/**
 * API: Số dư tài khoản người dùng
 *
 * GET /api/balance
 * Returns: { balanceCents: number, formatted: string }
 */
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/session";

export const runtime = "edge";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session?.sub) {
    return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });
  }

  const db = getDb();
  const row = await db
    .prepare(`SELECT balance_cents FROM user_balances WHERE user_id = ?`)
    .bind(session.sub)
    .first<{ balance_cents: number }>();

  const balanceCents = row?.balance_cents ?? 0;

  return NextResponse.json({
    balanceCents,
    formatted: `${balanceCents.toLocaleString("vi-VN")} VND`,
  });
}
