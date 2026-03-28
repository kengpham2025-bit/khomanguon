/**
 * src/lib/session.ts
 *
 * Helper cho server components / route handlers (Next.js App Router).
 * Dùng chung sessions D1 từ lib/sessions.ts — không dùng JWT_SECRET.
 */
import { cookies } from "next/headers";
import { SESSION_COOKIE_NAME, getSession } from "@/lib/sessions";

export async function getSessionFromCookies() {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE_NAME)?.value;
  if (!raw) return null;
  return getSession(raw);
}
