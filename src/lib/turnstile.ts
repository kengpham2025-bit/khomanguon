import { getSetting } from "@/lib/settings";

type TurnstileResult = { success: boolean; "error-codes"?: string[] };

export async function verifyTurnstile(
  secret: string | undefined,
  token: string | undefined,
  remoteip?: string,
): Promise<boolean> {
  if (!secret) {
    // Fallback: đọc từ DB
    secret = await getSetting("turnstile_secret_key");
  }
  if (!secret) return process.env.NODE_ENV !== "production";
  if (!token) return false;
  const body = new URLSearchParams();
  body.set("secret", secret);
  body.set("response", token);
  if (remoteip) body.set("remoteip", remoteip);
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const json = (await res.json()) as TurnstileResult;
  return Boolean(json.success);
}
