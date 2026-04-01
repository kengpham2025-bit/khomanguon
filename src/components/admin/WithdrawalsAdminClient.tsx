"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  DollarSign,
  AlertCircle,
  ArrowUpDown,
  FileText,
} from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { useNotification } from "@/components/NotificationProvider";
import { confirm } from "@/components/ConfirmDialog";

interface WithdrawalRequest {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  createdAt: number;
  note?: string;
}

interface WithdrawalsAdminClientProps {
  locale: "vi" | "en";
  withdrawals: WithdrawalRequest[];
}

const dummyWithdrawals: WithdrawalRequest[] = [
  {
    _id: "w1",
    userId: "user_1",
    userName: "Nguyen Van A",
    userEmail: "nguyenvana@email.com",
    bankName: "Vietcombank",
    accountNumber: "1234567890",
    accountHolder: "NGUYEN VAN A",
    amount: 500000,
    status: "pending",
    createdAt: Date.now() - 3600000 * 2,
  },
  {
    _id: "w2",
    userId: "user_2",
    userName: "Tran Thi B",
    userEmail: "tranthib@email.com",
    bankName: "TPBank",
    accountNumber: "0987654321",
    accountHolder: "TRAN THI B",
    amount: 1200000,
    status: "pending",
    createdAt: Date.now() - 3600000 * 5,
  },
  {
    _id: "w3",
    userId: "user_3",
    userName: "Le Van C",
    userEmail: "levanc@email.com",
    bankName: "MB Bank",
    accountNumber: "5555666677",
    accountHolder: "LE VAN C",
    amount: 300000,
    status: "approved",
    createdAt: Date.now() - 86400000,
  },
  {
    _id: "w4",
    userId: "user_4",
    userName: "Pham Van D",
    userEmail: "phamvand@email.com",
    bankName: "ACB",
    accountNumber: "1111222233",
    accountHolder: "PHAM VAN D",
    amount: 750000,
    status: "rejected",
    createdAt: Date.now() - 86400000 * 2,
    note: "Số tài khoản không hợp lệ",
  },
];

export function WithdrawalsAdminClient({ locale, withdrawals }: WithdrawalsAdminClientProps) {
  const { success, error: notifyError } = useNotification();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isProcessing, setIsProcessing] = useState(false);

  const filtered = withdrawals.filter((w) => {
    const matchesSearch =
      w.userName.toLowerCase().includes(search.toLowerCase()) ||
      w.accountNumber.includes(search) ||
      w.userEmail.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || w.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const totalPending = withdrawals.filter((w) => w.status === "pending").reduce((sum, w) => sum + w.amount, 0);
  const totalApproved = withdrawals.filter((w) => w.status === "approved").reduce((sum, w) => sum + w.amount, 0);
  const totalRejected = withdrawals.filter((w) => w.status === "rejected").reduce((sum, w) => sum + w.amount, 0);

  const handleApprove = async (w: WithdrawalRequest) => {
    const confirmed = await confirm({
      title: locale === "vi" ? "Duyệt rút tiền" : "Approve Withdrawal",
      description:
        locale === "vi"
          ? `Duyệt rút tiền ${formatPrice(w.amount, locale)} của "${w.userName}"?`
          : `Approve withdrawal of ${formatPrice(w.amount, locale)} for "${w.userName}"?`,
      confirmText: locale === "vi" ? "Duyệt" : "Approve",
      cancelText: locale === "vi" ? "Hủy" : "Cancel",
      variant: "success",
    });
    if (!confirmed) return;
    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      success({
        title: locale === "vi" ? "Đã duyệt rút tiền" : "Withdrawal Approved",
        message: locale === "vi"
          ? `Đã chuyển ${formatPrice(w.amount, locale)} cho ${w.userName}`
          : `Transferred ${formatPrice(w.amount, locale)} to ${w.userName}`,
      });
    } catch {
      notifyError({ title: locale === "vi" ? "Lỗi" : "Error", message: "" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (w: WithdrawalRequest) => {
    const confirmed = await confirm({
      title: locale === "vi" ? "Từ chối rút tiền" : "Reject Withdrawal",
      description:
        locale === "vi"
          ? `Từ chối yêu cầu rút tiền ${formatPrice(w.amount, locale)} của "${w.userName}"? Số dư sẽ được hoàn lại cho người dùng.`
          : `Reject withdrawal request of ${formatPrice(w.amount, locale)} for "${w.userName}"? Balance will be refunded.`,
      confirmText: locale === "vi" ? "Từ chối" : "Reject",
      cancelText: locale === "vi" ? "Hủy" : "Cancel",
      variant: "danger",
    });
    if (!confirmed) return;
    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      success({
        title: locale === "vi" ? "Đã từ chối" : "Withdrawal Rejected",
        message: locale === "vi"
          ? `Đã từ chối và hoàn ${formatPrice(w.amount, locale)} cho ${w.userName}`
          : `Rejected and refunded ${formatPrice(w.amount, locale)} to ${w.userName}`,
      });
    } catch {
      notifyError({ title: locale === "vi" ? "Lỗi" : "Error", message: "" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {locale === "vi" ? "Quản lý rút tiền" : "Withdrawal Management"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length} {locale === "vi" ? "yêu cầu" : "requests"}
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: locale === "vi" ? "Chờ duyệt" : "Pending", value: formatPrice(totalPending, locale), icon: Clock, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
          { label: locale === "vi" ? "Đã duyệt" : "Approved", value: formatPrice(totalApproved, locale), icon: CheckCircle2, color: "text-green-600", bg: "bg-green-50", border: "border-green-100" },
          { label: locale === "vi" ? "Đã từ chối" : "Rejected", value: formatPrice(totalRejected, locale), icon: XCircle, color: "text-red-600", bg: "bg-red-50", border: "border-red-100" },
        ].map((card) => (
          <div key={card.label} className={cn("rounded-2xl border bg-white p-5 shadow-soft-sm", card.border)}>
            <div className={cn("mb-3 flex h-10 w-10 items-center justify-center rounded-xl", card.bg)}>
              <card.icon className={cn("h-5 w-5", card.color)} />
            </div>
            <div className="text-2xl font-bold text-slate-900">{card.value}</div>
            <div className="mt-1 text-sm text-slate-500">{card.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={locale === "vi" ? "Tìm người dùng..." : "Search user..."}
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option value="all">{locale === "vi" ? "Tất cả" : "All"}</option>
          <option value="pending">{locale === "vi" ? "Chờ duyệt" : "Pending"}</option>
          <option value="approved">{locale === "vi" ? "Đã duyệt" : "Approved"}</option>
          <option value="rejected">{locale === "vi" ? "Từ chối" : "Rejected"}</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-soft-sm">
          <Wallet className="mx-auto mb-3 h-12 w-12 text-slate-200" />
          <p className="text-lg font-semibold text-slate-700">
            {locale === "vi" ? "Không có yêu cầu nào" : "No requests found"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((w, idx) => (
            <motion.div
              key={w._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft-sm"
            >
              <div className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                  {w.userName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-slate-900">{w.userName}</p>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-xs font-medium",
                      w.status === "pending" ? "bg-amber-100 text-amber-600" :
                      w.status === "approved" ? "bg-green-100 text-green-600" :
                      "bg-red-100 text-red-600"
                    )}>
                      {w.status === "pending" ? (locale === "vi" ? "Chờ duyệt" : "Pending") :
                       w.status === "approved" ? (locale === "vi" ? "Đã duyệt" : "Approved") :
                       (locale === "vi" ? "Từ chối" : "Rejected")}
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span>{w.bankName}</span>
                    <span>•</span>
                    <span>{w.accountNumber}</span>
                    <span>•</span>
                    <span>{formatDate(w.createdAt, locale)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-600">{formatPrice(w.amount, locale)}</div>
                </div>
                {w.status === "pending" && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleApprove(w)}
                      disabled={isProcessing}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50"
                      title={locale === "vi" ? "Duyệt" : "Approve"}
                    >
                      {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => handleReject(w)}
                      disabled={isProcessing}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-red-500 transition-colors hover:bg-red-50 disabled:opacity-50"
                      title={locale === "vi" ? "Từ chối" : "Reject"}
                    >
                      <XCircle className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
              {w.note && (
                <div className="border-t border-slate-100 px-4 py-2">
                  <p className="flex items-center gap-1 text-xs text-red-500"><FileText className="h-3 w-3 inline-block" /> {w.note}</p>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
