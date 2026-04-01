"use client";

import Link from "next/link";
import { SignUp } from "@clerk/nextjs";
import { ArrowLeft, Crosshair, Bot, DollarSign, ShieldCheck } from "lucide-react";

interface RegisterPageProps {
  locale?: "vi" | "en";
}

export function RegisterPage({ locale = "vi" }: RegisterPageProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:relative lg:flex lg:w-1/2 lg:flex-col lg:justify-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1000&h=1200&fit=crop"
            alt="Background"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary-900/90 to-primary-700/80" />
        </div>
        <div className="relative z-10 px-16">
          <div className="mb-8 grid grid-cols-1 gap-3">
            {[
              { icon: Crosshair, text: locale === "vi" ? "Mã nguồn chất lượng cao" : "High-quality Source Codes" },
              { icon: Bot, text: locale === "vi" ? "Tài khoản AI Premium" : "Premium AI Accounts" },
              { icon: DollarSign, text: locale === "vi" ? "Dịch vụ MMO uy tín" : "Trusted MMO Services" },
              { icon: ShieldCheck, text: locale === "vi" ? "Bảo vệ người mua 100%" : "100% Buyer Protection" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-white">
                <item.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{item.text}</span>
              </div>
            ))}
          </div>
          <h3 className="text-3xl font-bold text-white">
            {locale === "vi" ? "Tham gia cùng chúng tôi" : "Join Us Today"}
          </h3>
          <p className="mt-4 text-lg text-white/80">
            {locale === "vi"
              ? "Đăng ký ngay để trải nghiệm thị trường kỹ thuật số tốt nhất"
              : "Sign up now to experience the best digital marketplace"}
          </p>
        </div>
      </div>

      {/* Right Side - Clerk SignUp */}
      <div className="flex flex-1 flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-slate-600 transition-colors hover:text-primary-600"
          >
            <ArrowLeft className="h-4 w-4" />
            {locale === "vi" ? "Quay về trang chủ" : "Back to home"}
          </Link>

          <SignUp
            routing="path"
            path="/register"
            signInUrl="/login"
            afterSignUpUrl="/"
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
    </div>
  );
}
