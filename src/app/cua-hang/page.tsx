import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { AlertTriangle, BadgeCheck } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Cửa hàng",
  description: "Danh sách sản phẩm mã nguồn, tài khoản MMO và dịch vụ AI trên Kho Mã Nguồn.",
  alternates: { canonical: "https://khomanguon.io.vn/cua-hang" },
};

type Product = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price_cents: number;
  seller_name: string;
  kycWarning: boolean;
};

async function getProducts(): Promise<Product[]> {
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;
  try {
    const res = await fetch(`${base}/api/products`, { cache: "no-store" });
    if (!res.ok) return [];
    const d = (await res.json()) as { products?: Product[] };
    return d.products ?? [];
  } catch {
    return [];
  }
}

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}

export default async function StorePage() {
  const products = await getProducts();

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="text-3xl font-bold text-slate-900">Cửa hàng</h1>
        <p className="mt-2 text-slate-600">
          Sản phẩm do người bán đăng. Người bán chưa KYC CCCD hiển thị cảnh báo đỏ theo chính sách minh bạch.
        </p>
        {products.length === 0 ? (
          <p className="mt-12 rounded-2xl border border-dashed border-slate-200 bg-slate-50 py-16 text-center text-slate-500">
            Chưa có sản phẩm. Người bán được duyệt có thể thêm sản phẩm từ trang tài khoản.
          </p>
        ) : (
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((p) => (
              <li
                key={p.id}
                className={`relative overflow-hidden rounded-2xl border bg-white p-6 shadow-sm ${p.kycWarning ? "border-red-300 ring-1 ring-red-100" : "border-slate-100"}`}
              >
                {p.kycWarning ? (
                  <div className="mb-3 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    Người bán chưa xác minh CCCD
                  </div>
                ) : (
                  <div className="mb-3 flex items-center gap-2 text-xs font-medium text-emerald-700">
                    <BadgeCheck className="h-4 w-4" />
                    Người bán đã KYC
                  </div>
                )}
                <h2 className="text-lg font-semibold text-slate-900">{p.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-slate-600">{p.description || "—"}</p>
                <p className="mt-4 text-xl font-bold text-brand-green">{formatVnd(p.price_cents)}</p>
                <p className="mt-2 text-xs text-slate-500">Người bán: {p.seller_name}</p>
                <Link href={`/cua-hang/${p.slug}`} className="mt-4 inline-block text-sm font-semibold text-brand-blue">
                  Xem chi tiết
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
