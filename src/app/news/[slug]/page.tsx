import { NewsDetailClient } from "@/components/NewsDetailClient";
import { db } from "@/lib/db";
import { newsArticles } from "@/lib/db/schema";
import { eq, or } from "drizzle-orm";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface NewsDetailPageProps {
  params: { slug: string };
  searchParams: { locale?: string };
}

export default async function NewsDetailPage({ params, searchParams }: NewsDetailPageProps) {
  const locale = (searchParams.locale === "en" ? "en" : "vi") as "vi" | "en";
  const slug = params.slug;

  const [articleRow] = await db
    .select()
    .from(newsArticles)
    .where(
      or(
        eq(newsArticles.slugVi, slug),
        eq(newsArticles.slugEn, slug)
      )
    )
    .limit(1);

  if (!articleRow || !articleRow.isPublished) {
    notFound();
  }

  let tags: string[] = [];
  try { tags = JSON.parse(articleRow.tags || "[]"); } catch {}

  const article = {
    _id: articleRow.id,
    slug: locale === "en" ? articleRow.slugEn : articleRow.slugVi,
    titleVi: articleRow.titleVi,
    titleEn: articleRow.titleEn,
    contentVi: articleRow.contentVi,
    contentEn: articleRow.contentEn,
    thumbnail: articleRow.coverImage || undefined,
    tags,
    author: articleRow.author || "Admin",
    views: 0,
    publishedAt: articleRow.publishedAt ? (articleRow.publishedAt instanceof Date ? articleRow.publishedAt.getTime() : Number(articleRow.publishedAt)) : Date.now(),
    isPublished: true,
  };

  const relatedRaw = await db
    .select()
    .from(newsArticles)
    .where(eq(newsArticles.isPublished, true))
    .limit(4); // Fetch some recent articles as related for now

  const relatedArticles = relatedRaw
    .filter(a => a.id !== articleRow.id)
    .slice(0, 3)
    .map(a => {
      let rTags: string[] = [];
      try { rTags = JSON.parse(a.tags || "[]"); } catch {}
      return {
        _id: a.id,
        slug: locale === "en" ? a.slugEn : a.slugVi,
        titleVi: a.titleVi,
        titleEn: a.titleEn,
        contentVi: a.contentVi,
        contentEn: a.contentEn,
        thumbnail: a.coverImage || undefined,
        tags: rTags,
        author: a.author || "Admin",
        views: 0,
        publishedAt: a.publishedAt ? (a.publishedAt instanceof Date ? a.publishedAt.getTime() : Number(a.publishedAt)) : Date.now(),
        isPublished: true,
      };
    });

  return (
    <NewsDetailClient
      article={article}
      locale={locale}
      relatedArticles={relatedArticles}
    />
  );
}
