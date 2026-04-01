import { NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { deposits, users, affiliateLogs } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * PayOS webhook handler
 * PayOS sends POST with JSON body when a payment is completed
 */
export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.PAYCROS_API_KEY;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-signature") || "";

    // Verify webhook signature
    const expectedSig = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (signature !== expectedSig) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const data = JSON.parse(rawBody);

    // Only process successful payments
    if (data.status !== "PAID" && data.status !== "SUCCESS") {
      return NextResponse.json({ received: true });
    }

    const { orderCode, amount, transactionNo } = data;

    // Find pending deposit
    const deposit = await db
      .select()
      .from(deposits)
      .where(eq(deposits.payosOrderCode, String(orderCode)))
      .get();

    if (!deposit) {
      return NextResponse.json({ error: "Deposit not found" }, { status: 404 });
    }

    if (deposit.status === "completed") {
      // Already processed
      return NextResponse.json({ received: true });
    }

    // Update deposit to completed
    await db
      .update(deposits)
      .set({
        status: "completed",
        payosTransactionNo: transactionNo || null,
        completedAt: new Date(),
      })
      .where(eq(deposits.id, deposit.id));

    // Credit user balance
    const user = await db.select().from(users).where(eq(users.id, deposit.userId)).get();
    if (user) {
      await db
        .update(users)
        .set({ balance: user.balance + deposit.amount })
        .where(eq(users.id, deposit.userId));

      // Process affiliate commission if referral code was used
      if (deposit.referralCode && deposit.affiliateCommission) {
        const referrer = await db
          .select()
          .from(users)
          .where(eq(users.referralCode, deposit.referralCode))
          .get();

        if (referrer && referrer.isAffiliateActive) {
          await db.insert(affiliateLogs).values({
            id: crypto.randomUUID(),
            userId: referrer.id,
            referredUserId: deposit.userId,
            depositId: deposit.id,
            commissionAmount: deposit.affiliateCommission,
            depositAmount: deposit.amount,
            level: 1,
            createdAt: new Date(),
          });

          await db
            .update(users)
            .set({
              balance: referrer.balance + deposit.affiliateCommission,
              totalEarnings: referrer.totalEarnings + deposit.affiliateCommission,
            })
            .where(eq(users.id, referrer.id));
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("PayOS webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
