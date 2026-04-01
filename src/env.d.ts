/// <reference types="node" />
/// <reference types="next" />
/// <reference types="next/image" />

declare namespace NodeJS {
  interface ProcessEnv {
    // Turso Database (libSQL)
    TURSO_DATABASE_URL: string;
    TURSO_AUTH_TOKEN: string;
    TURSO_LOCAL_URL: string;

    // Clerk Authentication
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
    CLERK_SECRET_KEY: string;
    CLERK_WEBHOOK_SECRET: string;

    // Groq AI API (for news rewriting)
    GROQ_API_KEY: string;

    // Resend Email API (for OTP)
    RESEND_API_KEY: string;

    // hCaptcha (replacing Cloudflare Turnstile)
    NEXT_PUBLIC_HCAPTCHA_SITE_KEY: string;
    HCAPTCHA_SECRET_KEY: string;

    // PayOS Payment
    NEXT_PUBLIC_PAYOS_CLIENT_ID: string;
    PAYCROS_BANK_CODE: string;
    PAYCROS_ACCOUNT_NUMBER: string;
    PAYCROS_ACCOUNT_NAME: string;
    PAYCROS_API_KEY: string;

    // App URL
    NEXT_PUBLIC_APP_URL: string;
  }
}
