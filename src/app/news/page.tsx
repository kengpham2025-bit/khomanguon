import { NewsClient } from "@/components/NewsClient";
import { db } from "@/lib/db";
import { newsArticles } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

interface NewsPageProps {
  searchParams: { locale?: string };
}

export default async function NewsPage({ searchParams }: NewsPageProps) {
  const locale = (searchParams.locale === "en" ? "en" : "vi") as "vi" | "en";

  const allArticlesRaw = await db
    .select()
    .from(newsArticles)
    .where(eq(newsArticles.isPublished, true))
    .orderBy(desc(newsArticles.publishedAt));

  const mappedArticles = allArticlesRaw.map(a => {
    let tags: string[] = [];
    try { tags = JSON.parse(a.tags || "[]"); } catch {}

    return {
      _id: a.id,
      titleVi: a.titleVi,
      titleEn: a.titleEn,
      slugVi: a.slugVi,
      slugEn: a.slugEn,
      excerptVi: a.excerptVi || "",
      excerptEn: a.excerptEn || "",
      contentVi: a.contentVi,
      contentEn: a.contentEn,
      coverImage: a.coverImage || undefined,
      tags,
      isPublished: true,
      isFeatured: a.isFeatured,
      publishedAt: a.publishedAt ? (a.publishedAt instanceof Date ? a.publishedAt.getTime() : Number(a.publishedAt)) : Date.now(),
      views: 0, // Could add a views column if needed
    };
  });

  const featured = mappedArticles.filter(a => a.isFeatured);
  const regular = mappedArticles.filter(a => !a.isFeatured);

  return (
    <div className="min-h-screen bg-slate-50">
      <NewsClient articles={regular} featuredArticles={featured} locale={locale} />
    </div>
  );
}
