"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Package,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  Eye,
  DollarSign,
  Star,
  CheckCircle2,
  XCircle,
  Loader2,
  ToggleLeft,
  ToggleRight,
  ArrowUpDown,
  AlertTriangle,
  Flame,
  Tag,
} from "lucide-react";
import { cn, formatPrice, formatDate } from "@/lib/utils";
import { useNotification } from "@/components/NotificationProvider";
import { confirm } from "@/components/ConfirmDialog";

interface AdminProduct {
  _id: string;
  titleVi: string;
  titleEn: string;
  category: string;
  sellerName: string;
  sellerId: string;
  demoImages: string[];
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

interface ProductsAdminClientProps {
  locale: "vi" | "en";
  products: AdminProduct[];
}

const dummyProducts: AdminProduct[] = [
  {
    _id: "p1",
    titleVi: "Tài Khoản Netflix Premium 1 Tháng",
    titleEn: "Netflix Premium 1 Month Account",
    category: "Streaming",
    sellerName: "Nguyen Van A",
    sellerId: "user_1",
    demoImages: ["https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?w=200"],
    variants: [{ price: 89000, stock: 12 }],
    isHot: true,
    isSale: false,
    isNew: false,
    isActive: true,
    rating: 4.8,
    reviewCount: 124,
    sales: 89,
    views: 1200,
    createdAt: Date.now() - 86400000 * 10,
  },
  {
    _id: "p2",
    titleVi: "Tài Khoản Spotify Premium 6 Tháng",
    titleEn: "Spotify Premium 6 Month Account",
    category: "Music",
    sellerName: "Tran Thi B",
    sellerId: "user_2",
    demoImages: ["https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=200"],
    variants: [{ price: 199000, stock: 5 }],
    isHot: false,
    isSale: true,
    isNew: false,
    isActive: true,
    rating: 4.6,
    reviewCount: 67,
    sales: 45,
    views: 800,
    createdAt: Date.now() - 86400000 * 5,
  },
  {
    _id: "p3",
    titleVi: "Tài Khoản YouTube Premium 1 Năm",
    titleEn: "YouTube Premium 1 Year Account",
    category: "Streaming",
    sellerName: "Le Van C",
    sellerId: "user_3",
    demoImages: [],
    variants: [{ price: 399000, stock: 0 }],
    isHot: false,
    isSale: false,
    isNew: true,
    isActive: false,
    rating: 4.9,
    reviewCount: 31,
    sales: 22,
    views: 450,
    createdAt: Date.now() - 86400000 * 2,
  },
  {
    _id: "p4",
    titleVi: "Tài Khoản ChatGPT Plus 1 Tháng",
    titleEn: "ChatGPT Plus 1 Month Account",
    category: "AI Tools",
    sellerName: "Pham Van D",
    sellerId: "user_4",
    demoImages: [],
    variants: [{ price: 149000, stock: 20 }],
    isHot: true,
    isSale: true,
    isNew: true,
    isActive: true,
    rating: 4.7,
    reviewCount: 203,
    sales: 310,
    views: 3500,
    createdAt: Date.now() - 86400000 * 1,
  },
];

export function ProductsAdminClient({ locale, products }: ProductsAdminClientProps) {
  const { success, error: notifyError } = useNotification();
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const filtered = products.filter((p) => {
    const matchesSearch =
      p.titleVi.toLowerCase().includes(search.toLowerCase()) ||
      p.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      p.sellerName.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "active" && p.isActive) ||
      (filterStatus === "inactive" && !p.isActive) ||
      (filterStatus === "hot" && p.isHot) ||
      (filterStatus === "sale" && p.isSale);
    return matchesSearch && matchesStatus;
  });

  const handleToggleActive = async (product: AdminProduct) => {
    const confirmed = await confirm({
      title: product.isActive
        ? (locale === "vi" ? "Hủy kích hoạt sản phẩm" : "Deactivate Product")
        : (locale === "vi" ? "Kích hoạt sản phẩm" : "Activate Product"),
      description:
        locale === "vi"
          ? `${product.isActive ? "Hủy kích hoạt" : "Kích hoạt"} "${product.titleVi}"?`
          : `${product.isActive ? "Deactivate" : "Activate"} "${product.titleEn}"?`,
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

  const handleDelete = async (product: AdminProduct) => {
    const confirmed = await confirm({
      title: locale === "vi" ? "Xóa sản phẩm" : "Delete Product",
      description:
        locale === "vi"
          ? `Bạn có chắc muốn xóa sản phẩm "${product.titleVi}"? Hành động này không thể hoàn tác.`
          : `Are you sure you want to delete "${product.titleEn}"? This action cannot be undone.`,
      confirmText: locale === "vi" ? "Xóa" : "Delete",
      cancelText: locale === "vi" ? "Hủy" : "Cancel",
      variant: "danger",
    });
    if (!confirmed) return;
    setIsProcessing(true);
    try {
      await new Promise((r) => setTimeout(r, 1000));
      success({
        title: locale === "vi" ? "Đã xóa sản phẩm" : "Product Deleted",
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {locale === "vi" ? "Quản lý sản phẩm" : "Products Management"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {filtered.length} / {products.length} {locale === "vi" ? "sản phẩm" : "products"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={locale === "vi" ? "Tìm sản phẩm..." : "Search products..."}
            className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none"
        >
          <option value="all">{locale === "vi" ? "Tất cả" : "All"}</option>
          <option value="active">{locale === "vi" ? "Đang hoạt động" : "Active"}</option>
          <option value="inactive">{locale === "vi" ? "Tắt" : "Inactive"}</option>
          <option value="hot">Hot</option>
          <option value="sale">Sale</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-soft-sm">
          <Package className="mx-auto mb-3 h-12 w-12 text-slate-200" />
          <p className="text-lg font-semibold text-slate-700">
            {locale === "vi" ? "Không tìm thấy sản phẩm" : "No products found"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((product, idx) => (
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
                <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {product.demoImages[0] ? (
                    <img src={product.demoImages[0]} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <Package className="h-4 w-4" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {locale === "vi" ? product.titleVi : product.titleEn}
                    </p>
                    {product.isHot && <span className="inline-flex items-center gap-0.5 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600"><Flame className="h-3 w-3" /> Hot</span>}
                    {product.isSale && <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-600">Sale</span>}
                    {!product.isActive && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-500">Tắt</span>}
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="font-medium text-slate-700">{product.sellerName}</span>
                    </span>
                    <span>•</span>
                    <span>{product.category}</span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="hidden text-right sm:block">
                  <div className="text-sm font-bold text-primary-600">{formatPrice(product.variants[0]?.price || 0, locale)}</div>
                  <div className="text-xs text-slate-400">{product.variants[0]?.stock || 0} stock</div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleToggleActive(product)}
                    disabled={isProcessing}
                    className={cn("flex h-8 w-8 items-center justify-center rounded-full transition-colors", product.isActive ? "text-green-600 hover:bg-green-50" : "text-slate-400 hover:bg-slate-100")}
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : product.isActive ? <ToggleRight className="h-5 w-5" /> : <ToggleLeft className="h-5 w-5" />}
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
