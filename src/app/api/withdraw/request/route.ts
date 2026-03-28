import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { newId } from "@/lib/ids";
import { sha256Hex } from "@/lib/hash";
import { getSessionFromCookies } from "@/lib/session";
import { sendTransactionalEmail, otpWithdrawHtml } from "@/lib/email";
import { verifyAndConsumeCaptchaPass } from "@/lib/captcha-pass";

async function requireWithdrawSeller() {
  const s = await getSessionFromCookies();
  if (!s?.sub) return null;
  const db = getDb();
  const u = await db
    .prepare(`SELECT id, role, seller_status, email FROM users WHERE id = ?`)
    .bind(s.sub)
    .first<{ id: string; role: string; seller_status: string; email: string }>();
  if (!u) return null;
  const ok =
    u.role === "admin" || u.role === "seller" || u.seller_status === "approved";
  if (!ok) return null;
  return u;
}

const schema = z.object({
  bankAccountId: z.string().uuid(),
  amountVnd: z.number().int().positive().max(1_000_000_000),
  captchaToken: z.string().min(1),
});

function randomOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: Request) {
  try {
    const u = await requireWithdrawSeller();
    if (!u) {
      return NextResponse.json({ error: "Chỉ người bán đã duyệt mới được rút tiền" }, { status: 403 });
    }

    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

    const captchaOk = await verifyAndConsumeCaptchaPass(parsed.data.captchaToken);
    if (!captchaOk) {
      return NextResponse.json({ error: "Mã bảo vệ không hợp lệ hoặc đã hết hạn" }, { status: 400 });
    }

    const db = getDb();
    const acc = await db
      .prepare(`SELECT id FROM bank_accounts WHERE id = ? AND user_id = ?`)
      .bind(parsed.data.bankAccountId, u.id)
      .first<{ id: string }>();

    if (!acc) return NextResponse.json({ error: "Tài khoản ngân hàng không hợp lệ" }, { status: 400 });

    const wid = newId();
    const now = Math.floor(Date.now() / 1000);
    const amountCents = parsed.data.amountVnd;

    await db
      .prepare(
        `INSERT INTO withdrawals (id, user_id, bank_account_id, amount_cents, status, created_at) VALUES (?, ?, ?, ?, 'pending_otp', ?)`,
      )
      .bind(wid, u.id, acc.id, amountCents, now)
      .run();

    const otp = randomOtp();
    const tokenHash = await sha256Hex(otp);
    const tid = newId();
    const exp = now + 900;

    await db
      .prepare(
        `INSERT INTO tokens (id, user_id, token_hash, type, ref_id, expires_at, created_at) VALUES (?, ?, ?, 'withdraw_otp', ?, ?, ?)`,
      )
      .bind(tid, u.id, tokenHash, wid, exp, now)
      .run();

    await sendTransactionalEmail({
      to: u.email,
      subject: "Mã OTP rút tiền — Kho Mã Nguồn",
      html: otpWithdrawHtml(otp),
    });

    return NextResponse.json({ ok: true, withdrawalId: wid, message: "Đã gửi OTP tới email." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
