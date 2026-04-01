import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { deposits } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { createPayOSPayment, generatePayOSOrderCode } from "@/lib/payos";

// POST /api/deposit - Create a PayOS deposit
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, referralCode } = await req.json();

    if (!amount || amount < 10000) {
      return NextResponse.json(
        { error: "Minimum deposit is 10,000 VND" },
        { status: 400 }
      );
    }

    const orderCode = generatePayOSOrderCode();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    // Calculate affiliate commission (1%)
    const affiliateCommission = referralCode ? Math.floor(amount * 0.01) : undefined;

    // Create deposit record
    const depositId = crypto.randomUUID();
    await db.insert(deposits).values({
      id: depositId,
      userId,
      amount,
      status: "pending",
      payosOrderCode: orderCode,
      referralCode: referralCode || null,
      affiliateCommission: affiliateCommission || null,
      createdAt: new Date(),
    });

    // Create PayOS payment
    const payment = await createPayOSPayment({
      orderCode,
      amount,
      description: `Nap tien KHOMANGUON - ${amount.toLocaleString()} VND`,
      returnUrl: `${appUrl}/dashboard?deposit=success&order=${orderCode}`,
      cancelUrl: `${appUrl}/deposit?cancelled=true`,
    });

    // Update deposit with checkout URL
    await db
      .update(deposits)
      .set({
        payosPaymentLinkId: payment.paymentLinkId,
        payosCheckoutUrl: payment.checkoutUrl,
      })
      .where(eq(deposits.id, depositId));

    return NextResponse.json({
      checkoutUrl: payment.checkoutUrl,
      orderCode,
    });
  } catch (err) {
    console.error("Deposit API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// GET /api/deposit - Get user's deposit history
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userDeposits = await db
      .select()
      .from(deposits)
      .where(eq(deposits.userId, userId));

    return NextResponse.json({ deposits: userDeposits });
  } catch (err) {
    console.error("Deposit GET error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
