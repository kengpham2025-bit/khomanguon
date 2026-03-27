/**
 * GET /api/settings — settings công khai cho client (public keys)
 * Chỉ trả về các key KHÔNG có is_secret.
 */
import { NextResponse } from "next/server";
import { getAllSettings } from "@/lib/settings";

export async function GET() {
  try {
    const rows = await getAllSettings();
    const publicSettings: Record<string, string> = {};
    for (const row of rows) {
      if (!row.is_secret) {
        publicSettings[row.key] = row.value;
      }
    }
    return NextResponse.json({ ok: true, settings: publicSettings });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
