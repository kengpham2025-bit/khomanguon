"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Loader2, Clock, TrendingUp } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

interface SearchProduct {
  _id: string;
  titleVi: string;
  titleEn: string;
  demoImages?: string[];
  variants?: { price: number }[];
  isHot?: boolean;
  isSale?: boolean;
  seller?: { username?: string; fullName?: string };
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  locale?: "vi" | "en";
}

const popularSearchesVi = ["ChatGPT Plus", "Tài khoản AI", "Mã nguồn Website", "Tool MMO", "Email Premium"];
const popularSearchesEn = ["ChatGPT Plus", "AI Accounts", "Website Source Code", "MMO Tool", "Premium Email"];

export function SearchModal({ isOpen, onClose, locale = "vi" }: SearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      const saved = localStorage.getItem("recentSearches");
      if (saved) setRecentSearches(JSON.parse(saved).slice(0, 5));
    } else {
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        // Simulate search - in production this calls Convex
        await new Promise((r) => setTimeout(r, 300));
        // Replace with actual Convex search query
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSearch = (q: string) => {
    if (!q.trim()) return;
    const updated = [q, ...recentSearches.filter((s) => s !== q)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem("recentSearches", JSON.stringify(updated));
    router.push(`/products?q=${encodeURIComponent(q)}`);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch(query);
    if (e.key === "Escape") onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="w-full max-w-2xl rounded-2xl bg-white shadow-soft-xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="flex items-center gap-3 border-b border-slate-100 p-4">
              {isSearching ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400 flex-shrink-0" />
              ) : (
                <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={locale === "vi" ? "Tìm kiếm sản phẩm..." : "Search products..."}
                className="flex-1 bg-transparent text-base text-slate-900 placeholder-slate-400 focus:outline-none"
              />
              {query && (
                <button onClick={() => setQuery("")} className="rounded-full p-1 text-slate-400 hover:bg-slate-100">
                  <X className="h-4 w-4" />
                </button>
              )}
              <button onClick={onClose} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                ESC
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {results.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {results.map((product) => (
                    <Link
                      key={product._id}
                      href={`/product/${product._id}`}
                      onClick={onClose}
                      className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-slate-50"
                    >
                      <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {product.demoImages?.[0] ? (
                          <Image src={product.demoImages[0]} alt="" fill className="object-cover" />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-400 text-xs">No Img</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {locale === "vi" ? product.titleVi : product.titleEn}
                        </p>
                        <p className="text-xs text-slate-500">
                          {product.seller?.username || product.seller?.fullName}
                        </p>
                      </div>
                      <span className="text-sm font-bold text-primary-600">
                        {formatPrice(product.variants?.[0]?.price || 0, locale)}
                      </span>
                    </Link>
                  ))}
                </div>
              ) : query.trim() ? (
                <div className="py-8 text-center text-slate-500">
                  <Search className="mx-auto mb-2 h-10 w-10 text-slate-200" />
                  <p>{locale === "vi" ? "Không tìm thấy kết quả" : "No results found"}</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div>
                      <div className="mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4 text-slate-400" />
                        <span className="text-xs font-semibold text-slate-500 uppercase">
                          {locale === "vi" ? "Tìm kiếm gần đây" : "Recent Searches"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recentSearches.map((s) => (
                          <button
                            key={s}
                            onClick={() => handleSearch(s)}
                            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Searches */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-slate-400" />
                      <span className="text-xs font-semibold text-slate-500 uppercase">
                        {locale === "vi" ? "Xu hướng tìm kiếm" : "Popular Searches"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(locale === "vi" ? popularSearchesVi : popularSearchesEn).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleSearch(s)}
                          className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 transition-colors hover:border-primary-300 hover:bg-primary-50 hover:text-primary-600"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
