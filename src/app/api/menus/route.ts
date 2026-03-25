import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export const runtime = "edge";

export async function GET() {
  const db = getDb();
  const rows = await db
    .prepare(
      `SELECT id, parent_id, label, href, sort_order FROM menus WHERE is_active = 1 ORDER BY sort_order ASC, created_at ASC`,
    )
    .all<{ id: string; parent_id: string | null; label: string; href: string; sort_order: number }>();

  const list = rows.results ?? [];
  const parents = list.filter((m) => !m.parent_id);
  const children = list.filter((m) => m.parent_id);
  const tree = parents.map((p) => ({
    ...p,
    children: children.filter((c) => c.parent_id === p.id),
  }));

  return NextResponse.json({ menus: tree });
}
