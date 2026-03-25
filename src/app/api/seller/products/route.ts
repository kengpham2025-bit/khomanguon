import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { newId } from "@/lib/ids";
import { slugify } from "@/lib/slug";
import { getSessionFromCookies } from "@/lib/session";

export const runtime = "edge";

async function requireApprovedSeller() {
  const s = await getSessionFromCookies();
  if (!s?.sub) return null;
  const db = getDb();
  const u = await db
    .prepare(`SELECT id, role, seller_status FROM users WHERE id = ?`)
    .bind(s.sub)
    .first<{ id: string; role: string; seller_status: string }>();
  if (!u) return null;
  const ok = u.role === "admin" || u.role === "seller" || u.seller_status === "approved";
  if (!ok) return null;
  return u;
}

const postSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  priceCents: z.number().int().nonnegative(),
  categorySlug: z.string().optional(),
  publish: z.boolean().optional(),
});

export async function POST(req: Request) {
  const seller = await requireApprovedSeller();
  if (!seller) return NextResponse.json({ error: "Chỉ người bán đã duyệt mới thêm sản phẩm" }, { status: 403 });

  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  const db = getDb();
  const id = newId();
  const now = Math.floor(Date.now() / 1000);
  let slug = slugify(parsed.data.title);
  const exists = await db.prepare("SELECT 1 FROM products WHERE slug = ?").bind(slug).first();
  if (exists) slug = `${slug}-${now}`;

  const status = parsed.data.publish ? "published" : "draft";

  await db
    .prepare(
      `INSERT INTO products (id, seller_id, title, slug, description, price_cents, category_slug, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      seller.id,
      parsed.data.title,
      slug,
      parsed.data.description ?? null,
      parsed.data.priceCents,
      parsed.data.categorySlug ?? null,
      status,
      now,
      now,
    )
    .run();

  return NextResponse.json({ ok: true, id, slug });
}

export async function GET() {
  const seller = await requireApprovedSeller();
  if (!seller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = getDb();
  const rows = await db
    .prepare(`SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC`)
    .bind(seller.id)
    .all();
  return NextResponse.json({ products: rows.results ?? [] });
}
