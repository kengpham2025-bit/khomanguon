import type { MetadataRoute } from "next";

const base = "https://khomanguon.io.vn";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/dang-nhap",
    "/dang-ky",
    "/cua-hang",
    "/tin-tuc",
    "/dang-ky-ban-hang",
    "/rut-tien",
    "/xac-minh-cccd",
    "/tai-khoan",
  ];
  const now = new Date();
  return paths.map((p) => ({
    url: `${base}${p || "/"}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.7,
  }));
}
