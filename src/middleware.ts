import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

export const config = {
  matcher: ["/admin/:path*"],
};

export async function middleware(req: NextRequest) {
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const secret = process.env.JWT_SECRET;
  if (!token || !secret) {
    return NextResponse.redirect(new URL("/dang-nhap?next=/admin", req.url));
  }
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/dang-nhap?next=/admin", req.url));
  }
}
