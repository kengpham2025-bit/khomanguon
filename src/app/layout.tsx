import type { Metadata, Viewport } from "next";
import { Inter, Manrope, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

/** Tiêu đề section, hero — hình học, hiện đại */
const fontHeading = Plus_Jakarta_Sans({
  subsets: ["latin", "vietnamese"],
  variable: "--font-heading",
  display: "swap",
});

/** Nội dung bài viết, mô tả dài */
const fontBody = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-body",
  display: "swap",
});

/** Menu, nút, nhãn, form — bo tròn, dễ đọc */
const fontUi = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-ui",
  display: "swap",
});

const siteUrl = "https://khomanguon.io.vn";
const title = "Kho Mã Nguồn — Mã nguồn, tài khoản MMO & dịch vụ AI";
const description =
  "Chợ mã nguồn, tài khoản game MMO và dịch vụ tài khoản AI uy tín. Đăng ký bán hàng, KYC CCCD, rút tiền an toàn với OTP email.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s | Kho Mã Nguồn",
  },
  description,
  keywords: [
    "mã nguồn",
    "source code",
    "tài khoản MMO",
    "game account",
    "AI account",
    "khomanguon",
  ],
  authors: [{ name: "Kho Mã Nguồn" }],
  creator: "Kho Mã Nguồn",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteUrl,
    siteName: "Kho Mã Nguồn",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: siteUrl },
};

export const viewport: Viewport = {
  themeColor: "#0d4a52",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Kho Mã Nguồn",
    url: siteUrl,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/cua-hang?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const fontVars = `${fontHeading.variable} ${fontBody.variable} ${fontUi.variable}`;

  return (
    <html lang="vi" className={fontVars}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
