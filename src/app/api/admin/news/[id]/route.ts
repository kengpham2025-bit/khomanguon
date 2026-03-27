import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/session";

async function requireAdmin() {
  const s = await getSessionFromCookies();
  if (!s || s.role !== "admin") return null;
  return s;
}

const patchSchema = z.object({
  status: z.enum(["draft", "published"]),
});

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, ctx: Ctx) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON không hợp lệ" }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const publishedAt = parsed.data.status === "published" ? now : null;

  const r = await db
    .prepare(
      `UPDATE news_posts SET status = ?, updated_at = ?, published_at = CASE WHEN ? = 'published' THEN COALESCE(published_at, ?) ELSE NULL END WHERE id = ?`,
    )
    .bind(parsed.data.status, now, parsed.data.status, now, id)
    .run();

  if (!r.success || (r.meta?.changes ?? 0) === 0) {
    return NextResponse.json({ error: "Không tìm thấy bài" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
