"use client";

import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Sidebar } from "@/components/Sidebar";
import { ProductCard } from "@/components/ProductCard";
import { ProductGrid } from "@/components/ProductGrid";
import { ChatBox } from "@/components/Chat";

interface ProductsClientProps {
  locale?: "vi" | "en";
  products?: any[];
}

export function ProductsClient({
  locale = "vi",
  products = [],
}: ProductsClientProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        locale={locale}
        cartCount={0}
      />

      <div className="flex flex-1">
        {/* Sidebar */}
        <Sidebar
          locale={locale}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          minPrice={priceRange[0]}
          maxPrice={priceRange[1]}
          onPriceChange={(min, max) => setPriceRange([min, max])}
        />

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
              {locale === "vi" ? "Tất cả sản phẩm" : "All Products"}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {locale === "vi"
                ? "Khám phá hàng ngàn sản phẩm chất lượng"
                : "Explore thousands of quality products"}
            </p>
          </div>

          {/* Filter Bar */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-4 shadow-soft-sm">
            <div className="flex flex-wrap items-center gap-2">
              {[
                { key: "all", labelVi: "Tất cả", labelEn: "All" },
                { key: "hot", labelVi: "Nổi bật", labelEn: "Hot" },
                { key: "sale", labelVi: "Giảm giá", labelEn: "Sale" },
                { key: "new", labelVi: "Mới", labelEn: "New" },
              ].map((filter) => (
                <button
                  key={filter.key}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-all hover:border-primary-500 hover:bg-primary-50 hover:text-primary-600"
                >
                  {locale === "vi" ? filter.labelVi : filter.labelEn}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-500">
                {locale === "vi" ? "Sắp xếp theo:" : "Sort by:"}
              </span>
              <select className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:outline-none">
                <option value="newest">
                  {locale === "vi" ? "Mới nhất" : "Newest"}
                </option>
                <option value="price-low">
                  {locale === "vi" ? "Giá: Thấp đến cao" : "Price: Low to High"}
                </option>
                <option value="price-high">
                  {locale === "vi" ? "Giá: Cao đến thấp" : "Price: High to Low"}
                </option>
                <option value="popular">
                  {locale === "vi" ? "Phổ biến nhất" : "Most Popular"}
                </option>
              </select>
            </div>
          </div>

          {/* Product Grid */}
          <ProductGrid locale={locale} products={products} />

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition-all hover:bg-slate-50">
                {locale === "vi" ? "Trước" : "Previous"}
              </button>
              {[1, 2, 3, 4, 5].map((page) => (
                <button
                  key={page}
                  className={`h-10 w-10 rounded-full text-sm font-medium transition-all ${
                    page === 1
                      ? "bg-primary-600 text-white"
                      : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600 transition-all hover:bg-slate-50">
                {locale === "vi" ? "Sau" : "Next"}
              </button>
            </div>
          </div>
        </main>
      </div>

      <Footer locale={locale} />

      {/* Chat Box */}
      <ChatBox locale={locale} />
    </div>
  );
}
