import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/session";

async function requireAdmin() {
  const s = await getSessionFromCookies();
  if (!s || s.role !== "admin") return null;
  return s;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = getDb();
  const rows = await db
    .prepare(
      `SELECT a.*, u.email, u.name FROM seller_applications a JOIN users u ON u.id = a.user_id ORDER BY a.created_at DESC`,
    )
    .all();
  return NextResponse.json({ applications: rows.results ?? [] });
}

const patchSchema = z.object({
  id: z.string().uuid(),
  action: z.enum(["approve", "reject"]),
});

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const db = getDb();
  const app = await db
    .prepare(`SELECT * FROM seller_applications WHERE id = ?`)
    .bind(parsed.data.id)
    .first<{ id: string; user_id: string; status: string }>();

  if (!app || app.status !== "pending") {
    return NextResponse.json({ error: "Không hợp lệ" }, { status: 400 });
  }

  const now = Math.floor(Date.now() / 1000);
  if (parsed.data.action === "approve") {
    await db
      .prepare(`UPDATE seller_applications SET status = 'approved', reviewed_at = ? WHERE id = ?`)
      .bind(now, app.id)
      .run();
    await db
      .prepare(`UPDATE users SET seller_status = 'approved', role = 'seller', updated_at = ? WHERE id = ?`)
      .bind(now, app.user_id)
      .run();
  } else {
    await db
      .prepare(`UPDATE seller_applications SET status = 'rejected', reviewed_at = ? WHERE id = ?`)
      .bind(now, app.id)
      .run();
    await db
      .prepare(`UPDATE users SET seller_status = 'rejected', updated_at = ? WHERE id = ?`)
      .bind(now, app.user_id)
      .run();
  }

  return NextResponse.json({ ok: true });
}
