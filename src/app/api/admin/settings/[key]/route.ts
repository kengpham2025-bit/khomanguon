/**
 * PUT /api/admin/settings/[key] — cập nhật một setting
 * Body: { value: string }
 */
import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionFromCookies } from "@/lib/session";
import { upsertSetting, invalidateCache } from "@/lib/settings";
import type { SettingType } from "@/lib/settings";

const schema = z.object({
  value: z.string(),
  type: z.enum(["string", "number", "boolean", "json"]).optional(),
});

type Params = { params: Promise<{ key: string }> };

export async function PUT(req: Request, { params }: Params) {
  const session = await getSessionFromCookies();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Không có quyền" }, { status: 403 });
  }

  const { key } = await params;
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
  }

  const { value, type } = parsed.data;
  const settingType: SettingType = type ?? "string";

  try {
    await upsertSetting(key, value, settingType);
    invalidateCache();
    return NextResponse.json({ ok: true, key, value });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
