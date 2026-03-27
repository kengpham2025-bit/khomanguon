/**
 * GET /api/captcha — tạo mã captcha mới, trả về id + svg để render.
 * Body (POST) để verify: { id, code } → { ok: true/false }
 */
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { signCaptchaConsumeToken } from "@/lib/captcha-consume-jwt";

/* ---------- SVG captcha generator ---------- */

const CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function rndChar(): string {
  return CHARS[Math.floor(Math.random() * CHARS.length)];
}

/** SVG base chuẩn, góc trên-trái (0,0) */
function svgStart(w: number, h: number) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">`;
}

function captchaSvg(code: string): string {
  const W = 168;
  const H = 56;
  const FS = 34;
  const bg =
    `<rect width="${W}" height="${H}" rx="8" fill="#f8fafc"/>` +
    `<rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="7" fill="none" stroke="#10b981" stroke-width="1.5" opacity="0.45"/>`;

  const chars = code.split("");
  const letterRenders = chars.map((ch, i) => {
    const x = 22 + i * 36;
    const y = 40;
    const rot = (Math.random() - 0.5) * 18;
    const tx = `translate(${x},${y}) rotate(${rot})`;
    return (
      `<text font-family="Consolas, ui-monospace, monospace" font-size="${FS}" font-weight="800" ` +
      `fill="#0f766e" stroke="#ecfdf5" stroke-width="1.2" paint-order="stroke fill" ` +
      `transform="${tx}" text-anchor="middle" dominant-baseline="middle">${ch}</text>`
    );
  });

  const lines: string[] = [];
  for (let l = 0; l < 2; l++) {
    const y1 = 12 + Math.floor(Math.random() * (H - 24));
    const x2 = 60 + Math.floor(Math.random() * 90);
    lines.push(
      `<line x1="6" y1="${y1}" x2="${x2}" stroke="#94a3b8" stroke-width="1" opacity="0.2"/>`,
    );
  }

  const dots: string[] = [];
  for (let d = 0; d < 10; d++) {
    const cx = Math.floor(Math.random() * W);
    const cy = Math.floor(Math.random() * H);
    dots.push(`<circle cx="${cx}" cy="${cy}" r="1" fill="#64748b" opacity="0.12"/>`);
  }

  return svgStart(W, H) + bg + lines.join("") + dots.join("") + letterRenders.join("") + "</svg>";
}

/* ---------- Simple hash (fast, server-only) ---------- */
// Dùng Web Crypto API — có sẵn trong Workers, không cần thư viện ngoài
async function hashCode(code: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(code.toUpperCase() + "|" + salt);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ---------- GET: tạo captcha mới ---------- */
export async function GET() {
  try {
    const db = getDb();
    const code = Array.from({ length: 4 }, () => rndChar()).join("");

    // Salt ngẫu nhiên trong 1 ngày (mỗi ngày salt mới → captcha cũ không verify được sau 1 ngày)
    const salt = new Date().toISOString().slice(0, 10);
    const hashed = await hashCode(code, salt);

    const id = crypto.randomUUID();
    const ip = "unknown"; // có thể mở rộng lưu IP sau
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // 10 phút

    // Xóa captcha cũ (cleanup)
    await db.prepare(`DELETE FROM captchas WHERE expires_at < ?`).bind(now).run();

    await db.prepare(
      `INSERT INTO captchas (id, code_hash, ip, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`,
    )
      .bind(id, hashed, ip, expiresAt, now)
      .run();

    const svg = captchaSvg(code);

    return NextResponse.json({ id, svg });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* ---------- POST: verify captcha ---------- */
export async function POST(req: Request) {
  try {
    const body = await req.json() as { id?: unknown; code?: unknown };
    const { id, code } = body ?? {};

    if (!id || typeof id !== "string" || !id.trim()) {
      return NextResponse.json({ ok: false, reason: "Thiếu mã captcha" }, { status: 400 });
    }
    if (!code || typeof code !== "string" || !code.trim()) {
      return NextResponse.json({ ok: false, reason: "Thiếu mã captcha" }, { status: 400 });
    }

    const db = getDb();
    const row = await db.prepare(
      `SELECT id, code_hash, expires_at FROM captchas WHERE id = ? LIMIT 1`,
    )
      .bind(id.trim())
      .first<{ id: string; code_hash: string; expires_at: number }>();

    if (!row) {
      return NextResponse.json({ ok: false, reason: "Captcha không tồn tại" }, { status: 400 });
    }
    if (Date.now() > row.expires_at) {
      await db.prepare(`DELETE FROM captchas WHERE id = ?`).bind(id.trim()).run();
      return NextResponse.json({ ok: false, reason: "Captcha đã hết hạn" }, { status: 400 });
    }

    const salt = new Date().toISOString().slice(0, 10);
    const hashed = await hashCode(code, salt);

    if (hashed !== row.code_hash) {
      return NextResponse.json({ ok: false, reason: "Mã captcha không đúng" }, { status: 400 });
    }

    const consumeToken = await signCaptchaConsumeToken(row.id, row.expires_at);

    // Verify thành công → xóa captcha; client gửi consumeToken (JWT) khi đăng nhập/đăng ký
    await db.prepare(`DELETE FROM captchas WHERE id = ?`).bind(id.trim()).run();

    if (!consumeToken) {
      return NextResponse.json(
        { ok: false, reason: "Máy chủ chưa cấu hình JWT_SECRET" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, consumeToken });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
