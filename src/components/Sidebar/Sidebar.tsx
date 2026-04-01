"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronDown,
  Code,
  Bot,
  Mail,
  Users,
  Gamepad2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Subcategory {
  _id: string;
  nameVi: string;
  nameEn: string;
  slug: string;
}

interface Category {
  _id: string;
  nameVi: string;
  nameEn: string;
  slug: string;
  icon: string;
  subcategories?: Subcategory[];
}

interface SidebarProps {
  locale?: "vi" | "en";
  categories?: Category[];
  isOpen?: boolean;
  onClose?: () => void;
  minPrice?: number;
  maxPrice?: number;
  onPriceChange?: (min: number, max: number) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Code,
  Bot,
  Mail,
  Users,
  Gamepad2,
};

export function Sidebar({
  locale = "vi",
  categories = defaultCategories,
  isOpen = false,
  onClose,
  minPrice = 0,
  maxPrice = 10000000,
  onPriceChange,
}: SidebarProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(minPrice);
  const [priceMax, setPriceMax] = useState(maxPrice);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleCategoryFilter = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handlePriceChange = () => {
    onPriceChange?.(priceMin, priceMax);
  };

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-80 max-w-[85vw] overflow-y-auto bg-white shadow-soft-xl transition-transform duration-300 lg:static lg:z-auto lg:h-auto lg:w-72 lg:translate-x-0 lg:rounded-2xl lg:shadow-soft-sm",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white p-4 lg:rounded-t-2xl">
          <h2 className="text-lg font-bold text-slate-900">
            {locale === "vi" ? "Danh mục" : "Categories"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-col gap-6 p-4">
          {/* Categories Accordion */}
          <div className="flex flex-col gap-2">
            {categories.map((category) => {
              const IconComponent = iconMap[category.icon] || Code;
              const isExpanded = expandedCategories.includes(category._id);

              return (
                <div key={category._id} className="flex flex-col">
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category._id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-4 py-3 text-left transition-all duration-200",
                      selectedCategories.includes(category._id)
                        ? "bg-primary-50 text-primary-600"
                        : "text-slate-700 hover:bg-slate-50"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                          selectedCategories.includes(category._id)
                            ? "bg-primary-100 text-primary-600"
                            : "bg-slate-100 text-slate-600"
                        )}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <span className="font-medium">
                        {locale === "vi" ? category.nameVi : category.nameEn}
                      </span>
                    </div>
                    <ChevronDown
                      className={cn(
                        "h-4 w-4 transition-transform duration-200",
                        isExpanded && "rotate-180"
                      )}
                    />
                  </button>

                  {/* Subcategories */}
                  <AnimatePresence>
                    {isExpanded && category.subcategories && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="ml-4 flex flex-col gap-1 border-l-2 border-slate-100 py-2 pl-4">
                          <button
                            onClick={() => toggleCategoryFilter(category._id)}
                            className={cn(
                              "rounded-lg px-3 py-2 text-sm transition-colors",
                              selectedCategories.includes(category._id)
                                ? "bg-primary-50 text-primary-600"
                                : "text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            {locale === "vi" ? "Tất cả" : "All"}
                          </button>
                          {category.subcategories.map((sub) => (
                            <button
                              key={sub._id}
                              className="rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900"
                            >
                              {locale === "vi" ? sub.nameVi : sub.nameEn}
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          {/* Price Filter */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              {locale === "vi" ? "Khoảng giá" : "Price Range"}
            </h3>

            <div className="flex flex-col gap-4">
              {/* Min/Max Inputs */}
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-slate-500">
                    {locale === "vi" ? "Từ" : "Min"}
                  </label>
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(Number(e.target.value))}
                    onBlur={handlePriceChange}
                    className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    placeholder="0"
                  />
                </div>
                <span className="mt-5 text-slate-400">-</span>
                <div className="flex-1">
                  <label className="mb-1 block text-xs text-slate-500">
                    {locale === "vi" ? "Đến" : "Max"}
                  </label>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(Number(e.target.value))}
                    onBlur={handlePriceChange}
                    className="w-full rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                    placeholder="10,000,000"
                  />
                </div>
              </div>

              {/* Range Slider */}
              <div className="relative h-2 rounded-full bg-slate-200">
                <div
                  className="absolute h-full rounded-full bg-primary-600"
                  style={{
                    left: `${(priceMin / maxPrice) * 100}%`,
                    right: `${100 - (priceMax / maxPrice) * 100}%`,
                  }}
                />
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceMin}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val <= priceMax) {
                      setPriceMin(val);
                    }
                  }}
                  onMouseUp={handlePriceChange}
                  onTouchEnd={handlePriceChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
                <input
                  type="range"
                  min="0"
                  max={maxPrice}
                  value={priceMax}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val >= priceMin) {
                      setPriceMax(val);
                    }
                  }}
                  onMouseUp={handlePriceChange}
                  onTouchEnd={handlePriceChange}
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                />
              </div>

              {/* Price Display */}
              <div className="flex justify-between text-xs text-slate-500">
                <span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    minimumFractionDigits: 0,
                  }).format(priceMin)}
                </span>
                <span>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                    minimumFractionDigits: 0,
                  }).format(priceMax)}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Filters */}
          <div className="border-t border-slate-100 pt-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-900">
              {locale === "vi" ? "Bộ lọc nhanh" : "Quick Filters"}
            </h3>
            <div className="flex flex-wrap gap-2">
              {["Hot", "Sale", "New"].map((filter) => (
                <button
                  key={filter}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:border-primary-500 hover:bg-primary-50 hover:text-primary-600"
                >
                  {filter === "Hot" && (locale === "vi" ? "Nổi bật" : "Hot")}
                  {filter === "Sale" && (locale === "vi" ? "Giảm giá" : "Sale")}
                  {filter === "New" && (locale === "vi" ? "Mới" : "New")}
                </button>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

// Default categories for demo
const defaultCategories: Category[] = [
  {
    _id: "cat-1",
    nameVi: "Mã nguồn",
    nameEn: "Source Codes",
    slug: "source-codes",
    icon: "Code",
    subcategories: [
      { _id: "sub-1", nameVi: "Website", nameEn: "Website", slug: "website" },
      { _id: "sub-2", nameVi: "Ứng dụng", nameEn: "Applications", slug: "applications" },
      { _id: "sub-3", nameVi: "Script", nameEn: "Scripts", slug: "scripts" },
      { _id: "sub-4", nameVi: "Khác", nameEn: "Others", slug: "others" },
    ],
  },
  {
    _id: "cat-2",
    nameVi: "Tài khoản AI",
    nameEn: "AI Accounts",
    slug: "ai-accounts",
    icon: "Bot",
    subcategories: [
      { _id: "sub-5", nameVi: "ChatGPT", nameEn: "ChatGPT", slug: "chatgpt" },
      { _id: "sub-6", nameVi: "Claude", nameEn: "Claude", slug: "claude" },
      { _id: "sub-7", nameVi: "Midjourney", nameEn: "Midjourney", slug: "midjourney" },
      { _id: "sub-8", nameVi: "Khác", nameEn: "Others", slug: "others" },
    ],
  },
  {
    _id: "cat-3",
    nameVi: "Email",
    nameEn: "Emails",
    slug: "emails",
    icon: "Mail",
    subcategories: [
      { _id: "sub-9", nameVi: "Gmail", nameEn: "Gmail", slug: "gmail" },
      { _id: "sub-10", nameVi: "Outlook", nameEn: "Outlook", slug: "outlook" },
      { _id: "sub-11", nameVi: "Yahoo", nameEn: "Yahoo", slug: "yahoo" },
      { _id: "sub-12", nameVi: "Khác", nameEn: "Others", slug: "others" },
    ],
  },
  {
    _id: "cat-4",
    nameVi: "Dịch vụ MMO",
    nameEn: "MMO Services",
    slug: "mmo-services",
    icon: "Gamepad2",
    subcategories: [
      { _id: "sub-13", nameVi: "SEO", nameEn: "SEO", slug: "seo" },
      { _id: "sub-14", nameVi: "Social Media", nameEn: "Social Media", slug: "social-media" },
      { _id: "sub-15", nameVi: "Khác", nameEn: "Others", slug: "others" },
    ],
  },
  {
    _id: "cat-5",
    nameVi: "Tài khoản MXH",
    nameEn: "Social Media Accounts",
    slug: "social-media-accounts",
    icon: "Users",
    subcategories: [
      { _id: "sub-16", nameVi: "Facebook", nameEn: "Facebook", slug: "facebook" },
      { _id: "sub-17", nameVi: "Instagram", nameEn: "Instagram", slug: "instagram" },
      { _id: "sub-18", nameVi: "TikTok", nameEn: "TikTok", slug: "tiktok" },
      { _id: "sub-19", nameVi: "Khác", nameEn: "Others", slug: "others" },
    ],
  },
];
