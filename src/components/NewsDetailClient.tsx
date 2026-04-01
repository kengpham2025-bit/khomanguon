"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, Eye, ArrowLeft, Tag, Share2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface Article {
  _id: string;
  slug?: string;
  titleVi: string;
  titleEn: string;
  contentVi: string;
  contentEn: string;
  thumbnail?: string;
  tags: string[];
  author?: string;
  views: number;
  publishedAt?: number;
  isPublished: boolean;
}

interface NewsDetailClientProps {
  article: Article;
  locale: "vi" | "en";
  relatedArticles?: Article[];
}

export function NewsDetailClient({ article, locale, relatedArticles = [] }: NewsDetailClientProps) {
  const title = locale === "vi" ? article.titleVi : article.titleEn;
  const content = locale === "vi" ? article.contentVi : article.contentEn;

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Back */}
        <Link
          href="/news"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary-600 transition-colors hover:text-primary-700"
        >
          <ArrowLeft className="h-4 w-4" />
          {locale === "vi" ? "Quay lại Tin tức" : "Back to News"}
        </Link>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="flex items-center gap-1 rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-600"
            >
              <Tag className="h-3 w-3" />
              {tag}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="mb-4 text-3xl font-bold leading-tight text-slate-900 lg:text-4xl">
          {title}
        </h1>

        {/* Meta */}
        <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-slate-500">
          {article.author && <span className="font-medium text-slate-700">{article.author}</span>}
          {article.publishedAt && (
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {formatDate(article.publishedAt)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {article.views.toLocaleString()} {locale === "vi" ? "lượt xem" : "views"}
          </span>
          <button className="ml-auto flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-600 transition-all hover:bg-slate-200">
            <Share2 className="h-3.5 w-3.5" />
            {locale === "vi" ? "Chia sẻ" : "Share"}
          </button>
        </div>

        {/* Thumbnail */}
        {article.thumbnail && (
          <div className="relative mb-8 aspect-video overflow-hidden rounded-2xl bg-slate-100">
            <Image
              src={article.thumbnail}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div
          className="prose prose-slate max-w-none prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:leading-relaxed prose-a:text-primary-600 prose-img:rounded-xl"
          dangerouslySetInnerHTML={{ __html: content }}
        />

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="mt-12 border-t border-slate-200 pt-8">
            <h2 className="mb-6 text-xl font-bold text-slate-900">
              {locale === "vi" ? "Bài viết liên quan" : "Related Articles"}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {relatedArticles.map((related) => (
                <Link
                  key={related._id}
                  href={`/news/${related.slug || related._id}`}
                  className="group flex gap-4 rounded-xl border border-slate-100 bg-white p-4 transition-all hover:shadow-soft-md"
                >
                  {related.thumbnail && (
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      <Image
                        src={related.thumbnail}
                        alt={locale === "vi" ? related.titleVi : related.titleEn}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="mb-1 line-clamp-2 text-sm font-semibold text-slate-900 transition-colors group-hover:text-primary-600">
                      {locale === "vi" ? related.titleVi : related.titleEn}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      {related.publishedAt && (
                        <span>{formatDate(related.publishedAt)}</span>
                      )}
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" />
                        {related.views}
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-slate-300 transition-transform group-hover:translate-x-1 group-hover:text-primary-600" />
                </Link>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
