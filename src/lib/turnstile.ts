import { getSetting } from "@/lib/settings";

type TurnstileResult = { success: boolean; "error-codes"?: string[] };

/** Turnstile chỉ chấp nhận một IP; x-forwarded-for có thể là "a, b, c". */
function normalizeRemoteIp(ip: string | undefined): string | undefined {
  if (!ip?.trim()) return undefined;
  const first = ip.split(",")[0]?.trim();
  return first || undefined;
}

export async function verifyTurnstile(
  secret: string | undefined,
  token: string | undefined,
  remoteip?: string,
): Promise<boolean> {
  if (!secret) {
    secret = await getSetting("turnstile_secret_key");
  }
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!token) return false;
  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  const ip = normalizeRemoteIp(remoteip);
  if (ip) body.set("remoteip", ip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json()) as TurnstileResult;
  return Boolean(json.success);
}
