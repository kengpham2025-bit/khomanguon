import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/session";

const schema = z.object({
  note: z.string().max(500).optional(),
  cccdImageBase64: z.string().max(450000).optional(),
});

export async function POST(req: Request) {
  const s = await getSessionFromCookies();
  if (!s?.sub) return NextResponse.json({ error: "Cần đăng nhập" }, { status: 401 });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Ảnh CCCD quá lớn hoặc dữ liệu không hợp lệ" }, { status: 400 });

  const db = getDb();
  const now = Math.floor(Date.now() / 1000);
  const payload = [parsed.data.note, parsed.data.cccdImageBase64].filter(Boolean).join("\n---\n").slice(0, 500000);

  await db
    .prepare(`UPDATE users SET kyc_status = 'pending', kyc_cccd_note = ?, kyc_submitted_at = ?, updated_at = ? WHERE id = ?`)
    .bind(payload || "Đã gửi yêu cầu KYC", now, now, s.sub)
    .run();

  return NextResponse.json({ ok: true, message: "Đã gửi hồ sơ. Admin sẽ xét duyệt." });
}
