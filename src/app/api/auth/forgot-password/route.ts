import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sha256Hex } from "@/lib/hash";
import { sendTransactionalEmail, forgotPasswordHtml, getAppUrl } from "@/lib/email";

export const runtime = "edge";

function generateOTP(): string {
  const arr = new Uint8Array(6);
  crypto.getRandomValues(arr);
  let otp = "";
  for (let i = 0; i < 6; i++) otp += (arr[i] % 10).toString();
  return otp;
}

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email) {
      return NextResponse.json({ error: "Thiếu email" }, { status: 400 });
    }

    const db = getDb();
    const user = await db
      .prepare("SELECT id FROM users WHERE email = ? LIMIT 1")
      .bind(email.toLowerCase().trim())
      .first<{ id: string }>();

    if (!user) {
      return NextResponse.json({ ok: true, message: "Nếu email tồn tại, chúng tôi đã gửi mã OTP." });
    }

    const code = generateOTP();
    const codeHash = await sha256Hex(code);
    const now = Math.floor(Date.now() / 1000);
    const expiresAt = now + 15 * 60; // 15 minutes

    await db
      .prepare(
        `DELETE FROM tokens WHERE user_id = ? AND type = 'forgot_password' AND expires_at > ?`,
      )
      .bind(user.id, now)
      .run();

    await db
      .prepare(
        `INSERT INTO tokens (id, user_id, token_hash, type, expires_at, created_at)
         VALUES (?, ?, ?, 'forgot_password', ?, ?)`,
      )
      .bind(
        crypto.randomUUID(),
        user.id,
        codeHash,
        expiresAt,
        now,
      )
      .run();

    const appUrl = await getAppUrl();
    await sendTransactionalEmail({
      to: email,
      subject: "Mã OTP đặt lại mật khẩu - Kho Mã Nguồn",
      html: forgotPasswordHtml(code, appUrl),
    });

    return NextResponse.json({ ok: true, message: "Đã gửi mã OTP qua email." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
