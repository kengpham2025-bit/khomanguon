import { getOptionalCloudflareContext } from "./cloudflare-context";

export function turnstileSecret(): string | undefined {
  const ctx = getOptionalCloudflareContext();
  return ctx?.env?.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY;
}

export function groqApiKey(): string | undefined {
  const ctx = getOptionalCloudflareContext();
  return ctx?.env?.GROQ_API_KEY || process.env.GROQ_API_KEY;
}
