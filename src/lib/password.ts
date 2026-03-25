const ITER = 120_000;

function bytesToB64(bytes: Uint8Array): string {
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin);
}

function b64ToBytes(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: ITER,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );
  const hashBytes = new Uint8Array(bits);
  return `v1.${bytesToB64(salt)}.${bytesToB64(hashBytes)}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (!stored.startsWith("v1.")) return false;
  const parts = stored.split(".");
  if (parts.length !== 3) return false;
  const salt = b64ToBytes(parts[1]);
  const expected = b64ToBytes(parts[2]);
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt.buffer as ArrayBuffer,
      iterations: ITER,
      hash: "SHA-256",
    },
    keyMaterial,
    256,
  );
  const out = new Uint8Array(bits);
  if (out.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < out.length; i++) diff |= out[i] ^ expected[i];
  return diff === 0;
}
