import { getOptionalCloudflareContext } from "./cloudflare-context";

/**
 * JWT_SECRET trên Workers phải lấy từ binding (Dashboard / wrangler secret),
 * không phải lúc nào cũng có trong process.env.
 */
export function getJwtSecretOptional(): string | undefined {
  const ctx = getOptionalCloudflareContext();
  const fromWorker = ctx?.env?.JWT_SECRET;
  if (typeof fromWorker === "string" && fromWorker.trim()) return fromWorker.trim();
  const fromProcess = process.env.JWT_SECRET?.trim();
  return fromProcess || undefined;
}

export function getJwtSecret(): string {
  const s = getJwtSecretOptional();
  if (!s) {
    throw new Error("Thiếu JWT_SECRET — thêm secret trên Worker hoặc biến môi trường.");
  }
  return s;
}
