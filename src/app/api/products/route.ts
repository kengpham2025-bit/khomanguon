import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  const db = getDb();
  const rows = await db
    .prepare(
      `SELECT p.id, p.title, p.slug, p.description, p.price_cents, p.category_slug, p.created_at,
              u.kyc_status, u.name as seller_name, u.id as seller_id
       FROM products p
       JOIN users u ON u.id = p.seller_id
       WHERE p.status = 'published'
       ORDER BY p.created_at DESC`,
    )
    .all<{
      id: string;
      title: string;
      slug: string;
      description: string | null;
      price_cents: number;
      category_slug: string | null;
      created_at: number;
      kyc_status: string;
      seller_name: string;
      seller_id: string;
    }>();

  const products = (rows.results ?? []).map((p) => ({
    ...p,
    kycWarning: p.kyc_status !== "verified",
  }));

  return NextResponse.json({ products });
}
