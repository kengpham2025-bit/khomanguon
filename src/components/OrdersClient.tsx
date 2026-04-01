"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, Package, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Eye, Star } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useNotification } from "@/components/NotificationProvider";
import { confirm } from "@/components/ConfirmDialog";

interface Order {
  _id: string;
  totalPrice: number;
  unitPrice: number;
  quantity: number;
  status: string;
  createdAt: number;
  deliveredAt?: number;
  completedAt?: number;
  product?: { titleVi: string; titleEn: string; demoImages?: string[] };
  variant?: { labelVi: string; labelEn: string };
  seller?: { _id?: string; username?: string; fullName?: string };
  buyer?: { username?: string; fullName?: string };
}

interface OrdersClientProps {
  orders: Order[];
  locale: "vi" | "en";
}

const statusConfig = {
  pending: { labelVi: "Chờ xử lý", labelEn: "Pending", color: "text-amber-600", bg: "bg-amber-50", icon: Clock },
  paid: { labelVi: "Đã thanh toán", labelEn: "Paid", color: "text-blue-600", bg: "bg-blue-50", icon: CheckCircle2 },
  delivered: { labelVi: "Đã giao", labelEn: "Delivered", color: "text-indigo-600", bg: "bg-indigo-50", icon: Package },
  completed: { labelVi: "Hoàn thành", labelEn: "Completed", color: "text-green-600", bg: "bg-green-50", icon: CheckCircle2 },
  cancelled: { labelVi: "Đã hủy", labelEn: "Cancelled", color: "text-red-600", bg: "bg-red-50", icon: XCircle },
  refunded: { labelVi: "Đã hoàn tiền", labelEn: "Refunded", color: "text-slate-600", bg: "bg-slate-50", icon: XCircle },
  disputed: { labelVi: "Khiếu nại", labelEn: "Disputed", color: "text-orange-600", bg: "bg-orange-50", icon: AlertTriangle },
};

export function OrdersClient({ orders, locale = "vi" }: OrdersClientProps) {
  const { success, error: notifyError } = useNotification();
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showReview, setShowReview] = useState<Order | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const filteredOrders = filter === "all"
    ? orders
    : orders.filter((o) => o.status === filter);

  const handleConfirmReceived = async (order: Order) => {
    const confirmed = await confirm({
      title: locale === "vi" ? "Xác nhận đã nhận hàng?" : "Confirm receipt?",
      description:
        locale === "vi"
          ? `Xác nhận bạn đã nhận được "${order.product?.titleVi}"?`
          : `Confirm you received "${order.product?.titleEn}"?`,
      confirmText: locale === "vi" ? "Đã nhận được" : "Confirm Receipt",
      cancelText: locale === "vi" ? "Hủy" : "Cancel",
      variant: "success",
    });
    if (confirmed) {
      success({
        title: locale === "vi" ? "Đã xác nhận!" : "Confirmed!",
        message: locale === "vi"
          ? "Cảm ơn bạn! Đơn hàng đã hoàn thành."
          : "Thank you! Order completed.",
      });
    }
  };

  const handleDispute = async (order: Order) => {
    const confirmed = await confirm({
      title: locale === "vi" ? "Khiếu nại đơn hàng" : "Dispute Order",
      description:
        locale === "vi"
          ? `Bạn có chắc muốn khiếu nại đơn hàng "${order.product?.titleVi}"?`
          : `Are you sure you want to dispute order "${order.product?.titleEn}"?`,
      confirmText: locale === "vi" ? "Khiếu nại" : "Dispute",
      cancelText: locale === "vi" ? "Hủy" : "Cancel",
      variant: "warning",
    });
    if (confirmed) {
      info({
        title: locale === "vi" ? "Đã gửi khiếu nại" : "Dispute submitted",
        message: locale === "vi"
          ? "Khiếu nại của bạn đang được xử lý."
          : "Your dispute is being processed.",
      });
    }
  };

  const submitReview = async () => {
    if (!showReview) return;
    success({
      title: locale === "vi" ? "Cảm ơn bạn!" : "Thank you!",
      message: locale === "vi"
        ? "Đánh giá của bạn đã được gửi."
        : "Your review has been submitted.",
    });
    setShowReview(null);
    setRating(5);
    setComment("");
  };

  const info = useNotification().info;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
              {locale === "vi" ? "Đơn hàng của tôi" : "My Orders"}
            </h1>
            <p className="mt-1 text-slate-500">
              {orders.length} {locale === "vi" ? "đơn hàng" : "orders"}
            </p>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
          >
            {locale === "vi" ? "Mua sắm ngay" : "Shop Now"}
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
          {["all", "pending", "paid", "delivered", "completed", "cancelled", "disputed"].map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={cn(
                "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors",
                filter === s
                  ? "bg-primary-600 text-white"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300"
              )}
            >
              {s === "all" ? (locale === "vi" ? "Tất cả" : "All") :
               statusConfig[s as keyof typeof statusConfig]
                ? (locale === "vi" ? statusConfig[s as keyof typeof statusConfig].labelVi : statusConfig[s as keyof typeof statusConfig].labelEn)
                : s}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-soft-sm">
            <Package className="mx-auto mb-3 h-12 w-12 text-slate-200" />
            <p className="text-lg font-semibold text-slate-700">
              {locale === "vi" ? "Không có đơn hàng nào" : "No orders found"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {locale === "vi" ? "Bạn chưa có đơn hàng nào." : "You have no orders yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order, idx) => {
              const status = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.pending;
              const StatusIcon = status.icon;
              const isExpanded = expanded === order._id;

              return (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={cn(
                    "overflow-hidden rounded-2xl border bg-white shadow-soft-sm transition-all",
                    isExpanded ? "border-primary-200" : "border-slate-100"
                  )}
                >
                  {/* Order Header */}
                  <div
                    className="flex cursor-pointer items-center gap-4 p-4"
                    onClick={() => setExpanded(isExpanded ? null : order._id)}
                  >
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                      {order.product?.demoImages?.[0] ? (
                        <img src={order.product.demoImages[0]} alt="" className="h-full w-full object-cover" />
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
                      </p>
                    </div>

                    <div className="text-right hidden sm:block">
                      <div className="text-base font-bold text-slate-900">{formatPrice(order.totalPrice, locale)}</div>
                      <div className="text-xs text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                      </div>
                    </div>

                    <span className={cn("flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium", status.bg, status.color)}>
                      <StatusIcon className="h-3.5 w-3.5" />
                      {locale === "vi" ? status.labelVi : status.labelEn}
                    </span>
                  </div>

                  {/* Expanded Actions */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 p-4 space-y-4">
                      {/* Order Details */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">{locale === "vi" ? "Người bán" : "Seller"}</p>
                          <p className="font-medium text-slate-900">{order.seller?.username || order.seller?.fullName || "—"}</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 p-3">
                          <p className="text-xs text-slate-500">{locale === "vi" ? "Ngày đặt" : "Order Date"}</p>
                          <p className="font-medium text-slate-900">
                            {new Date(order.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {order.status === "delivered" && (
                          <>
                            <button
                              onClick={() => handleConfirmReceived(order)}
                              className="flex items-center gap-1.5 rounded-full bg-green-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-green-700"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {locale === "vi" ? "Xác nhận đã nhận" : "Confirm Receipt"}
                            </button>
                            <button
                              onClick={() => handleDispute(order)}
                              className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-600 transition-colors hover:bg-amber-100"
                            >
                              <AlertTriangle className="h-3.5 w-3.5" />
                              {locale === "vi" ? "Khiếu nại" : "Dispute"}
                            </button>
                          </>
                        )}
                        {order.status === "completed" && !showReview && (
                          <button
                            onClick={() => setShowReview(order)}
                            className="flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-4 py-2 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-100"
                          >
                            <Star className="h-3.5 w-3.5" />
                            {locale === "vi" ? "Đánh giá" : "Review"}
                          </button>
                        )}
                        <Link
                          href={`/chat?sellerId=${order.seller?._id || ""}`}
                          className="flex items-center gap-1.5 rounded-full border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                        >
                          {locale === "vi" ? "Liên hệ người bán" : "Contact Seller"}
                        </Link>
                      </div>

                      {/* Review Form */}
                      {showReview?._id === order._id && (
                        <div className="rounded-xl border-2 border-primary-200 bg-primary-50 p-4 space-y-3">
                          <h4 className="font-semibold text-primary-700">
                            {locale === "vi" ? "Đánh giá sản phẩm" : "Rate this product"}
                          </h4>
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button key={star} onClick={() => setRating(star)} className="transition-transform hover:scale-110">
                                <Star className={cn("h-7 w-7", star <= rating ? "fill-amber-400 text-amber-400" : "text-slate-300")} />
                              </button>
                            ))}
                          </div>
                          <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                            placeholder={locale === "vi" ? "Viết đánh giá của bạn..." : "Write your review..."}
                            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
                          />
                          <div className="flex gap-2">
                            <button onClick={submitReview} className="flex-1 rounded-full bg-primary-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700">
                              {locale === "vi" ? "Gửi đánh giá" : "Submit Review"}
                            </button>
                            <button onClick={() => setShowReview(null)} className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50">
                              {locale === "vi" ? "Hủy" : "Cancel"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
