/**
 * GET  /api/admin/settings          — lấy toàn bộ settings (grouped, admin only)
 * POST /api/admin/settings/seed       — seed default values (nếu chưa có)
 */
import { NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/session";
import { getSettingsGrouped, seedSettings } from "@/lib/settings";

export const runtime = "edge";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  try {
    const groups = await getSettingsGrouped();
    return NextResponse.json({ ok: true, groups });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { action?: string };
  if (body.action === "seed") {
    try {
      await seedSettings();
      const groups = await getSettingsGrouped();
      return NextResponse.json({ ok: true, message: "Đã seed thành công", groups });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "action không hợp lệ" }, { status: 400 });
}
