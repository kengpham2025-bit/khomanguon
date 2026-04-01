"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Users,
  Package,
  ShoppingBag,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldCheck,
  ChevronRight,
  Eye,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useNotification } from "@/components/NotificationProvider";
import { confirm } from "@/components/ConfirmDialog";

interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  pendingWithdrawals: number;
  pendingKyc: number;
  recentOrders: any[];
}

interface AdminClientProps {
  stats: AdminStats;
  locale: "vi" | "en";
}

export function AdminDashboardClient({ stats, locale = "vi" }: AdminClientProps) {
  const { success, error: notifyError } = useNotification();

  const statCards = [
    {
      label: locale === "vi" ? "Tổng người dùng" : "Total Users",
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50",
      href: "/admin/users",
    },
    {
      label: locale === "vi" ? "Tổng sản phẩm" : "Total Products",
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: "text-green-600",
      bg: "bg-green-50",
      href: "/admin/products",
    },
    {
      label: locale === "vi" ? "Tổng đơn hàng" : "Total Orders",
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingBag,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      href: "/admin/orders",
    },
    {
      label: locale === "vi" ? "Tổng doanh thu" : "Total Revenue",
      value: formatPrice(stats.totalRevenue, locale),
      icon: DollarSign,
      color: "text-primary-600",
      bg: "bg-primary-50",
      href: "/admin/orders",
    },
    {
      label: locale === "vi" ? "Chờ rút tiền" : "Pending Withdrawals",
      value: stats.pendingWithdrawals.toString(),
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
      href: "/admin/withdrawals",
      alert: stats.pendingWithdrawals > 0,
    },
    {
      label: locale === "vi" ? "Chờ xác minh KYC" : "Pending KYC",
      value: stats.pendingKyc.toString(),
      icon: ShieldCheck,
      color: stats.pendingKyc > 0 ? "text-red-600" : "text-green-600",
      bg: stats.pendingKyc > 0 ? "bg-red-50" : "bg-green-50",
      href: "/admin/kyc",
      alert: stats.pendingKyc > 0,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "rounded-2xl border p-5 shadow-soft-sm transition-shadow hover:shadow-soft-md",
                stat.alert ? "border-red-200 bg-red-50/30" : "border-slate-100 bg-white"
              )}
            >
              <div className="mb-3 flex items-center justify-between">
                <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </span>
                {stat.alert && <span className="flex h-3 w-3 rounded-full bg-red-500" />}
              </div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
            </motion.div>
          </Link>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="rounded-2xl border border-slate-100 bg-white shadow-soft-sm">
        <div className="flex items-center justify-between border-b border-slate-100 p-5">
          <h3 className="font-bold text-slate-900">
            {locale === "vi" ? "Đơn hàng gần đây" : "Recent Orders"}
          </h3>
          <Link href="/admin/orders" className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
            {locale === "vi" ? "Xem tất cả" : "View All"} <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {stats.recentOrders.length === 0 ? (
          <div className="p-8 text-center text-slate-500">
            <ShoppingBag className="mx-auto mb-2 h-10 w-10 text-slate-200" />
            <p>{locale === "vi" ? "Chưa có đơn hàng nào." : "No orders yet."}</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {stats.recentOrders.map((order: any) => {
              const statusCfg = ({
                pending: { color: "text-amber-600 bg-amber-50", icon: Clock },
                paid: { color: "text-blue-600 bg-blue-50", icon: CheckCircle2 },
                delivered: { color: "text-indigo-600 bg-indigo-50", icon: Package },
                completed: { color: "text-green-600 bg-green-50", icon: CheckCircle2 },
                cancelled: { color: "text-red-600 bg-red-50", icon: XCircle },
              } as Record<string, { color: string; icon: any }>)[order.status] || { color: "text-slate-600 bg-slate-50", icon: Clock };
              const StatusIcon = statusCfg.icon;

              return (
                <div key={order._id} className="flex items-center gap-4 p-4">
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium text-slate-900">
                      {order.product?.titleVi || order.product?.titleEn || "—"}
                    </p>
                    <p className="text-xs text-slate-500">
                      {order.buyer?.username || order.buyer?.email || "—"}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{formatPrice(order.totalPrice, locale)}</div>
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", statusCfg.color)}>
                      <StatusIcon className="h-3 w-3" />
                      {order.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { labelVi: "Quản lý sản phẩm", labelEn: "Manage Products", href: "/admin/products", icon: Package, color: "text-green-600", bg: "bg-green-50" },
          { labelVi: "Quản lý đơn hàng", labelEn: "Manage Orders", href: "/admin/orders", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
          { labelVi: "Quản lý người dùng", labelEn: "Manage Users", href: "/admin/users", icon: Users, color: "text-indigo-600", bg: "bg-indigo-50" },
          { labelVi: "Tin tức AI", labelEn: "AI News Blogger", href: "/admin/news", icon: Eye, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((link) => (
          <Link key={link.href} href={link.href}>
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-5 shadow-soft-sm transition-shadow hover:shadow-soft-md">
              <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", link.bg)}>
                <link.icon className={cn("h-5 w-5", link.color)} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-slate-900">{locale === "vi" ? link.labelVi : link.labelEn}</div>
                <div className="flex items-center gap-1 text-xs text-slate-400">
                  {locale === "vi" ? "Truy cập" : "Access"} <ChevronRight className="h-3 w-3" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
