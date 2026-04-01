import { AiNewsBloggerClient } from "@/components/admin/AiNewsBloggerClient";

export const dynamic = "force-dynamic";

interface AdminNewsPageProps {
  searchParams: { locale?: string };
}

const demoArticles = [
  {
    _id: "article-1",
    titleVi: "ChatGPT-5 được OpenAI công bố: Tính năng vượt trội",
    titleEn: "OpenAI announces ChatGPT-5: Revolutionary features",
    slugVi: "chatgpt-5-openai-cong-bo",
    slugEn: "chatgpt-5-openai-announced",
    excerptVi: "OpenAI vừa chính thức công bố ChatGPT-5 với khả năng suy luận vượt trội.",
    excerptEn: "OpenAI officially announced ChatGPT-5 with superior reasoning capabilities.",
    contentVi: "",
    contentEn: "",
    sourceUrl: "https://techcrunch.com/example",
    coverImage: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&q=80",
    tags: ["AI", "ChatGPT", "OpenAI", "Công nghệ"],
    isPublished: true,
    isFeatured: true,
    publishedAt: Date.now() - 86400000,
    createdAt: Date.now() - 86400000,
    views: 3420,
  },
  {
    _id: "article-2",
    titleVi: "Top 10 Tool MMO miễn phí tốt nhất 2024",
    titleEn: "Top 10 Best Free MMO Tools 2024",
    slugVi: "top-10-tool-mmo-mien-phi-2024",
    slugEn: "top-10-free-mmo-tools-2024",
    excerptVi: "Danh sách top 10 công cụ MMO miễn phí tốt nhất.",
    excerptEn: "The top 10 best free MMO tools.",
    contentVi: "",
    contentEn: "",
    coverImage: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&q=80",
    tags: ["MMO", "Tool", "Free"],
    isPublished: true,
    isFeatured: false,
    publishedAt: Date.now() - 86400000 * 3,
    createdAt: Date.now() - 86400000 * 3,
    views: 1856,
  },
  {
    _id: "article-3",
    titleVi: "Cách tạo tài khoản Claude AI",
    titleEn: "How to create Claude AI accounts",
    slugVi: "cach-tao-claude-ai",
    slugEn: "how-to-create-claude-ai",
    excerptVi: "Hướng dẫn chi tiết cách tạo tài khoản Claude AI.",
    excerptEn: "Detailed guide on creating Claude AI accounts.",
    contentVi: "",
    contentEn: "",
    coverImage: "https://images.unsplash.com/photo-1655720828018-edd2daec9349?w=600&q=80",
    tags: ["Claude", "AI", "Hướng dẫn"],
    isPublished: false,
    isFeatured: false,
    publishedAt: undefined,
    createdAt: Date.now() - 86400000 * 5,
    views: 0,
  },
];

export default function AdminNewsPage({ searchParams }: AdminNewsPageProps) {
  const locale = (searchParams.locale === "en" ? "en" : "vi") as "vi" | "en";
  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">
          {locale === "vi" ? "AI News Auto-Blogger" : "AI News Auto-Blogger"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          {locale === "vi"
            ? "Tự động scrape và viết lại bài viết bằng AI (Groq API)"
            : "Auto-scrape and rewrite articles using AI (Groq API)"}
        </p>
      </div>
      <AiNewsBloggerClient articles={demoArticles} locale={locale} />
    </>
  );
}
