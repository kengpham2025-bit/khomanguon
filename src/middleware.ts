import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getSession, SESSION_COOKIE_NAME } from "@/lib/sessions";

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
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value ?? "";

  const session = await getSession(token);

  if (path.startsWith("/admin")) {
    if (!session || session.role !== "admin") {
      return redirectLogin(req, "/admin");
    }
    return NextResponse.next();
  }

  if (!session) {
    return redirectLogin(req, path);
  }

  return NextResponse.next();
}
