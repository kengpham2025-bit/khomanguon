import { getOptionalRequestContext } from "@cloudflare/next-on-pages";

export function turnstileSecret(): string | undefined {
  const ctx = getOptionalRequestContext();
  return ctx?.env?.TURNSTILE_SECRET_KEY || process.env.TURNSTILE_SECRET_KEY;
}
