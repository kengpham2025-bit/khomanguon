import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative grid min-h-[520px] overflow-hidden lg:grid-cols-2">
          <div className="relative z-10 flex flex-col justify-center bg-gradient-to-br from-[#062a2e] via-[#0d4a52] to-[#0a3d42] px-6 py-16 text-white lg:px-16">
            <p className="font-ui text-sm font-semibold uppercase tracking-widest text-emerald-200/90">Nền tảng</p>
            <h1 className="mt-3 max-w-xl font-heading text-3xl font-bold leading-tight md:text-4xl lg:text-[2.35rem]">
              Chợ mã nguồn, tài khoản MMO &amp; dịch vụ AI được tin dùng
            </h1>
            <p className="mt-4 max-w-lg font-body text-sm leading-relaxed text-slate-200 md:text-base">
              Đăng ký với xác nhận email và Captcha. Người bán duyệt qua admin, KYC CCCD để có tích xanh; chưa KYC vẫn bán
              được nhưng sản phẩm hiển thị cảnh báo đỏ cho người mua.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/dang-ky"
                className="font-ui inline-flex items-center gap-3 rounded-full bg-brand-green px-8 py-4 text-sm font-semibold text-white shadow-lg hover:brightness-110"
              >
                Đăng ký miễn phí
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Link>
              <Link
                href="/dang-nhap"
                className="font-ui inline-flex items-center rounded-full border border-white/30 px-6 py-4 text-sm font-semibold text-white hover:bg-white/10"
              >
                Đăng nhập
              </Link>
            </div>
          </div>
          <div className="relative min-h-[280px] bg-slate-900 lg:min-h-0">
            <Image
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80"
              alt="Thương mại số và logistics"
              fill
              className="object-cover opacity-90"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0d4a52]/80 to-transparent lg:from-[#0d4a52]" />
          </div>
        </section>

        <section className="border-y border-slate-100 bg-white py-10">
          <p className="text-center font-ui text-xs font-semibold uppercase tracking-wider text-slate-400">
            Đối tác / thương hiệu — thêm logo khi bạn triển khai
          </p>
          <div className="mx-auto mt-6 flex max-w-5xl flex-wrap items-center justify-center gap-10 px-4 opacity-40 grayscale">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-8 w-24 rounded bg-slate-200" aria-hidden />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 py-20 text-center">
          <h2 className="font-heading text-3xl font-bold text-slate-900 md:text-4xl">Một nền tảng, mọi nhu cầu số</h2>
          <p className="mx-auto mt-4 max-w-2xl font-body text-slate-600">
            Mã nguồn website, tool, tài khoản game MMO, và dịch vụ liên quan tài khoản AI — quản lý qua admin, menu động,
            không dữ liệu mẫu cố định.
          </p>
          <div className="mt-10 grid gap-6 text-left sm:grid-cols-3">
            {[
              { t: "Mã nguồn", d: "Theme, script, API, template do người bán đăng sau khi được duyệt." },
              { t: "Tài khoản MMO", d: "Gian hàng cho tài khoản game — hiển thị cảnh báo nếu seller chưa KYC." },
              { t: "Dịch vụ AI", d: "Gói dịch vụ tài khoản AI — SEO tối ưu cho domain khomanguon.io.vn." },
            ].map((x) => (
              <div key={x.t} className="rounded-2xl border border-slate-100 bg-slate-50/80 p-6">
                <h3 className="font-heading text-lg font-semibold text-slate-900">{x.t}</h3>
                <p className="mt-2 font-body text-sm text-slate-600">{x.d}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
