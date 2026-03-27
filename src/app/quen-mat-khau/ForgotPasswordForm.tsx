"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { IconX, IconEye, IconEyeOff } from "@/components/Icons";
import { BottomWaves } from "@/components/Waves";
import { SiteLogo } from "@/components/SiteLogo";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { notifyError, notifySuccess } from "@/lib/notify";
import { useAuthModal } from "@/components/AuthModal";

type Step = "email" | "otp";

export function ForgotPasswordForm() {
  const router = useRouter();
  const { open: openAuth } = useAuthModal();
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
        const m = data.error || "Gửi mã thất bại";
        setErr(m); notifyError(m); return;
      }
      const sent = data.message || "Đã gửi mã OTP qua email.";
      setSuccess(sent);
      notifySuccess("Đã gửi mã", sent);
      setStep("otp");
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((c) => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
      }, 1000);
    } catch {
      const m = "Lỗi mạng"; setErr(m); notifyError(m);
    }
    setLoading(false);
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (otp.length !== 6) { const m = "Mã OTP gồm 6 chữ số"; setErr(m); notifyError(m); return; }
    if (password.length < 8) { const m = "Mật khẩu phải từ 8 ký tự"; setErr(m); notifyError(m); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, password }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) { const m = data.error || "Xác minh thất bại"; setErr(m); notifyError(m); return; }
      const done = "Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập…";
      setSuccess(done);
      notifySuccess("Đổi mật khẩu thành công", "Đang chuyển đến trang đăng nhập…");
      setTimeout(() => router.push("/dang-nhap"), 2000);
    } catch { const m = "Lỗi mạng"; setErr(m); notifyError(m); }
    setLoading(false);
  }

  return (
    <>
      {loading && <LoadingOverlay label="Đang xử lý…" />}
      <div className="auth-page">
      <Link href="/" className="close-btn" aria-label="Đóng">
        <IconX size={20} />
      </Link>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <SiteLogo height={48} className="justify-center" />
            <h1 className="auth-title">
              {step === "email" ? "Khôi phục mật khẩu" : "Nhập mã OTP"}
            </h1>
          </div>

          {step === "email" ? (
            <form onSubmit={sendOtp} className="form-space" style={{ marginTop: "var(--space-8)" }}>
              {err ? <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--error-text)" }}>{err}</p> : null}
              {success ? <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--success-text)" }}>{success}</p> : null}
              <input className="input" placeholder="Email đã đăng ký" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <button type="submit" disabled={loading} className="pill-btn-primary">{loading ? "Đang gửi mã…" : "Gửi mã OTP"}</button>
            </form>
          ) : (
            <form onSubmit={resetPassword} className="form-space" style={{ marginTop: "var(--space-8)" }}>
              {err ? <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--error-text)" }}>{err}</p> : null}
              {success ? <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--success-text)" }}>{success}</p> : null}
              <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>
                Mã OTP đã được gửi đến <strong style={{ color: "var(--text-primary)" }}>{email}</strong>.
              </p>
              <div>
                <input
                  className="input"
                  style={{ textAlign: "center", letterSpacing: "0.2em" }}
                  placeholder="Nhập mã OTP (6 chữ số)"
                  maxLength={6}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="one-time-code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  required
                />
                <p style={{ marginTop: "var(--space-1)", textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                  {countdown > 0 ? `Gửi lại sau ${countdown}s` : "Không nhận được mã?"}
                  {countdown === 0 && (
                    <button
                      type="button"
                      className="link-brand"
                      style={{ marginLeft: "var(--space-1)", fontSize: "0.75rem" }}
                      onClick={async (e) => {
                        (e.target as HTMLButtonElement).textContent = "Đang gửi…";
                        await fetch("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
                        setCountdown(60);
                        const timer = setInterval(() => { setCountdown((c) => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; }); }, 1000);
                        (e.target as HTMLButtonElement).textContent = "Gửi lại";
                      }}
                    >
                      Gửi lại
                    </button>
                  )}
                </p>
              </div>
              <div className="input-password-wrap">
                <input
                  className="input"
                  style={{ paddingRight: "3rem" }}
                  placeholder="Mật khẩu mới (từ 8 ký tự)"
                  type={showPw ? "text" : "password"}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button type="button" className="password-toggle" onClick={() => setShowPw(!showPw)} aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                  {showPw ? <IconEyeOff size={20} /> : <IconEye size={20} />}
                </button>
              </div>
              <button type="submit" disabled={loading} className="pill-btn-primary">{loading ? "Đang xử lý…" : "Đặt lại mật khẩu"}</button>
              <button
                type="button"
                style={{ width: "100%", textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)", background: "none", border: "none", cursor: "pointer" }}
                onClick={() => { setStep("email"); setOtp(""); setPassword(""); setErr(""); setSuccess(""); }}
              >
                ← Quay lại
              </button>
            </form>
          )}

          <p style={{ marginTop: "var(--space-8)", textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Nhớ mật khẩu rồi?{" "}
            <button type="button" className="link-brand" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }} onClick={() => openAuth("login")}>Đăng nhập</button>
          </p>
        </div>
      </div>
      <BottomWaves />
    </div>
    </>
  );
}
