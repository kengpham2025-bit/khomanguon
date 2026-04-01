"use client";

import { ProductCard } from "@/components/ProductCard";

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

interface ProductGridProps {
  locale?: "vi" | "en";
  products?: Product[];
}



export function ProductGrid({ locale = "vi", products = [] }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
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
  );
}
