import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { sha256Hex } from "@/lib/hash";
import { hashPassword } from "@/lib/password";

const ResetSchema = z.object({
  email: z.string().email("Email không hợp lệ"),
  otp: z.string().length(6, "Mã OTP gồm 6 chữ số"),
  password: z.string().min(8, "Mật khẩu phải từ 8 ký tự"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = ResetSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { email, otp, password } = parsed.data;
    const db = getDb();

    const row = await db
      .prepare(
        `SELECT t.id as tid, t.user_id, t.expires_at FROM tokens t
         JOIN users u ON u.id = t.user_id
         WHERE u.email = ? AND t.token_hash = ? AND t.type = 'forgot_password' LIMIT 1`,
      )
      .bind(email.toLowerCase().trim(), await sha256Hex(otp))
      .first<{ tid: string; user_id: string; expires_at: number }>();

    if (!row) {
      return NextResponse.json({ error: "Mã OTP không hợp lệ" }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1000);
    if (row.expires_at < now) {
      return NextResponse.json({ error: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới." }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);
    const updatedAt = Math.floor(Date.now() / 1000);

    await db
      .prepare("UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?")
      .bind(passwordHash, updatedAt, row.user_id)
      .run();

    await db.prepare("DELETE FROM tokens WHERE id = ?").bind(row.tid).run();

    return NextResponse.json({ ok: true, message: "Đặt lại mật khẩu thành công." });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
