/**
 * API: Lịch sử nạp tiền của người dùng
 *
 * GET /api/deposit/history
 * Returns: { deposits: [...] }
 */
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/session";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session?.sub) {
    return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });
  }

  const db = getDb();
  const rows = await db
    .prepare(
      `SELECT id, order_code, amount_cents, status, payos_transaction_no,
              description, created_at, completed_at
       FROM deposits
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
    )
    .bind(session.sub)
    .all<{
      id: string;
      order_code: number;
      amount_cents: number;
      status: string;
      payos_transaction_no: string | null;
      description: string | null;
      created_at: number;
      completed_at: number | null;
    }>();

  const deposits = (rows.results ?? []).map((d) => ({
    id: d.id,
    orderCode: d.order_code,
    amountCents: d.amount_cents,
    status: d.status,
    transactionNo: d.payos_transaction_no,
    description: d.description,
    createdAt: d.created_at * 1000,
    completedAt: d.completed_at ? d.completed_at * 1000 : null,
  }));

  return NextResponse.json({ deposits });
}
