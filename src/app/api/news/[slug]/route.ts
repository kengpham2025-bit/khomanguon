import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "edge";

type Ctx = { params: Promise<{ slug: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { slug } = await ctx.params;
  const db = getDb();
  const row = await db
    .prepare(
      `SELECT id, slug, title, excerpt, content_html, seo_keywords, source_url, published_at, created_at
       FROM news_posts
       WHERE slug = ? AND status = 'published'`,
    )
    .bind(slug)
    .first<{
      id: string;
      slug: string;
      title: string;
      excerpt: string | null;
      content_html: string;
      seo_keywords: string | null;
      source_url: string | null;
      published_at: number | null;
      created_at: number;
    }>();

  if (!row) {
    return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
  }

  return NextResponse.json({ post: row });
}
