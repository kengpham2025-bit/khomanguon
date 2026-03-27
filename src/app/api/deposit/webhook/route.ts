/**
 * API: Webhook PayOS — nhận thông báo thanh toán thành công
 *
 * POST /api/deposit/webhook
 *
 * PayOS sẽ POST dữ liệu thanh toán về webhook này.
 * Cần verify webhook signature trước khi xử lý.
 */
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getPayOS } from "@/lib/payos";
import type { Webhook } from "@payos/node";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Webhook;

    const payos = getPayOS();

    // Xác minh signature webhook
    const verifiedData = await payos.webhooks.verify(body);

    console.log("[payos:webhook] verified data:", JSON.stringify(verifiedData));

    const { orderCode, amount, reference, code } = verifiedData;

    const db = getDb();

    // Tìm deposit record
    const deposit = await db
      .prepare(`SELECT * FROM deposits WHERE order_code = ?`)
      .bind(orderCode)
      .first<{
        id: string;
        user_id: string;
        amount_cents: number;
        status: string;
      }>();

    if (!deposit) {
      console.warn("[payos:webhook] deposit not found:", orderCode);
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Tránh xử lý trùng lặp
    if (deposit.status !== "pending") {
      return NextResponse.json({ received: true, status: "already_processed" });
    }

    if (code === "00") {
      const now = Math.floor(Date.now() / 1000);

      // Cập nhật trạng thái deposit
      await db
        .prepare(
          `UPDATE deposits
           SET status = 'success',
               payos_transaction_no = ?,
               payos_reference = ?,
               completed_at = ?
           WHERE id = ?`,
        )
        .bind(reference || "", reference || "", now, deposit.id)
        .run();

      // Cộng tiền vào số dư
      const existing = await db
        .prepare(`SELECT balance_cents FROM user_balances WHERE user_id = ?`)
        .bind(deposit.user_id)
        .first<{ balance_cents: number }>();

      if (existing) {
        await db
          .prepare(`UPDATE user_balances SET balance_cents = balance_cents + ?, updated_at = ? WHERE user_id = ?`)
          .bind(amount, now, deposit.user_id)
          .run();
      } else {
        await db
          .prepare(`INSERT INTO user_balances (user_id, balance_cents, updated_at) VALUES (?, ?, ?)`)
          .bind(deposit.user_id, amount, now)
          .run();
      }

      console.log(
        `[payos:webhook] SUCCESS: user=${deposit.user_id} amount=${amount} orderCode=${orderCode}`,
      );
    } else if (code && code !== "00") {
      await db
        .prepare(`UPDATE deposits SET status = 'cancelled' WHERE id = ?`)
        .bind(deposit.id)
        .run();
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[payos:webhook] error:", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 },
    );
  }
}
