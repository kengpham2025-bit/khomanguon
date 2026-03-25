import type { D1Database } from "@cloudflare/workers-types";
import { getOptionalRequestContext } from "@cloudflare/next-on-pages";

export function getDb(): D1Database {
  const ctx = getOptionalRequestContext();
  const db = ctx?.env?.DB as D1Database | undefined;
  if (!db) {
    throw new Error(
      "D1 không khả dụng. Deploy lên Cloudflare Pages hoặc chạy `npm run pages:build` rồi `wrangler pages dev .vercel/output/static --d1 DB=khomanguonnew`.",
    );
  }
  return db;
}
