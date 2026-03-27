import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";
import { SESSION_COOKIE_NAME } from "@/lib/auth";

export const config = {
  matcher: [
    "/admin/:path*",
    "/nap-tien",
    "/nap-tien/:path*",
    "/rut-tien",
    "/rut-tien/:path*",
    "/tai-khoan",
    "/tai-khoan/:path*",
    "/xac-minh-cccd",
    "/dang-ky-ban-hang",
  ],
};

function redirectLogin(req: NextRequest, returnPath: string) {
  const next = `${returnPath}${req.nextUrl.search}`;
  const url = new URL("/dang-nhap", req.url);
  url.searchParams.set("next", next.startsWith("/") ? next : `/${next}`);
  return NextResponse.redirect(url);
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const secret = process.env.JWT_SECRET;

  if (path.startsWith("/admin")) {
    if (!token || !secret) {
      return redirectLogin(req, "/admin");
    }
    try {
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
      if (payload.role !== "admin") {
        return NextResponse.redirect(new URL("/", req.url));
      }
      return NextResponse.next();
    } catch {
      return redirectLogin(req, "/admin");
    }
  }

  /* Các trang cần đăng nhập (nạp/rút tiền, tài khoản, KYC, đăng ký bán) */
  if (!token || !secret) {
    return redirectLogin(req, path);
  }
  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (!payload.sub) {
      return redirectLogin(req, path);
    }
    return NextResponse.next();
  } catch {
    return redirectLogin(req, path);
  }
}
