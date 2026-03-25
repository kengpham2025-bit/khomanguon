"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Eye, EyeOff, X } from "lucide-react";
import { BottomWaves } from "@/components/Waves";
import { BrandLogo } from "@/components/BrandLogo";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export function LoginForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/tai-khoan";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!siteKey) {
      setErr("Thiếu NEXT_PUBLIC_TURNSTILE_SITE_KEY");
      return;
    }
    if (!token) {
      setErr("Vui lòng hoàn thành Captcha");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, turnstileToken: token }),
      });
      const data = (await res.json()) as { error?: string; user?: unknown; ok?: boolean };
      if (!res.ok) {
        setErr(data.error || "Đăng nhập thất bại");
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setErr("Lỗi mạng");
    }
    setLoading(false);
  }

  return (
    <div className="relative min-h-screen wave-bg">
      <Link
        href="/"
        className="absolute right-4 top-4 z-20 rounded-full p-2 font-ui text-slate-400 hover:bg-slate-100"
        aria-label="Đóng"
      >
        <X className="h-5 w-5" />
      </Link>
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col items-center justify-center px-4 pb-40 pt-16">
        <div className="mb-8 flex flex-col items-center text-center">
          <BrandLogo iconSize={44} wordmarkClassName="text-2xl sm:text-3xl" className="justify-center" />
          <h1 className="mt-5 font-heading text-lg font-semibold text-slate-800">Đăng nhập vào tài khoản của bạn</h1>
        </div>

        <form onSubmit={onSubmit} className="w-full space-y-4">
          {err ? <p className="text-center text-sm text-red-600">{err}</p> : null}
          <input
            className="pill-input"
            placeholder="Email đăng nhập"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <div className="relative">
            <input
              className="pill-input pr-12"
              placeholder="Mật khẩu đăng nhập"
              type={show ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
              onClick={() => setShow(!show)}
              aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          <div className="text-right font-ui text-sm">
            <Link href={`/quen-mat-khau?email=${encodeURIComponent(email)}`} className="text-brand-blue hover:underline">
              Quên mật khẩu?
            </Link>
          </div>

          <div className="flex justify-center py-2">
            {siteKey ? (
              <Turnstile siteKey={siteKey} onSuccess={setToken} onExpire={() => setToken("")} />
            ) : (
              <p className="text-xs text-amber-600">Cấu hình Turnstile để bật Captcha</p>
            )}
          </div>

          <button type="submit" disabled={loading} className="pill-btn-primary disabled:opacity-60">
            {loading ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-slate-500">Hoặc đăng nhập với</p>
        <div className="mt-3 flex w-full gap-3">
          <button
            type="button"
            className="flex-1 rounded-full border border-slate-200 py-3 text-sm font-medium text-slate-500 opacity-60"
            disabled
          >
            Facebook
          </button>
          <button
            type="button"
            className="flex-1 rounded-full border border-slate-200 py-3 text-sm font-medium text-slate-500 opacity-60"
            disabled
          >
            Google
          </button>
        </div>
        <p className="mt-6 text-center font-body text-sm text-slate-600">
          Chưa có tài khoản?{" "}
          <Link href="/dang-ky" className="font-semibold text-brand-blue">
            Đăng ký
          </Link>
        </p>
      </div>
      <BottomWaves />
    </div>
  );
}
