import type { Metadata, Viewport } from "next";
import { AppProviders } from "@/components/providers/AppProviders";
import { AuthModalProvider } from "@/components/AuthModal";
import localFont from "next/font/local";
import "./globals.css";

const fontHeading = localFont({
  src: [
    { path: "../../public/media/1a634e73dfeff02c-s.woff2", weight: "400" },
    { path: "../../public/media/1a634e73dfeff02c-s.woff2", weight: "500" },
    { path: "../../public/media/1a634e73dfeff02c-s.woff2", weight: "600" },
    { path: "../../public/media/1a634e73dfeff02c-s.woff2", weight: "700" },
    { path: "../../public/media/1a634e73dfeff02c-s.woff2", weight: "800" },
  ],
  variable: "--font-heading",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const fontBody = localFont({
  src: [
    { path: "../../public/media/1e41be92c43b3255-s.p.woff2", weight: "300" },
    { path: "../../public/media/1e41be92c43b3255-s.p.woff2", weight: "400" },
    { path: "../../public/media/1e41be92c43b3255-s.p.woff2", weight: "500" },
    { path: "../../public/media/1e41be92c43b3255-s.p.woff2", weight: "600" },
    { path: "../../public/media/1e41be92c43b3255-s.p.woff2", weight: "700" },
  ],
  variable: "--font-body",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const fontUi = localFont({
  src: [
    { path: "../../public/media/4120b0a488381b31-s.p.woff2", weight: "300" },
    { path: "../../public/media/4120b0a488381b31-s.p.woff2", weight: "400" },
    { path: "../../public/media/4120b0a488381b31-s.p.woff2", weight: "500" },
    { path: "../../public/media/4120b0a488381b31-s.p.woff2", weight: "600" },
    { path: "../../public/media/4120b0a488381b31-s.p.woff2", weight: "700" },
    { path: "../../public/media/4120b0a488381b31-s.p.woff2", weight: "800" },
  ],
  variable: "--font-ui",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});

const fontBrand = localFont({
  src: [
    { path: "../../public/media/62c97acc3aa63787-s.p.woff2", weight: "400" },
    { path: "../../public/media/62c97acc3aa63787-s.p.woff2", weight: "500" },
    { path: "../../public/media/62c97acc3aa63787-s.p.woff2", weight: "600" },
    { path: "../../public/media/62c97acc3aa63787-s.p.woff2", weight: "700" },
    { path: "../../public/media/62c97acc3aa63787-s.p.woff2", weight: "800" },
  ],
  variable: "--font-brand",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
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
  icons: {
    icon: [{ url: "/brand/mark.svg", type: "image/svg+xml" }],
    apple: "/brand/mark.svg",
  },
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
  themeColor: "#0d3d45",
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

  const fontVars = `${fontHeading.variable} ${fontBody.variable} ${fontUi.variable} ${fontBrand.variable}`;

  return (
    <html lang="vi" className={fontVars}>
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        <AppProviders>
          <AuthModalProvider>{children}</AuthModalProvider>
        </AppProviders>
      </body>
    </html>
  );
}
