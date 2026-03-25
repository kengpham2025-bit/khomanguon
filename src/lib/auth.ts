import { SignJWT, jwtVerify } from "jose";
import type { JWTPayload } from "jose";

export type SessionPayload = JWTPayload & {
  sub: string;
  email: string;
  role: string;
};

const COOKIE = "kmn_session";

function secretKey() {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error("Thiếu JWT_SECRET");
  return new TextEncoder().encode(s);
}

export async function signSession(payload: {
  userId: string;
  email: string;
  role: string;
}): Promise<string> {
  return new SignJWT({
    email: payload.email,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey());
    if (!payload.sub || typeof payload.email !== "string" || typeof payload.role !== "string")
      return null;
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export { COOKIE as SESSION_COOKIE_NAME };

export function sessionCookieOptions(maxAgeSec: number) {
  return {
    httpOnly: true as const,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: maxAgeSec,
  };
}
