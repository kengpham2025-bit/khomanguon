"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, Minus, Plus, X, Trash2, Loader2, ArrowRight } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useNotification } from "@/components/NotificationProvider";
import { confirm } from "@/components/ConfirmDialog";

interface CartVariant {
  _id: string;
  labelVi: string;
  labelEn: string;
  price: number;
  originalPrice?: number;
  stock: number;
}

interface CartProduct {
  _id: string;
  titleVi: string;
  titleEn: string;
  demoImages?: string[];
  sellerId?: string;
  sellerName?: string;
  isVerified?: boolean;
}

interface CartItem {
  _id: string;
  productId: string;
  variantId: string;
  quantity: number;
  product?: CartProduct;
  variant?: CartVariant;
  seller?: { fullName?: string; username?: string };
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  cartTotal: number;
  onUpdateQuantity: (itemId: string, quantity: number) => void;
  onRemove: (itemId: string) => void;
  onClearCart: () => void;
  locale?: "vi" | "en";
  isLoading?: boolean;
}

export function CartDrawer({
  isOpen,
  onClose,
  items,
  cartTotal,
  onUpdateQuantity,
  onRemove,
  onClearCart,
  locale = "vi",
  isLoading = false,
}: CartDrawerProps) {
  const { success, error: notifyError } = useNotification();

  const handleRemove = async (item: CartItem) => {
    const confirmed = await confirm({
      title: locale === "vi" ? "Xóa sản phẩm" : "Remove Product",
      description:
        locale === "vi"
          ? `Bạn có chắc muốn xóa "${item.product?.titleVi}" khỏi giỏ hàng?`
          : `Are you sure you want to remove "${item.product?.titleEn}" from cart?`,
      confirmText: locale === "vi" ? "Xóa" : "Remove",
      cancelText: locale === "vi" ? "Hủy" : "Cancel",
      variant: "danger",
    });
    if (confirmed) {
      onRemove(item._id);
      success({
        title: locale === "vi" ? "Đã xóa" : "Removed",
        message:
          locale === "vi"
            ? "Sản phẩm đã được xóa khỏi giỏ hàng."
            : "Product removed from cart.",
      });
    }
  };

  const handleClearCart = async () => {
    const confirmed = await confirm({
      title: locale === "vi" ? "Xóa toàn bộ giỏ hàng" : "Clear Cart",
      description:
        locale === "vi"
          ? "Bạn có chắc muốn xóa TẤT CẢ sản phẩm trong giỏ hàng?"
          : "Are you sure you want to remove ALL items from your cart?",
      confirmText: locale === "vi" ? "Xóa tất cả" : "Clear All",
      cancelText: locale === "vi" ? "Hủy" : "Cancel",
      variant: "danger",
    });
    if (confirmed) {
      onClearCart();
      success({
        title: locale === "vi" ? "Đã xóa" : "Cleared",
        message: locale === "vi" ? "Giỏ hàng đã được xóa." : "Cart has been cleared.",
      });
    }
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-soft-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-bold text-slate-900">
                  {locale === "vi" ? "Giỏ hàng" : "Cart"}
                </h2>
                <span className="rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-600">
                  {items.length} {locale === "vi" ? "sản phẩm" : "items"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {items.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="rounded-full p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                    title={locale === "vi" ? "Xóa giỏ hàng" : "Clear cart"}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center">
                  <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
                    <ShoppingCart className="h-10 w-10 text-slate-300" />
                  </div>
                  <p className="mb-2 text-lg font-semibold text-slate-700">
                    {locale === "vi" ? "Giỏ hàng trống" : "Your cart is empty"}
                  </p>
                  <p className="mb-6 text-sm text-slate-500">
                    {locale === "vi"
                      ? "Khám phá các sản phẩm ngay!"
                      : "Start exploring products!"}
                  </p>
                  <Link
                    href="/products"
                    onClick={onClose}
                    className="flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700"
                  >
                    {locale === "vi" ? "Mua sắm ngay" : "Shop Now"}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {items.map((item) => (
                    <motion.div
                      key={item._id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="flex gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-soft-sm transition-shadow hover:shadow-soft-md"
                    >
                      {/* Image */}
                      <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                        {item.product?.demoImages?.[0] ? (
                          <Image
                            src={item.product.demoImages[0]}
                            alt={item.product.titleVi}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <ShoppingCart className="h-6 w-6 text-slate-300" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex flex-1 flex-col justify-between">
                        <div>
                          <Link
                            href={`/product/${item.productId}`}
                            onClick={onClose}
                            className="line-clamp-2 text-sm font-semibold text-slate-900 transition-colors hover:text-primary-600"
                          >
                            {locale === "vi"
                              ? item.product?.titleVi
                              : item.product?.titleEn}
                          </Link>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {item.variant
                              ? locale === "vi"
                                ? item.variant.labelVi
                                : item.variant.labelEn
                              : ""}
                          </p>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-primary-600">
                            {formatPrice(item.variant?.price || 0, locale)}
                          </span>

                          <div className="flex items-center gap-2">
                            {/* Quantity */}
                            <div className="flex items-center gap-1 rounded-full border border-slate-200">
                              <button
                                onClick={() =>
                                  onUpdateQuantity(item._id, item.quantity - 1)
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="w-6 text-center text-xs font-semibold">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() =>
                                  onUpdateQuantity(item._id, item.quantity + 1)
                                }
                                disabled={
                                  item.variant &&
                                  item.quantity >= item.variant.stock
                                }
                                className="flex h-7 w-7 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            {/* Remove */}
                            <button
                              onClick={() => handleRemove(item)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-slate-100 p-4">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-sm text-slate-500">
                    {locale === "vi" ? "Tổng cộng" : "Total"}
                  </span>
                  <span className="text-2xl font-bold text-primary-600">
                    {formatPrice(cartTotal, locale)}
                  </span>
                </div>

                <Link
                  href="/checkout"
                  onClick={onClose}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-primary-600 py-3.5 text-sm font-semibold text-white transition-all hover:bg-primary-700 active:scale-95"
                >
                  {locale === "vi" ? "Thanh toán ngay" : "Checkout Now"}
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <button
                  onClick={onClose}
                  className="mt-2 w-full rounded-full py-2.5 text-sm font-medium text-slate-500 transition-colors hover:text-slate-700"
                >
                  {locale === "vi" ? "Tiếp tục mua sắm" : "Continue Shopping"}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
