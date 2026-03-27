import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { newId } from "@/lib/ids";
import { EXCLUDED_MENU_HREFS } from "@/lib/nav-config";
import { getSessionFromCookies } from "@/lib/session";

function normalizeMenuHref(h: string): string {
  const t = h.trim();
  if (!t.startsWith("/")) return t;
  const noTrail = t.replace(/\/+$/, "");
  return noTrail === "" ? "/" : noTrail;
}

function menuHrefForbidden(href: string): boolean {
  return EXCLUDED_MENU_HREFS.has(normalizeMenuHref(href));
}

export const runtime = "edge";

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
    .prepare(`SELECT * FROM menus ORDER BY sort_order ASC, created_at ASC`)
    .all<{
      id: string;
      parent_id: string | null;
      label: string;
      href: string;
      sort_order: number;
      is_active: number;
      created_at: number;
    }>();
  return NextResponse.json({ menus: rows.results ?? [] });
}

const createSchema = z.object({
  label: z.string().min(1),
  href: z.string().min(1),
  parentId: z.union([z.string().uuid(), z.null()]).optional(),
  sortOrder: z.number().int().optional(),
});

export async function POST(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = createSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  if (menuHrefForbidden(parsed.data.href)) {
    return NextResponse.json(
      { error: "Không thêm /cua-hang vào menu — danh sách sản phẩm do admin/người bán quản lý, không dùng mục menu cửa hàng." },
      { status: 400 },
    );
  }

  const db = getDb();
  const id = newId();
  const now = Math.floor(Date.now() / 1000);
  const parentId = parsed.data.parentId ?? null;
  const sort = parsed.data.sortOrder ?? 0;

  await db
    .prepare(
      `INSERT INTO menus (id, parent_id, label, href, sort_order, is_active, created_at) VALUES (?, ?, ?, ?, ?, 1, ?)`,
    )
    .bind(id, parentId, parsed.data.label, parsed.data.href, sort, now)
    .run();

  return NextResponse.json({ ok: true, id });
}

const patchSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1).optional(),
  href: z.string().min(1).optional(),
  parentId: z.union([z.string().uuid(), z.null()]).optional(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const db = getDb();
  const { id, ...rest } = parsed.data;
  const cur = await db.prepare("SELECT * FROM menus WHERE id = ?").bind(id).first();
  if (!cur) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const label = rest.label ?? (cur as { label: string }).label;
  const href = rest.href ?? (cur as { href: string }).href;
  if (menuHrefForbidden(href)) {
    return NextResponse.json(
      { error: "Không đặt menu trỏ tới /cua-hang — trang này không nằm trong menu điều hướng." },
      { status: 400 },
    );
  }
  const parentId =
    rest.parentId !== undefined ? rest.parentId : (cur as { parent_id: string | null }).parent_id;
  const sortOrder =
    rest.sortOrder !== undefined ? rest.sortOrder : (cur as { sort_order: number }).sort_order;
  const isActive =
    rest.isActive !== undefined ? (rest.isActive ? 1 : 0) : (cur as { is_active: number }).is_active;

  await db
    .prepare(`UPDATE menus SET label = ?, href = ?, parent_id = ?, sort_order = ?, is_active = ? WHERE id = ?`)
    .bind(label, href, parentId, sortOrder, isActive, id)
    .run();

  return NextResponse.json({ ok: true });
}

const delSchema = z.object({ id: z.string().uuid() });

export async function DELETE(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = delSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const db = getDb();
  await db.prepare("DELETE FROM menus WHERE id = ?").bind(parsed.data.id).run();
  return NextResponse.json({ ok: true });
}
