import crypto from "crypto";

interface PayOSConfig {
  clientId: string;
  apiKey: string;
  checksumKey: string;
}

interface PayOSPaymentData {
  orderCode: string;
  amount: number;
  description: string;
  returnUrl: string;
  cancelUrl: string;
  buyerName?: string;
  buyerEmail?: string;
  buyerPhone?: string;
}

interface PayOSCreatePaymentResponse {
  checkoutUrl: string;
  paymentLinkId: string;
  qrCode: string;
  orderCode: string;
}

function signPayOS(data: Record<string, string | number>, key: string): string {
  const sortedKeys = Object.keys(data).sort();
  const signData = sortedKeys.map((k) => `${k}=${data[k]}`).join("&");
  return crypto.createHmac("sha256", key).update(signData).digest("hex");
}

export function getPayOSConfig(): PayOSConfig {
  return {
    clientId: process.env.NEXT_PUBLIC_PAYOS_CLIENT_ID!,
    apiKey: process.env.PAYCROS_API_KEY!,
    checksumKey: process.env.PAYCROS_CHECKSUM_KEY || process.env.PAYCROS_API_KEY!,
  };
}

// Generate a unique order code (PayOS requires numeric string up to 20 digits)
export function generatePayOSOrderCode(): string {
  const timestamp = Date.now().toString().slice(-10); // last 10 digits
  const random = Math.floor(Math.random() * 9000 + 1000).toString(); // 4 random digits
  return (timestamp + random).slice(-14);
}

// Create a PayOS payment link
export async function createPayOSPayment(
  data: PayOSPaymentData
): Promise<PayOSCreatePaymentResponse> {
  const config = getPayOSConfig();

  const payload: Record<string, string | number> = {
    clientId: config.clientId,
    apiKey: config.apiKey,
    amount: data.amount,
    orderCode: data.orderCode,
    description: data.description,
    returnUrl: data.returnUrl,
    cancelUrl: data.cancelUrl,
    buyerName: data.buyerName || "",
    buyerEmail: data.buyerEmail || "",
    buyerPhone: data.buyerPhone || "",
  };

  const signature = signPayOS(payload, config.checksumKey);
  payload["signature"] = signature;

  const response = await fetch("https://api.payos.vn/v1/payment-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`PayOS error: ${JSON.stringify(err)}`);
  }

  return response.json();
}

// Verify PayOS webhook signature
export function verifyPayOSWebhook(
  rawBody: string,
  signature: string,
  checksumKey: string
): boolean {
  // PayOS typically sends: orderCode, amount, status, ...
  const data = JSON.parse(rawBody);
  const { signature: _sig, ...rest } = data;

  const signData = Object.keys(rest)
    .sort()
    .map((k) => `${k}=${rest[k]}`)
    .join("&");

  const expectedSig = crypto.createHmac("sha256", checksumKey).update(signData).digest("hex");
  return signature === expectedSig;
}

// Get PayOS payment status
export async function getPayOSPaymentStatus(paymentLinkId: string) {
  const config = getPayOSConfig();

  const response = await fetch(
    `https://api.payos.vn/v1/payment-requests/${paymentLinkId}`,
    {
      headers: {
        "Content-Type": "application/json",
        "X-Client-Id": config.clientId,
        "X-Api-Key": config.apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to get PayOS payment status");
  }

  return response.json();
}
