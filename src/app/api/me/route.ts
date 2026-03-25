import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/session";

export const runtime = "edge";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session?.sub) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  const db = getDb();
  const u = await db
    .prepare(
      `SELECT id, email, name, phone, role, seller_status, kyc_status, email_verified_at FROM users WHERE id = ?`,
    )
    .bind(session.sub)
    .first<{
      id: string;
      email: string;
      name: string;
      phone: string | null;
      role: string;
      seller_status: string;
      kyc_status: string;
      email_verified_at: number | null;
    }>();

  if (!u) return NextResponse.json({ user: null }, { status: 401 });

  return NextResponse.json({
    user: {
      ...u,
      isSellerApproved: u.seller_status === "approved" || u.role === "seller" || u.role === "admin",
      kycVerified: u.kyc_status === "verified",
    },
  });
}
