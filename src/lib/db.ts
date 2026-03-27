import type { D1Database } from "@cloudflare/workers-types";
import { getOptionalCloudflareContext } from "./cloudflare-context";

export function getDb(): D1Database {
  const ctx = getOptionalCloudflareContext();
  const db = ctx?.env?.DB as D1Database | undefined;
  if (!db) {
    throw new Error(
      "D1 không khả dụng. Deploy lên Cloudflare hoặc chạy `npm run pages:preview` / `wrangler pages dev` với binding DB.",
    );
  }
  return db;
}
