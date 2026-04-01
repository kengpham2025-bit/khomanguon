"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, Minus, Plus, Trash2, ArrowRight, ShoppingBag } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useNotification } from "@/components/NotificationProvider";
import { confirm } from "@/components/ConfirmDialog";

interface CartItem {
  _id: string;
  productId: string;
  variantId: string;
  quantity: number;
  product?: { titleVi: string; titleEn: string; demoImages?: string[] };
  variant?: { labelVi: string; labelEn: string; price: number; originalPrice?: number; stock: number };
}

interface CartPageClientProps {
  locale?: "vi" | "en";
}

export function CartPageClient({ locale = "vi" }: CartPageClientProps) {
  const { success, info } = useNotification();

  const [items, setItems] = useState<CartItem[]>([
    {
      _id: "c1",
      productId: "1",
      variantId: "v1",
      quantity: 1,
      product: {
        titleVi: "Tài Khoản ChatGPT Plus Premium - Bản Quyền",
        titleEn: "ChatGPT Plus Premium Account",
        demoImages: ["https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&q=80"],
      },
      variant: { labelVi: "7 Ngày", labelEn: "7 Days", price: 50000, originalPrice: 70000, stock: 15 },
    },
    {
      _id: "c2",
      productId: "2",
      variantId: "v2",
      quantity: 2,
      product: {
        titleVi: "Claude Pro Account",
        titleEn: "Claude Pro Account",
        demoImages: ["https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=400&q=80"],
      },
      variant: { labelVi: "1 Tháng", labelEn: "1 Month", price: 180000, stock: 8 },
    },
  ]);

  const updateQuantity = (id: string, q: number) => {
    if (q <= 0) {
      removeItem(id);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item._id === id ? { ...item, quantity: Math.min(q, item.variant?.stock || 99) } : item
      )
    );
  };

  const removeItem = async (id: string) => {
    const item = items.find((i) => i._id === id);
    if (!item) return;
    const confirmed = await confirm({
      title: locale === "vi" ? "Xóa sản phẩm" : "Remove Product",
      description: locale === "vi"
        ? `Xóa "${item.product?.titleVi}" khỏi giỏ hàng?`
        : `Remove "${item.product?.titleEn}" from cart?`,
      confirmText: locale === "vi" ? "Xóa" : "Remove",
      cancelText: locale === "vi" ? "Hủy" : "Cancel",
      variant: "danger",
    });
    if (confirmed) {
      setItems((prev) => prev.filter((i) => i._id !== id));
      success({
        title: locale === "vi" ? "Đã xóa" : "Removed",
        message: locale === "vi" ? "Sản phẩm đã được xóa khỏi giỏ hàng." : "Product removed from cart.",
      });
    }
  };

  const clearAll = async () => {
    const confirmed = await confirm({
      title: locale === "vi" ? "Xóa toàn bộ giỏ hàng" : "Clear Cart",
      description: locale === "vi"
        ? "Bạn có chắc muốn xóa TẤT CẢ sản phẩm?"
        : "Are you sure you want to remove ALL items?",
      confirmText: locale === "vi" ? "Xóa tất cả" : "Clear All",
      cancelText: locale === "vi" ? "Hủy" : "Cancel",
      variant: "danger",
    });
    if (confirmed) {
      setItems([]);
      success({
        title: locale === "vi" ? "Đã xóa" : "Cleared",
        message: locale === "vi" ? "Giỏ hàng đã được xóa." : "Cart has been cleared.",
      });
    }
  };

  const subtotal = items.reduce((sum, item) => sum + (item.variant?.price || 0) * item.quantity, 0);
  const totalDiscount = items.reduce((sum, item) => {
    const orig = item.variant?.originalPrice || 0;
    const curr = item.variant?.price || 0;
    return sum + Math.max(0, orig - curr) * item.quantity;
  }, 0);

  if (items.length === 0) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-100">
          <ShoppingCart className="h-12 w-12 text-slate-300" />
        </div>
        <h2 className="mb-2 text-2xl font-bold text-slate-700">
          {locale === "vi" ? "Giỏ hàng trống" : "Your cart is empty"}
        </h2>
        <p className="mb-8 text-slate-500">
          {locale === "vi" ? "Hãy thêm sản phẩm để bắt đầu mua sắm." : "Add some products to start shopping."}
        </p>
        <Link
          href="/products"
          className="flex items-center gap-2 rounded-full bg-primary-600 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
        >
          <ShoppingBag className="h-4 w-4" />
          {locale === "vi" ? "Mua sắm ngay" : "Shop Now"}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
            {locale === "vi" ? "Giỏ hàng" : "Shopping Cart"}
          </h1>
          <p className="mt-1 text-slate-500">
            {items.length} {locale === "vi" ? "sản phẩm" : "items"}
            {totalDiscount > 0 && (
              <span className="ml-2 text-green-600">
                {locale === "vi" ? "Tiết kiệm" : "Saving"} {formatPrice(totalDiscount, locale)}
              </span>
            )}
          </p>
        </div>
        <button
          onClick={clearAll}
          className="flex items-center gap-2 rounded-full border border-red-200 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
        >
          <Trash2 className="h-4 w-4" />
          {locale === "vi" ? "Xóa tất cả" : "Clear All"}
        </button>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Items */}
        <div className="flex-1 space-y-4">
          {items.map((item, idx) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="flex gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-soft-sm"
            >
              <Link href={`/product/${item.productId}`} className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                {item.product?.demoImages?.[0] ? (
                  <Image src={item.product.demoImages[0]} alt={item.product.titleVi} fill className="object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-400 text-xs">No Img</div>
                )}
              </Link>

              <div className="flex flex-1 flex-col justify-between">
                <div>
                  <Link href={`/product/${item.productId}`} className="line-clamp-2 text-sm font-semibold text-slate-900 hover:text-primary-600 transition-colors">
                    {locale === "vi" ? item.product?.titleVi : item.product?.titleEn}
                  </Link>
                  <p className="mt-1 text-xs text-slate-500">
                    {locale === "vi" ? item.variant?.labelVi : item.variant?.labelEn}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white">
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity - 1)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item._id, item.quantity + 1)}
                        disabled={item.quantity >= (item.variant?.stock || 99)}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item._id)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold text-primary-600">
                      {formatPrice((item.variant?.price || 0) * item.quantity, locale)}
                    </div>
                    {item.variant?.originalPrice && item.variant.originalPrice > item.variant.price && (
                      <div className="text-xs text-slate-400 line-through">
                        {formatPrice(item.variant.originalPrice * item.quantity, locale)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:w-80">
          <div className="sticky top-24 rounded-2xl border border-slate-100 bg-white p-6 shadow-soft-sm">
            <h3 className="mb-4 text-base font-bold text-slate-900">
              {locale === "vi" ? "Tóm tắt" : "Summary"}
            </h3>

            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">
                  {locale === "vi" ? "Tạm tính" : "Subtotal"} ({items.length} {locale === "vi" ? "sản phẩm" : "items"})
                </span>
                <span className="font-medium text-slate-900">{formatPrice(subtotal, locale)}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>{locale === "vi" ? "Giảm giá" : "Discount"}</span>
                  <span>-{formatPrice(totalDiscount, locale)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">{locale === "vi" ? "Phí giao hàng" : "Delivery"}</span>
                <span className="font-medium text-green-600">{locale === "vi" ? "Miễn phí" : "Free"}</span>
              </div>
            </div>

            <div className="mb-6 border-t border-slate-100 pt-4">
              <div className="flex justify-between">
                <span className="font-semibold text-slate-900">{locale === "vi" ? "Tổng cộng" : "Total"}</span>
                <span className="text-2xl font-bold text-primary-600">{formatPrice(subtotal, locale)}</span>
              </div>
            </div>

            <Link
              href="/checkout"
              className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-primary-700 active:scale-95"
            >
              {locale === "vi" ? "Thanh toán ngay" : "Checkout Now"}
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/products"
              className="mt-3 flex w-full items-center justify-center gap-1 text-sm text-slate-500 transition-colors hover:text-primary-600"
            >
              {locale === "vi" ? "Tiếp tục mua sắm" : "Continue Shopping"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
