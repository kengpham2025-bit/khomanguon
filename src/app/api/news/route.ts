import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  const db = getDb();
  const rows = await db
    .prepare(
      `SELECT id, slug, title, excerpt, published_at, created_at
       FROM news_posts
       WHERE status = 'published'
       ORDER BY COALESCE(published_at, created_at) DESC`,
    )
    .all<{
      id: string;
      slug: string;
      title: string;
      excerpt: string | null;
      published_at: number | null;
      created_at: number;
    }>();

  return NextResponse.json({ posts: rows.results ?? [] });
}
