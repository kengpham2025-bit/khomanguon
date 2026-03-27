/**
 * Thu thập tiêu đề, đoạn văn bản thô và URL ảnh từ một trang HTML (không dùng thư viện DOM — chạy được trên Edge).
 */
export async function crawlArticleFromUrl(url: string): Promise<{
  title: string;
  plainText: string;
  imageUrls: string[];
}> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; KhoMaNguonBot/1.0; +https://khomanguon.io.vn)",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`Không tải được trang (${res.status})`);
  }
  const html = await res.text();
  const base = new URL(url);

  const ogTitle = html.match(/property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
  const twTitle = html.match(/name=["']twitter:title["'][^>]*content=["']([^"']+)["']/i);
  const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  const title = decodeEntities(
    (ogTitle?.[1] || twTitle?.[1] || titleMatch?.[1] || "Bài viết").replace(/\s+/g, " ").trim(),
  );

  const article = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  const bodyHtml = article?.[1] || main?.[1] || html;

  const imageUrls: string[] = [];
  const seen = new Set<string>();
  for (const m of bodyHtml.matchAll(/<img[^>]+src=["']([^"']+)["']/gi)) {
    const resolved = resolveImgUrl(m[1].trim(), base);
    if (resolved && !seen.has(resolved)) {
      seen.add(resolved);
      imageUrls.push(resolved);
    }
    if (imageUrls.length >= 24) break;
  }

  const stripped = bodyHtml
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 14000);

  return { title, plainText: stripped, imageUrls };
}

function decodeEntities(s: string) {
  return s
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function resolveImgUrl(src: string, base: URL): string | null {
  if (!src || src.startsWith("data:")) return null;
  try {
    if (src.startsWith("//")) return new URL(`https:${src}`).href;
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    return new URL(src, base).href;
  } catch {
    return null;
  }
}
