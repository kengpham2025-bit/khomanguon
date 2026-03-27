import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { CloudflareContext } from "@opennextjs/cloudflare";

/** Giống getOptionalRequestContext của next-on-pages: không throw khi chạy next dev / build ngoài Worker. */
export function getOptionalCloudflareContext():
  | CloudflareContext
  | undefined {
  try {
    return getCloudflareContext();
  } catch {
    return undefined;
  }
}
