import type { D1Database } from "@cloudflare/workers-types";

declare global {
  interface CloudflareEnv {
    DB: D1Database;
    TURNSTILE_SECRET_KEY?: string;
    JWT_SECRET?: string;
    RESEND_API_KEY?: string;
    EMAIL_FROM?: string;
    GROQ_API_KEY?: string;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    FACEBOOK_APP_ID?: string;
    FACEBOOK_APP_SECRET?: string;
    PAYOS_CLIENT_ID?: string;
    PAYOS_API_KEY?: string;
    PAYOS_CHECKSUM_KEY?: string;
  }
}

export {};
