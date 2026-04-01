import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateAffiliateCode } from "@/lib/utils";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing webhook secret" }, { status: 500 });
  }

  const payload = await req.json();
  const headerPayload = req.headers.get("svix-id");
  const headerTimestamp = req.headers.get("svix-timestamp");
  const headerSignature = req.headers.get("svix-signature");

  if (!headerPayload || !headerTimestamp || !headerSignature) {
    return NextResponse.json({ error: "Missing svix headers" }, { status: 400 });
  }

  const svix = new Webhook(WEBHOOK_SECRET);
  let event: WebhookEvent;

  try {
    event = svix.verify(JSON.stringify(payload), {
      "svix-id": headerPayload,
      "svix-timestamp": headerTimestamp,
      "svix-signature": headerSignature,
    }) as WebhookEvent;
  } catch {
    return NextResponse.json({ error: "Webhook verification failed" }, { status: 400 });
  }

  const { type, data } = event;

  try {
    if (type === "user.created" || type === "user.updated") {
      const { id: clerkId, email_addresses, username, first_name, last_name, image_url } = data;
      const primaryEmail = email_addresses?.[0]?.email_address;

      if (!primaryEmail) {
        return NextResponse.json({ error: "No email found" }, { status: 400 });
      }

      const existing = await db
        .select()
        .from(users)
        .where(eq(users.clerkId, clerkId))
        .get();

      if (existing) {
        // Update user
        await db
          .update(users)
          .set({
            email: primaryEmail,
            username: username ?? existing.username,
            fullName: [first_name, last_name].filter(Boolean).join(" ") || existing.fullName,
            avatarUrl: image_url ?? existing.avatarUrl,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existing.id));
      } else {
        // Create new user
        await db.insert(users).values({
          id: crypto.randomUUID(),
          clerkId,
          email: primaryEmail,
          username: username ?? null,
          fullName: [first_name, last_name].filter(Boolean).join(" ") || null,
          avatarUrl: image_url ?? null,
          balance: 0,
          role: "user",
          language: "vi",
          referralCode: generateAffiliateCode(),
          kycStatus: "none",
          isAffiliateActive: false,
          totalEarnings: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    } else if (type === "user.deleted") {
      const { id: clerkId } = data;
      if (clerkId) {
        await db.delete(users).where(eq(users.clerkId, clerkId));
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Clerk webhook error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
