"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Eye, ArrowRight, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

interface Article {
  _id: string;
  titleVi: string;
  titleEn: string;
  slugVi: string;
  slugEn: string;
  excerptVi?: string;
  excerptEn?: string;
  contentVi: string;
  contentEn: string;
  coverImage?: string;
  tags: string[];
  author?: string;
  sourceUrl?: string;
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: number;
  views: number;
}

interface NewsClientProps {
  articles: Article[];
  featuredArticles: Article[];
  locale: "vi" | "en";
}

export function NewsClient({ articles, featuredArticles, locale = "vi" }: NewsClientProps) {
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = Array.from(new Set(articles.flatMap((a) => a.tags))).slice(0, 10);

  const filteredArticles = selectedTag
    ? articles.filter((a) => a.tags.includes(selectedTag))
    : articles;

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 lg:text-4xl">
          {locale === "vi" ? "Tin tức & Blog" : "News & Blog"}
        </h1>
        <p className="mt-2 text-slate-500">
          {locale === "vi"
            ? "Cập nhật tin tức công nghệ, MMO và thế giới AI"
            : "Latest tech news, MMO updates and AI world"}
        </p>
      </div>

      {/* Featured Article */}
      {featuredArticles[0] && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <Link
            href={`/news/${locale === "vi" ? featuredArticles[0].titleVi : featuredArticles[0].titleEn}`.toLowerCase().replace(/\s+/g, "-")}
            className="group relative block overflow-hidden rounded-2xl bg-slate-900 shadow-soft-xl"
          >
            <div className="aspect-[3/1]">
              {featuredArticles[0].coverImage ? (
                <Image
                  src={featuredArticles[0].coverImage}
                  alt={featuredArticles[0].titleVi}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-full w-full bg-gradient-to-r from-indigo-600 to-purple-600" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-10">
              <div className="mb-3 flex items-center gap-3">
                <span className="rounded-full bg-primary-600 px-3 py-1 text-xs font-semibold text-white">
                  {locale === "vi" ? "Nổi bật" : "Featured"}
                </span>
                {featuredArticles[0].tags.slice(0, 2).map((tag) => (
                  <span key={tag} className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-xs text-white/80">
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="mb-3 text-2xl font-bold text-white lg:text-4xl">
                {locale === "vi" ? featuredArticles[0].titleVi : featuredArticles[0].titleEn}
              </h2>
              {featuredArticles[0].excerptVi && (
                <p className="mb-4 hidden max-w-2xl text-sm text-white/70 lg:text-base lg:block">
                  {locale === "vi" ? featuredArticles[0].excerptVi : featuredArticles[0].excerptEn}
                </p>
              )}
              <div className="flex items-center gap-4 text-sm text-white/60">
                {featuredArticles[0].publishedAt && (
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(featuredArticles[0].publishedAt)}
                  </span>
                )}
                {featuredArticles[0].author && (
                  <span>{featuredArticles[0].author}</span>
                )}
              </div>
            </div>
          </Link>
        </motion.div>
      )}

      {/* Tags Filter */}
      <div className="mb-8 flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedTag(null)}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            !selectedTag
              ? "bg-primary-600 text-white"
              : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:text-primary-600"
          )}
        >
          {locale === "vi" ? "Tất cả" : "All"}
        </button>
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              selectedTag === tag
                ? "bg-primary-600 text-white"
                : "border border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:text-primary-600"
            )}
          >
            {tag}
          </button>
        ))}
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {filteredArticles.map((article, idx) => (
          <motion.div
            key={article._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Link
              href={`/news/${locale === "vi" ? article.slugVi : article.slugEn}`}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-soft-sm transition-all hover:shadow-soft-md"
            >
              {/* Cover Image */}
              <div className="relative aspect-video overflow-hidden bg-slate-100">
                {article.coverImage ? (
                  <Image
                    src={article.coverImage}
                    alt={article.titleVi}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full bg-gradient-to-br from-indigo-100 to-purple-100" />
                )}
                {article.isFeatured && (
                  <span className="absolute left-3 top-3 rounded-full bg-amber-500 px-2.5 py-0.5 text-xs font-semibold text-white">
                    {locale === "vi" ? "Nổi bật" : "Featured"}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                {/* Tags */}
                <div className="mb-3 flex flex-wrap gap-1.5">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h3 className="mb-2 text-base font-bold text-slate-900 line-clamp-2 group-hover:text-primary-600 transition-colors">
                  {locale === "vi" ? article.titleVi : article.titleEn}
                </h3>

                {/* Excerpt */}
                {(article.excerptVi || article.excerptEn) && (
                  <p className="mb-4 flex-1 text-sm text-slate-500 line-clamp-2">
                    {locale === "vi" ? article.excerptVi : article.excerptEn}
                  </p>
                )}

                {/* Footer */}
                <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    {article.publishedAt && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(article.publishedAt)}
                      </span>
                    )}
                    {article.views > 0 && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {article.views.toLocaleString()}
                      </span>
                    )}
                  </div>
                  <span className="flex items-center gap-1 text-xs font-medium text-primary-600">
                    {locale === "vi" ? "Đọc tiếp" : "Read more"}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filteredArticles.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-slate-500">
            {locale === "vi" ? "Không có bài viết nào." : "No articles found."}
          </p>
        </div>
      )}
    </div>
  );
}
