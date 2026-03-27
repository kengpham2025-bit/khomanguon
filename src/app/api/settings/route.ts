/**
 * GET /api/settings — settings công khai cho client (public keys)
 * Chỉ trả về các key KHÔNG có is_secret.
 */
import { NextResponse } from "next/server";
import { getAllSettings, getSetting } from "@/lib/settings";

export async function GET() {
  try {
    const rows = await getAllSettings();
    const publicSettings: Record<string, string> = {};
    for (const row of rows) {
      if (!row.is_secret) {
        publicSettings[row.key] = row.value;
      }
    }
    const turnstileSite = await getSetting("turnstile_site_key");
    if (turnstileSite) publicSettings.turnstile_site_key = turnstileSite;
    return NextResponse.json({ ok: true, settings: publicSettings });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
