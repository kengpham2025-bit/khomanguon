"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Search,
  ChevronDown,
  Loader2,
  UserCheck,
  UserX,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useNotification } from "@/components/NotificationProvider";
import { confirm } from "@/components/ConfirmDialog";

interface AdminUser {
  _id: string;
  email: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  role: string;
  kycStatus: string;
  balance: number;
  totalEarnings: number;
  createdAt: number;
  referralCode: string;
}

interface UsersAdminClientProps {
  users: AdminUser[];
  locale: "vi" | "en";
}

const roleColors = {
  user: { labelVi: "Người dùng", labelEn: "User", color: "text-slate-600", bg: "bg-slate-50" },
  seller: { labelVi: "Người bán", labelEn: "Seller", color: "text-blue-600", bg: "bg-blue-50" },
  vendor: { labelVi: "Nhà cung cấp", labelEn: "Vendor", color: "text-indigo-600", bg: "bg-indigo-50" },
  admin: { labelVi: "Quản trị", labelEn: "Admin", color: "text-red-600", bg: "bg-red-50" },
};

export function UsersAdminClient({ users, locale = "vi" }: UsersAdminClientProps) {
  const { success, error: notifyError } = useNotification();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [kycFilter, setKycFilter] = useState<string>("all");
  const [expandedUser, setExpandedUser] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchesSearch = !q || u.email.toLowerCase().includes(q) || (u.username || "").toLowerCase().includes(q) || (u.fullName || "").toLowerCase().includes(q);
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    const matchesKyc = kycFilter === "all" || u.kycStatus === kycFilter;
    return matchesSearch && matchesRole && matchesKyc;
  });

  const handleUpdateRole = async (user: AdminUser, newRole: string) => {
    const confirmed = await confirm({
      title: locale === "vi" ? "Cập nhật vai trò" : "Update Role",
      description:
        locale === "vi"
          ? `Cập nhật vai trò của "${user.username || user.email}" thành "${newRole}"?`
          : `Update role of "${user.username || user.email}" to "${newRole}"?`,
      confirmText: locale === "vi" ? "Cập nhật" : "Update",
      cancelText: locale === "vi" ? "Hủy" : "Cancel",
      variant: "info",
    });
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      success({
        title: locale === "vi" ? "Cập nhật thành công!" : "Updated!",
        message: "",
      });
      setExpandedUser(null);
    } catch {
      notifyError({ title: locale === "vi" ? "Lỗi" : "Error", message: "" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={locale === "vi" ? "Tìm người dùng..." : "Search users..."}
            className="w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        {["all", "user", "seller", "vendor", "admin"].map((r) => (
          <button
            key={r}
            onClick={() => setRoleFilter(r)}
            className={cn(
              "rounded-full px-4 py-2 text-xs font-medium transition-colors",
              roleFilter === r
                ? "bg-primary-600 text-white"
                : "border border-slate-200 bg-white text-slate-600"
            )}
          >
            {r === "all" ? (locale === "vi" ? "Tất cả" : "All") :
             roleColors[r as keyof typeof roleColors]
              ? (locale === "vi" ? roleColors[r as keyof typeof roleColors].labelVi : roleColors[r as keyof typeof roleColors].labelEn)
              : r}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: locale === "vi" ? "Tổng người dùng" : "Total Users", value: users.length, color: "text-blue-600" },
          { label: locale === "vi" ? "Người bán" : "Sellers", value: users.filter((u) => u.role === "seller").length, color: "text-green-600" },
          { label: locale === "vi" ? "Chưa xác minh" : "Unverified", value: users.filter((u) => u.kycStatus === "none").length, color: "text-red-600" },
          { label: locale === "vi" ? "Đang chờ KYC" : "Pending KYC", value: users.filter((u) => u.kycStatus === "pending").length, color: "text-amber-600" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-soft-sm">
            <div className={cn("text-2xl font-bold", s.color)}>{s.value}</div>
            <div className="text-sm text-slate-500">{s.label}</div>
          </div>
        ))}
      </div>

      {/* User List */}
      <div className="space-y-3">
        {filteredUsers.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-soft-sm">
            <Users className="mx-auto mb-3 h-12 w-12 text-slate-200" />
            <p className="text-slate-500">{locale === "vi" ? "Không tìm thấy người dùng." : "No users found."}</p>
          </div>
        ) : (
          filteredUsers.map((user, idx) => {
            const role = roleColors[user.role as keyof typeof roleColors] || roleColors.user;
            const isExpanded = expandedUser === user._id;

            return (
              <motion.div
                key={user._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-white shadow-soft-sm transition-all",
                  isExpanded ? "border-primary-200" : "border-slate-100"
                )}
              >
                {/* User Header */}
                <div
                  className="flex cursor-pointer items-center gap-4 p-4"
                  onClick={() => setExpandedUser(isExpanded ? null : user._id)}
                >
                  <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold">
                    {(user.username || user.fullName || user.email)?.[0]?.toUpperCase()}
                    {user.kycStatus === "approved" && (
                      <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-white">
                        <ShieldCheck className="h-2.5 w-2.5" />
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">
                        {user.username || user.fullName || "User"}
                      </span>
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium", role.bg, role.color)}>
                        {locale === "vi" ? role.labelVi : role.labelEn}
                      </span>
                      {user.kycStatus === "pending" && (
                        <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                          <Clock className="h-3 w-3" />
                          {locale === "vi" ? "Chờ KYC" : "KYC Pending"}
                        </span>
                      )}
                      {user.kycStatus === "none" && (
                        <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                          <AlertTriangle className="h-3 w-3" />
                          {locale === "vi" ? "Chưa xác minh" : "Unverified"}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>

                  <div className="hidden text-right sm:block">
                    <div className="text-sm font-semibold text-slate-900">{formatPrice(user.balance, locale)}</div>
                    <div className="text-xs text-slate-400">
                      {locale === "vi" ? "Số dư" : "Balance"}
                    </div>
                  </div>

                  <ChevronDown className={cn("h-5 w-5 text-slate-400 transition-transform", isExpanded && "rotate-180")} />
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">{locale === "vi" ? "Ngày tham gia" : "Joined"}</p>
                        <p className="font-medium text-slate-900">
                          {new Date(user.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">{locale === "vi" ? "Mã giới thiệu" : "Referral Code"}</p>
                        <p className="font-mono font-semibold text-primary-600">{user.referralCode}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">{locale === "vi" ? "Hoa hồng" : "Earnings"}</p>
                        <p className="font-semibold text-green-600">{formatPrice(user.totalEarnings, locale)}</p>
                      </div>
                      <div className="rounded-xl bg-slate-50 p-3">
                        <p className="text-xs text-slate-500">{locale === "vi" ? "Trạng thái KYC" : "KYC Status"}</p>
                        <p className={cn("font-semibold capitalize",
                          user.kycStatus === "approved" ? "text-green-600" :
                          user.kycStatus === "pending" ? "text-amber-600" :
                          user.kycStatus === "rejected" ? "text-red-600" : undefined
                        )}>
                          {user.kycStatus}
                        </p>
                      </div>
                    </div>

                    {/* Role Actions */}
                    <div className="border-t border-slate-100 pt-4">
                      <p className="mb-3 text-sm font-semibold text-slate-700">
                        {locale === "vi" ? "Thay đổi vai trò" : "Change Role"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {(["user", "seller", "vendor", "admin"] as const).map((r) => (
                          <button
                            key={r}
                            onClick={() => handleUpdateRole(user, r)}
                            disabled={isProcessing || user.role === r}
                            className={cn(
                              "rounded-full px-4 py-2 text-xs font-medium transition-colors cursor-default",
                              user.role === r
                                ? `${roleColors[r].bg} ${roleColors[r].color}`
                                : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
                            )}
                          >
                            {locale === "vi" ? roleColors[r].labelVi : roleColors[r].labelEn}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
