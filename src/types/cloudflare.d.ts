import type { D1Database } from "@cloudflare/workers-types";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    TURNSTILE_SECRET_KEY?: string;
    JWT_SECRET?: string;
    RESEND_API_KEY?: string;
    EMAIL_FROM?: string;
  }
}

export {};
