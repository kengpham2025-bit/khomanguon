import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { AlertTriangle, BadgeCheck } from "lucide-react";

type Props = { params: Promise<{ slug: string }> };

async function getProduct(slug: string) {
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;
  const res = await fetch(`${base}/api/products`, { cache: "no-store" });
  if (!res.ok) return null;
  const d = (await res.json()) as {
    products?: Record<string, unknown>[];
  };
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
      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/cua-hang" className="text-sm text-brand-blue">
          ← Quay lại cửa hàng
        </Link>
        {kycWarning ? (
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Cảnh báo: người bán chưa xác minh CCCD — cân nhắc kỹ trước khi giao dịch.
          </div>
        ) : (
          <div className="mt-6 flex items-center gap-2 text-sm font-medium text-emerald-700">
            <BadgeCheck className="h-5 w-5" />
            Người bán đã KYC (tích xanh nội bộ)
          </div>
        )}
        <h1 className="mt-6 text-3xl font-bold">{String(p.title)}</h1>
        <p className="mt-4 text-2xl font-bold text-brand-green">{formatVnd(Number(p.price_cents))}</p>
        <p className="mt-6 whitespace-pre-wrap text-slate-700">{String(p.description || "")}</p>
      </main>
      <SiteFooter />
    </>
  );
}
