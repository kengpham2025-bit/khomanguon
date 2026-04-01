// Verify hCaptcha token server-side
export async function verifyHCaptcha(token: string): Promise<boolean> {
  const secret = process.env.HCAPTCHA_SECRET_KEY;

  if (!secret) {
    console.error("Missing HCAPTCHA_SECRET_KEY");
    return false;
  }

  try {
    const params = new URLSearchParams({
      secret,
      response: token,
    });

    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await response.json();
    return data.success === true;
  } catch {
    return false;
  }
}

// Get hCaptcha site key for client components
export function getHCaptchaSiteKey(): string {
  return process.env.NEXT_PUBLIC_HCAPTCHA_SITE_KEY || "";
}
