import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { sha256Hex } from "@/lib/hash";

export const runtime = "edge";

export async function POST(req: Request) {
  try {
    const { token } = (await req.json()) as { token?: string };
    if (!token) {
      return NextResponse.json({ error: "Thiếu token" }, { status: 400 });
    }
    const db = getDb();
    const hash = await sha256Hex(token);
    const row = await db
      .prepare(
        `SELECT t.id as tid, t.user_id, t.expires_at FROM tokens t
         WHERE t.token_hash = ? AND t.type = 'email_verify' LIMIT 1`,
      )
      .bind(hash)
      .first<{ tid: string; user_id: string; expires_at: number }>();

    if (!row) {
      return NextResponse.json({ error: "Token không hợp lệ" }, { status: 400 });
    }
    const now = Math.floor(Date.now() / 1000);
    if (row.expires_at < now) {
      return NextResponse.json({ error: "Token đã hết hạn" }, { status: 400 });
    }

    await db.prepare("UPDATE users SET email_verified_at = ?, updated_at = ? WHERE id = ?").bind(now, now, row.user_id).run();
    await db.prepare("DELETE FROM tokens WHERE id = ?").bind(row.tid).run();

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
