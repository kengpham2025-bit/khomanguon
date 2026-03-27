/**
 * API: Tạo link thanh toán PayOS để nạp tiền
 *
 * POST /api/deposit/create
 * Body: { amount: number (VND) }
 * Returns: { checkoutUrl, orderCode, depositId }
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { newId } from "@/lib/ids";
import { getSessionFromCookies } from "@/lib/session";
import { getPayOS, generateOrderCode } from "@/lib/payos";
import { getAppUrl } from "@/lib/email";

export const runtime = "nodejs";

const schema = z.object({
  amount: z.number().int().positive().min(10000).max(1_000_000_000),
});

export async function POST(req: Request) {
  const session = await getSessionFromCookies();
  if (!session?.sub) {
    return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Số tiền không hợp lệ. Tối thiểu 10.000 VND." },
      { status: 400 },
    );
  }

  const userId = session.sub;
  const amountCents = parsed.data.amount;
  const orderCode = generateOrderCode();
  const depositId = newId();
  const now = Math.floor(Date.now() / 1000);

  const db = getDb();

  // Lưu deposit record trước
  await db
    .prepare(
      `INSERT INTO deposits (id, user_id, order_code, amount_cents, status, created_at)
       VALUES (?, ?, ?, ?, 'pending', ?)`,
    )
    .bind(depositId, userId, orderCode, amountCents, now)
    .run();

  try {
    const payos = getPayOS();
    const appUrl =
      (typeof window !== "undefined"
        ? window.location.origin
        : await getAppUrl()) || "https://khomanguon.io.vn";

    const paymentData = {
      orderCode,
      amount: amountCents,
      description: `Nap tien Kho Ma Nguon - ${amountCents.toLocaleString("vi-VN")} VND`,
      items: [
        {
          name: `Nap tien tai khoan - ${amountCents.toLocaleString("vi-VN")} VND`,
          quantity: 1,
          price: amountCents,
        },
      ],
      returnUrl: `${appUrl}/nap-tien/thanh-cong?depositId=${depositId}`,
      cancelUrl: `${appUrl}/nap-tien?cancelled=1`,
    };

    const paymentLink = await payos.paymentRequests.create(paymentData);

    // Lưu checkout_url
    await db
      .prepare(`UPDATE deposits SET checkout_url = ? WHERE id = ?`)
      .bind(paymentLink.checkoutUrl, depositId)
      .run();

    return NextResponse.json({
      ok: true,
      depositId,
      orderCode,
      checkoutUrl: paymentLink.checkoutUrl,
    });
  } catch (err) {
    console.error("[payos:create]", err);

    // Mark deposit as failed
    await db
      .prepare(`UPDATE deposits SET status = 'failed' WHERE id = ?`)
      .bind(depositId)
      .run();

    const msg =
      err instanceof Error ? err.message : "Không thể tạo link thanh toán PayOS.";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
