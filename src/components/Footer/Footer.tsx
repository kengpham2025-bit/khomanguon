import Link from "next/link";
import { Mail, Newspaper, ShoppingBag, UserPlus, LogIn } from "lucide-react";

interface FooterProps {
  locale?: "vi" | "en";
}

export function Footer({ locale = "vi" }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-slate-200">
      {/* CTA Section */}
      <div className="bg-primary-50">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div>
              <h3 className="text-xl font-bold text-primary-700">
                {locale === "vi" ? "Bạn có sản phẩm để bán?" : "Have products to sell?"}
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                {locale === "vi"
                  ? "Đăng ký gian hàng miễn phí, đăng sản phẩm và bắt đầu kiếm thu nhập ngay hôm nay."
                  : "Register your shop for free, list products, and start earning today."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/seller"
                className="rounded-full border border-primary-600 px-5 py-2.5 text-sm font-semibold text-primary-600 transition-all hover:bg-primary-600 hover:text-white"
              >
                {locale === "vi" ? "Đăng ký bán hàng" : "Start Selling"}
              </Link>
              <Link
                href="/login"
                className="rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-primary-700"
              >
                {locale === "vi" ? "Đăng nhập" : "Login"}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                <span className="text-sm font-bold">K</span>
              </div>
              <span className="text-base font-extrabold text-slate-800">
                khomanguon<span className="text-primary-600">.io.vn</span>
              </span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500">
              {locale === "vi"
                ? "Nền tảng giao dịch mã nguồn, tài khoản MMO và dịch vụ AI đáng tin cậy"
                : "Trusted platform for source codes, MMO accounts, and AI services"}
            </p>
          </div>

          {/* Customer Links */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              {locale === "vi" ? "KHÁCH HÀNG" : "CUSTOMERS"}
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/news" className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-primary-600">
                  <Newspaper className="h-3.5 w-3.5" />
                  {locale === "vi" ? "Tin tức" : "News"}
                </Link>
              </li>
              <li>
                <Link href="/seller" className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-primary-600">
                  <ShoppingBag className="h-3.5 w-3.5" />
                  {locale === "vi" ? "Đăng ký bán hàng" : "Start Selling"}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              {locale === "vi" ? "LIÊN HỆ" : "CONTACT"}
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="mailto:support@khomanguon.io.vn" className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-primary-600">
                  <Mail className="h-3.5 w-3.5" />
                  support@khomanguon.io.vn
                </a>
              </li>
              <li>
                <Link href="/register" className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-primary-600">
                  <UserPlus className="h-3.5 w-3.5" />
                  {locale === "vi" ? "Đăng ký thành viên" : "Register"}
                </Link>
              </li>
              <li>
                <Link href="/login" className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-primary-600">
                  <LogIn className="h-3.5 w-3.5" />
                  {locale === "vi" ? "Đăng nhập" : "Login"}
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-100">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-slate-400">
            &copy; {currentYear} KHOMANGUON.IO.VN.{" "}
            {locale === "vi" ? "Mọi quyền được bảo lưu." : "All rights reserved."}
          </p>
        </div>
      </div>
    </footer>
  );
}
