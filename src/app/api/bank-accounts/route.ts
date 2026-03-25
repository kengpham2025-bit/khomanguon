import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { newId } from "@/lib/ids";
import { getSessionFromCookies } from "@/lib/session";
import { VN_BANKS } from "@/lib/vn-banks";

export const runtime = "edge";

async function requireWithdrawSeller() {
  const s = await getSessionFromCookies();
  if (!s?.sub) return null;
  const db = getDb();
  const u = await db
    .prepare(`SELECT id, role, seller_status FROM users WHERE id = ?`)
    .bind(s.sub)
    .first<{ id: string; role: string; seller_status: string }>();
  if (!u) return null;
  const ok =
    u.role === "admin" || u.role === "seller" || u.seller_status === "approved";
  if (!ok) return null;
  return u;
}

export async function GET() {
  const u = await requireWithdrawSeller();
  if (!u) return NextResponse.json({ error: "Chỉ người bán đã duyệt mới quản lý TK ngân hàng" }, { status: 403 });
  const db = getDb();
  const rows = await db
    .prepare(`SELECT * FROM bank_accounts WHERE user_id = ? ORDER BY created_at DESC`)
    .bind(u.id)
    .all();
  return NextResponse.json({ accounts: rows.results ?? [], banks: VN_BANKS });
}

const postSchema = z.object({
  bankCode: z.string().min(2).max(12),
  accountNumber: z.string().min(4).max(32),
  accountName: z.string().min(2).max(120),
  isDefault: z.boolean().optional(),
});

export async function POST(req: Request) {
  const u = await requireWithdrawSeller();
  if (!u) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const parsed = postSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });

  const code = parsed.data.bankCode.toUpperCase();
  if (!VN_BANKS.some((b) => b.code === code)) {
    return NextResponse.json({ error: "Ngân hàng không hợp lệ" }, { status: 400 });
  }

  const db = getDb();
  const id = newId();
  const now = Math.floor(Date.now() / 1000);

  if (parsed.data.isDefault) {
    await db.prepare(`UPDATE bank_accounts SET is_default = 0 WHERE user_id = ?`).bind(u.id).run();
  }

  await db
    .prepare(
      `INSERT INTO bank_accounts (id, user_id, bank_code, account_number, account_name, is_default, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      id,
      u.id,
      code,
      parsed.data.accountNumber,
      parsed.data.accountName,
      parsed.data.isDefault ? 1 : 0,
      now,
    )
    .run();

  return NextResponse.json({ ok: true, id });
}
