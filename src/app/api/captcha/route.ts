/**
 * GET /api/captcha — captcha chọn biểu tượng SVG (không phép toán).
 * POST: { id, answer: "<icon_key>" } → { ok, consumeToken }
 */
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

/* ---------- SVG icon pool (key = đáp án server, label = gợi ý tiếng Việt) ---------- */

const ICON_POOL: { key: string; label: string; body: string }[] = [
  {
    key: "circle",
    label: "hình tròn",
    body: `<circle cx="24" cy="24" r="14" fill="none" stroke="#0f766e" stroke-width="3"/>`,
  },
  {
    key: "square",
    label: "hình vuông",
    body: `<rect x="11" y="11" width="26" height="26" rx="2" fill="none" stroke="#0f766e" stroke-width="3"/>`,
  },
  {
    key: "triangle",
    label: "tam giác",
    body: `<path d="M24 10 L38 38 H10 Z" fill="none" stroke="#0f766e" stroke-width="3" stroke-linejoin="round"/>`,
  },
  {
    key: "star",
    label: "ngôi sao",
    body: `<path d="M24 8l3.2 9.8h10.4l-8.4 6.1 3.2 9.9-8.4-6.1-8.4 6.1 3.2-9.9-8.4-6.1h10.4z" fill="none" stroke="#0f766e" stroke-width="2.2" stroke-linejoin="round"/>`,
  },
  {
    key: "bolt",
    label: "tia chớp",
    body: `<path d="M28 6L12 26h10l-4 16 16-22H26z" fill="none" stroke="#0f766e" stroke-width="2.6" stroke-linejoin="round"/>`,
  },
  {
    key: "diamond",
    label: "hình thoi",
    body: `<path d="M24 9 L37 24 24 39 11 24 Z" fill="none" stroke="#0f766e" stroke-width="3" stroke-linejoin="round"/>`,
  },
  {
    key: "hexagon",
    label: "lục giác",
    body: `<path d="M24 8l10 6v12l-10 6-10-6V14z" fill="none" stroke="#0f766e" stroke-width="3" stroke-linejoin="round"/>`,
  },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function wrapSvg(body: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" aria-hidden="true">` +
    body +
    `</svg>`
  );
}

async function hashChallenge(value: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(value.toLowerCase().trim() + "|" + salt);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const KEY_RE = /^[a-z][a-z0-9_]{0,31}$/;

/* ---------- GET ---------- */
export async function GET() {
  try {
    const db = getDb();
    const four = shuffle([...ICON_POOL]).slice(0, 4);
    const correct = four[Math.floor(Math.random() * four.length)]!;
    const salt = new Date().toISOString().slice(0, 10);
    const hashedAnswer = await hashChallenge(correct.key, salt);

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

    const icons = shuffle(four).map((item) => ({
      key: item.key,
      svg: wrapSvg(item.body),
    }));

    return NextResponse.json({
      id,
      prompt: `Chọn biểu tượng ${correct.label}`,
      icons,
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
      return NextResponse.json({ ok: false, reason: "Chưa chọn biểu tượng" }, { status: 400 });
    }

    const key = String(answer).trim().toLowerCase();
    if (!KEY_RE.test(key)) {
      return NextResponse.json({ ok: false, reason: "Lựa chọn không hợp lệ" }, { status: 400 });
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
    const hashed = await hashChallenge(key, salt);

    if (hashed !== row.code_hash) {
      return NextResponse.json({ ok: false, reason: "Chưa đúng biểu tượng" }, { status: 400 });
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
