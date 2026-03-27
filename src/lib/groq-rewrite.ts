import { z } from "zod";

const responseSchema = z.object({
  title: z.string().min(1),
  excerpt: z.string().min(1),
  body_html: z.string().min(1),
  keywords: z.array(z.string()).default([]),
});

export type RewrittenArticle = z.infer<typeof responseSchema>;

export async function rewriteArticleWithGroq(params: {
  apiKey: string;
  sourceTitle: string;
  plainText: string;
  imageUrls: string[];
  sourceUrl: string;
}): Promise<RewrittenArticle> {
  const { apiKey, sourceTitle, plainText, imageUrls, sourceUrl } = params;
  const imageList =
    imageUrls.length > 0
      ? imageUrls.map((u, i) => `${i + 1}. ${u}`).join("\n")
      : "(Không phát hiện ảnh — chỉ dùng văn bản.)";

  const prompt = `Bạn là biên tập nội dung và SEO cho website thương mại "Kho Mã Nguồn" (khomanguon.io.vn).

Liên kết nguồn: ${sourceUrl}
Tiêu đề gốc: ${sourceTitle}

Nội dung đã bỏ HTML (để tham khảo, có thể lẫn quảng cáo/menu — hãy bỏ qua phần không phải bài viết):
${plainText}

Danh sách URL ảnh từ bài gốc. BẮT BUỘC: trong body_html, mỗi ảnh dùng đúng một URL từ danh sách, trong thẻ <img src="..." alt="..." loading="lazy" />. Không đổi domain, path hay query của URL ảnh.
${imageList}

Yêu cầu:
1) Viết lại bằng tiếng Việt tự nhiên, mạch lạc, phù hợp đọc trên web; không copy nguyên văn dài.
2) body_html là HTML hợp lệ: p, h2, h3, ul/li khi cần; có thể chèn ảnh hợp lý theo ngữ cảnh.
3) excerpt: 1–2 câu, tối đa 240 ký tự.
4) keywords: 5–12 từ khóa SEO tiếng Việt (mảng).

Trả về đúng một JSON object, không markdown, các khóa: title, excerpt, body_html, keywords.`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.35,
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Groq: ${res.status} — ${t.slice(0, 400)}`);
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string | null } }[];
  };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("Groq không trả nội dung");

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Phản hồi AI không phải JSON hợp lệ");
  }

  const out = responseSchema.safeParse(parsed);
  if (!out.success) {
    throw new Error("Cấu trúc JSON từ AI không đúng");
  }
  const rewritten = out.data;
  if (rewritten.keywords.length === 0) {
    rewritten.keywords = rewritten.title
      .split(/\s+/)
      .filter((w) => w.length > 2)
      .slice(0, 8);
  }
  return rewritten;
}
