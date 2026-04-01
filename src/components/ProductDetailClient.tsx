"use client";

import { useState, useEffect, use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingCart,
  Star,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Truck,
  RefreshCw,
  MessageCircle,
  Minus,
  Plus,
  Loader2,
  Share2,
  Eye,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  Flame,
  Percent,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { useNotification } from "@/components/NotificationProvider";
import { confirm } from "@/components/ConfirmDialog";
import { ProductCard } from "@/components/ProductCard/ProductCard";

interface Variant {
  _id: string;
  labelVi: string;
  labelEn: string;
  price: number;
  originalPrice?: number;
  stock: number;
}

interface Review {
  _id: string;
  rating: number;
  commentVi?: string;
  commentEn?: string;
  createdAt: number;
  buyer?: { username?: string; fullName?: string; avatarUrl?: string };
}

interface Seller {
  _id: string;
  username?: string;
  fullName?: string;
  avatarUrl?: string;
  kycStatus?: string;
  rating?: number;
  reviewCount?: number;
}

interface Product {
  _id: string;
  titleVi: string;
  titleEn: string;
  descriptionVi: string;
  descriptionEn: string;
  demoImages: string[];
  downloadLinks: string[];
  isHot: boolean;
  isSale: boolean;
  isNew: boolean;
  rating: number;
  reviewCount: number;
  sales: number;
  views: number;
  sellerId: string;
  seller?: Seller;
  variants?: Variant[];
  reviews?: Review[];
  category?: { nameVi: string; nameEn: string; slug: string };
}

interface ProductDetailProps {
  product: Product;
  relatedProducts: Product[];
  locale: "vi" | "en";
  currentUserId?: string;
  isVerified?: boolean;
}

export function ProductDetailClient({
  product,
  relatedProducts,
  locale = "vi",
  currentUserId,
  isVerified = false,
}: ProductDetailProps) {
  const router = useRouter();
  const { success, error: notifyError, info } = useNotification();

  const [selectedVariantId, setSelectedVariantId] = useState<string>(
    product.variants?.[0]?._id || ""
  );
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"description" | "reviews" | "seller">("description");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const selectedVariant = product.variants?.find((v) => v._id === selectedVariantId);
  const title = locale === "vi" ? product.titleVi : product.titleEn;
  const description = locale === "vi" ? product.descriptionVi : product.descriptionEn;
  const images = product.demoImages?.length ? product.demoImages : [];
  const displayPrice = selectedVariant?.price ?? product.variants?.[0]?.price ?? 0;
  const originalPrice = selectedVariant?.originalPrice ?? product.variants?.[0]?.originalPrice;
  const salePercent = originalPrice && originalPrice > displayPrice
    ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100)
    : 0;
  const isOutOfStock = !selectedVariant || selectedVariant.stock <= 0;
  const isLowStock = selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 3;

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = async () => {
    if (!selectedVariant || selectedVariant.stock <= 0) return;
    if (!currentUserId) {
      info({
        title: locale === "vi" ? "Đăng nhập để mua" : "Login to purchase",
        message: locale === "vi"
          ? "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng."
          : "You need to log in to add items to cart.",
      });
      router.push("/login");
      return;
    }

    if (isLowStock) {
      const confirmed = await confirm({
        title: locale === "vi" ? "Cảnh báo tồn kho" : "Low Stock Warning",
        description: locale === "vi"
          ? `Chỉ còn ${selectedVariant.stock} sản phẩm trong kho. Bạn có muốn tiếp tục?`
          : `Only ${selectedVariant.stock} left in stock. Do you want to continue?`,
        confirmText: locale === "vi" ? "Thêm vào giỏ" : "Add to Cart",
        cancelText: locale === "vi" ? "Hủy" : "Cancel",
        variant: "warning",
      });
      if (!confirmed) return;
    }

    setIsAddingToCart(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      success({
        title: locale === "vi" ? "Thêm vào giỏ thành công!" : "Added to cart!",
        message: locale === "vi"
          ? `"${title}" đã được thêm vào giỏ hàng.`
          : `"${title}" has been added to your cart.`,
      });
    } catch {
      notifyError({
        title: locale === "vi" ? "Thêm vào giỏ thất bại" : "Failed to add to cart",
        message: locale === "vi"
          ? "Đã xảy ra lỗi. Vui lòng thử lại."
          : "An error occurred. Please try again.",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleBuyNow = async () => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    await handleAddToCart();
    router.push("/checkout");
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title, text: description.slice(0, 100), url });
      } catch { /* dismissed */ }
    } else {
      await navigator.clipboard.writeText(url);
      info({
        title: locale === "vi" ? "Đã sao chép!" : "Copied!",
        message: locale === "vi" ? "Link đã được sao chép vào clipboard." : "Link copied to clipboard.",
      });
    }
  };

  const handleContactSeller = async () => {
    if (!currentUserId) {
      router.push("/login");
      return;
    }
    router.push(`/chat?sellerId=${product.sellerId}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/" className="hover:text-primary-600 transition-colors">
          {locale === "vi" ? "Trang chủ" : "Home"}
        </Link>
        <span>/</span>
        <Link href="/products" className="hover:text-primary-600 transition-colors">
          {locale === "vi" ? "Sản phẩm" : "Products"}
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <span className="text-slate-900">{product.category.nameVi}</span>
          </>
        )}
      </nav>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Left: Image Gallery */}
        <div className="relative flex flex-col gap-4">
          {/* Main Image */}
          <div className="relative aspect-video overflow-hidden rounded-2xl bg-slate-100">
            {!imageErrors.has(activeImageIndex) && images[activeImageIndex] ? (
              <Image
                src={images[activeImageIndex]}
                alt={title}
                fill
                className="object-cover"
                priority
                onError={() => setImageErrors((prev) => new Set([...Array.from(prev), activeImageIndex]))}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-200">
                <span className="text-slate-400">{locale === "vi" ? "Không có hình ảnh" : "No Image"}</span>
              </div>
            )}

            {/* Badges */}
            <div className="absolute left-4 top-4 flex flex-col gap-2">
              {product.isHot && (
                <span className="flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white shadow-soft-sm">
                  <Flame className="h-3.5 w-3.5" /> Hot
                </span>
              )}
              {product.isSale && salePercent > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-green-500 px-3 py-1.5 text-xs font-semibold text-white shadow-soft-sm">
                  <Percent className="h-3.5 w-3.5" /> -{salePercent}%
                </span>
              )}
              {product.isNew && (
                <span className="rounded-full bg-blue-500 px-3 py-1.5 text-xs font-semibold text-white shadow-soft-sm">
                  {locale === "vi" ? "Mới" : "New"}
                </span>
              )}
            </div>

            {/* Navigation Arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-soft-md backdrop-blur-sm transition-all hover:bg-white active:scale-95"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-slate-700 shadow-soft-md backdrop-blur-sm transition-all hover:bg-white active:scale-95"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="rounded-full bg-red-500 px-6 py-3 text-base font-semibold text-white">
                  {locale === "vi" ? "Hết hàng" : "Out of Stock"}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={cn(
                    "relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl transition-all",
                    activeImageIndex === idx
                      ? "ring-2 ring-primary-600 ring-offset-2"
                      : "opacity-60 hover:opacity-100"
                  )}
                >
                  <Image
                    src={img}
                    alt={`${title} ${idx + 1}`}
                    fill
                    className="object-cover"
                    onError={() => setImageErrors((prev) => new Set([...Array.from(prev), idx]))}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Trust Badges */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: ShieldCheck, label: locale === "vi" ? "An toàn 100%" : "100% Safe", color: "text-green-600" },
              { icon: Truck, label: locale === "vi" ? "Giao hàng tức thì" : "Instant Delivery", color: "text-blue-600" },
              { icon: RefreshCw, label: locale === "vi" ? "Hỗ trợ 24/7" : "24/7 Support", color: "text-purple-600" },
            ].map(({ icon: Icon, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-1.5 rounded-2xl bg-slate-50 p-3 text-center">
                <Icon className={cn("h-5 w-5", color)} />
                <span className="text-xs font-medium text-slate-600">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Product Info */}
        <div className="flex flex-col">
          {/* Title & Seller */}
          <div className="mb-4">
            <h1 className="mb-3 text-2xl font-bold text-slate-900 lg:text-3xl">{title}</h1>

            {/* Stats Row */}
            <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-semibold text-slate-700">{product.rating.toFixed(1)}</span>
                <span>({product.reviewCount} {locale === "vi" ? "đánh giá" : "reviews"})</span>
              </div>
              <span className="text-slate-300">|</span>
              <span>{product.sales.toLocaleString()} {locale === "vi" ? "đã bán" : "sold"}</span>
              <span className="text-slate-300">|</span>
              <div className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                <span>{product.views.toLocaleString()} {locale === "vi" ? "lượt xem" : "views"}</span>
              </div>
            </div>

            {/* Seller Info */}
            {product.seller && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 p-3">
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-primary-100">
                  {product.seller.avatarUrl ? (
                    <Image src={product.seller.avatarUrl} alt="" fill className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-primary-600 font-semibold">
                      {(product.seller.username || product.seller.fullName || "S")?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900">
                      {product.seller.username || product.seller.fullName || "Seller"}
                    </span>
                    {product.seller.kycStatus === "approved" && (
                      <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">
                        <BadgeCheck className="h-3 w-3" />
                        {locale === "vi" ? "Tích xanh" : "Verified"}
                      </span>
                    )}
                    {product.seller.kycStatus === "pending" && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-600">
                        <Clock className="h-3 w-3" />
                        {locale === "vi" ? "Đang xác minh" : "Pending"}
                      </span>
                    )}
                    {product.seller.kycStatus === "none" && (
                      <span className="flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-600">
                        <AlertTriangle className="h-3 w-3" />
                        {locale === "vi" ? "Chưa xác minh" : "Unverified"}
                      </span>
                    )}
                  </div>
                  {product.seller.rating !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span>{product.seller.rating?.toFixed(1) || "0.0"} ({product.seller.reviewCount || 0})</span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleContactSeller}
                  className="flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 transition-colors hover:bg-primary-100"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  {locale === "vi" ? "Liên hệ" : "Contact"}
                </button>
              </div>
            )}
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                {locale === "vi" ? "Chọn phiên bản:" : "Select variant:"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <button
                    key={variant._id}
                    onClick={() => setSelectedVariantId(variant._id)}
                    disabled={variant.stock <= 0}
                    className={cn(
                      "rounded-full border-2 px-4 py-2 text-sm font-medium transition-all duration-200",
                      selectedVariantId === variant._id
                        ? "border-primary-600 bg-primary-600 text-white shadow-soft-sm"
                        : "border-slate-200 bg-white text-slate-700 hover:border-primary-400 hover:bg-primary-50",
                      variant.stock <= 0 && "cursor-not-allowed opacity-50 line-through"
                    )}
                  >
                    {locale === "vi" ? variant.labelVi : variant.labelEn}
                    {variant.stock <= 0 && ` (${locale === "vi" ? "Hết" : "Sold"})`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="mb-6 rounded-2xl bg-gradient-to-r from-primary-50 to-indigo-50 p-6">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary-600">
                {formatPrice(displayPrice, locale)}
              </span>
              {originalPrice && originalPrice > displayPrice && (
                <>
                  <span className="text-xl text-slate-400 line-through">
                    {formatPrice(originalPrice, locale)}
                  </span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    -{salePercent}%
                  </span>
                </>
              )}
            </div>

            {/* Stock Status */}
            {selectedVariant && (
              <div className="mt-2 flex items-center gap-2">
                {isOutOfStock ? (
                  <span className="flex items-center gap-1 text-sm font-medium text-red-500">
                    <X className="h-4 w-4" />
                    {locale === "vi" ? "Hết hàng" : "Out of Stock"}
                  </span>
                ) : isLowStock ? (
                  <span className="flex items-center gap-1 text-sm font-medium text-amber-600">
                    <AlertTriangle className="h-4 w-4" />
                    {locale === "vi"
                      ? `Chỉ còn ${selectedVariant.stock} sản phẩm!`
                      : `Only ${selectedVariant.stock} left!`}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-sm font-medium text-green-600">
                    <CheckCircle2 className="h-4 w-4" />
                    {locale === "vi" ? "Còn hàng" : "In Stock"}
                    {selectedVariant.stock <= 10 && ` (${selectedVariant.stock})`}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quantity */}
          {!isOutOfStock && (
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">
                {locale === "vi" ? "Số lượng:" : "Quantity:"}
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-white">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(selectedVariant?.stock || 10, q + 1))}
                    disabled={quantity >= (selectedVariant?.stock || 10)}
                    className="flex h-10 w-10 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
                <span className="text-sm text-slate-500">
                  {locale === "vi" ? "Tổng:" : "Total:"}{" "}
                  <strong className="text-primary-600">
                    {formatPrice(displayPrice * quantity, locale)}
                  </strong>
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || isAddingToCart}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-all active:scale-95",
                !isOutOfStock && !isAddingToCart
                  ? "bg-primary-600 text-white hover:bg-primary-700"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
              )}
            >
              {isAddingToCart ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {locale === "vi" ? "Đang thêm..." : "Adding..."}</>
              ) : (
                <><ShoppingCart className="h-4 w-4" /> {locale === "vi" ? "Thêm vào giỏ" : "Add to Cart"}</>
              )}
            </button>

            <button
              onClick={handleBuyNow}
              disabled={isOutOfStock || isAddingToCart}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold transition-all active:scale-95",
                !isOutOfStock
                  ? "bg-slate-900 text-white hover:bg-slate-800"
                  : "cursor-not-allowed bg-slate-200 text-slate-400"
              )}
            >
              {locale === "vi" ? "Mua ngay" : "Buy Now"}
            </button>

            <button
              onClick={handleShare}
              className="flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
            >
              <Share2 className="h-4 w-4" />
            </button>
          </div>

          {/* Download Info */}
          {product.downloadLinks && product.downloadLinks.length > 0 && (
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-semibold text-slate-700">
                  {locale === "vi" ? "Thông tin giao hàng" : "Delivery Information"}
                </span>
              </div>
              <p className="text-sm text-slate-500">
                {locale === "vi"
                  ? "Sau khi thanh toán thành công, file sẽ được gửi qua email hoặc hiển thị ngay trên trang."
                  : "After successful payment, the file will be sent via email or displayed on the page."}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabs: Description, Reviews, Seller */}
      <div className="mt-12">
        {/* Tab Headers */}
        <div className="mb-6 flex gap-1 border-b border-slate-200">
          {(["description", "reviews", "seller"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "relative px-6 py-3 text-sm font-semibold transition-colors",
                activeTab === tab ? "text-primary-600" : "text-slate-500 hover:text-slate-700"
              )}
            >
              {tab === "description" && (locale === "vi" ? "Mô tả" : "Description")}
              {tab === "reviews" && `${locale === "vi" ? "Đánh giá" : "Reviews"} (${product.reviewCount})`}
              {tab === "seller" && (locale === "vi" ? "Người bán" : "Seller Info")}
              {activeTab === tab && (
                <motion.div
                  layoutId="product-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-600"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="rounded-2xl border border-slate-100 bg-white p-6"
          >
            {activeTab === "description" && (
              <div className="prose prose-slate max-w-none">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-600 lg:text-base">
                  {description}
                </p>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="flex flex-col gap-4">
                    {/* Rating Summary */}
                    <div className="mb-6 flex items-center gap-6 rounded-2xl bg-slate-50 p-4">
                      <div className="text-center">
                        <div className="text-5xl font-bold text-primary-600">{product.rating.toFixed(1)}</div>
                        <div className="mt-1 flex items-center justify-center gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star
                              key={s}
                              className={cn(
                                "h-4 w-4",
                                s <= Math.round(product.rating)
                                  ? "fill-amber-400 text-amber-400"
                                  : "text-slate-300"
                              )}
                            />
                          ))}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {product.reviewCount} {locale === "vi" ? "đánh giá" : "reviews"}
                        </div>
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="flex flex-col gap-4">
                      {product.reviews.map((review) => (
                        <div key={review._id} className="flex gap-4 rounded-2xl border border-slate-100 p-4">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-600 font-semibold">
                            {(review.buyer?.username || review.buyer?.fullName || "U")?.[0]?.toUpperCase()}
                          </div>
                          <div className="flex-1">
                            <div className="mb-1 flex items-center gap-2">
                              <span className="font-semibold text-slate-900">
                                {review.buyer?.username || review.buyer?.fullName || "User"}
                              </span>
                              <div className="flex items-center gap-0.5">
                                {[1, 2, 3, 4, 5].map((s) => (
                                  <Star
                                    key={s}
                                    className={cn(
                                      "h-3.5 w-3.5",
                                      s <= review.rating
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-slate-300"
                                    )}
                                  />
                                ))}
                              </div>
                            </div>
                            {(review.commentVi || review.commentEn) && (
                              <p className="text-sm text-slate-600">
                                {locale === "vi" ? review.commentVi : review.commentEn}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-slate-400">
                              {new Date(review.createdAt).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Star className="mb-3 h-12 w-12 text-slate-200" />
                    <p className="text-slate-500">
                      {locale === "vi" ? "Chưa có đánh giá nào." : "No reviews yet."}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "seller" && product.seller && (
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-4">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-primary-100">
                    {product.seller.avatarUrl ? (
                      <Image src={product.seller.avatarUrl} alt="" fill className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xl font-bold text-primary-600">
                        {(product.seller.username || product.seller.fullName || "S")?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold text-slate-900">
                        {product.seller.username || product.seller.fullName || "Seller"}
                      </h3>
                      {product.seller.kycStatus === "approved" && (
                        <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
                          <BadgeCheck className="h-3.5 w-3.5" />
                          {locale === "vi" ? "Tích xanh" : "Verified"}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-sm text-slate-500">
                      {product.seller.rating !== undefined && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                          {product.seller.rating?.toFixed(1)} ({product.seller.reviewCount || 0})
                        </span>
                      )}
                      <span>
                        {locale === "vi" ? "Người bán" : "Seller"}:{" "}
                        {product.seller.kycStatus === "approved" ? (locale === "vi" ? "Đã xác minh" : "Verified") : (locale === "vi" ? "Chưa xác minh" : "Unverified")}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleContactSeller}
                  className="self-start flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50 px-5 py-2.5 text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-100"
                >
                  <MessageCircle className="h-4 w-4" />
                  {locale === "vi" ? "Liên hệ người bán" : "Contact Seller"}
                </button>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            {locale === "vi" ? "Sản phẩm liên quan" : "Related Products"}
          </h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {relatedProducts.slice(0, 5).map((p) => (
              <ProductCard
                key={p._id}
                productId={p._id}
                titleVi={p.titleVi}
                titleEn={p.titleEn}
                image={p.demoImages?.[0] || ""}
                variants={p.variants || []}
                isHot={p.isHot}
                isSale={p.isSale}
                salePercent={p.variants?.[0]?.originalPrice && p.variants?.[0]?.price
                  ? Math.round(((p.variants[0].originalPrice! - p.variants[0].price) / p.variants[0].originalPrice!) * 100)
                  : undefined}
                rating={p.rating}
                reviewCount={p.reviewCount}
                sales={p.sales}
                sellerName={p.seller?.username || p.seller?.fullName || "Seller"}
                isVerified={p.seller?.kycStatus === "approved"}
                locale={locale}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
