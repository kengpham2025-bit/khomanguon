import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const HCAPTCHA_SECRET = process.env.HCAPTCHA_SECRET_KEY;

  if (!HCAPTCHA_SECRET) {
    return NextResponse.json({ error: "Missing hCaptcha secret" }, { status: 500 });
  }

  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const params = new URLSearchParams({
      secret: HCAPTCHA_SECRET,
      response: token,
    });

    const response = await fetch("https://hcaptcha.com/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const data = await response.json();

    if (!data.success) {
      return NextResponse.json(
        { verified: false, errorCodes: data["error-codes"] },
        { status: 400 }
      );
    }

    return NextResponse.json({ verified: true, score: data.score });
  } catch (err) {
    console.error("hCaptcha verify error:", err);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
