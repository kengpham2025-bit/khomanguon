"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, X } from "lucide-react";
import { BottomWaves } from "@/components/Waves";
import { BrandLogo } from "@/components/BrandLogo";

type Step = "email" | "otp";

export function ForgotPasswordForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const emailParam = sp.get("email") || "";

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  async function sendOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean; message?: string };
      if (!res.ok) {
        setErr(data.error || "Gửi mã thất bại");
        return;
      }
      setSuccess(data.message || "Đã gửi mã OTP qua email.");
      setStep("otp");
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) { clearInterval(timer); return 0; }
          return c - 1;
        });
      }, 1000);
    } catch {
      setErr("Lỗi mạng");
    }
    setLoading(false);
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (otp.length !== 6) { setErr("Mã OTP gồm 6 chữ số"); return; }
    if (password.length < 8) { setErr("Mật khẩu phải từ 8 ký tự"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setErr(data.error || "Xác minh thất bại");
        return;
      }
      setSuccess("Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập…");
      setTimeout(() => router.push("/dang-nhap"), 2000);
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
          <h1 className="mt-5 font-heading text-lg font-semibold text-slate-800">
            {step === "email" ? "Khôi phục mật khẩu" : "Nhập mã OTP"}
          </h1>
        </div>

        {step === "email" ? (
          <form onSubmit={sendOtp} className="w-full space-y-4">
            {err ? <p className="text-center text-sm text-red-600">{err}</p> : null}
            {success ? <p className="text-center text-sm text-green-600">{success}</p> : null}
            <input
              className="pill-input"
              placeholder="Email đã đăng ký"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={loading} className="pill-btn-primary disabled:opacity-60">
              {loading ? "Đang gửi mã…" : "Gửi mã OTP"}
            </button>
          </form>
        ) : (
          <form onSubmit={resetPassword} className="w-full space-y-4">
            {err ? <p className="text-center text-sm text-red-600">{err}</p> : null}
            {success ? <p className="text-center text-sm text-green-600">{success}</p> : null}
            <p className="text-center font-body text-sm text-slate-500">
              Mã OTP đã được gửi đến <strong>{email}</strong>.
            </p>
            <div>
              <input
                className="pill-input text-center tracking-widest"
                placeholder="Nhập mã OTP (6 chữ số)"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                required
              />
              <p className="mt-1 text-center font-ui text-xs text-slate-400">
                {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Không nhận được mã?"}
                {countdown === 0 && (
                  <button
                    type="button"
                    className="ml-1 text-brand-blue hover:underline"
                    onClick={async (e) => {
                      (e.target as HTMLButtonElement).textContent = "Đang gửi…";
                      await fetch("/api/auth/forgot-password", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email }),
                      });
                      setCountdown(60);
                      const timer = setInterval(() => {
                        setCountdown((c) => {
                          if (c <= 1) { clearInterval(timer); return 0; }
                          return c - 1;
                        });
                      }, 1000);
                      (e.target as HTMLButtonElement).textContent = "Gửi lại";
                    }}
                  >
                    Gửi lại
                  </button>
                )}
              </p>
            </div>
            <div className="relative">
              <input
                className="pill-input pr-12"
                placeholder="Mật khẩu mới (từ 8 ký tự)"
                type={showPw ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                onClick={() => setShowPw(!showPw)}
                aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            <button type="submit" disabled={loading} className="pill-btn-primary disabled:opacity-60">
              {loading ? "Đang xử lý…" : "Đặt lại mật khẩu"}
            </button>
            <button
              type="button"
              className="w-full text-center text-sm text-slate-500 hover:text-brand-blue"
              onClick={() => { setStep("email"); setOtp(""); setPassword(""); setErr(""); setSuccess(""); }}
            >
              ← Quay lại
            </button>
          </form>
        )}

        <p className="mt-8 text-center font-body text-sm text-slate-600">
          Nhớ mật khẩu rồi?{" "}
          <Link href="/dang-nhap" className="font-semibold text-brand-blue">
            Đăng nhập
          </Link>
        </p>
      </div>
      <BottomWaves />
    </div>
  );
}
