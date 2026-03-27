import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { IconAlertTriangle, IconBadgeCheck, IconArrowRight, IconStore, IconTag } from "@/components/Icons";
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
      <main className="page-main">
        <div className="page-header-bar">
          <div>
            <h1 className="page-title">Cửa hàng</h1>
            <p className="page-desc">
              Sản phẩm do người bán đăng. Người bán chưa KYC CCCD hiển thị cảnh báo đỏ theo chính sách minh bạch.
            </p>
          </div>
          <div className="store-count-badge">
            <IconStore size={16} />
            {products.length} sản phẩm
          </div>
        </div>
        {products.length === 0 ? (
          <div className="empty-state">
            Chưa có sản phẩm. Người bán được duyệt có thể thêm sản phẩm từ trang tài khoản.
          </div>
        ) : (
          <div className="grid sm\:grid-2 lg\:grid-3 gap-6" style={{ marginTop: "var(--space-10)" }}>
            {products.map((p) => (
              <article
                key={p.id}
                className={`product-card ${p.kycWarning ? "product-card-warn" : ""}`}
              >
                {p.kycWarning ? (
                  <div className="badge badge-error" style={{ marginBottom: "var(--space-3)" }}>
                    <IconAlertTriangle size={14} /> Người bán chưa xác minh CCCD
                  </div>
                ) : (
                  <div className="badge badge-success" style={{ marginBottom: "var(--space-3)" }}>
                    <IconBadgeCheck size={14} /> Người bán đã KYC
                  </div>
                )}
                <h2 style={{ fontSize: "1.125rem", fontWeight: 600, color: "var(--text-primary)" }}>{p.title}</h2>
                <p className="line-clamp-3" style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "var(--space-2)" }}>
                  {p.description || "—"}
                </p>
                <p className="product-price">{formatVnd(p.price_cents)}</p>
                <p className="product-seller">Người bán: {p.seller_name}</p>
                <Link href={`/cua-hang/${p.slug}`} className="product-link">
                  Xem chi tiết <IconArrowRight size={14} />
                </Link>
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
