import { NextResponse } from "next/server";
import { Resend } from "resend";
import { db } from "@/lib/db";
import { otpCodes } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";

const getResend = () => new Resend(process.env.RESEND_API_KEY!);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
}

export async function POST(req: Request) {
  try {
    const { email, purpose } = await req.json();

    if (!email || !purpose) {
      return NextResponse.json({ error: "Missing email or purpose" }, { status: 400 });
    }

    // Invalidate old OTPs for this email + purpose
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

    // Send email
    const purposeLabels: Record<string, string> = {
      register: "Đăng ký tài khoản",
      login: "Đăng nhập",
      withdraw: "Rút tiền",
      add_bank: "Thêm tài khoản ngân hàng",
      change_password: "Đổi mật khẩu",
      change_email: "Đổi email",
    };

    const { error } = await getResend().emails.send({
      from: "KHOMANGUON <noreply@khomanguon.io.vn>",
      to: email,
      subject: `Mã xác minh ${purposeLabels[purpose] || purpose} - KHOMANGUON`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">KHOMANGUON.IO.VN</h2>
          <p>Mã xác minh của bạn:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #4F46E5; background: #f0f0ff; padding: 16px 24px; border-radius: 12px; text-align: center; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #666; font-size: 14px;">Mã có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này với bất kỳ ai.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;" />
          <p style="color: #999; font-size: 12px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Email OTP error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Verify OTP
export async function PUT(req: Request) {
  try {
    const { email, code, purpose } = await req.json();

    if (!email || !code || !purpose) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

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

    if (!record) {
      return NextResponse.json({ valid: false, error: "Invalid OTP" }, { status: 400 });
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json({ valid: false, error: "OTP expired" }, { status: 400 });
    }

    // Mark as used
    await db
      .update(otpCodes)
      .set({ isUsed: true })
      .where(eq(otpCodes.id, record.id));

    return NextResponse.json({ valid: true });
  } catch (err) {
    console.error("OTP verify error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
