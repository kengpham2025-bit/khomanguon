import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { sha256Hex } from "@/lib/hash";
import { getSessionFromCookies } from "@/lib/session";

const schema = z.object({
  withdrawalId: z.string().uuid(),
  otp: z.string().regex(/^\d{6}$/),
});

export async function POST(req: Request) {
  const s = await getSessionFromCookies();
  if (!s?.userId) return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "OTP không hợp lệ" }, { status: 400 });

  const db = getDb();
  const w = await db
    .prepare(`SELECT * FROM withdrawals WHERE id = ? AND user_id = ?`)
    .bind(parsed.data.withdrawalId, s.userId)
    .first<{ id: string; status: string }>();

  if (!w || w.status !== "pending_otp") {
    return NextResponse.json({ error: "Yêu cầu rút tiền không hợp lệ" }, { status: 400 });
  }

  const hash = await sha256Hex(parsed.data.otp);
  const tok = await db
    .prepare(
      `SELECT id FROM tokens WHERE user_id = ? AND type = 'withdraw_otp' AND ref_id = ? AND token_hash = ? AND expires_at > ?`,
    )
    .bind(s.userId, parsed.data.withdrawalId, hash, Math.floor(Date.now() / 1000))
    .first<{ id: string }>();

  if (!tok) return NextResponse.json({ error: "Sai OTP hoặc đã hết hạn" }, { status: 400 });

  await db.prepare(`DELETE FROM tokens WHERE id = ?`).bind(tok.id).run();
  await db
    .prepare(`UPDATE withdrawals SET status = 'processing', completed_at = NULL WHERE id = ?`)
    .bind(parsed.data.withdrawalId)
    .run();

  return NextResponse.json({ ok: true, message: "Đã xác nhận. Đơn đang chờ xử lý thanh toán." });
}
