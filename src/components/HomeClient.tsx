"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, Flame, Percent, TrendingUp, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/ProductCard";
import { cn, formatPrice } from "@/lib/utils";

interface BannerSlide {
  id: string;
  image: string;
  titleVi: string;
  titleEn: string;
  subtitleVi: string;
  subtitleEn: string;
  link?: string;
}

interface Product {
  _id: string;
  titleVi: string;
  titleEn: string;
  image: string;
  variants: Array<{
    _id: string;
    labelVi: string;
    labelEn: string;
    price: number;
    originalPrice?: number;
    stock: number;
  }>;
  isHot: boolean;
  isSale: boolean;
  salePercent?: number;
  rating: number;
  reviewCount: number;
  sales: number;
  sellerName: string;
  isVerified: boolean;
}

interface HomeClientProps {
  locale: "vi" | "en";
  banners?: BannerSlide[];
  hotProducts?: Product[];
  saleProducts?: Product[];
}

export function HomeClient({
  locale,
  banners = [],
  hotProducts = [],
  saleProducts = [],
}: HomeClientProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 via-primary-500 to-emerald-400">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
          <div className="text-center text-white">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-3xl font-extrabold sm:text-4xl lg:text-5xl"
            >
              {locale === "vi" ? "Mã nguồn & Tài khoản AI" : "Source Codes & AI Accounts"}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mx-auto mt-4 max-w-2xl text-base text-white/80 sm:text-lg"
            >
              {locale === "vi"
                ? "Nền tảng giao dịch uy tín — mã nguồn, tài khoản MMO, dịch vụ AI và hơn thế nữa"
                : "Trusted marketplace — source codes, MMO accounts, AI services and more"}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-8 flex items-center justify-center gap-3"
            >
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary-700 shadow-soft-md transition-all hover:shadow-soft-lg"
              >
                {locale === "vi" ? "Khám phá sản phẩm" : "Browse Products"}
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/seller"
                className="inline-flex items-center gap-2 rounded-full border-2 border-white/40 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/10"
              >
                {locale === "vi" ? "Bán hàng" : "Start Selling"}
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-8 px-4 py-4 sm:gap-16 sm:px-6 lg:px-8">
          {[
            { value: "10K+", labelVi: "Sản phẩm", labelEn: "Products" },
            { value: "50K+", labelVi: "Người dùng", labelEn: "Users" },
            { value: "99%", labelVi: "Hài lòng", labelEn: "Satisfaction" },
            { value: "24/7", labelVi: "Hỗ trợ", labelEn: "Support" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="text-xl font-extrabold text-primary-600 sm:text-2xl">{stat.value}</p>
              <p className="text-xs text-slate-500">{locale === "vi" ? stat.labelVi : stat.labelEn}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-500">
              <Flame className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              {locale === "vi" ? "Sản phẩm nổi bật" : "Featured Products"}
            </h2>
          </div>
          <Link
            href="/products?filter=hot"
            className="flex items-center gap-1 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
          >
            {locale === "vi" ? "Xem tất cả" : "View All"}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {hotProducts.map((product) => (
            <ProductCard
              key={product._id}
              productId={product._id}
              titleVi={product.titleVi}
              titleEn={product.titleEn}
              image={product.image}
              variants={product.variants}
              isHot={product.isHot}
              isSale={product.isSale}
              salePercent={product.salePercent}
              rating={product.rating}
              reviewCount={product.reviewCount}
              sales={product.sales}
              sellerName={product.sellerName}
              isVerified={product.isVerified}
              locale={locale}
            />
          ))}
        </div>
      </section>

      {/* Sale Products */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500">
              <Percent className="h-4 w-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 sm:text-xl">
              {locale === "vi" ? "Ưu đãi hot" : "Hot Deals"}
            </h2>
          </div>
          <Link
            href="/products?filter=sale"
            className="flex items-center gap-1 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
          >
            {locale === "vi" ? "Xem tất cả" : "View All"}
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {saleProducts.map((product) => (
            <ProductCard
              key={product._id}
              productId={product._id}
              titleVi={product.titleVi}
              titleEn={product.titleEn}
              image={product.image}
              variants={product.variants}
              isHot={product.isHot}
              isSale={product.isSale}
              salePercent={product.salePercent}
              rating={product.rating}
              reviewCount={product.reviewCount}
              sales={product.sales}
              sellerName={product.sellerName}
              isVerified={product.isVerified}
              locale={locale}
            />
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            {
              icon: Shield,
              titleVi: "An toàn & Bảo mật",
              titleEn: "Safe & Secure",
              descVi: "Thanh toán an toàn, bảo mật thông tin",
              descEn: "Secure payments, protected information",
            },
            {
              icon: Zap,
              titleVi: "Giao hàng nhanh",
              titleEn: "Fast Delivery",
              descVi: "Nhận hàng ngay sau khi thanh toán",
              descEn: "Get your items instantly after payment",
            },
            {
              icon: Headphones,
              titleVi: "Hỗ trợ 24/7",
              titleEn: "24/7 Support",
              descVi: "Đội ngũ hỗ trợ luôn sẵn sàng",
              descEn: "Support team always ready to help",
            },
            {
              icon: BadgeCheck,
              titleVi: "Chất lượng đảm bảo",
              titleEn: "Quality Guaranteed",
              descVi: "Cam kết chất lượng sản phẩm",
              descEn: "Committed to product quality",
            },
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="flex flex-col items-center rounded-xl border border-slate-200 bg-white p-5 text-center transition-all hover:shadow-soft-md hover:border-primary-200"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-50">
                <feature.icon className="h-5 w-5 text-primary-600" />
              </div>
              <h3 className="mb-1 text-sm font-bold text-slate-800">
                {locale === "vi" ? feature.titleVi : feature.titleEn}
              </h3>
              <p className="text-xs text-slate-500">
                {locale === "vi" ? feature.descVi : feature.descEn}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

// Helper icons
function Shield({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function Zap({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  );
}

function Headphones({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    </svg>
  );
}

function BadgeCheck({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}
