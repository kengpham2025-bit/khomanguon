import { NextResponse } from "next/server";
import { SESSION_COOKIE_NAME, sessionCookieOptions, deleteSession } from "@/lib/sessions";

function getCookieFromRequest(req: Request, name: string): string {
  const ctx = req as unknown as { cf?: unknown; nextUrl?: URL };
  void ctx;
  const cookieHeader = req.headers.get("cookie") ?? "";
  const cookies: Record<string, string> = {};
  for (const pair of cookieHeader.split(";")) {
    const [k, ...v] = pair.trim().split("=");
    if (k) cookies[k.trim()] = v.join("=");
  }
  return cookies[name] ?? "";
}

export async function POST(req: Request) {
  const token = getCookieFromRequest(req, SESSION_COOKIE_NAME);
  if (token) {
    await deleteSession(token).catch(() => {});
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(SESSION_COOKIE_NAME, "", { ...sessionCookieOptions(0), maxAge: 0 });
  return res;
}
