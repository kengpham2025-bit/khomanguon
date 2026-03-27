import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/password";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { newId } from "@/lib/ids";
import { sha256Hex } from "@/lib/hash";
import { verifyTurnstile } from "@/lib/turnstile";
import { sendTransactionalEmail, verificationEmailHtml, getAppUrl } from "@/lib/email";

export const runtime = "edge";

const bodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().optional(),
  turnstileToken: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }
    const { email, password, name, phone, turnstileToken } = parsed.data;

    const ip = req.headers.get("cf-connecting-ip") || req.headers.get("x-forwarded-for") || undefined;
    const ok = await verifyTurnstile(undefined, turnstileToken, ip);
    if (!ok) {
      return NextResponse.json({ error: "Xác minh Captcha thất bại" }, { status: 400 });
    }

    const db = getDb();
    const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) {
      return NextResponse.json({ error: "Email đã được đăng ký" }, { status: 409 });
    }

    const userId = newId();
    const now = Math.floor(Date.now() / 1000);
    const passwordHash = await hashPassword(password);

    await db
      .prepare(
        `INSERT INTO users (id, email, password_hash, name, phone, role, email_verified_at, seller_status, kyc_status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 'user', NULL, 'none', 'none', ?, ?)`,
      )
      .bind(userId, email.toLowerCase(), passwordHash, name, phone ?? null, now, now)
      .run();

    const rawToken = crypto.randomUUID() + crypto.randomUUID();
    const tokenHash = await sha256Hex(rawToken);
    const tokenId = newId();
    const exp = now + 86400;

    await db
      .prepare(
        `INSERT INTO tokens (id, user_id, token_hash, type, ref_id, expires_at, created_at) VALUES (?, ?, ?, 'email_verify', NULL, ?, ?)`,
      )
      .bind(tokenId, userId, tokenHash, exp, now)
      .run();

    const appUrl = await getAppUrl();
    await sendTransactionalEmail({
      to: email,
      subject: "Xác nhận email — Kho Mã Nguồn",
      html: verificationEmailHtml(rawToken, appUrl),
    });

    return NextResponse.json({ ok: true, message: "Đã gửi email xác nhận. Vui lòng kiểm tra hộp thư." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
