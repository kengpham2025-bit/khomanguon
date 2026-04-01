"use client";

import Link from "next/link";
import { SignIn } from "@clerk/nextjs";
import { ArrowLeft, Check } from "lucide-react";

interface LoginPageProps {
  locale?: "vi" | "en";
}

export function LoginPage({ locale = "vi" }: LoginPageProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Clerk SignIn */}
      <div className="flex flex-1 flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-primary-600"
          >
            <ArrowLeft className="h-4 w-4" />
            {locale === "vi" ? "Quay về trang chủ" : "Back to home"}
          </Link>

          <SignIn
            routing="path"
            path="/login"
            signUpUrl="/register"
            afterSignInUrl="/"
            redirectUrl="/"
            appearance={{
              elements: {
                rootBox: "mx-auto w-full",
                card: "rounded-2xl border border-slate-100 shadow-soft-sm",
                headerTitle: "text-2xl font-bold text-slate-900",
                headerSubtitle: "text-sm text-slate-500",
                formButtonPrimary: "rounded-full bg-primary-600 text-white hover:bg-primary-700 font-semibold",
                formFieldInput: "rounded-full border border-slate-200 focus:border-primary-500",
                footerActionLink: "text-primary-600 font-medium hover:text-primary-700",
              },
            }}
          />
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 lg:flex-col lg:justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=1000&h=1200&fit=crop"
            alt="Background"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 to-primary-700/80" />
        </div>
        <div className="relative z-10 px-16">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3 className="text-3xl font-bold text-white">
            {locale === "vi" ? "An toàn & Bảo mật" : "Safe & Secure"}
          </h3>
          <p className="mt-4 text-lg text-white/80">
            {locale === "vi"
              ? "Bảo vệ thông tin của bạn với công nghệ mã hóa tiên tiến nhất"
              : "Protect your information with the most advanced encryption technology"}
          </p>
          <div className="mt-8 space-y-3">
            {[
              locale === "vi" ? "Đăng nhập bằng Google, GitHub, email" : "Sign in with Google, GitHub, email",
              locale === "vi" ? "Mã hóa dữ liệu 256-bit" : "256-bit data encryption",
              locale === "vi" ? "Xác minh 2 yếu tố (2FA)" : "Two-factor authentication (2FA)",
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white/90">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20"><Check className="h-3.5 w-3.5" /></div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
