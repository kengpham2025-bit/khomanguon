import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { newId } from "@/lib/ids";
import { getSessionFromCookies } from "@/lib/session";
import { slugify } from "@/lib/slug";
import { crawlArticleFromUrl } from "@/lib/crawl-article";
import { rewriteArticleWithGroq } from "@/lib/groq-rewrite";
import { getSetting } from "@/lib/settings";

export const runtime = "edge";

async function requireAdmin() {
  const s = await getSessionFromCookies();
  if (!s || s.role !== "admin") return null;
  return s;
}

async function uniqueSlug(db: ReturnType<typeof getDb>, base: string): Promise<string> {
  let s = base;
  for (let i = 0; i < 8; i++) {
    const row = await db.prepare("SELECT id FROM news_posts WHERE slug = ?").bind(s).first();
    if (!row) return s;
    s = `${base.slice(0, 48)}-${Math.random().toString(36).slice(2, 8)}`;
  }
  return `${base}-${newId().slice(0, 8)}`;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = getDb();
  const rows = await db
    .prepare(
      `SELECT id, slug, title, excerpt, status, source_url, seo_keywords, created_at, published_at
       FROM news_posts
       ORDER BY created_at DESC`,
    )
    .all<{
      id: string;
      slug: string;
      title: string;
      excerpt: string | null;
      status: string;
      source_url: string | null;
      seo_keywords: string | null;
      created_at: number;
      published_at: number | null;
    }>();

  return NextResponse.json({ posts: rows.results ?? [] });
}

const ingestSchema = z.object({
  url: z.string().url(),
  publish: z.boolean().optional(),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const key = await getSetting("groq_api_key");
  if (!key) {
    return NextResponse.json({ error: "Chưa cấu hình Groq API Key trong Cài đặt" }, { status: 500 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON không hợp lệ" }, { status: 400 });
  }

  const parsed = ingestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "URL không hợp lệ" }, { status: 400 });
  }

  const { url, publish } = parsed.data;

  let crawled: Awaited<ReturnType<typeof crawlArticleFromUrl>>;
  try {
    crawled = await crawlArticleFromUrl(url);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lỗi tải trang";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  if (crawled.plainText.length < 80) {
    return NextResponse.json(
      { error: "Nội dung trích từ trang quá ngắn — thử URL bài viết đầy đủ hoặc trang có thẻ article/main." },
      { status: 400 },
    );
  }

  let ai: Awaited<ReturnType<typeof rewriteArticleWithGroq>>;
  try {
    ai = await rewriteArticleWithGroq({
      apiKey: key,
      sourceTitle: crawled.title,
      plainText: crawled.plainText,
      imageUrls: crawled.imageUrls,
      sourceUrl: url,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Lỗi Groq";
    return NextResponse.json({ error: msg }, { status: 502 });
  }

  const db = getDb();
  const id = newId();
  const now = Math.floor(Date.now() / 1000);
  const baseSlug = slugify(ai.title);
  const slug = await uniqueSlug(db, baseSlug);
  const status = publish ? "published" : "draft";
  const publishedAt = publish ? now : null;
  const keywordsJson = JSON.stringify(ai.keywords);

  await db
    .prepare(
      `INSERT INTO news_posts (id, slug, title, excerpt, content_html, source_url, seo_keywords, status, created_at, updated_at, published_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      slug,
      ai.title,
      ai.excerpt,
      ai.body_html,
      url,
      keywordsJson,
      status,
      now,
      now,
      publishedAt,
    )
    .run();

  return NextResponse.json({ ok: true, id, slug, status });
}
