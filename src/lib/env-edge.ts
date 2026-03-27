import { getOptionalCloudflareContext } from "./cloudflare-context";

/** Site key từ Worker bindings hoặc env — không dùng SETTINGS defaultValue (NEXT_PUBLIC_* bị Next build inline rỗng). */
export function turnstileSiteKey(): string | undefined {
  const ctx = getOptionalCloudflareContext();
  const fromBindings = ctx?.env?.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
  if (fromBindings?.trim()) return fromBindings.trim();
  const fromEnv = process.env["NEXT_PUBLIC_TURNSTILE_SITE_KEY"];
  if (fromEnv?.trim()) return fromEnv.trim();
  return undefined;
}

export function turnstileSecret(): string | undefined {
  const ctx = getOptionalCloudflareContext();
  return (
    ctx?.env?.TURNSTILE_SECRET_KEY ||
    process.env["TURNSTILE_SECRET_KEY"]
  );
}

export function groqApiKey(): string | undefined {
  const ctx = getOptionalCloudflareContext();
  return ctx?.env?.GROQ_API_KEY || process.env.GROQ_API_KEY;
}
