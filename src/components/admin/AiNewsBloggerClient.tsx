"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Newspaper,
  Loader2,
  Sparkles,
  Globe,
  CheckCircle2,
  AlertTriangle,
  Eye,
  X,
  Star,
  RefreshCw,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useNotification } from "@/components/NotificationProvider";
import { confirm } from "@/components/ConfirmDialog";

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
  sourceUrl?: string;
  coverImage?: string;
  tags: string[];
  isPublished: boolean;
  isFeatured: boolean;
  publishedAt?: number;
  createdAt: number;
  views: number;
}

interface AiNewsBloggerClientProps {
  articles: Article[];
  locale: "vi" | "en";
}

export function AiNewsBloggerClient({ articles, locale = "vi" }: AiNewsBloggerClientProps) {
  const { success, error: notifyError, info } = useNotification();

  // Scrape & Rewrite State
  const [url, setUrl] = useState("");
  const [isScraping, setIsScraping] = useState(false);
  const [scrapedTitle, setScrapedTitle] = useState("");
  const [rewrittenVi, setRewrittenVi] = useState("");
  const [rewrittenEn, setRewrittenEn] = useState("");
  const [tags, setTags] = useState("");
  const [isRewriting, setIsRewriting] = useState(false);
  const [rewriteStatus, setRewriteStatus] = useState<"idle" | "scraping" | "rewriting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);

  // Article List State
  const [showArticleModal, setShowArticleModal] = useState<Article | null>(null);
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const filteredArticles = articles.filter((a) => {
    if (filter === "published") return a.isPublished;
    if (filter === "draft") return !a.isPublished;
    return true;
  });

  const handleScrape = async () => {
    if (!url.trim() || !url.startsWith("http")) {
      notifyError({
        title: locale === "vi" ? "URL không hợp lệ" : "Invalid URL",
        message: "",
      });
      return;
    }

    setIsScraping(true);
    setRewriteStatus("scraping");
    setErrorMsg("");
    setRewrittenVi("");
    setRewrittenEn("");

    try {
      // Simulate scraping
      await new Promise((r) => setTimeout(r, 2000));
      setScrapedTitle("Article Title from URL");

      // Simulate AI rewrite
      setRewriteStatus("rewriting");
      setIsRewriting(true);
      await new Promise((r) => setTimeout(r, 5000));

      setRewrittenVi(`Bài viết đã được viết lại hoàn toàn bằng tiếng Việt tự nhiên, giữ nguyên các thẻ hình ảnh HTML gốc và bổ sung từ khóa SEO phù hợp với chủ đề MMO và Công nghệ. Nội dung hoàn toàn mới, không sao chép từ bài viết nguồn.\n\n<img src="https://example.com/image1.jpg" alt="Hình minh họa công nghệ" />\n\nĐây là đoạn văn hoàn toàn mới được viết lại tự nhiên bằng tiếng Việt...`);
      setRewrittenEn(`The article has been completely rewritten in natural English, preserving all original HTML image tags and injecting relevant MMO and Tech SEO keywords. The content is entirely new and unique, not copied from the source article.\n\n<img src="https://example.com/image1.jpg" alt="Technology illustration" />\n\nThis is a completely new passage rewritten naturally in English...`);

      setRewriteStatus("done");
      success({
        title: locale === "vi" ? "Viết lại thành công!" : "Rewrite complete!",
        message: locale === "vi"
          ? "Bài viết đã được viết lại hoàn toàn thành 2 phiên bản VI/EN."
          : "Article rewritten into 2 complete VI/EN versions.",
      });
    } catch (e) {
      setRewriteStatus("error");
      setErrorMsg(locale === "vi" ? "Đã xảy ra lỗi khi scrape và viết lại." : "Error occurred while scraping and rewriting.");
    } finally {
      setIsScraping(false);
      setIsRewriting(false);
    }
  };

  const handlePublish = async () => {
    if (!rewrittenVi || !rewrittenEn) {
      info({
        title: locale === "vi" ? "Cần viết lại trước" : "Rewrite first",
        message: "",
      });
      return;
    }

    const confirmed = await confirm({
      title: locale === "vi" ? "Xuất bản bài viết" : "Publish Article",
      description:
        locale === "vi"
          ? "Bạn có chắc muốn xuất bản bài viết này?"
          : "Are you sure you want to publish this article?",
      confirmText: locale === "vi" ? "Xuất bản" : "Publish",
      cancelText: locale === "vi" ? "Hủy" : "Cancel",
      variant: "success",
    });
    if (!confirmed) return;

    setIsPublishing(true);
    try {
      await new Promise((r) => setTimeout(r, 1500));
      success({
        title: locale === "vi" ? "Xuất bản thành công!" : "Published!",
        message: "",
      });
      // Reset form
      setUrl("");
      setScrapedTitle("");
      setRewrittenVi("");
      setRewrittenEn("");
      setTags("");
      setRewriteStatus("idle");
    } catch {
      notifyError({ title: locale === "vi" ? "Lỗi" : "Error", message: "" });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleUnpublish = async (article: Article) => {
    const confirmed = await confirm({
      title: locale === "vi" ? "Gỡ bài viết" : "Unpublish Article",
      description:
        locale === "vi"
          ? `Gỡ bài "${article.titleVi}" khỏi trang chủ?`
          : `Unpublish "${article.titleEn}" from homepage?`,
      confirmText: locale === "vi" ? "Gỡ bài" : "Unpublish",
      cancelText: locale === "vi" ? "Hủy" : "Cancel",
      variant: "warning",
    });
    if (!confirmed) return;

    success({
      title: locale === "vi" ? "Đã gỡ!" : "Unpublished!",
      message: "",
    });
  };

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString(locale === "vi" ? "vi-VN" : "en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

  return (
    <div className="space-y-8">
      {/* ── AI Scraper & Writer ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 via-white to-indigo-50 p-6 shadow-soft-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {locale === "vi" ? "AI News Auto-Blogger" : "AI News Auto-Blogger"}
            </h2>
            <p className="text-sm text-slate-500">
              {locale === "vi"
                ? "Dán URL bài viết nguồn -> AI sẽ scrape và viết lại hoàn toàn thành 2 phiên bản VI/EN."
                : "Paste a source URL -> AI scrapes and rewrites into 2 completely unique VI/EN versions."}
            </p>
          </div>
        </div>

        {/* URL Input */}
        <div className="mb-4">
          <label className="mb-2 block text-sm font-semibold text-slate-700">
            {locale === "vi" ? "URL bài viết nguồn" : "Source Article URL"}
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article-to-scrape"
                className="w-full rounded-full border border-slate-200 bg-white pl-11 pr-4 py-3 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                disabled={isScraping || isRewriting}
              />
            </div>
            <button
              onClick={handleScrape}
              disabled={isScraping || isRewriting || !url.trim()}
              className="flex items-center gap-2 rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
            >
              {isScraping || isRewriting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {rewriteStatus === "scraping" ? (locale === "vi" ? "Đang scrape..." : "Scraping...") : (locale === "vi" ? "Đang viết lại..." : "Rewriting...")}</>
              ) : (
                <><Sparkles className="h-4 w-4" /> {locale === "vi" ? "Scrape & Viết lại" : "Scrape & Rewrite"}</>
              )}
            </button>
          </div>
        </div>

        {/* Progress */}
        {(rewriteStatus === "scraping" || rewriteStatus === "rewriting") && (
          <div className="mb-4 rounded-xl border border-primary-200 bg-primary-50/50 p-4">
            <div className="flex items-center gap-3 mb-2">
              <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
              <span className="text-sm font-medium text-primary-700">
                {rewriteStatus === "scraping"
                  ? (locale === "vi" ? "Đang scrape bài viết..." : "Scraping article...")
                  : (locale === "vi" ? "AI đang viết lại bài viết (VI + EN)..." : "AI rewriting article (VI + EN)...")}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-primary-200">
              <motion.div
                animate={{ width: rewriteStatus === "scraping" ? "40%" : "80%" }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
                className="h-full rounded-full bg-primary-600"
              />
            </div>
            {rewriteStatus === "rewriting" && (
              <p className="mt-2 text-xs text-primary-600">
                {locale === "vi"
                  ? "Giữ nguyên thẻ <img>, bổ sung từ khóa SEO MMO/Tech, viết hoàn toàn mới..."
                  : "Preserving <img> tags, injecting MMO/Tech SEO keywords, completely new content..."}
              </p>
            )}
          </div>
        )}

        {/* Error */}
        {rewriteStatus === "error" && (
          <div className="mb-4 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Rewritten Content */}
        {(rewrittenVi || rewrittenEn) && (
          <div className="space-y-4">
            {/* Tags Input */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                {locale === "vi" ? "Tags (phân cách bằng dấu phẩy)" : "Tags (comma separated)"}
              </label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={locale === "vi" ? "AI, MMO, Công nghệ, SEO, ..." : "AI, MMO, Technology, SEO, ..."}
                className="w-full rounded-full border border-slate-200 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>

            {/* VI Version */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-500 text-xs font-bold text-white">VI</span>
                  {locale === "vi" ? "Phiên bản Tiếng Việt" : "Vietnamese Version"}
                </label>
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {locale === "vi" ? "Đã viết lại" : "Rewritten"}
                </span>
              </div>
              <textarea
                value={rewrittenVi}
                onChange={(e) => setRewrittenVi(e.target.value)}
                rows={8}
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder={locale === "vi" ? "Nội dung tiếng Việt sẽ xuất hiện ở đây..." : "Vietnamese content will appear here..."}
              />
            </div>

            {/* EN Version */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <span className="flex h-5 w-5 items-center justify-center rounded bg-blue-500 text-xs font-bold text-white">EN</span>
                  {locale === "vi" ? "Phiên bản Tiếng Anh" : "English Version"}
                </label>
                <span className="flex items-center gap-1 text-xs text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {locale === "vi" ? "Đã viết lại" : "Rewritten"}
                </span>
              </div>
              <textarea
                value={rewrittenEn}
                onChange={(e) => setRewrittenEn(e.target.value)}
                rows={8}
                className="w-full rounded-2xl border border-slate-200 p-4 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                placeholder={locale === "vi" ? "Nội dung tiếng Anh sẽ xuất hiện ở đây..." : "English content will appear here..."}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-green-600 py-3 text-sm font-semibold text-white transition-colors hover:bg-green-700 disabled:opacity-50"
              >
                {isPublishing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                {locale === "vi" ? "Xuất bản bài viết" : "Publish Article"}
              </button>
              <button
                onClick={() => {
                  setRewriteStatus("idle");
                  setRewrittenVi("");
                  setRewrittenEn("");
                  setUrl("");
                  setScrapedTitle("");
                  setTags("");
                }}
                disabled={isPublishing}
                className="flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4" />
                {locale === "vi" ? "Làm lại" : "Reset"}
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ── Article List ── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">
            {locale === "vi" ? "Quản lý bài viết" : "Article Management"}
            <span className="ml-2 rounded-full bg-slate-100 px-2.5 py-0.5 text-sm font-medium text-slate-600">
              {articles.length}
            </span>
          </h2>
          <div className="flex gap-2">
            {(["all", "published", "draft"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
                  filter === f
                    ? "bg-primary-600 text-white"
                    : "border border-slate-200 bg-white text-slate-600"
                )}
              >
                {f === "all" ? (locale === "vi" ? "Tất cả" : "All") :
                 f === "published" ? (locale === "vi" ? "Đã xuất bản" : "Published") :
                 (locale === "vi" ? "Bản nháp" : "Drafts")}
              </button>
            ))}
          </div>
        </div>

        {filteredArticles.length === 0 ? (
          <div className="rounded-2xl border border-slate-100 bg-white p-12 text-center shadow-soft-sm">
            <Newspaper className="mx-auto mb-3 h-12 w-12 text-slate-200" />
            <p className="text-slate-500">
              {locale === "vi" ? "Chưa có bài viết nào." : "No articles yet."}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredArticles.map((article, idx) => (
              <motion.div
                key={article._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-soft-sm"
              >
                {/* Cover */}
                <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {article.coverImage ? (
                    <img src={article.coverImage} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-400">
                      <Newspaper className="h-5 w-5" />
                    </div>
                  )}
                  {article.isFeatured && (
                    <span className="absolute -bottom-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-white">
                      <Star className="h-3 w-3" />
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {locale === "vi" ? article.titleVi : article.titleEn}
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      {article.publishedAt ? formatDate(article.publishedAt) : formatDate(article.createdAt)}
                    </span>
                    <span className="text-slate-300">·</span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Eye className="h-3 w-3" />
                      {article.views}
                    </span>
                    {article.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <span className={cn(
                  "flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium",
                  article.isPublished
                    ? "bg-green-50 text-green-600"
                    : "bg-slate-100 text-slate-500"
                )}>
                  {article.isPublished ? (
                    <><CheckCircle2 className="h-3 w-3" /> {locale === "vi" ? "Đã xuất bản" : "Published"}</>
                  ) : (
                    <><RefreshCw className="h-3 w-3" /> {locale === "vi" ? "Bản nháp" : "Draft"}</>
                  )}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {article.sourceUrl && (
                    <a
                      href={article.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  {!article.isPublished && (
                    <button
                      onClick={() => handleUnpublish(article)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-green-600 transition-colors hover:bg-green-50"
                      title={locale === "vi" ? "Xuất bản" : "Publish"}
                    >
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                  {article.isPublished && (
                    <button
                      onClick={() => handleUnpublish(article)}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-amber-600 transition-colors hover:bg-amber-50"
                      title={locale === "vi" ? "Gỡ xuống" : "Unpublish"}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
