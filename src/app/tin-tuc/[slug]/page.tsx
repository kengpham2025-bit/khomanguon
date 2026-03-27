import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

type Post = {
  id: string; slug: string; title: string; excerpt: string | null;
  content_html: string; seo_keywords: string | null;
  source_url: string | null; published_at: number | null; created_at: number;
};

async function getPost(slug: string): Promise<Post | null> {
  const h = await headers();
  const host = h.get("host") || "localhost:3000";
  const proto = h.get("x-forwarded-proto") || "http";
  const base = `${proto}://${host}`;
  try {
    const res = await fetch(`${base}/api/news/${encodeURIComponent(slug)}`, { cache: "no-store" });
    if (res.status === 404 || !res.ok) return null;
    const d = (await res.json()) as { post?: Post };
    return d.post ?? null;
  } catch { return null; }
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) return { title: "Tin tức" };
  let keywords: string[] = [];
  if (post.seo_keywords) {
    try { const k = JSON.parse(post.seo_keywords) as unknown; if (Array.isArray(k)) keywords = k.filter((x): x is string => typeof x === "string"); } catch {}
  }
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    keywords: keywords.length ? keywords : undefined,
    alternates: { canonical: `https://khomanguon.io.vn/tin-tuc/${post.slug}` },
  };
}

export default async function NewsArticlePage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <>
      <SiteHeader />
      <main className="page-lg" style={{ maxWidth: 800 }}>
        <p style={{ fontSize: "0.875rem", color: "var(--text-muted)" }}>
          <Link href="/tin-tuc" className="link-brand">Tin tức</Link>
          <span style={{ margin: "0 var(--space-2)" }}>/</span>
          <span style={{ color: "var(--text-secondary)" }}>{post.title}</span>
        </p>
        <h1 style={{ marginTop: "var(--space-4)", fontFamily: "var(--font-heading)", fontSize: "1.75rem", fontWeight: 700, lineHeight: 1.3, color: "var(--text-primary)" }}>
          {post.title}
        </h1>
        {post.excerpt ? <p style={{ marginTop: "var(--space-4)", fontSize: "1.125rem", color: "var(--text-secondary)" }}>{post.excerpt}</p> : null}
        <article
          className="article-content"
          style={{ marginTop: "var(--space-10)", fontFamily: "var(--font-body)", lineHeight: 1.8, color: "var(--text-primary)" }}
          dangerouslySetInnerHTML={{ __html: post.content_html }}
        />
        {post.source_url ? (
          <p style={{ marginTop: "var(--space-10)", fontSize: "0.875rem", color: "var(--text-muted)" }}>
            Nguồn tham khảo:{" "}
            <a href={post.source_url} className="link-brand" style={{ textDecoration: "underline" }} target="_blank" rel="noopener noreferrer">{post.source_url}</a>
          </p>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
