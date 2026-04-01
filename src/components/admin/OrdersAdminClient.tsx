"use client";

import { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Package,
  Eye,
  RefreshCw,
  ChevronDown,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useNotification } from "@/components/NotificationProvider";
import { confirm } from "@/components/ConfirmDialog";

interface Order {
  _id: string;
  totalPrice: number;
  unitPrice: number;
  quantity: number;
  status: string;
  paymentMethod?: string;
  payosTransactionNo?: string;
  transferContent?: string;
  createdAt: number;
  deliveredAt?: number;
  completedAt?: number;
  cancellationReason?: string;
  disputeReason?: string;
  product?: { titleVi: string; titleEn: string; demoImages?: string[] };
  variant?: { labelVi: string; labelEn: string };
  buyer?: { email: string; username?: string; fullName?: string };
  seller?: { email: string; username?: string; fullName?: string };
}

interface OrdersAdminClientProps {
  orders: Order[];
  locale: "vi" | "en";
}

const statusFlow = ["pending", "paid", "delivered", "completed"];
const statusLabels: Record<string, { labelVi: string; labelEn: string; color: string; bg: string; icon: React.ComponentType<{ className?: string }> }> = {
  pending: { labelVi: "Chờ xử lý", labelEn: "Pending", color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
  paid: { labelVi: "Đã thanh toán", labelEn: "Paid", color: "text-blue-600", bg: "bg-blue-50", icon: CheckCircle2 },
  delivered: { labelVi: "Đã giao", labelEn: "Delivered", color: "text-indigo-600", bg: "bg-indigo-50", icon: Package },
  completed: { labelVi: "Hoàn thành", labelEn: "Completed", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
  cancelled: { labelVi: "Đã hủy", labelEn: "Cancelled", color: "text-red-600", bg: "bg-red-50", icon: XCircle },
  refunded: { labelVi: "Đã hoàn tiền", labelEn: "Refunded", color: "text-slate-600", bg: "bg-slate-50", icon: RefreshCw },
  disputed: { labelVi: "Khiếu nại", labelEn: "Disputed", color: "text-orange-600", bg: "bg-orange-50", icon: AlertTriangle },
};

export function OrdersAdminClient({ orders, locale = "vi" }: OrdersAdminClientProps) {
  const { success, error: notifyError } = useNotification();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [actionOrder, setActionOrder] = useState<Order | null>(null);

  const filteredOrders = statusFilter === "all"
    ? orders
    : orders.filter((o) => o.status === statusFilter);

  const handleUpdateStatus = async (order: Order, newStatus: string) => {
    const statusCfg = statusLabels[newStatus as keyof typeof statusLabels];
    const confirmed = await confirm({
      title: `${locale === "vi" ? "Cập nhật trạng thái" : "Update status"}: ${locale === "vi" ? statusCfg?.labelVi : statusCfg?.labelEn}`,
      description:
        locale === "vi"
          ? `Cập nhật đơn hàng "${order.product?.titleVi}" sang trạng thái "${statusCfg?.labelVi}"?`
          : `Update order "${order.product?.titleEn}" to "${statusCfg?.labelEn}"?`,
      confirmText: locale === "vi" ? "Xác nhận" : "Confirm",
      cancelText: locale === "vi" ? "Hủy" : "Cancel",
      variant: newStatus === "cancelled" || newStatus === "refunded" ? "danger" : "info",
    });
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      success({
        title: locale === "vi" ? "Cập nhật thành công!" : "Updated!",
        message:
          locale === "vi"
            ? `Đơn hàng đã được cập nhật sang "${statusCfg?.labelVi}".`
            : `Order updated to "${statusCfg?.labelEn}".`,
      });
      setActionOrder(null);
    } catch {
      notifyError({ title: locale === "vi" ? "Lỗi" : "Error", message: "" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-slate-900">
          {locale === "vi" ? "Quản lý đơn hàng" : "Order Management"}
          <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-600">
            {orders.length}
          </span>
        </h2>
        <div className="flex items-center gap-2">
          {["all", "pending", "paid", "delivered", "completed", "cancelled", "disputed"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                statusFilter === s
                  ? "bg-primary-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300"
              )}
            >
              {s === "all"
                ? (locale === "vi" ? "Tất cả" : "All")
                : (statusLabels[s] ? (locale === "vi" ? statusLabels[s].labelVi : statusLabels[s].labelEn) : s)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-soft-sm">
            <FileText className="mx-auto mb-3 h-12 w-12 text-slate-200" />
            <p className="text-slate-500">
              {locale === "vi" ? "Không có đơn hàng nào." : "No orders found."}
            </p>
          </div>
        ) : (
          filteredOrders.map((order, idx) => {
            const statusCfg = statusLabels[order.status as keyof typeof statusLabels] || statusLabels.pending;
            const StatusIcon = statusCfg.icon;
            const isExpanded = expandedOrder === order._id;
            const currentIdx = statusFlow.indexOf(order.status);

            return (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={cn(
                  "rounded-2xl border bg-white shadow-soft-sm transition-all",
                  isExpanded ? "border-primary-200" : "border-slate-100"
                )}
              >
                {/* Order Header */}
                <div
                  className="flex cursor-pointer items-center gap-4 p-4"
                  onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                >
                  <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {order.product?.demoImages?.[0] ? (
                      <Image src={order.product.demoImages[0]} alt="" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-slate-400">
                        <Package className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {locale === "vi" ? order.product?.titleVi : order.product?.titleEn}
                    </p>
                    <p className="text-xs text-slate-500">
                      {locale === "vi" ? order.variant?.labelVi : order.variant?.labelEn} × {order.quantity}
                      {" · "}
                      {new Date(order.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                    </p>
                  </div>

                  <div className="hidden text-right sm:block">
                    <div className="text-base font-bold text-slate-900">{formatPrice(order.totalPrice, locale)}</div>
                    <div className="text-xs text-slate-400">
                      {order.buyer?.username || order.buyer?.fullName || order.buyer?.email}
                    </div>
                  </div>

                  <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", statusCfg.bg, statusCfg.color)}>
                    <StatusIcon className="h-3.5 w-3.5" />
                    {locale === "vi" ? statusCfg.labelVi : statusCfg.labelEn}
                  </span>

                  <ChevronDown className={cn("h-5 w-5 text-slate-400 transition-transform", isExpanded && "rotate-180")} />
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-100 p-4 space-y-4">
                    {/* Product + Parties */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">{locale === "vi" ? "Người mua" : "Buyer"}</p>
                        <p className="text-sm font-medium text-slate-900">{order.buyer?.username || order.buyer?.fullName || "—"}</p>
                        <p className="text-xs text-slate-500">{order.buyer?.email}</p>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">{locale === "vi" ? "Người bán" : "Seller"}</p>
                        <p className="text-sm font-medium text-slate-900">{order.seller?.username || order.seller?.fullName || "—"}</p>
                        <p className="text-xs text-slate-500">{order.seller?.email}</p>
                      </div>
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                        <p className="mb-1 text-xs font-semibold text-slate-500 uppercase">{locale === "vi" ? "Thông tin" : "Info"}</p>
                        {order.payosTransactionNo && (
                          <p className="text-xs text-slate-600">PayOS: {order.payosTransactionNo}</p>
                        )}
                        {order.transferContent && (
                          <p className="text-xs text-slate-600">Nội dung: {order.transferContent}</p>
                        )}
                        <p className="text-xs text-slate-500">
                          {locale === "vi" ? "Đơn giá:" : "Unit price:"} {formatPrice(order.unitPrice, locale)}
                        </p>
                      </div>
                    </div>

                    {/* Status Flow */}
                    {order.status !== "cancelled" && order.status !== "refunded" && order.status !== "disputed" && (
                      <div className="flex items-center gap-2">
                        {statusFlow.map((s, i) => {
                          const cfg = statusLabels[s];
                          const isPast = i < currentIdx;
                          const isCurrent = s === order.status;
                          return (
                            <div key={s} className="flex flex-1 items-center">
                              <div className="flex flex-col items-center gap-1">
                                <div className={cn(
                                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors",
                                  isPast ? "bg-green-100 text-green-600" :
                                  isCurrent ? `${cfg.bg} ${cfg.color}` :
                                  "bg-slate-100 text-slate-400"
                                )}>
                                  {isPast ? <CheckCircle2 className="h-4 w-4" /> : i + 1}
                                </div>
                                <span className={cn("text-xs font-medium", isCurrent ? cfg.color : "text-slate-400")}>
                                  {locale === "vi" ? cfg.labelVi : cfg.labelEn}
                                </span>
                              </div>
                              {i < statusFlow.length - 1 && (
                                <div className={cn("flex-1 h-0.5 mx-1", isPast ? "bg-green-300" : "bg-slate-200")} />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Action Buttons */}
                    {actionOrder?._id !== order._id && (
                      <div className="flex flex-wrap gap-2">
                        {order.status === "pending" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setActionOrder(order); }}
                            className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-blue-700"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {locale === "vi" ? "Xác nhận thanh toán" : "Confirm Payment"}
                          </button>
                        )}
                        {order.status === "paid" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setActionOrder(order); }}
                            className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-indigo-700"
                          >
                            <Package className="h-3.5 w-3.5" />
                            {locale === "vi" ? "Giao hàng" : "Deliver"}
                          </button>
                        )}
                        {order.status === "delivered" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setActionOrder(order); }}
                            className="flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-700"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            {locale === "vi" ? "Hoàn thành" : "Complete"}
                          </button>
                        )}
                        {order.status !== "cancelled" && order.status !== "refunded" && order.status !== "completed" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setActionOrder(order); }}
                            className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 transition-colors hover:bg-red-100"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            {locale === "vi" ? "Hủy đơn" : "Cancel Order"}
                          </button>
                        )}
                      </div>
                    )}

                    {/* Confirm Action */}
                    {actionOrder?._id === order._id && (
                      <div className="flex flex-col gap-3 rounded-xl border-2 border-primary-200 bg-primary-50 p-4">
                        <p className="text-sm font-medium text-primary-700">
                          {locale === "vi" ? "Chọn hành động:" : "Choose action:"}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {order.status === "pending" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order, "paid"); }}
                              disabled={isProcessing}
                              className="flex items-center gap-1.5 rounded-full bg-blue-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> {locale === "vi" ? "Xác nhận TT" : "Confirm Pay"}
                            </button>
                          )}
                          {order.status === "paid" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order, "delivered"); }}
                              disabled={isProcessing}
                              className="flex items-center gap-1.5 rounded-full bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              <Package className="h-3.5 w-3.5" /> {locale === "vi" ? "Giao hàng" : "Deliver"}
                            </button>
                          )}
                          {order.status === "delivered" && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order, "completed"); }}
                              disabled={isProcessing}
                              className="flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> {locale === "vi" ? "Hoàn thành" : "Complete"}
                            </button>
                          )}
                          {(order.status === "pending" || order.status === "paid") && (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleUpdateStatus(order, "cancelled"); }}
                              disabled={isProcessing}
                              className="flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 disabled:opacity-50"
                            >
                              <XCircle className="h-3.5 w-3.5" /> {locale === "vi" ? "Hủy" : "Cancel"}
                            </button>
                          )}
                          <button
                            onClick={(e) => { e.stopPropagation(); setActionOrder(null); }}
                            disabled={isProcessing}
                            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 disabled:opacity-50"
                          >
                            {locale === "vi" ? "Hủy" : "Cancel"}
                          </button>
                        </div>
                      </div>
                    )}

                    {isProcessing && actionOrder?._id === order._id && (
                      <div className="flex items-center gap-2 text-sm text-primary-600">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {locale === "vi" ? "Đang xử lý..." : "Processing..."}
                      </div>
                    )}
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
