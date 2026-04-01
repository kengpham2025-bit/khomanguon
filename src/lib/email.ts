import { Resend } from "resend";
import { db } from "./db";
import { otpCodes } from "./db/schema";
import { eq, and } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY);

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export type OtpPurpose =
  | "register"
  | "login"
  | "withdraw"
  | "add_bank"
  | "change_password"
  | "change_email";

const PURPOSE_LABELS: Record<OtpPurpose, string> = {
  register: "Đăng ký tài khoản",
  login: "Đăng nhập",
  withdraw: "Rút tiền",
  add_bank: "Thêm tài khoản ngân hàng",
  change_password: "Đổi mật khẩu",
  change_email: "Đổi email",
};

export async function sendOtpEmail(email: string, purpose: OtpPurpose): Promise<void> {
  // Invalidate previous OTPs for this email + purpose
  await db
    .update(otpCodes)
    .set({ isUsed: true })
    .where(
      and(
        eq(otpCodes.email, email),
        eq(otpCodes.purpose, purpose),
        eq(otpCodes.isUsed, false)
      )
    );

  const code = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.insert(otpCodes).values({
    id: crypto.randomUUID(),
    email,
    code,
    purpose,
    expiresAt,
    attempts: 0,
    isUsed: false,
    createdAt: new Date(),
  });

  await resend.emails.send({
    from: "KHOMANGUON <noreply@khomanguon.io.vn>",
    to: email,
    subject: `Mã xác minh ${PURPOSE_LABELS[purpose]} - KHOMANGUON`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="color: #4F46E5; font-size: 24px; margin: 0;">KHOMANGUON.IO.VN</h1>
          <p style="color: #666; margin: 4px 0 0;">Premium Digital Marketplace</p>
        </div>
        <div style="background: #f8f9ff; border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 20px;">
          <p style="color: #333; font-size: 16px; margin: 0 0 16px;">
            Mã xác minh <strong>${PURPOSE_LABELS[purpose]}</strong> của bạn:
          </p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 12px; color: #4F46E5;">
            ${code}
          </div>
        </div>
        <p style="color: #666; font-size: 14px; text-align: center;">
          Mã có hiệu lực trong <strong>10 phút</strong>.<br/>
          Nếu bạn không yêu cầu, vui lòng bỏ qua email này.
        </p>
      </div>
    `,
  });
}

export async function verifyOtp(
  email: string,
  code: string,
  purpose: OtpPurpose
): Promise<boolean> {
  const record = await db
    .select()
    .from(otpCodes)
    .where(
      and(
        eq(otpCodes.email, email),
        eq(otpCodes.code, code),
        eq(otpCodes.purpose, purpose),
        eq(otpCodes.isUsed, false)
      )
    )
    .get();

  if (!record) return false;
  if (record.expiresAt < new Date()) return false;

  await db.update(otpCodes).set({ isUsed: true }).where(eq(otpCodes.id, record.id));
  return true;
}
