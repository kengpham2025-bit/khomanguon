"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Settings,
  Package,
  CreditCard,
  Users,
  LayoutDashboard,
  Code2,
  UserCircle,
  Mail,
  MonitorSmartphone,
  MoreHorizontal,
  Wrench,
  KeyRound,
} from "lucide-react";
import { useUser, useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

interface HeaderProps {
  locale?: "vi" | "en";
  cartCount?: number;
  onLanguageToggle?: () => void;
}

const categories = [
  { id: "source-code", labelVi: "Source Code", labelEn: "Source Code", icon: Code2, href: "/products?cat=source-code" },
  { id: "accounts", labelVi: "Tài Khoản", labelEn: "Accounts", icon: UserCircle, href: "/products?cat=accounts" },
  { id: "email", labelVi: "Email", labelEn: "Email", icon: Mail, href: "/products?cat=email", hasDropdown: true },
  { id: "software", labelVi: "Phần mềm", labelEn: "Software", icon: MonitorSmartphone, href: "/products?cat=software", hasDropdown: true },
  { id: "other-products", labelVi: "Sản Phẩm Khác", labelEn: "Other Products", icon: MoreHorizontal, href: "/products?cat=other", hasDropdown: true },
  { id: "services", labelVi: "Dịch Vụ", labelEn: "Services", icon: Wrench, href: "/products?cat=services", hasDropdown: true },
  { id: "ai-keys", labelVi: "Tài Khoản - Key AI", labelEn: "AI Keys", icon: KeyRound, href: "/products?cat=ai-keys", hasDropdown: true },
];

export function Header({
  locale = "vi",
  cartCount = 0,
  onLanguageToggle,
}: HeaderProps) {
  const { user, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();

  const userMenuItems = locale === "vi"
    ? [
        { href: "/dashboard", label: "Tài khoản", icon: LayoutDashboard },
        { href: "/orders", label: "Đơn hàng", icon: Package },
        { href: "/deposit", label: "Nạp tiền", icon: CreditCard },
        { href: "/chat", label: "Tin nhắn", icon: Users },
        { href: "/settings", label: "Cài đặt", icon: Settings },
      ]
    : [
        { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { href: "/orders", label: "Orders", icon: Package },
        { href: "/deposit", label: "Deposit", icon: CreditCard },
        { href: "/chat", label: "Messages", icon: Users },
        { href: "/settings", label: "Settings", icon: Settings },
      ];

  const displayName = user?.fullName || user?.username || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User";

  return (
    <>
      {/* Announcement Bar */}
      <div className="bg-primary-600 text-white">
        <div className="mx-auto max-w-7xl px-4 py-2 text-center text-xs font-medium sm:text-sm">
          {locale === "vi"
            ? "Mã nguồn, tài khoản và dịch vụ AI — uy tín, bảo mật, giao dịch an toàn"
            : "Source codes, accounts & AI services — trusted, secure, safe transactions"}
        </div>
      </div>

      {/* Main Header */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-soft-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between gap-4">
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-600 text-white">
                <Code2 className="h-5 w-5" />
              </div>
              <span className="hidden text-lg font-extrabold text-slate-800 sm:block">
                khomanguon<span className="text-primary-600">.io.vn</span>
              </span>
            </Link>

            {/* Search Bar - Desktop */}
            <div className="hidden flex-1 items-center justify-center lg:flex">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={locale === "vi" ? "Tìm kiếm sản phẩm..." : "Search products..."}
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 transition-all focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center justify-center rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
              >
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {cartCount > 9 ? "9+" : cartCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {isSignedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors hover:bg-slate-100"
                  >
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={displayName}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-100 text-primary-600">
                        <User className="h-3.5 w-3.5" />
                      </div>
                    )}
                    <span className="hidden text-sm font-medium text-slate-700 sm:block max-w-24 truncate">
                      {displayName}
                    </span>
                    <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
                  </button>

                  <AnimatePresence>
                    {isUserMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-56 rounded-xl bg-white py-2 shadow-soft-xl border border-slate-100"
                      >
                        {userMenuItems.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setIsUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"
                          >
                            <item.icon className="h-4 w-4 text-slate-400" />
                            {item.label}
                          </Link>
                        ))}
                        <hr className="my-2 border-slate-100" />
                        <button
                          onClick={() => signOut({ redirectUrl: "/" })}
                          className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          {locale === "vi" ? "Đăng xuất" : "Logout"}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    href="/login"
                    className="rounded-full border border-primary-600 px-4 py-2 text-sm font-semibold text-primary-600 transition-all hover:bg-primary-50"
                  >
                    {locale === "vi" ? "Đăng nhập" : "Login"}
                  </Link>
                  <Link
                    href="/register"
                    className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary-700"
                  >
                    {locale === "vi" ? "Đăng ký" : "Register"}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Category Navigation Bar */}
        <div className="hidden border-t border-slate-100 bg-white lg:block">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav className="flex items-center gap-0 overflow-x-auto">
              {categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={cat.href}
                  className="flex items-center gap-2 whitespace-nowrap border-b-2 border-transparent px-4 py-3 text-sm font-medium text-slate-600 transition-colors hover:border-primary-600 hover:text-primary-600"
                >
                  <cat.icon className="h-4 w-4" />
                  {locale === "vi" ? cat.labelVi : cat.labelEn}
                  {cat.hasDropdown && <ChevronDown className="h-3 w-3 text-slate-400" />}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-soft-xl lg:hidden"
            >
              <div className="flex h-14 items-center justify-between border-b border-slate-100 px-4">
                <span className="text-lg font-bold text-slate-900">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Search */}
              <div className="border-b border-slate-100 p-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder={locale === "vi" ? "Tìm kiếm..." : "Search..."}
                    className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm"
                  />
                </div>
              </div>

              {/* Mobile Categories */}
              <nav className="flex flex-col p-4">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={cat.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
                  >
                    <cat.icon className="h-4 w-4 text-primary-600" />
                    {locale === "vi" ? cat.labelVi : cat.labelEn}
                  </Link>
                ))}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
