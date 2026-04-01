"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  ShieldCheck,
  XCircle,
  Clock,
  User,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  ChevronRight,
  Eye,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useNotification } from "@/components/NotificationProvider";
import { confirm } from "@/components/ConfirmDialog";

interface KycUser {
  _id: string;
  email: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  kycData?: {
    cccdFront: string;
    cccdBack: string;
    cccdNumber: string;
    submittedAt: number;
  };
  createdAt: number;
}

interface KycApprovalPageProps {
  pendingUsers: KycUser[];
  locale: "vi" | "en";
}

export function KycApprovalClient({ pendingUsers, locale = "vi" }: KycApprovalPageProps) {
  const { success, error: notifyError, info } = useNotification();
  const [selectedUser, setSelectedUser] = useState<KycUser | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async (user: KycUser) => {
    const confirmed = await confirm({
      title: locale === "vi" ? "Phê duyệt KYC" : "Approve KYC",
      description:
        locale === "vi"
          ? `Xác nhận phê duyệt KYC cho "${user.username || user.fullName || user.email}"?`
          : `Confirm KYC approval for "${user.username || user.fullName || user.email}"?`,
      confirmText: locale === "vi" ? "Phê duyệt" : "Approve",
      cancelText: locale === "vi" ? "Hủy" : "Cancel",
      variant: "success",
    });
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      success({
        title: locale === "vi" ? "Phê duyệt thành công!" : "Approved!",
        message:
          locale === "vi"
            ? `KYC của "${user.username || user.fullName}" đã được phê duyệt.`
            : `${user.username || user.fullName}'s KYC has been approved.`,
      });
      setSelectedUser(null);
    } catch {
      notifyError({ title: locale === "vi" ? "Lỗi" : "Error", message: "" });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (user: KycUser) => {
    if (!rejectReason.trim()) {
      info({
        title: locale === "vi" ? "Cần nhập lý do" : "Reason required",
        message: locale === "vi" ? "Vui lòng nhập lý do từ chối." : "Please enter rejection reason.",
      });
      return;
    }
    const confirmed = await confirm({
      title: locale === "vi" ? "Từ chối KYC" : "Reject KYC",
      description:
        locale === "vi"
          ? `Từ chối KYC của "${user.username || user.fullName || user.email}"?`
          : `Reject KYC of "${user.username || user.fullName || user.email}"?`,
      confirmText: locale === "vi" ? "Từ chối" : "Reject",
      cancelText: locale === "vi" ? "Hủy" : "Cancel",
      variant: "danger",
    });
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      success({
        title: locale === "vi" ? "Đã từ chối" : "Rejected",
        message:
          locale === "vi"
            ? `KYC của "${user.username || user.fullName}" đã bị từ chối.`
            : `${user.username || user.fullName}'s KYC has been rejected.`,
      });
      setSelectedUser(null);
      setRejectReason("");
    } catch {
      notifyError({ title: locale === "vi" ? "Lỗi" : "Error", message: "" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {locale === "vi" ? "Xét duyệt KYC" : "KYC Approval"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {locale === "vi"
              ? `${pendingUsers.length} hồ sơ đang chờ xét duyệt`
              : `${pendingUsers.length} applications pending review`}
          </p>
        </div>
        {pendingUsers.length > 0 && (
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
            <Clock className="h-5 w-5 text-amber-600" />
          </div>
        )}
      </div>

      {pendingUsers.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-soft-sm">
          <ShieldCheck className="mx-auto mb-3 h-12 w-12 text-green-300" />
          <p className="text-lg font-semibold text-slate-700">
            {locale === "vi" ? "Không có hồ sơ nào" : "All caught up!"}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {locale === "vi" ? "Không có hồ sơ KYC nào đang chờ xét duyệt." : "No KYC applications pending."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingUsers.map((user, idx) => (
            <motion.div
              key={user._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="rounded-2xl border border-slate-100 bg-white shadow-soft-sm"
            >
              {/* Header */}
              <div
                className="flex cursor-pointer items-center gap-4 p-5"
                onClick={() => setSelectedUser(selectedUser?._id === user._id ? null : user)}
              >
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-primary-100">
                  {user.avatarUrl ? (
                    <Image src={user.avatarUrl} alt="" fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-lg font-bold text-primary-600">
                      {(user.username || user.fullName || user.email)?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {user.username || user.fullName || "User"}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
                      <Clock className="h-3 w-3" />
                      {locale === "vi" ? "Đang chờ" : "Pending"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500">{user.email}</p>
                  {user.kycData?.submittedAt && (
                    <p className="mt-0.5 text-xs text-slate-400">
                      {locale === "vi" ? "Nộp lúc:" : "Submitted:"}{" "}
                      {new Date(user.kycData.submittedAt).toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}
                    </p>
                  )}
                </div>

                <ChevronRight
                  className={cn(
                    "h-5 w-5 text-slate-400 transition-transform",
                    selectedUser?._id === user._id && "rotate-90"
                  )}
                />
              </div>

              {/* Expanded Details */}
              {selectedUser?._id === user._id && (
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: "auto" }}
                  exit={{ height: 0 }}
                  className="overflow-hidden border-t border-slate-100"
                >
                  <div className="p-5 space-y-4">
                    {/* CCCD Images */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="mb-2 text-xs font-semibold text-slate-500 uppercase">
                          {locale === "vi" ? "Mặt trước CCCD" : "CCCD Front"}
                        </p>
                        {user.kycData?.cccdFront ? (
                          <a href={user.kycData.cccdFront} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-slate-200">
                            <Image
                              src={user.kycData.cccdFront}
                              alt="CCCD Front"
                              width={300}
                              height={200}
                              className="w-full object-cover"
                            />
                          </a>
                        ) : (
                          <div className="flex h-32 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-400">
                            {locale === "vi" ? "Không có hình ảnh" : "No image"}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="mb-2 text-xs font-semibold text-slate-500 uppercase">
                          {locale === "vi" ? "Mặt sau CCCD" : "CCCD Back"}
                        </p>
                        {user.kycData?.cccdBack ? (
                          <a href={user.kycData.cccdBack} target="_blank" rel="noreferrer" className="block overflow-hidden rounded-xl border border-slate-200">
                            <Image
                              src={user.kycData.cccdBack}
                              alt="CCCD Back"
                              width={300}
                              height={200}
                              className="w-full object-cover"
                            />
                          </a>
                        ) : (
                          <div className="flex h-32 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-400">
                            {locale === "vi" ? "Không có hình ảnh" : "No image"}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* CCCD Number */}
                    {user.kycData?.cccdNumber && (
                      <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <User className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-mono text-slate-700">
                          {user.kycData.cccdNumber}
                        </span>
                      </div>
                    )}

                    {/* Reject Reason */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        {locale === "vi" ? "Lý do từ chối (nếu có)" : "Rejection reason (optional)"}
                      </label>
                      <textarea
                        value={selectedUser?._id === user._id ? rejectReason : ""}
                        onChange={(e) => setRejectReason(e.target.value)}
                        placeholder={locale === "vi" ? "Nhập lý do..." : "Enter reason..."}
                        rows={2}
                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleApprove(user)}
                        disabled={isProcessing}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
                      >
                        {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                        {locale === "vi" ? "Phê duyệt" : "Approve"}
                      </button>
                      <button
                        onClick={() => handleReject(user)}
                        disabled={isProcessing}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                      >
                        <XCircle className="h-4 w-4" />
                        {locale === "vi" ? "Từ chối" : "Reject"}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
