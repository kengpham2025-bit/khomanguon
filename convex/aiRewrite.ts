import { action } from "../_generated/server";
import { v } from "convex/values";

export const scrapeAndRewrite = action({
  args: {
    url: v.string(),
    seoKeywords: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const { api } = await import("@/lib/groq");

    const response = await fetch(args.url);
    const html = await response.text();

    const cheerio = (await import("cheerio")).default;
    const $ = cheerio.load(html);

    const title = $("h1").first().text().trim() || "";
    const content = $("article, .content, main").html() || $("body").html() || "";

    const imgTags: { src: string; alt: string }[] = [];
    $("img").each((_, el) => {
      imgTags.push({
        src: $(el).attr("src") || "",
        alt: $(el).attr("alt") || "",
      });
    });

    const promptVi = `Bạn là một chuyên gia viết bài SEO. Hãy viết lại bài viết sau thành tiếng Việt mới, tự nhiên, chuẩn ngữ pháp. CHÈN ĐẦY ĐỦ các thẻ <img> gốc vào đúng vị trí của chúng trong bài viết mới. Bổ sung các từ khóa SEO: ${args.seoKeywords.join(", ")}. Bài viết gốc:\n\nTiêu đề: ${title}\n\nNội dung: ${content}`;

    const promptEn = `You are an SEO content expert. Rewrite the following article into natural, grammatically correct English. INSERT ALL original <img> tags at their exact positions in the new article. Inject SEO keywords: ${args.seoKeywords.join(", ")}. Original article:\n\nTitle: ${title}\n\nContent: ${content}`;

    const [rewriteVi, rewriteEn] = await Promise.all([
      api.chat.completions.create({
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content: promptVi }],
        max_tokens: 4096,
      }),
      api.chat.completions.create({
        model: "mixtral-8x7b-32768",
        messages: [{ role: "user", content: promptEn }],
        max_tokens: 4096,
      }),
    ]);

    return {
      titleVi: rewriteVi.choices[0]?.message?.content || title,
      titleEn: rewriteEn.choices[0]?.message?.content || title,
      imageUrls: imgTags.map((img) => img.src).filter(Boolean),
    };
  },
});
