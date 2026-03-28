/**
 * GET /api/captcha — tạo phép toán mới, trả về id + câu hỏi.
 * Body (POST) để verify: { id, answer } → { ok: true/false }
 */
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { signCaptchaConsumeToken } from "@/lib/captcha-consume-jwt";

/* ---------- Math captcha generator ---------- */

type Operator = "+" | "-";

interface MathProblem {
  a: number;
  b: number;
  op: Operator;
  answer: number;
}

function generateMathProblem(): MathProblem {
  const op: Operator = Math.random() < 0.6 ? "+" : "-";
  let a: number;
  let b: number;

  if (op === "+") {
    a = Math.floor(Math.random() * 15) + 3; // 3–17
    b = Math.floor(Math.random() * 10) + 2; // 2–11
    // result 5–28, always positive
  } else {
    a = Math.floor(Math.random() * 12) + 8; // 8–19
    b = Math.floor(Math.random() * 7) + 2;   // 2–8
    // result 1–17, always positive
  }

  return { a, b, op, answer: op === "+" ? a + b : a - b };
}

function mathQuestionText(p: MathProblem): string {
  return `${p.a} ${p.op} ${p.b} = ?`;
}

async function hashAnswer(answer: number, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${answer}|${salt}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* ---------- GET: tạo captcha toán mới ---------- */
export async function GET() {
  try {
    const db = getDb();
    const problem = generateMathProblem();

    // Salt cố định trong ngày
    const salt = new Date().toISOString().slice(0, 10);
    const hashedAnswer = await hashAnswer(problem.answer, salt);

    const id = crypto.randomUUID();
    const ip = "unknown";
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // 10 phút

    // Dọn captcha cũ
    await db.prepare(`DELETE FROM captchas WHERE expires_at < ?`).bind(now).run();

    await db
      .prepare(
        `INSERT INTO captchas (id, code_hash, ip, expires_at, created_at) VALUES (?, ?, ?, ?, ?)`,
      )
      .bind(id, hashedAnswer, ip, expiresAt, now)
      .run();

    return NextResponse.json({ id, question: mathQuestionText(problem) });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/* ---------- POST: verify captcha ---------- */
export async function POST(req: Request) {
  try {
    const body = await req.json() as { id?: unknown; answer?: unknown };
    const { id, answer } = body ?? {};

    if (!id || typeof id !== "string" || !id.trim()) {
      return NextResponse.json({ ok: false, reason: "Thiếu mã xác minh" }, { status: 400 });
    }
    if (answer === undefined || answer === null || String(answer).trim() === "") {
      return NextResponse.json({ ok: false, reason: "Thiếu kết quả" }, { status: 400 });
    }

    const numAnswer = Number(answer);
    if (!Number.isInteger(numAnswer)) {
      return NextResponse.json({ ok: false, reason: "Kết quả phải là số nguyên" }, { status: 400 });
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
    const hashed = await hashAnswer(numAnswer, salt);

    if (hashed !== row.code_hash) {
      return NextResponse.json({ ok: false, reason: "Kết quả không đúng" }, { status: 400 });
    }

    const consumeToken = await signCaptchaConsumeToken(row.id, row.expires_at);

    // Xóa captcha sau khi verify thành công
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
