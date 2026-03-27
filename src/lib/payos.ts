/**
 * PayOS Utility — tích hợp thanh toán qua kênh PayOS
 *
 * Docs: https://payos.vn/docs/sdks/back-end/node/
 * SDK:  @payos/node
 */
import { PayOS } from "@payos/node";
import { getOptionalCloudflareContext } from "./cloudflare-context";

export interface PayOSEnv {
  clientId: string;
  apiKey: string;
  checksumKey: string;
}

let _payos: PayOS | null = null;

export function getPayOS(): PayOS {
  if (_payos) return _payos;

  const ctx = getOptionalCloudflareContext();
  const env = ctx?.env;

  const clientId =
    (env?.PAYOS_CLIENT_ID as string | undefined) ||
    process.env.PAYOS_CLIENT_ID ||
    "";
  const apiKey =
    (env?.PAYOS_API_KEY as string | undefined) ||
    process.env.PAYOS_API_KEY ||
    "";
  const checksumKey =
    (env?.PAYOS_CHECKSUM_KEY as string | undefined) ||
    process.env.PAYOS_CHECKSUM_KEY ||
    "";

  if (!clientId || !apiKey || !checksumKey) {
    throw new Error(
      "PayOS credentials not configured. Set PAYOS_CLIENT_ID, PAYOS_API_KEY, PAYOS_CHECKSUM_KEY.",
    );
  }

  _payos = new PayOS({ clientId, apiKey, checksumKey });
  return _payos;
}

export function resetPayOS(): void {
  _payos = null;
}

/** Tạo order code duy nhất từ timestamp + random */
export function generateOrderCode(): number {
  const now = Date.now();
  const rand = Math.floor(Math.random() * 1000);
  return Number(String(now).slice(-6) + String(rand).padStart(3, "0"));
}
