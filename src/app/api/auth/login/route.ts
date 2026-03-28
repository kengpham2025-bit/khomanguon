import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/password";
import { z } from "zod";
import { getDb } from "@/lib/db";
import { SESSION_COOKIE_NAME, sessionCookieOptions, createSession } from "@/lib/sessions";
import { verifyAndConsumeCaptchaPass } from "@/lib/captcha-pass";
import { verifyTurnstile } from "@/lib/turnstile";

const bodySchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(1),
    captchaToken: z.string().min(1).optional(),
    turnstileToken: z.string().min(1).optional(),
  })
  .refine((d) => Boolean(d.captchaToken) || Boolean(d.turnstileToken), {
    message: "Thiếu mã bảo vệ",
    path: ["captchaToken"],
  });

function clientIp(req: Request): string | undefined {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf?.trim()) return cf.trim();
  const xff = req.headers.get("x-forwarded-for");
  const first = xff?.split(",")[0]?.trim();
  return first || undefined;
}

async function verifyHumanGate(
  captchaToken: string | undefined,
  turnstileToken: string | undefined,
  req: Request,
): Promise<boolean> {
  if (turnstileToken) {
    return verifyTurnstile(undefined, turnstileToken, clientIp(req));
  }
  if (captchaToken) {
    return verifyAndConsumeCaptchaPass(captchaToken);
  }
  return false;
}

export async function POST(req: Request) {
  try {
    const parsed = bodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Dữ liệu không hợp lệ" }, { status: 400 });
    }
    const { email, password, captchaToken, turnstileToken } = parsed.data;

    const ok = await verifyHumanGate(captchaToken, turnstileToken, req);
    if (!ok) {
      return NextResponse.json({ error: "Mã bảo vệ không hợp lệ hoặc đã hết hạn" }, { status: 400 });
    }

    const db = getDb();
    const user = await db
      .prepare(
        `SELECT id, email, password_hash, role, email_verified_at, seller_status, kyc_status FROM users WHERE email = ? LIMIT 1`,
      )
      .bind(email.toLowerCase())
      .first<{
        id: string;
        email: string;
        password_hash: string;
        role: string;
        email_verified_at: number | null;
        seller_status: string;
        kyc_status: string;
      }>();

    if (!user || !(await verifyPassword(password, user.password_hash))) {
      return NextResponse.json({ error: "Sai email hoặc mật khẩu" }, { status: 401 });
    }

    if (!user.email_verified_at) {
      return NextResponse.json(
        { error: "Tài khoản chưa xác nhận email. Vui lòng kiểm tra hộp thư." },
        { status: 403 },
      );
    }

    const token = await createSession(user.id);
    const res = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        seller_status: user.seller_status,
        kyc_status: user.kyc_status,
      },
    });
    res.cookies.set(SESSION_COOKIE_NAME, token, sessionCookieOptions(60 * 60 * 24 * 7));
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Lỗi máy chủ" }, { status: 500 });
  }
}
