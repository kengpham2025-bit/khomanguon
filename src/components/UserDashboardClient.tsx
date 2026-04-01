"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  User,
  Wallet,
  Package,
  Users,
  Gift,
  Settings,
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Clock,
  XCircle,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Loader2,
  Copy,
  Share2,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useNotification } from "@/components/NotificationProvider";
import { confirm } from "@/components/ConfirmDialog";

interface UserData {
  _id: string;
  email: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  balance: number;
  role: string;
  kycStatus: string;
  referralCode: string;
  totalEarnings: number;
  isAffiliateActive: boolean;
  bankAccount?: {
    bankName: string;
    bankCode: string;
    accountNumber: string;
    accountHolder: string;
  };
}

interface Order {
  _id: string;
  totalPrice: number;
  status: string;
  createdAt: number;
  product?: { titleVi: string; titleEn: string; demoImages?: string[] };
  variant?: { labelVi: string; labelEn: string };
  seller?: { username?: string; fullName?: string };
  buyer?: { username?: string; fullName?: string };
}

interface Deposit {
  _id: string;
  amount: number;
  status: string;
  payosOrderCode: string;
  createdAt: number;
  completedAt?: number;
}

interface Withdrawal {
  _id: string;
  amount: number;
  status: string;
  bankName: string;
  accountNumber: string;
  createdAt: number;
  processedAt?: number;
  adminNote?: string;
}

interface AffiliateLog {
  _id: string;
  commissionAmount: number;
  depositAmount: number;
  createdAt: number;
  referredUserId: string;
}

interface UserDashboardProps {
  user: UserData;
  orders: Order[];
  deposits: Deposit[];
  withdrawals: Withdrawal[];
  affiliateLogs: AffiliateLog[];
  locale: "vi" | "en";
  stats: {
    totalSpent: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
  };
}

type Tab = "overview" | "orders" | "deposits" | "withdrawals" | "affiliate" | "profile";

const statusConfig = {
  pending: { labelVi: "Chờ xử lý", labelEn: "Pending", color: "text-amber-600 bg-amber-50", icon: Clock },
  paid: { labelVi: "Đã thanh toán", labelEn: "Paid", color: "text-blue-600 bg-blue-50", icon: CheckCircle2 },
  delivered: { labelVi: "Đã giao", labelEn: "Delivered", color: "text-indigo-600 bg-indigo-50", icon: Package },
  completed: { labelVi: "Hoàn thành", labelEn: "Completed", color: "text-green-600 bg-green-50", icon: CheckCircle2 },
  cancelled: { labelVi: "Đã hủy", labelEn: "Cancelled", color: "text-red-600 bg-red-50", icon: XCircle },
  refunded: { labelVi: "Đã hoàn tiền", labelEn: "Refunded", color: "text-slate-600 bg-slate-50", icon: XCircle },
  disputed: { labelVi: "Khiếu nại", labelEn: "Disputed", color: "text-orange-600 bg-orange-50", icon: AlertTriangle },
  approved: { labelVi: "Đã duyệt", labelEn: "Approved", color: "text-green-600 bg-green-50", icon: CheckCircle2 },
  rejected: { labelVi: "Từ chối", labelEn: "Rejected", color: "text-red-600 bg-red-50", icon: XCircle },
  failed: { labelVi: "Thất bại", labelEn: "Failed", color: "text-red-600 bg-red-50", icon: XCircle },
};

export function UserDashboardClient({
  user,
  orders,
  deposits,
  withdrawals,
  affiliateLogs,
  locale = "vi",
  stats,
}: UserDashboardProps) {
  const { success, error: notifyError, info } = useNotification();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [showBalance, setShowBalance] = useState(true);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);

  const tabs = [
    { id: "overview", labelVi: "Tổng quan", labelEn: "Overview", icon: User },
    { id: "orders", labelVi: "Đơn hàng", labelEn: "Orders", icon: Package },
    { id: "deposits", labelVi: "Nạp tiền", labelEn: "Deposits", icon: CreditCard },
    { id: "withdrawals", labelVi: "Rút tiền", labelEn: "Withdrawals", icon: Wallet },
    { id: "affiliate", labelVi: "Giới thiệu", labelEn: "Affiliate", icon: Users },
    { id: "profile", labelVi: "Hồ sơ", labelEn: "Profile", icon: Settings },
  ];

  const copyReferralLink = () => {
    const link = `${typeof window !== "undefined" ? window.location.origin : ""}/register?ref=${user.referralCode}`;
    navigator.clipboard.writeText(link);
    success({
      title: locale === "vi" ? "Đã sao chép!" : "Copied!",
      message: locale === "vi" ? "Link giới thiệu đã được sao chép." : "Referral link copied.",
    });
  };

  const copyReferralCode = () => {
    navigator.clipboard.writeText(user.referralCode);
    success({
      title: locale === "vi" ? "Đã sao chép!" : "Copied!",
      message: locale === "vi" ? "Mã giới thiệu đã được sao chép." : "Referral code copied.",
    });
  };

  const tabContent = {
    overview: (
      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              label: locale === "vi" ? "Số dư" : "Balance",
              value: showBalance ? formatPrice(user.balance, locale) : "••••••",
              icon: Wallet,
              color: "text-primary-600",
              bg: "bg-primary-50",
            },
            {
              label: locale === "vi" ? "Tổng đã chi" : "Total Spent",
              value: formatPrice(stats.totalSpent, locale),
              icon: ArrowDownRight,
              color: "text-red-600",
              bg: "bg-red-50",
            },
            {
              label: locale === "vi" ? "Đơn hàng" : "Orders",
              value: stats.totalOrders.toString(),
              icon: Package,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              label: locale === "vi" ? "Hoa hồng" : "Earnings",
              value: formatPrice(user.totalEarnings, locale),
              icon: Gift,
              color: "text-green-600",
              bg: "bg-green-50",
            },
          ].map((stat) => (
            <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft-sm">
              <div className="mb-3 flex items-center justify-between">
                <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.bg)}>
                  <stat.icon className={cn("h-5 w-5", stat.color)} />
                </span>
                <button
                  onClick={() => setShowBalance((v) => !v)}
                  className="rounded-full p-1 text-slate-400 hover:bg-slate-100"
                >
                  {showBalance ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </button>
              </div>
              <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
              <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 text-left transition-shadow hover:shadow-soft-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <CreditCard className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-900">{locale === "vi" ? "Nạp tiền" : "Deposit"}</div>
              <div className="text-xs text-slate-500">{locale === "vi" ? "Qua PayOS" : "Via PayOS"}</div>
            </div>
          </button>

          <button
            onClick={() => {
              if (!user.bankAccount) {
                info({ title: locale === "vi" ? "Cần thêm tài khoản ngân hàng" : "Add bank account first", message: "" });
                setShowBankModal(true);
                return;
              }
              setShowWithdrawModal(true);
            }}
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-gradient-to-r from-green-50 to-emerald-50 p-4 text-left transition-shadow hover:shadow-soft-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <ArrowUpRight className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-900">{locale === "vi" ? "Rút tiền" : "Withdraw"}</div>
              <div className="text-xs text-slate-500">{locale === "vi" ? "Về tài khoản ngân hàng" : "To bank account"}</div>
            </div>
          </button>

          <Link
            href="/products"
            className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-gradient-to-r from-primary-50 to-indigo-50 p-4 text-left transition-shadow hover:shadow-soft-md"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-slate-900">{locale === "vi" ? "Mua sắm" : "Shop"}</div>
              <div className="text-xs text-slate-500">{locale === "vi" ? "Xem sản phẩm" : "Browse products"}</div>
            </div>
          </Link>
        </div>

        {/* Recent Orders */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-soft-sm">
          <div className="flex items-center justify-between border-b border-slate-100 p-5">
            <h3 className="font-bold text-slate-900">{locale === "vi" ? "Đơn hàng gần đây" : "Recent Orders"}</h3>
            <button onClick={() => setActiveTab("orders")} className="flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700">
              {locale === "vi" ? "Xem tất cả" : "View All"} <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          {orders.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Package className="mx-auto mb-2 h-10 w-10 text-slate-200" />
              <p>{locale === "vi" ? "Chưa có đơn hàng nào." : "No orders yet."}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {orders.slice(0, 3).map((order) => {
                const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
                const StatusIcon = status.icon;
                return (
                  <div key={order._id} className="flex items-center gap-4 p-4">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {order.product?.demoImages?.[0] && (
                        <img src={order.product.demoImages[0]} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900">
                        {locale === "vi" ? order.product?.titleVi : order.product?.titleEn}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900">{formatPrice(order.totalPrice, locale)}</div>
                      <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", status.color)}>
                        <StatusIcon className="h-3 w-3" />
                        {locale === "vi" ? status.labelVi : status.labelEn}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    ),

    orders: (
      <div className="space-y-4">
        <h2 className="mb-2 text-lg font-bold text-slate-900">
          {locale === "vi" ? "Tất cả đơn hàng" : "All Orders"} ({orders.length})
        </h2>
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-soft-sm">
            <Package className="mx-auto mb-3 h-12 w-12 text-slate-200" />
            <p className="text-slate-500">{locale === "vi" ? "Chưa có đơn hàng nào." : "No orders yet."}</p>
            <Link href="/products" className="mt-4 inline-block rounded-full bg-primary-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-primary-700">
              {locale === "vi" ? "Mua sắm ngay" : "Shop Now"}
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {orders.map((order) => {
              const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <div key={order._id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-soft-sm">
                  <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {order.product?.demoImages?.[0] && (
                      <img src={order.product.demoImages[0]} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {locale === "vi" ? order.product?.titleVi : order.product?.titleEn}
                    </p>
                    <p className="text-xs text-slate-500">
                      {locale === "vi" ? order.variant?.labelVi : order.variant?.labelEn} •{" "}
                      {new Date(order.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-base font-bold text-slate-900">{formatPrice(order.totalPrice, locale)}</div>
                    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", status.color)}>
                      <StatusIcon className="h-3 w-3" />
                      {locale === "vi" ? status.labelVi : status.labelEn}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    ),

    deposits: (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {locale === "vi" ? "Lịch sử nạp tiền" : "Deposit History"}
          </h2>
          <button
            onClick={() => setShowDepositModal(true)}
            className="flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <CreditCard className="h-3.5 w-3.5" />
            {locale === "vi" ? "Nạp tiền ngay" : "Deposit Now"}
          </button>
        </div>

        {deposits.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-soft-sm">
            <CreditCard className="mx-auto mb-3 h-12 w-12 text-slate-200" />
            <p className="text-slate-500">{locale === "vi" ? "Chưa có lịch sử nạp tiền." : "No deposit history."}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {deposits.map((deposit) => {
              const status = statusConfig[deposit.status as keyof typeof statusConfig] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <div key={deposit._id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-soft-sm">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-green-50">
                    <ArrowDownRight className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">+{formatPrice(deposit.amount, locale)}</div>
                    <div className="text-xs text-slate-500">
                      {new Date(deposit.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                    </div>
                  </div>
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", status.color)}>
                    <StatusIcon className="h-3 w-3" />
                    {locale === "vi" ? status.labelVi : status.labelEn}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    ),

    withdrawals: (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {locale === "vi" ? "Lịch sử rút tiền" : "Withdrawal History"}
          </h2>
          <button
            onClick={() => {
              if (!user.bankAccount) {
                setShowBankModal(true);
                info({ title: locale === "vi" ? "Cần thêm tài khoản ngân hàng" : "Add bank account first", message: "" });
              } else {
                setShowWithdrawModal(true);
              }
            }}
            className="flex items-center gap-1.5 rounded-full bg-primary-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-primary-700"
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            {locale === "vi" ? "Rút tiền" : "Withdraw"}
          </button>
        </div>

        {/* Bank Info */}
        {user.bankAccount && (
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span className="text-sm font-semibold text-slate-700">
                {locale === "vi" ? "Tài khoản ngân hàng" : "Bank Account"}
              </span>
            </div>
            <p className="text-sm text-slate-600">
              {user.bankAccount.bankName} - {user.bankAccount.accountNumber}
            </p>
          </div>
        )}

        {withdrawals.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-soft-sm">
            <ArrowUpRight className="mx-auto mb-3 h-12 w-12 text-slate-200" />
            <p className="text-slate-500">{locale === "vi" ? "Chưa có lịch sử rút tiền." : "No withdrawal history."}</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {withdrawals.map((w) => {
              const status = statusConfig[w.status as keyof typeof statusConfig] || statusConfig.pending;
              const StatusIcon = status.icon;
              return (
                <div key={w._id} className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-soft-sm">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-red-50">
                    <ArrowUpRight className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-slate-900">-{formatPrice(w.amount, locale)}</div>
                    <div className="text-xs text-slate-500">
                      {w.bankName} • {w.accountNumber.slice(-4)}
                    </div>
                  </div>
                  <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", status.color)}>
                    <StatusIcon className="h-3 w-3" />
                    {locale === "vi" ? status.labelVi : status.labelEn}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    ),

    affiliate: (
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900">
          {locale === "vi" ? "Chương trình giới thiệu" : "Affiliate Program"}
        </h2>

        {/* Referral Card */}
        <div className="rounded-2xl border border-primary-200 bg-gradient-to-r from-primary-50 to-indigo-50 p-6 shadow-soft-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">{locale === "vi" ? "Mã giới thiệu của bạn" : "Your Referral Code"}</h3>
              <p className="text-sm text-slate-500">{locale === "vi" ? "Nhận 1% hoa hồng từ mỗi lần nạp tiền của người được giới thiệu" : "Earn 1% commission from each referral deposit"}</p>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-3 rounded-xl border-2 border-primary-200 bg-white p-3">
            <span className="flex-1 text-xl font-bold tracking-wider text-primary-600">{user.referralCode}</span>
            <button onClick={copyReferralCode} className="rounded-full bg-primary-100 p-2 text-primary-600 hover:bg-primary-200">
              <Copy className="h-4 w-4" />
            </button>
            <button onClick={copyReferralLink} className="rounded-full bg-primary-600 p-2 text-white hover:bg-primary-700">
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-primary-200 bg-white/60 p-3">
            <span className="text-sm text-slate-600">{locale === "vi" ? "Link giới thiệu:" : "Referral link:"}</span>
            <span className="flex-1 truncate text-xs font-mono text-slate-500">
              {typeof window !== "undefined" ? window.location.origin : ""}/register?ref={user.referralCode}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-white/60 p-3 text-center">
              <div className="text-2xl font-bold text-green-600">{formatPrice(user.totalEarnings, locale)}</div>
              <div className="text-xs text-slate-500">{locale === "vi" ? "Hoa hồng đã nhận" : "Commission Earned"}</div>
            </div>
            <div className="rounded-xl bg-white/60 p-3 text-center">
              <div className="text-2xl font-bold text-primary-600">{affiliateLogs.length}</div>
              <div className="text-xs text-slate-500">{locale === "vi" ? "Người được giới thiệu" : "Referrals"}</div>
            </div>
          </div>
        </div>

        {/* Affiliate Logs */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-soft-sm">
          <div className="border-b border-slate-100 p-4">
            <h3 className="font-bold text-slate-900">{locale === "vi" ? "Lịch sử hoa hồng" : "Commission History"}</h3>
          </div>
          {affiliateLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <Gift className="mx-auto mb-2 h-10 w-10 text-slate-200" />
              <p>{locale === "vi" ? "Chưa có hoa hồng nào." : "No commission yet."}</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {affiliateLogs.map((log) => (
                <div key={log._id} className="flex items-center justify-between p-4">
                  <div>
                    <div className="text-sm font-medium text-slate-900">+{formatPrice(log.commissionAmount, locale)}</div>
                    <div className="text-xs text-slate-500">
                      {locale === "vi" ? "Từ nạp tiền" : "From deposit"} {formatPrice(log.depositAmount, locale)}
                    </div>
                  </div>
                  <div className="text-right text-xs text-slate-400">
                    {new Date(log.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    ),

    profile: (
      <div className="space-y-6">
        <h2 className="text-lg font-bold text-slate-900">{locale === "vi" ? "Hồ sơ cá nhân" : "Profile"}</h2>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft-sm">
          <div className="mb-6 flex items-center gap-4">
            <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-primary-100">
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-primary-600">
                  {(user.username || user.fullName || user.email)?.[0]?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{user.username || user.fullName || "User"}</h3>
                {user.kycStatus === "approved" && (
                  <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-600">
                    <ShieldCheck className="h-3 w-3" />
                    {locale === "vi" ? "Đã xác minh" : "Verified"}
                  </span>
                )}
                {user.kycStatus !== "approved" && user.kycStatus !== "pending" && (
                  <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-600">
                    <AlertTriangle className="h-3 w-3" />
                    {locale === "vi" ? "Chưa xác minh" : "Unverified"}
                  </span>
                )}
              </div>
              <p className="text-sm text-slate-500">{user.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-sm text-slate-500">{locale === "vi" ? "Mã giới thiệu" : "Referral Code"}</span>
              <span className="font-mono font-semibold text-primary-600">{user.referralCode}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-sm text-slate-500">{locale === "vi" ? "Vai trò" : "Role"}</span>
              <span className="font-semibold capitalize text-slate-900">{user.role}</span>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-4">
              <span className="text-sm text-slate-500">{locale === "vi" ? "Trạng thái KYC" : "KYC Status"}</span>
              <span className={cn(
                "font-semibold capitalize",
                user.kycStatus === "approved" ? "text-green-600" :
                user.kycStatus === "pending" ? "text-amber-600" :
                user.kycStatus === "rejected" ? "text-red-600" : "text-slate-600"
              )}>
                {user.kycStatus === "none" ? (locale === "vi" ? "Chưa nộp" : "Not submitted") :
                 user.kycStatus === "pending" ? (locale === "vi" ? "Đang xét duyệt" : "Pending") :
                 user.kycStatus === "approved" ? (locale === "vi" ? "Đã duyệt" : "Approved") :
                 (locale === "vi" ? "Bị từ chối" : "Rejected")}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Link href="/settings" className="flex items-center justify-between rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50">
              {locale === "vi" ? "Cài đặt tài khoản" : "Account Settings"} <ChevronRight className="h-4 w-4" />
            </Link>
            {user.kycStatus !== "approved" && (
              <Link href="/kyc" className="flex items-center justify-between rounded-full border border-primary-200 bg-primary-50 px-4 py-2.5 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-100">
                {locale === "vi" ? "Xác minh danh tính (KYC)" : "Verify Identity (KYC)"} <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
          {locale === "vi" ? "Tài khoản" : "My Account"}
        </h1>
        <p className="mt-1 text-slate-500">
          {locale === "vi" ? "Xin chào" : "Welcome back"}, {user.username || user.fullName || user.email}
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-8 flex gap-1 overflow-x-auto border-b border-slate-200 pb-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={cn(
              "flex items-center gap-2 whitespace-nowrap rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors",
              activeTab === tab.id
                ? "bg-primary-50 text-primary-600"
                : "text-slate-500 hover:text-slate-700"
            )}
          >
            <tab.icon className="h-4 w-4" />
            {locale === "vi" ? tab.labelVi : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        {tabContent[activeTab]}
      </motion.div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <DepositModal
          onClose={() => setShowDepositModal(false)}
          locale={locale}
          referralCode={user.referralCode}
        />
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <WithdrawModal
          onClose={() => setShowWithdrawModal(false)}
          locale={locale}
          balance={user.balance}
          bankAccount={user.bankAccount}
        />
      )}

      {/* Bank Account Modal */}
      {showBankModal && (
        <BankAccountModal
          onClose={() => setShowBankModal(false)}
          locale={locale}
        />
      )}
    </div>
  );
}

// ── Deposit Modal ────────────────────────────────────────────────────────────
function DepositModal({ onClose, locale, referralCode }: { onClose: () => void; locale: "vi" | "en"; referralCode?: string }) {
  const { success, error: notifyError } = useNotification();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const quickAmounts = [50000, 100000, 200000, 500000, 1000000, 2000000];

  const handleDeposit = async () => {
    const num = parseInt(amount);
    if (!num || num < 10000) {
      notifyError({ title: locale === "vi" ? "Số tiền không hợp lệ" : "Invalid amount", message: "" });
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      success({
        title: locale === "vi" ? "Đang chuyển hướng..." : "Redirecting...",
        message: locale === "vi" ? "Bạn sẽ được chuyển đến PayOS." : "Redirecting to PayOS payment gateway.",
      });
      onClose();
    } catch {
      notifyError({ title: locale === "vi" ? "Lỗi" : "Error", message: "" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-6 text-xl font-bold text-slate-900">
          {locale === "vi" ? "Nạp tiền qua PayOS" : "Deposit via PayOS"}
        </h2>

        <div className="mb-4 grid grid-cols-3 gap-2">
          {quickAmounts.map((a) => (
            <button key={a} onClick={() => setAmount(a.toString())} className={cn(
              "rounded-xl border py-2 text-sm font-medium transition-colors",
              amount === a.toString()
                ? "border-primary-600 bg-primary-50 text-primary-600"
                : "border-slate-200 text-slate-600 hover:border-primary-300"
            )}>
              {formatPrice(a, locale)}
            </button>
          ))}
        </div>

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={locale === "vi" ? "Nhập số tiền..." : "Enter amount..."}
          className="mb-4 w-full rounded-full border border-slate-200 px-4 py-3 text-lg font-semibold focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />

        <div className="mb-4 flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-700">
          <ShieldCheck className="h-4 w-4 flex-shrink-0" />
          {locale === "vi"
            ? "Phí nạp tiền: Miễn phí. Tối thiểu 10,000 VND."
            : "Deposit fee: Free. Minimum 10,000 VND."}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full border border-slate-200 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
            {locale === "vi" ? "Hủy" : "Cancel"}
          </button>
          <button onClick={handleDeposit} disabled={isLoading || !amount} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
            {locale === "vi" ? "Nạp tiền" : "Deposit"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Withdraw Modal ──────────────────────────────────────────────────────────
function WithdrawModal({ onClose, locale, balance, bankAccount }: { onClose: () => void; locale: "vi" | "en"; balance: number; bankAccount?: UserData["bankAccount"] }) {
  const { success, error: notifyError, info } = useNotification();
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async () => {
    const num = parseInt(amount);
    if (!num || num < 50000) {
      notifyError({ title: locale === "vi" ? "Tối thiểu 50,000 VND" : "Minimum 50,000 VND", message: "" });
      return;
    }
    if (num > balance) {
      notifyError({ title: locale === "vi" ? "Số dư không đủ" : "Insufficient balance", message: "" });
      return;
    }
    const confirmed = await confirm({
      title: locale === "vi" ? "Xác nhận rút tiền" : "Confirm Withdrawal",
      description: locale === "vi"
        ? `Bạn có chắc muốn rút ${formatPrice(num, locale)} về tài khoản ${bankAccount?.bankName} (****${bankAccount?.accountNumber.slice(-4)})?`
        : `Are you sure you want to withdraw ${formatPrice(num, locale)} to ${bankAccount?.bankName} (****${bankAccount?.accountNumber.slice(-4)})?`,
      confirmText: locale === "vi" ? "Xác nhận" : "Confirm",
      cancelText: locale === "vi" ? "Hủy" : "Cancel",
      variant: "warning",
    });
    if (!confirmed) return;

    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      success({ title: locale === "vi" ? "Yêu cầu đã gửi!" : "Request submitted!", message: locale === "vi" ? "Yêu cầu rút tiền đang chờ duyệt." : "Withdrawal request is pending approval." });
      onClose();
    } catch {
      notifyError({ title: locale === "vi" ? "Lỗi" : "Error", message: "" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-2 text-xl font-bold text-slate-900">{locale === "vi" ? "Rút tiền" : "Withdraw"}</h2>
        <p className="mb-4 text-sm text-slate-500">
          {locale === "vi" ? "Số dư khả dụng:" : "Available balance:"} <strong className="text-primary-600">{formatPrice(balance, locale)}</strong>
        </p>

        {bankAccount && (
          <div className="mb-4 flex items-center gap-2 rounded-xl bg-slate-50 p-3 text-sm">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            <span>{bankAccount.bankName} - ****{bankAccount.accountNumber.slice(-4)}</span>
          </div>
        )}

        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder={locale === "vi" ? "Nhập số tiền..." : "Enter amount..."}
          className="mb-4 w-full rounded-full border border-slate-200 px-4 py-3 text-lg font-semibold focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />

        <div className="mb-4 flex items-center gap-2 rounded-xl bg-amber-50 p-3 text-xs text-amber-700">
          <Clock className="h-4 w-4 flex-shrink-0" />
          {locale === "vi" ? "Phí rút tiền: Miễn phí. Thời gian xử lý: 1-3 ngày làm việc." : "Withdrawal fee: Free. Processing time: 1-3 business days."}
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full border border-slate-200 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
            {locale === "vi" ? "Hủy" : "Cancel"}
          </button>
          <button onClick={handleWithdraw} disabled={isLoading || !amount} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowUpRight className="h-4 w-4" />}
            {locale === "vi" ? "Rút tiền" : "Withdraw"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Bank Account Modal ───────────────────────────────────────────────────────
function BankAccountModal({ onClose, locale }: { onClose: () => void; locale: "vi" | "en" }) {
  const { success, error: notifyError } = useNotification();
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({ bankName: "", bankCode: "", accountNumber: "", accountHolder: "" });

  const handleSubmit = async () => {
    if (!form.bankName || !form.accountNumber || !form.accountHolder) {
      notifyError({ title: locale === "vi" ? "Vui lòng điền đầy đủ" : "Please fill all fields", message: "" });
      return;
    }
    setIsLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      success({ title: locale === "vi" ? "Đã thêm!" : "Added!", message: locale === "vi" ? "Tài khoản ngân hàng đã được lưu." : "Bank account saved." });
      onClose();
    } catch {
      notifyError({ title: locale === "vi" ? "Lỗi" : "Error", message: "" });
    } finally {
      setIsLoading(false);
    }
  };

  const banks = [
    { name: "Vietcombank", code: "VCB" },
    { name: "MB Bank", code: "MB" },
    { name: "VietinBank", code: "CTG" },
    { name: "Techcombank", code: "TCB" },
    { name: "ACB", code: "ACB" },
    { name: "TPBank", code: "TPB" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-soft-xl" onClick={(e) => e.stopPropagation()}>
        <h2 className="mb-6 text-xl font-bold text-slate-900">{locale === "vi" ? "Thêm tài khoản ngân hàng" : "Add Bank Account"}</h2>

        <div className="mb-3 flex flex-wrap gap-2">
          {banks.map((bank) => (
            <button key={bank.code} onClick={() => setForm((f) => ({ ...f, bankName: bank.name, bankCode: bank.code }))}
              className={cn("rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                form.bankCode === bank.code ? "border-primary-600 bg-primary-50 text-primary-600" : "border-slate-200 text-slate-600"
              )}>
              {bank.name}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          <input placeholder={locale === "vi" ? "Tên ngân hàng" : "Bank name"} value={form.bankName}
            onChange={(e) => setForm((f) => ({ ...f, bankName: e.target.value }))}
            className="w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
          <input placeholder={locale === "vi" ? "Số tài khoản" : "Account number"} value={form.accountNumber}
            onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
            className="w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
          <input placeholder={locale === "vi" ? "Tên chủ tài khoản" : "Account holder name"} value={form.accountHolder}
            onChange={(e) => setForm((f) => ({ ...f, accountHolder: e.target.value }))}
            className="w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none" />
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-full border border-slate-200 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
            {locale === "vi" ? "Hủy" : "Cancel"}
          </button>
          <button onClick={handleSubmit} disabled={isLoading} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-primary-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {locale === "vi" ? "Lưu" : "Save"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
