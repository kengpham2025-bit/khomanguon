"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { ChevronLeft } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { BottomWaves } from "@/components/Waves";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

const provinces = ["Hà Nội", "TP.HCM", "Đà Nẵng", "Cần Thơ", "Khác"];
const interests = ["Mã nguồn", "Tài khoản MMO", "Dịch vụ AI", "Khác"];

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [storeName, setStoreName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [province, setProvince] = useState("");
  const [interest, setInterest] = useState("");
  const [agree, setAgree] = useState(false);
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      name.length >= 2 &&
      email.includes("@") &&
      password.length >= 8 &&
      agree &&
      Boolean(token || !siteKey)
    );
  }, [name, email, password, agree, token]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setOkMsg("");
    if (!siteKey) {
      setErr("Thiếu NEXT_PUBLIC_TURNSTILE_SITE_KEY");
      return;
    }
    if (!token) {
      setErr("Vui lòng hoàn thành Captcha");
      return;
    }
    if (!agree) {
      setErr("Vui lòng đồng ý điều khoản");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          password,
          phone: phone || undefined,
          turnstileToken: token,
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string; ok?: boolean };
      if (!res.ok) {
        setErr(data.error || "Đăng ký thất bại");
        setLoading(false);
        return;
      }
      setOkMsg(data.message || "Kiểm tra email để xác nhận.");
      setTimeout(() => router.push("/dang-nhap"), 2500);
    } catch {
      setErr("Lỗi mạng");
    }
    setLoading(false);
  }

  return (
    <div className="relative min-h-screen wave-bg">
      <Link
        href="/"
        className="absolute left-4 top-4 z-20 inline-flex items-center gap-1 rounded-full px-3 py-2 font-ui text-sm font-medium text-slate-600 transition hover:bg-white/80 hover:text-brand-blue"
      >
        <ChevronLeft className="h-4 w-4" />
        Về trang chủ
      </Link>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 pb-36 pt-20 sm:px-6">
        <div className="rounded-[1.75rem] border border-slate-200/90 bg-white/95 p-8 shadow-[0_20px_50px_-12px_rgba(15,45,74,0.12)] backdrop-blur-sm sm:p-10">
          <div className="flex flex-col items-center text-center">
            <BrandLogo iconSize={48} wordmarkClassName="text-2xl sm:text-3xl" className="justify-center" />
            <h1 className="mt-6 font-heading text-2xl font-bold tracking-tight text-slate-900 sm:text-[1.65rem]">
              Tạo tài khoản thành viên
            </h1>
            <p className="mt-3 max-w-md font-body text-sm leading-relaxed text-slate-600">
              Đăng ký <span className="font-semibold text-slate-800">miễn phí</span>, không giới hạn thời gian dùng. Sau
              khi gửi form, bạn sẽ nhận email xác minh (và có thể dùng OTP quên mật khẩu khi cần). Captcha giúp chặn bot.
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {err ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm text-red-700">{err}</p> : null}
            {okMsg ? (
              <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-center text-sm text-emerald-800">{okMsg}</p>
            ) : null}

            <input
              className="pill-input"
              placeholder="Họ tên của bạn"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                className="pill-input"
                placeholder="Tên cửa hàng / hiển thị (tuỳ chọn)"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
              <input
                className="pill-input"
                placeholder="Số điện thoại (tuỳ chọn)"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <input
              className="pill-input"
              type="email"
              placeholder="Email đăng nhập"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="pill-input"
              type="password"
              placeholder="Mật khẩu (tối thiểu 8 ký tự)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <select
                className="pill-input bg-white"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                required
              >
                <option value="">Tỉnh / thành phố</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
              <select
                className="pill-input bg-white"
                value={interest}
                onChange={(e) => setInterest(e.target.value)}
                required
              >
                <option value="">Bạn quan tâm</option>
                {interests.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 px-4 py-3 text-xs text-slate-600">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-brand-green focus:ring-brand-blue/30"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
              />
              <span className="text-left leading-relaxed">
                Tôi đã đọc và đồng ý với{" "}
                <span className="font-medium text-brand-blue">Chính sách bảo vệ dữ liệu &amp; Quy định sử dụng</span> của
                Kho Mã Nguồn.
              </span>
            </label>

            <div className="flex justify-center py-1">
              {siteKey ? (
                <Turnstile siteKey={siteKey} onSuccess={setToken} onExpire={() => setToken("")} />
              ) : (
                <p className="text-xs text-amber-600">Cấu hình Turnstile để bật Captcha</p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit || loading}
              className="pill-btn-primary disabled:cursor-not-allowed disabled:opacity-45"
            >
              {loading ? "Đang gửi…" : "Hoàn tất đăng ký"}
            </button>
          </form>

          <div className="relative my-8 text-center text-xs text-slate-400">
            <span className="relative z-10 bg-white/95 px-3">hoặc</span>
            <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-200" aria-hidden />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50/50 py-3 text-sm font-medium text-slate-400"
              disabled
            >
              Facebook
            </button>
            <button
              type="button"
              className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50/50 py-3 text-sm font-medium text-slate-400"
              disabled
            >
              Google
            </button>
          </div>

          <p className="mt-8 text-center font-body text-sm text-slate-600">
            Đã có tài khoản?{" "}
            <Link href="/dang-nhap" className="font-semibold text-brand-blue hover:underline">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
      <BottomWaves />
    </div>
  );
}
