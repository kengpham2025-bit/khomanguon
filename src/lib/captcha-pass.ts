import { getDb } from "@/lib/db";

/** Xác minh vé captcha một lần (lưu D1), không dùng JWT_SECRET. */
export async function verifyAndConsumeCaptchaPass(ticket: string): Promise<boolean> {
  const id = ticket?.trim();
  if (!id) return false;
  const now = Date.now();
  const db = getDb();
  const row = await db
    .prepare(`DELETE FROM captcha_passes WHERE id = ? AND expires_at > ? RETURNING id`)
    .bind(id, now)
    .first<{ id: string }>();
  return Boolean(row?.id);
}
