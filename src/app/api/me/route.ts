import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession, SESSION_COOKIE_NAME } from "@/lib/sessions";

function getCookieFromRequest(req: Request, name: string): string {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const cookies: Record<string, string> = {};
  for (const pair of cookieHeader.split(";")) {
    const [k, ...v] = pair.trim().split("=");
    if (k) cookies[k.trim()] = v.join("=");
  }
  return cookies[name] ?? "";
}

export async function GET(req: Request) {
  const token = getCookieFromRequest(req, SESSION_COOKIE_NAME);
  const session = await getSession(token);
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }
  const db = getDb();
  const u = await db
    .prepare(
      `SELECT id, email, name, phone, role, seller_status, kyc_status, email_verified_at FROM users WHERE id = ?`,
    )
    .bind(session.userId)
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
