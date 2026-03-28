import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { newId } from "@/lib/ids";
import { getSessionFromCookies } from "@/lib/session";

const schema = z.object({ message: z.string().max(2000).optional() });

export async function POST(req: Request) {
  const s = await getSessionFromCookies();
  if (!s?.userId) return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  const db = getDb();
  const u = await db
    .prepare(`SELECT seller_status FROM users WHERE id = ?`)
    .bind(s.userId)
    .first<{ seller_status: string }>();

  if (!u) return NextResponse.json({ error: "Không tìm thấy user" }, { status: 404 });
  if (u.seller_status === "approved") {
    return NextResponse.json({ error: "Bạn đã là người bán" }, { status: 400 });
  }
  if (u.seller_status === "pending") {
    return NextResponse.json({ error: "Đơn đang chờ duyệt" }, { status: 400 });
  }

  const now = Math.floor(Date.now() / 1000);
  if (u.seller_status === "rejected") {
    await db.prepare(`UPDATE users SET seller_status = 'none', updated_at = ? WHERE id = ?`).bind(now, s.userId).run();
  }

  const id = newId();
  await db
    .prepare(
      `INSERT INTO seller_applications (id, user_id, message, status, created_at) VALUES (?, ?, ?, 'pending', ?)`,
    )
    .bind(id, s.userId, parsed.data.message ?? null, now)
    .run();

  await db.prepare(`UPDATE users SET seller_status = 'pending', updated_at = ? WHERE id = ?`).bind(now, s.userId).run();

  return NextResponse.json({ ok: true });
}
