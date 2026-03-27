import { NextResponse } from "next/server";
import { isOAuthConfigured } from "@/lib/oauth";

export async function GET() {
  const [google, facebook] = await Promise.all([
    isOAuthConfigured("google"),
    isOAuthConfigured("facebook"),
  ]);
  return NextResponse.json({ google, facebook });
}
