"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Star,
  CheckCircle2,
  XCircle,
  Loader2,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Flame,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useNotification } from "@/components/NotificationProvider";
import { confirm } from "@/components/ConfirmDialog";

interface SellerProduct {
  _id: string;
  titleVi: string;
  titleEn: string;
  demoImages?: string[];
  variants: { price: number; stock: number }[];
  isHot: boolean;
  isSale: boolean;
  isNew: boolean;
  isActive: boolean;
  rating: number;
  reviewCount: number;
  sales: number;
  views: number;
  createdAt: number;
}

interface SellerDashboardClientProps {
  products: SellerProduct[];
  locale: "vi" | "en";
  stats: {
    totalRevenue: number;
    pendingOrders: number;
    totalProducts: number;
    totalSales: number;
  };
}

export function SellerDashboardClient({ products, locale = "vi", stats }: SellerDashboardClientProps) {
  const { success, error: notifyError } = useNotification();
  const [selectedProduct, setSelectedProduct] = useState<SellerProduct | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleToggleActive = async (product: SellerProduct) => {
    const confirmed = await confirm({
      title: product.isActive
        ? (locale === "vi" ? "Hủy kích hoạt sản phẩm" : "Deactivate Product")
        : (locale === "vi" ? "Kích hoạt sản phẩm" : "Activate Product"),
      description:
        locale === "vi"
          ? `${product.isActive ? "Hủy kích hoạt" : "Kích hoạt"} sản phẩm "${product.titleVi}"?`
          : `${product.isActive ? "Deactivate" : "Activate"} product "${product.titleEn}"?`,
      confirmText: locale === "vi" ? "Xác nhận" : "Confirm",
      cancelText: locale === "vi" ? "Hủy" : "Cancel",
      variant: product.isActive ? "warning" : "success",
    });
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      success({
        title: product.isActive
          ? (locale === "vi" ? "Đã hủy kích hoạt" : "Deactivated")
          : (locale === "vi" ? "Đã kích hoạt" : "Activated"),
        message: "",
      });
    } catch {
      notifyError({ title: locale === "vi" ? "Lỗi" : "Error", message: "" });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          { label: locale === "vi" ? "Tổng doanh thu" : "Total Revenue", value: formatPrice(stats.totalRevenue, locale), icon: DollarSign, color: "text-green-600", bg: "bg-green-50" },
          { label: locale === "vi" ? "Chờ xử lý" : "Pending Orders", value: stats.pendingOrders.toString(), icon: Package, color: "text-amber-600", bg: "bg-amber-50" },
          { label: locale === "vi" ? "Sản phẩm" : "Products", value: stats.totalProducts.toString(), icon: Package, color: "text-blue-600", bg: "bg-blue-50" },
          { label: locale === "vi" ? "Đã bán" : "Sold", value: stats.totalSales.toString(), icon: Star, color: "text-primary-600", bg: "bg-primary-50" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-soft-sm">
            <div className="mb-3">
              <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", stat.bg)}>
                <stat.icon className={cn("h-5 w-5", stat.color)} />
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Products Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {locale === "vi" ? "Sản phẩm của tôi" : "My Products"}
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            {products.length} {locale === "vi" ? "sản phẩm" : "products"}
          </p>
        </div>
        <Link
          href="/seller/add-product"
          className="flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          <Plus className="h-4 w-4" />
          {locale === "vi" ? "Thêm sản phẩm" : "Add Product"}
        </Link>
      </div>

      {/* Products List */}
      <div className="space-y-3">
        {products.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-soft-sm">
            <Package className="mx-auto mb-3 h-12 w-12 text-slate-200" />
            <p className="text-lg font-semibold text-slate-700">
              {locale === "vi" ? "Chưa có sản phẩm nào" : "No products yet"}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {locale === "vi" ? "Hãy thêm sản phẩm đầu tiên của bạn." : "Add your first product."}
            </p>
          </div>
        ) : (
          products.map((product, idx) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.03 }}
              className={cn(
                "overflow-hidden rounded-2xl border bg-white shadow-soft-sm transition-all",
                product.isActive ? "border-slate-100" : "border-slate-200 opacity-60"
              )}
            >
              <div className="flex items-center gap-4 p-4">
                {/* Image */}
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {product.demoImages?.[0] ? (
                    <img src={product.demoImages[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <Package className="h-5 w-5" />
                    </div>
                  )}
                  {!product.isActive && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <span className="rounded-full bg-slate-700 px-2 py-0.5 text-xs font-semibold text-white">
                        {locale === "vi" ? "Tắt" : "Off"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {locale === "vi" ? product.titleVi : product.titleEn}
                    </p>
                    {product.isHot && (
                      <span className="flex items-center gap-0.5 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                        <Flame className="h-3 w-3" /> Hot
                      </span>
                    )}
                    {product.isSale && (
                      <span className="flex items-center gap-0.5 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">
                        Sale
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {product.rating.toFixed(1)} ({product.reviewCount})
                    </span>
                    <span>{product.sales} {locale === "vi" ? "đã bán" : "sold"}</span>
                    <span>{product.views} {locale === "vi" ? "lượt xem" : "views"}</span>
                  </div>
                </div>

                {/* Price */}
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-primary-600">
                    {formatPrice(product.variants[0]?.price || 0, locale)}
                  </div>
                  <div className="text-xs text-slate-400">
                    {product.variants[0]?.stock || 0} {locale === "vi" ? "trong kho" : "in stock"}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(product)}
                    disabled={isProcessing}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                      product.isActive
                        ? "text-green-600 hover:bg-green-50"
                        : "text-slate-400 hover:bg-slate-100"
                    )}
                    title={product.isActive ? (locale === "vi" ? "Tắt sản phẩm" : "Deactivate") : (locale === "vi" ? "Bật sản phẩm" : "Activate")}
                  >
                    {isProcessing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : product.isActive ? (
                      <ToggleRight className="h-5 w-5" />
                    ) : (
                      <ToggleLeft className="h-5 w-5" />
                    )}
                  </button>

                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    title={locale === "vi" ? "Sửa" : "Edit"}
                  >
                    <Edit className="h-4 w-4" />
                  </button>

                  <button
                    className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    title={locale === "vi" ? "Xóa" : "Delete"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
