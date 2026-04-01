import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: {
    default: "KHOMANGUON.IO.VN - Premium Digital Marketplace",
    template: "%s | KHOMANGUON.IO.VN",
  },
  description: "Premium Digital Marketplace for Source Codes, AI Accounts, Emails, Social Media Accounts, and MMO Services",
  keywords: ["digital marketplace", "source code", "AI accounts", "MMO services", "Vietnam"],
  authors: [{ name: "KHOMANGUON.IO.VN" }],
  openGraph: {
    type: "website",
    locale: "vi_VN",
    alternateLocale: "en_US",
    siteName: "KHOMANGUON.IO.VN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={inter.variable}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-slate-50 font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
