import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { IconArrowLeft, IconAlertTriangle, IconBadgeCheck, IconShieldCheck, IconStore, IconTag } from "@/components/Icons";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

type Props = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/products`, { cache: "no-store" });
  if (!res.ok) return null;
  const d = (await res.json()) as { products?: Record<string, unknown>[] };
  const p = d.products?.find((x) => x.slug === slug);
  return p ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) return { title: "Sản phẩm" };
  return {
    title: String(p.title),
    description: (p.description as string)?.slice(0, 160) || "Chi tiết sản phẩm tại Kho Mã Nguồn.",
    alternates: { canonical: `https://khomanguon.io.vn/cua-hang/${slug}` },
  };
}

function formatVnd(n: number) {
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND", maximumFractionDigits: 0 }).format(n);
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const p = await getProduct(slug);
  if (!p) notFound();

  const kycWarning = Boolean((p as { kycWarning?: boolean }).kycWarning);

  return (
    <>
      <SiteHeader />
      <main className="page-lg">
        <Link href="/cua-hang" className="back-link">
          <IconArrowLeft size={16} /> Quay lại cửa hàng
        </Link>
        {kycWarning ? (
          <div className="alert alert-error" style={{ marginTop: "var(--space-6)" }}>
            <IconAlertTriangle size={20} />
            <span style={{ fontWeight: 600 }}>Cảnh báo: người bán chưa xác minh CCCD — cân nhắc kỹ trước khi giao dịch.</span>
          </div>
        ) : (
          <div className="badge badge-success" style={{ marginTop: "var(--space-6)" }}>
            <IconBadgeCheck size={18} />
            Người bán đã KYC (tích xanh nội bộ)
          </div>
        )}
        <h1 style={{ marginTop: "var(--space-6)", fontSize: "1.875rem", fontWeight: 700 }}>{String(p.title)}</h1>
        <p style={{ marginTop: "var(--space-4)", fontSize: "1.5rem", fontWeight: 700, color: "var(--brand-green)" }}>
          {formatVnd(Number(p.price_cents))}
        </p>
        <p className="whitespace-pre-wrap" style={{ marginTop: "var(--space-6)", color: "var(--text-secondary)", lineHeight: 1.7 }}>
          {String(p.description || "")}
        </p>
      </main>
      <SiteFooter />
    </>
  );
}
