import { SignJWT, jwtVerify } from "jose";
import { getOptionalCloudflareContext } from "@/lib/cloudflare-context";

const PURPOSE = "captcha_consume";

function jwtSecretKey(): Uint8Array | null {
  const ctx = getOptionalCloudflareContext();
  const s = ctx?.env?.JWT_SECRET ?? process.env.JWT_SECRET;
  if (typeof s !== "string" || !s.trim()) return null;
  return new TextEncoder().encode(s.trim());
}

/** JWT ngắn hạn chứng minh đã giải captcha SVG (dùng khi gọi login/register/withdraw). */
export async function signCaptchaConsumeToken(
  captchaId: string,
  expiresAtMs: number,
): Promise<string | null> {
  const key = jwtSecretKey();
  if (!key) return null;
  const expSec = Math.floor(expiresAtMs / 1000);
  try {
    return await new SignJWT({ purpose: PURPOSE })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(captchaId)
      .setExpirationTime(expSec)
      .sign(key);
  } catch {
    return null;
  }
}

export async function verifyCaptchaConsumeToken(token: string): Promise<boolean> {
  const key = jwtSecretKey();
  if (!key) return false;
  try {
    const { payload } = await jwtVerify(token, key);
    return (
      payload.purpose === PURPOSE &&
      typeof payload.sub === "string" &&
      payload.sub.length > 0
    );
  } catch {
    return false;
  }
}
