/**
 * GET /api/captcha — hiển thị dãy số (SVG), người dùng nhập lại.
 * POST: { id, answer: "123456" } → { ok, consumeToken }
 */
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const CODE_LEN = 6;
const DIGITS_RE = new RegExp(`^\\d{${CODE_LEN}}$`);

function randomDigits(len: number): string {
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  let s = "";
  for (let i = 0; i < len; i++) s += String(buf[i]! % 10);
  return s;
}

function escapeXml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

/** SVG hiển thị dãy số, có nét nhiễu nhẹ (không trả mã thô ra JSON). */
function buildCaptchaSvg(code: string): string {
  const w = Math.min(280, 32 * code.length + 48);
  const h = 72;
  const lines: string[] = [];
  for (let n = 0; n < 4; n++) {
    const x1 = Math.random() * w;
    const y1 = Math.random() * h;
    lines.push(
      `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${(x1 + 30 + Math.random() * 50).toFixed(1)}" y2="${(y1 + 15 + Math.random() * 25).toFixed(1)}" stroke="#94a3b8" stroke-width="1.2" opacity="0.28"/>`,
    );
  }
  const texts: string[] = [];
  const baseX = 18;
  for (let i = 0; i < code.length; i++) {
    const ch = code[i]!;
    const cx = baseX + i * 36 + (Math.random() * 5 - 2);
    const cy = 48 + (Math.random() * 8 - 4);
    const rot = (Math.random() * 14 - 7).toFixed(1);
    const fs = 30 + Math.floor(Math.random() * 6);
    texts.push(
      `<text x="${cx.toFixed(1)}" y="${cy.toFixed(1)}" transform="rotate(${rot} ${cx.toFixed(1)} ${cy.toFixed(1)})" font-family="Consolas,ui-monospace,Courier New,monospace" font-size="${fs}" font-weight="700" fill="#047857">${escapeXml(ch)}</text>`,
    );
  }
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Mã số xác minh">` +
    `<rect width="100%" height="100%" fill="#f8fafc" rx="8"/>` +
    lines.join("") +
    texts.join("") +
    `</svg>`
  );
}

async function hashChallenge(value: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(value.trim() + "|" + salt);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ---------- GET ---------- */
export async function GET() {
  try {
    const db = getDb();
    const code = randomDigits(CODE_LEN);
    const salt = new Date().toISOString().slice(0, 10);
    const hashedAnswer = await hashChallenge(code, salt);

    const id = crypto.randomUUID();
    const ip = "unknown";
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000;

    await db.prepare(`DELETE FROM captchas WHERE expires_at < ?`).bind(now).run();
    await db.prepare(`DELETE FROM captcha_passes WHERE expires_at < ?`).bind(now).run();

    await db
      .prepare(
        `INSERT INTO captchas (id, code_hash, ip, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(id, hashedAnswer, ip, expiresAt, now)
      .run();

    const svg = buildCaptchaSvg(code);

    return NextResponse.json({
      id,
      svg,
      length: CODE_LEN,
      prompt: `Nhập ${CODE_LEN} chữ số hiển thị trong khung`,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* ---------- POST ---------- */
export async function POST(req: Request) {
  try {
    const body = await req.json() as { id?: unknown; answer?: unknown };
    const { id, answer } = body ?? {};

    if (!id || typeof id !== "string" || !id.trim()) {
      return NextResponse.json({ ok: false, reason: "Thiếu mã xác minh" }, { status: 400 });
    }
    if (answer === undefined || answer === null) {
      return NextResponse.json({ ok: false, reason: "Chưa nhập mã số" }, { status: 400 });
    }

    const digits = String(answer).replace(/\s+/g, "").trim();
    if (!DIGITS_RE.test(digits)) {
      return NextResponse.json(
        { ok: false, reason: `Cần đúng ${CODE_LEN} chữ số` },
        { status: 400 },
      );
    }

    const db = getDb();
    const row = await db
      .prepare(`SELECT id, code_hash, expires_at FROM captchas WHERE id = ? LIMIT 1`)
      .bind(id.trim())
      .first<{ id: string; code_hash: string; expires_at: number }>();

    if (!row) {
      return NextResponse.json({ ok: false, reason: "Mã xác minh không tồn tại" }, { status: 400 });
    }
    if (Date.now() > row.expires_at) {
      await db.prepare(`DELETE FROM captchas WHERE id = ?`).bind(id.trim()).run();
      return NextResponse.json({ ok: false, reason: "Mã xác minh đã hết hạn" }, { status: 400 });
    }

    const salt = new Date().toISOString().slice(0, 10);
    const hashed = await hashChallenge(digits, salt);

    if (hashed !== row.code_hash) {
      return NextResponse.json({ ok: false, reason: "Sai mã số" }, { status: 400 });
    }

    await db.prepare(`DELETE FROM captchas WHERE id = ?`).bind(id.trim()).run();

    const passId = crypto.randomUUID();
    const passExpires = Date.now() + 5 * 60 * 1000;
    await db
      .prepare(`INSERT INTO captcha_passes (id, expires_at, created_at) VALUES (?, ?, ?)`)
      .bind(passId, passExpires, Date.now())
      .run();

    return NextResponse.json({ ok: true, consumeToken: passId });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
