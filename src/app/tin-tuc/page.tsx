import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Tin tức",
  description: "Tin tức và cập nhật từ Kho Mã Nguồn — tách biệt với danh sách sản phẩm trên trang chủ.",
  alternates: { canonical: "https://khomanguon.io.vn/tin-tuc" },
};

type PostRow = { id: string; slug: string; title: string; excerpt: string | null; published_at: number | null; created_at: number };

async function getPosts(): Promise<PostRow[]> {
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;
  try {
    const res = await fetch(`${base}/api/news`, { cache: "no-store" });
    if (!res.ok) return [];
    const d = (await res.json()) as { posts?: PostRow[] };
    return d.posts ?? [];
  } catch { return []; }
}

export default async function NewsIndexPage() {
  const posts = await getPosts();

  return (
    <>
      <SiteHeader />
      <main className="page-lg">
        <h1 className="page-title">Tin tức</h1>
        <p className="page-desc">
          Kênh cập nhật nội dung biên tập — không hiển thị trên trang chủ. Sản phẩm nổi bật xem tại{" "}
          <Link href="/#featured-products" className="link-brand">trang chủ</Link>.
        </p>
        {posts.length === 0 ? (
          <div className="empty-state">
            Chưa có bài đăng. Quản trị viên có thể thêm bài từ nguồn URL và chỉnh sửa bằng AI trong trang quản trị.
          </div>
        ) : (
          <div style={{ marginTop: "var(--space-10)", display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            {posts.map((p) => (
              <article key={p.id} className="card">
                <Link href={`/tin-tuc/${p.slug}`} className="link-brand" style={{ fontSize: "1.125rem", fontWeight: 600 }}>
                  {p.title}
                </Link>
                {p.excerpt ? <p style={{ marginTop: "var(--space-2)", fontSize: "0.875rem", lineHeight: 1.7, color: "var(--text-secondary)" }}>{p.excerpt}</p> : null}
              </article>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
