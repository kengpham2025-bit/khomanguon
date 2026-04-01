"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
  BarChart3,
  Wallet,
  Bell,
  FileText,
  Globe,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminSidebarProps {
  locale?: "vi" | "en";
  activeItem?: string;
  onItemClick?: (item: string) => void;
}

const menuItems = [
  {
    id: "dashboard",
    labelVi: "Tổng quan",
    labelEn: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    id: "products",
    labelVi: "Sản phẩm",
    labelEn: "Products",
    icon: Package,
    href: "/admin/products",
  },
  {
    id: "orders",
    labelVi: "Đơn hàng",
    labelEn: "Orders",
    icon: ShoppingBag,
    href: "/admin/orders",
  },
  {
    id: "users",
    labelVi: "Người dùng",
    labelEn: "Users",
    icon: Users,
    href: "/admin/users",
  },
  {
    id: "deposits",
    labelVi: "Nạp tiền",
    labelEn: "Deposits",
    icon: Wallet,
    href: "/admin/deposits",
  },
  {
    id: "withdrawals",
    labelVi: "Rút tiền",
    labelEn: "Withdrawals",
    icon: BarChart3,
    href: "/admin/withdrawals",
  },
  {
    id: "chat",
    labelVi: "Tin nhắn",
    labelEn: "Messages",
    icon: MessageSquare,
    href: "/admin/chat",
  },
  {
    id: "news",
    labelVi: "Tin tức",
    labelEn: "News",
    icon: FileText,
    href: "/admin/news",
  },
  {
    id: "seo",
    labelVi: "SEO",
    labelEn: "SEO Settings",
    icon: Globe,
    href: "/admin/seo",
  },
  {
    id: "settings",
    labelVi: "Cài đặt",
    labelEn: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
];

export function AdminSidebar({
  locale = "vi",
  activeItem = "dashboard",
  onItemClick,
}: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-40 flex h-screen flex-col border-r border-slate-200 bg-white transition-all duration-300",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4">
        {!isCollapsed && (
          <Link href="/admin" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-600 text-white">
              <Shield className="h-5 w-5" />
            </div>
            <span className="font-bold text-slate-900">Admin</span>
          </Link>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.id;

            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  onClick={() => onItemClick?.(item.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                    isActive
                      ? "bg-primary-50 text-primary-600"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("h-5 w-5", isActive && "text-primary-600")} />
                  {!isCollapsed && (
                    <span>
                      {locale === "vi" ? item.labelVi : item.labelEn}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="border-t border-slate-100 p-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-600 transition-all hover:bg-red-50">
          <LogOut className="h-5 w-5" />
          {!isCollapsed && (
            <span>{locale === "vi" ? "Đăng xuất" : "Logout"}</span>
          )}
        </button>
      </div>
    </aside>
  );
}
