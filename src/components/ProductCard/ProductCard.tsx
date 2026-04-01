"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCart, BadgeCheck, ArrowRight, Loader2, Code2 } from "lucide-react";
import { cn, formatPrice, getVariantLabel } from "@/lib/utils";
import { useNotification } from "@/components/NotificationProvider";
import { confirm } from "@/components/ConfirmDialog";

interface Variant {
  _id: string;
  labelVi: string;
  labelEn: string;
  price: number;
  originalPrice?: number;
  stock: number;
}

interface ProductCardProps {
  productId: string;
  titleVi: string;
  titleEn: string;
  image: string;
  variants: Variant[];
  isHot: boolean;
  isSale: boolean;
  salePercent?: number;
  rating: number;
  reviewCount: number;
  sales: number;
  sellerName: string;
  isVerified: boolean;
  locale: "vi" | "en";
  className?: string;
}

export function ProductCard({
  productId,
  titleVi,
  titleEn,
  image,
  variants,
  isHot,
  isSale,
  salePercent,
  rating,
  reviewCount,
  sales,
  sellerName,
  isVerified,
  locale,
  className,
}: ProductCardProps) {
  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    variants[0]?._id || ""
  );
  const [imageError, setImageError] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const { success, error: notifyError } = useNotification();

  const selectedVariant = variants.find((v) => v._id === selectedVariantId);
  const title = locale === "vi" ? titleVi : titleEn;
  const displayPrice = selectedVariant?.price || variants[0]?.price || 0;

  const handleBuyNow = async () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;

    if (selectedVariant.stock <= 3) {
      const confirmed = await confirm({
        title: locale === "vi" ? "Cảnh báo tồn kho" : "Low Stock Warning",
        description: locale === "vi"
          ? `Chỉ còn ${selectedVariant.stock} sản phẩm. Tiếp tục?`
          : `Only ${selectedVariant.stock} left. Continue?`,
        confirmText: locale === "vi" ? "Mua ngay" : "Buy Now",
        cancelText: locale === "vi" ? "Hủy" : "Cancel",
        variant: "warning",
        onConfirm: () => {},
      });
      if (!confirmed) return;
    }

    setIsAddingToCart(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      success({
        title: locale === "vi" ? "Đã thêm vào giỏ!" : "Added to cart!",
        message: locale === "vi"
          ? `"${title}" đã được thêm vào giỏ hàng.`
          : `"${title}" has been added to your cart.`,
      });
    } catch {
      notifyError({
        title: locale === "vi" ? "Lỗi" : "Error",
        message: locale === "vi" ? "Vui lòng thử lại." : "Please try again.",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:shadow-soft-lg hover:border-primary-200",
        className
      )}
    >
      {/* Image / Icon Header */}
      <Link href={`/product/${productId}`} className="relative block p-6 pb-4">
        <div className="flex items-center justify-center">
          {!imageError ? (
            <div className="relative h-16 w-16 overflow-hidden rounded-xl bg-slate-50">
              <Image
                src={image}
                alt={title}
                fill
                className="object-cover"
                onError={() => setImageError(true)}
              />
            </div>
          ) : (
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary-50">
              <Code2 className="h-8 w-8 text-primary-600" />
            </div>
          )}
        </div>

        {/* Sale Badge */}
        {isSale && salePercent && (
          <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white">
            -{salePercent}%
          </span>
        )}
      </Link>

      {/* Content */}
      <div className="flex flex-1 flex-col px-4 pb-4">
        {/* Title */}
        <Link
          href={`/product/${productId}`}
          className="mb-1 line-clamp-2 text-sm font-bold text-slate-800 transition-colors hover:text-primary-600"
        >
          {title}
        </Link>

        {/* Seller */}
        <div className="mb-3 flex items-center gap-1.5">
          <span className="text-xs text-slate-400">{sellerName}</span>
          {isVerified && (
            <BadgeCheck className="h-3.5 w-3.5 text-primary-500" />
          )}
        </div>

        {/* Variants (compact) */}
        {variants.length > 1 && (
          <div className="mb-3 flex flex-wrap gap-1">
            {variants.map((variant) => (
              <button
                key={variant._id}
                onClick={() => setSelectedVariantId(variant._id)}
                disabled={variant.stock <= 0}
                className={cn(
                  "rounded-md border px-2 py-0.5 text-[11px] font-medium transition-all",
                  selectedVariantId === variant._id
                    ? "border-primary-600 bg-primary-50 text-primary-700"
                    : "border-slate-200 text-slate-500 hover:border-primary-300",
                  variant.stock <= 0 && "opacity-40 cursor-not-allowed"
                )}
              >
                {getVariantLabel(variant.labelVi, variant.labelEn, locale)}
              </button>
            ))}
          </div>
        )}

        {/* Price + Buy Button */}
        <div className="mt-auto flex items-center justify-between gap-2">
          <span className="text-base font-bold text-primary-600">
            {formatPrice(displayPrice, locale)}
          </span>

          <button
            onClick={handleBuyNow}
            disabled={!selectedVariant || selectedVariant.stock <= 0 || isAddingToCart}
            className={cn(
              "flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
              selectedVariant && selectedVariant.stock > 0 && !isAddingToCart
                ? "bg-primary-600 text-white hover:bg-primary-700 active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            )}
          >
            {isAddingToCart ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <>
                {locale === "vi" ? "Mua ngay" : "Buy"}
                <ArrowRight className="h-3 w-3" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
