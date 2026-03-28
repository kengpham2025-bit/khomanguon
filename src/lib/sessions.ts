/**
 * src/lib/sessions.ts
 *
 * Quản lý session hoàn toàn bằng D1 — không dùng JWT_SECRET.
 * Cookie chỉ chứa session token ngẫu nhiên (opaque), dữ liệu user lấy từ D1.
 */
import { getDb } from "@/lib/db";

const SESSION_COOKIE = "kmn_session";

/* ─── Cookie options ──────────────────────────────────────────────────────── */

export function sessionCookieOptions(maxAgeSec: number) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}

export { SESSION_COOKIE as SESSION_COOKIE_NAME };

/* ─── Create ──────────────────────────────────────────────────────────────── */

/**
 * Tạo session mới trong D1, trả về token để ghi vào cookie.
 */
export async function createSession(userId: string): Promise<string> {
  const db = getDb();
  const now = Math.floor(Date.now() / 1000);

  // Dọn session hết hạn trước khi tạo mới
  await db.prepare(`DELETE FROM sessions WHERE expires_at < ?`).bind(now).run();

  const token = crypto.randomUUID().replace(/-/g, "") + crypto.randomUUID().replace(/-/g, "");
  const sessionId = crypto.randomUUID();
  const expiresAt = now + 7 * 24 * 60 * 60; // 7 ngày

  await db
    .prepare(
      `INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)`,
    )
    .bind(sessionId, userId, expiresAt, now)
    .run();

  return token;
}

/* ─── Verify / Get ───────────────────────────────────────────────────────── */

export interface SessionData {
  userId: string;
  email: string;
  role: string;
}

/**
 * Xác minh token từ cookie → trả dữ liệu user nếu còn hạn.
 * Trả null nếu token không tồn tại hoặc đã hết hạn.
 */
export async function getSession(token: string): Promise<SessionData | null> {
  if (!token || token.trim() === "") return null;

  const db = getDb();
  const now = Math.floor(Date.now() / 1000);

  const row = await db
    .prepare(
      `SELECT s.user_id, u.email, u.role
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.id = ? AND s.expires_at > ?
       LIMIT 1`,
    )
    .bind(token, now)
    .first<{ user_id: string; email: string; role: string }>();

  if (!row) return null;

  return {
    userId: row.user_id,
    email: row.email,
    role: row.role,
  };
}

/**
 * Xóa session hiện tại (đăng xuất).
 */
export async function deleteSession(token: string): Promise<void> {
  if (!token || token.trim() === "") return;
  const db = getDb();
  await db.prepare(`DELETE FROM sessions WHERE id = ?`).bind(token).run();
}

/**
 * Xóa toàn bộ session của một user (đăng xuất hết thiết bị).
 */
export async function deleteAllUserSessions(userId: string): Promise<void> {
  const db = getDb();
  await db.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(userId).run();
}
