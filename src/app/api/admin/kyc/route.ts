import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/session";

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
    .prepare(
      `SELECT id, email, name, kyc_status, kyc_submitted_at FROM users WHERE kyc_status IN ('pending','verified','rejected') ORDER BY kyc_submitted_at DESC`,
    )
    .all();

  return NextResponse.json({ users: rows.results ?? [] });
}

const patchSchema = z.object({
  userId: z.string().uuid(),
  status: z.enum(["verified", "rejected", "none"]),
});

export async function PATCH(req: Request) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid" }, { status: 400 });

  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  await db
    .prepare(`UPDATE users SET kyc_status = ?, updated_at = ? WHERE id = ?`)
    .bind(parsed.data.status, now, parsed.data.userId)
    .run();

  return NextResponse.json({ ok: true });
}
