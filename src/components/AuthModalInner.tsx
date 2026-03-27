"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { CaptchaInput } from "@/components/CaptchaInput";
import { SiteLogo } from "@/components/SiteLogo";
import { notifyError, notifySuccess } from "@/lib/notify";

type OauthConfig = { google: boolean; facebook: boolean };
type Mode = "login" | "register" | "forgot";
type ForgotStep = "email" | "otp";

export function AuthModalInner({ defaultMode, onClose }: { defaultMode: Mode; onClose: () => void }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>(defaultMode === "forgot" ? "login" : defaultMode);
  const [oauthConfig, setOauthConfig] = useState<OauthConfig>({ google: false, facebook: false });

  // Login fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [loginErr, setLoginErr] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regAgree, setRegAgree] = useState(false);
  const [regErr, setRegErr] = useState("");
  const [regOk, setRegOk] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Forgot password fields
  const [fpEmail, setFpEmail] = useState("");
  const [fpStep, setFpStep] = useState<ForgotStep>("email");
  const [fpOtp, setFpOtp] = useState("");
  const [fpPassword, setFpPassword] = useState("");
  const [fpShowPwd, setFpShowPwd] = useState(false);
  const [fpErr, setFpErr] = useState("");
  const [fpSuccess, setFpSuccess] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpCountdown, setFpCountdown] = useState(0);

  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCaptchaToken("");
  }, [mode]);

  useEffect(() => {
    fetch("/api/auth/oauth/config")
      .then((r) => r.json() as Promise<OauthConfig>)
      .then(setOauthConfig)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function openOAuth(provider: "google" | "facebook") {
    const url =
      provider === "google"
        ? `/api/auth/oauth/google?next=/tai-khoan`
        : `/api/auth/oauth/facebook?next=/tai-khoan`;
    window.open(url, "_blank", "noopener,noreferrer");
    onClose();
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoginErr("");
    if (!captchaToken) {
      setLoginErr("Vui lòng hoàn thành mã bảo vệ");
      return;
    }
    setLoginLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, captchaToken }),
      });
      const data = (await res.json()) as { error?: string; ok?: boolean };
      if (!res.ok) {
        setLoginErr(data.error || "Đăng nhập thất bại");
        notifyError(data.error || "Đăng nhập thất bại");
        setLoginLoading(false);
        return;
      }
      notifySuccess("Đăng nhập thành công");
      onClose();
      router.push("/tai-khoan");
      router.refresh();
    } catch {
      setLoginErr("Lỗi mạng");
      notifyError("Lỗi mạng");
    }
    setLoginLoading(false);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setRegErr("");
    setRegOk("");
    if (!captchaToken) {
      setRegErr("Vui lòng hoàn thành mã bảo vệ");
      return;
    }
    if (!regAgree) { setRegErr("Vui lòng đồng ý điều khoản"); return; }
    setRegLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
          phone: regPhone || undefined,
          captchaToken,
        }),
      });
      const data = (await res.json()) as { error?: string; message?: string; ok?: boolean };
      if (!res.ok) {
        setRegErr(data.error || "Đăng ký thất bại");
        notifyError(data.error || "Đăng ký thất bại");
        setRegLoading(false);
        return;
      }
      const msg = data.message || "Kiểm tra email để xác nhận.";
      setRegOk(msg);
      notifySuccess("Đăng ký thành công", msg);
      setMode("login");
    } catch {
      setRegErr("Lỗi mạng");
      notifyError("Lỗi mạng");
    }
    setRegLoading(false);
  }

  async function handleForgotSend(e: React.FormEvent) {
    e.preventDefault();
    setFpErr("");
    setFpSuccess("");
    setFpLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) {
        setFpErr(data.error || "Gửi mã thất bại");
        setFpLoading(false);
        return;
      }
      setFpSuccess(data.message || "Đã gửi mã OTP qua email.");
      setFpStep("otp");
      setFpCountdown(60);
      const timer = setInterval(() => {
        setFpCountdown((c) => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
      }, 1000);
    } catch {
      setFpErr("Lỗi mạng");
    }
    setFpLoading(false);
  }

  async function handleForgotResend() {
    setFpErr("");
    setFpLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail }),
      });
      const data = (await res.json()) as { error?: string; message?: string };
      if (!res.ok) { setFpErr(data.error || "Gửi lại thất bại"); return; }
      setFpSuccess(data.message || "Đã gửi lại mã OTP.");
      setFpCountdown(60);
      const timer = setInterval(() => {
        setFpCountdown((c) => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
      }, 1000);
    } catch {
      setFpErr("Lỗi mạng");
    }
    setFpLoading(false);
  }

  async function handleForgotReset(e: React.FormEvent) {
    e.preventDefault();
    setFpErr("");
    if (fpOtp.length !== 6) { setFpErr("Mã OTP gồm 6 chữ số"); return; }
    if (fpPassword.length < 8) { setFpErr("Mật khẩu phải từ 8 ký tự"); return; }
    setFpLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: fpEmail, otp: fpOtp, password: fpPassword }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) { setFpErr(data.error || "Xác minh thất bại"); setFpLoading(false); return; }
      setFpSuccess("Đặt lại mật khẩu thành công! Đang chuyển đến đăng nhập…");
      setTimeout(() => { setMode("login"); setFpSuccess(""); }, 2000);
    } catch {
      setFpErr("Lỗi mạng");
    }
    setFpLoading(false);
  }

  function resetForgot() {
    setFpStep("email");
    setFpOtp("");
    setFpPassword("");
    setFpErr("");
    setFpSuccess("");
  }

  const humanGateOk = Boolean(captchaToken);
  const canRegister =
    regName.length >= 2 &&
    regEmail.includes("@") &&
    regPassword.length >= 8 &&
    regAgree &&
    humanGateOk;

  return (
    <div
      className="auth-modal-overlay"
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Đăng nhập / Đăng ký"
    >
      <div className="auth-modal-card">
        {/* Left brand panel */}
        <div className="auth-modal-brand">
          <div className="auth-modal-brand-content">
            <SiteLogo height={52} showTagline={false} variant="dark" />
            <p className="auth-modal-brand-desc">
              Mua bán mã nguồn, tài khoản MMO &amp; dịch vụ AI — an toàn, nhanh chóng, uy tín.
            </p>
            <div className="auth-modal-features">
              {["Mã nguồn chất lượng cao", "Thanh toán qua PayOS", "Hỗ trợ 24/7", "Bảo mật tuyệt đối"].map((f) => (
                <div key={f} className="auth-modal-feature-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  {f}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="auth-modal-form-panel">
          <button type="button" className="auth-modal-close" onClick={onClose} aria-label="Đóng">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          {/* OAuth */}
          {(oauthConfig.google || oauthConfig.facebook) ? (
            <div className="auth-modal-oauth">
              {oauthConfig.google && (
                <button type="button" className="auth-modal-oauth-btn auth-oauth-google" onClick={() => openOAuth("google")}>
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Tiếp tục với Google
                </button>
              )}
              {oauthConfig.facebook && (
                <button type="button" className="auth-modal-oauth-btn auth-oauth-facebook" onClick={() => openOAuth("facebook")}>
                  <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
                  </svg>
                  Tiếp tục với Facebook
                </button>
              )}
            </div>
          ) : null}

          {/* Divider */}
          <div className="auth-modal-divider"><span>hoặc dùng email</span></div>

          {/* Tabs */}
          <div className="auth-modal-tabs" role="tablist">
            <button type="button" role="tab" className={`auth-modal-tab ${mode === "login" ? "auth-modal-tab-active" : ""}`} onClick={() => { setMode("login"); resetForgot(); }} aria-selected={mode === "login"}>
              Đăng nhập
            </button>
            <button type="button" role="tab" className={`auth-modal-tab ${mode === "register" ? "auth-modal-tab-active" : ""}`} onClick={() => { setMode("register"); resetForgot(); }} aria-selected={mode === "register"}>
              Đăng ký
            </button>
          </div>

          {/* Login */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="auth-modal-form-fields">
              {loginErr ? <div className="auth-modal-alert auth-modal-alert-error">{loginErr}</div> : null}

              <div className="auth-modal-field">
                <label className="auth-modal-label" htmlFor="am-email">Email</label>
                <input id="am-email" type="email" className="auth-modal-input" placeholder="email@example.com" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
              </div>

              <div className="auth-modal-field">
                <div className="auth-modal-label-row">
                  <label className="auth-modal-label" htmlFor="am-pwd">Mật khẩu</label>
                  <button type="button" className="auth-modal-forgot-link" onClick={() => setMode("forgot")}>Quên mật khẩu?</button>
                </div>
                <div className="auth-modal-input-wrap">
                  <input id="am-pwd" type={showPwd ? "text" : "password"} className="auth-modal-input" style={{ paddingRight: "3rem" }} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
                  <button type="button" className="auth-modal-input-action" onClick={() => setShowPwd(!showPwd)} aria-label={showPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                    {showPwd ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="auth-modal-captcha">
                <CaptchaInput
                  onVerify={setCaptchaToken}
                  disabled={loginLoading}
                  inputClassName="auth-modal-input captcha-input-code"
                />
              </div>

              <button type="submit" className="auth-modal-submit" disabled={loginLoading || !humanGateOk}>
                {loginLoading ? <span className="auth-modal-spinner" /> : null}
                {loginLoading ? "Đang đăng nhập…" : "Đăng nhập"}
              </button>
            </form>
          )}

          {/* Register */}
          {mode === "register" && (
            <form onSubmit={handleRegister} className="auth-modal-form-fields">
              {regErr ? <div className="auth-modal-alert auth-modal-alert-error">{regErr}</div> : null}
              {regOk ? <div className="auth-modal-alert auth-modal-alert-success">{regOk}</div> : null}

              <div className="auth-modal-field">
                <label className="auth-modal-label" htmlFor="am-reg-name">Họ tên</label>
                <input id="am-reg-name" type="text" className="auth-modal-input" placeholder="Nguyễn Văn A" value={regName} onChange={(e) => setRegName(e.target.value)} required minLength={2} />
              </div>

              <div className="auth-modal-field">
                <label className="auth-modal-label" htmlFor="am-reg-phone">Số điện thoại <span className="auth-modal-optional">(tuỳ chọn)</span></label>
                <input id="am-reg-phone" type="tel" className="auth-modal-input" placeholder="0901 234 567" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} />
              </div>

              <div className="auth-modal-field">
                <label className="auth-modal-label" htmlFor="am-reg-email">Email</label>
                <input id="am-reg-email" type="email" className="auth-modal-input" placeholder="email@example.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
              </div>

              <div className="auth-modal-field">
                <label className="auth-modal-label" htmlFor="am-reg-pwd">Mật khẩu</label>
                <input id="am-reg-pwd" type="password" className="auth-modal-input" placeholder="Tối thiểu 8 ký tự" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required minLength={8} />
              </div>

              <div className="auth-modal-captcha">
                <CaptchaInput
                  onVerify={setCaptchaToken}
                  disabled={regLoading}
                  inputClassName="auth-modal-input captcha-input-code"
                />
              </div>

              <label className="auth-modal-check">
                <input type="checkbox" checked={regAgree} onChange={(e) => setRegAgree(e.target.checked)} />
                <span>
                  Tôi đồng ý với{" "}
                  <span style={{ color: "var(--brand-green)", fontWeight: 600 }}>Điều khoản sử dụng</span>
                  {" "}&amp;{" "}
                  <span style={{ color: "var(--brand-green)", fontWeight: 600 }}>Chính sách bảo mật</span>
                </span>
              </label>

              <button type="submit" className="auth-modal-submit" disabled={!canRegister || regLoading}>
                {regLoading ? <span className="auth-modal-spinner" /> : null}
                {regLoading ? "Đang gửi…" : "Tạo tài khoản"}
              </button>
            </form>
          )}

          {/* Forgot password */}
          {mode === "forgot" && (
            <form onSubmit={fpStep === "email" ? handleForgotSend : handleForgotReset} className="auth-modal-form-fields">
              <button type="button" className="auth-modal-back-link" onClick={() => { setMode("login"); resetForgot(); }}>
                ← Quay lại đăng nhập
              </button>

              <h3 style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--text-primary)", marginBottom: "0.25rem", textAlign: "center" }}>
                Khôi phục mật khẩu
              </h3>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", textAlign: "center", marginBottom: "1.25rem" }}>
                {fpStep === "email" ? "Nhập email đã đăng ký để nhận mã OTP" : `Nhập mã OTP đã gửi đến ${fpEmail}`}
              </p>

              {fpErr ? <div className="auth-modal-alert auth-modal-alert-error">{fpErr}</div> : null}
              {fpSuccess ? <div className="auth-modal-alert auth-modal-alert-success">{fpSuccess}</div> : null}

              {fpStep === "email" ? (
                <div className="auth-modal-field">
                  <label className="auth-modal-label" htmlFor="am-fp-email">Email</label>
                  <input id="am-fp-email" type="email" className="auth-modal-input" placeholder="email@example.com" value={fpEmail} onChange={(e) => setFpEmail(e.target.value)} autoComplete="email" required />
                </div>
              ) : (
                <>
                  <div className="auth-modal-field">
                    <label className="auth-modal-label" htmlFor="am-fp-otp">Mã OTP</label>
                    <input
                      id="am-fp-otp"
                      type="text"
                      className="auth-modal-input"
                      style={{ textAlign: "center", letterSpacing: "0.2em" }}
                      placeholder="6 chữ số"
                      maxLength={6}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      autoComplete="one-time-code"
                      value={fpOtp}
                      onChange={(e) => setFpOtp(e.target.value.replace(/\D/g, ""))}
                      required
                    />
                    {fpCountdown > 0 ? (
                      <span className="auth-modal-input-countdown">Gửi lại sau {fpCountdown}s</span>
                    ) : (
                      <span className="auth-modal-input-countdown">
                        Không nhận được mã?{" "}
                        <button type="button" className="auth-modal-forgot-link" style={{ fontSize: "0.75rem" }} onClick={handleForgotResend}>Gửi lại</button>
                      </span>
                    )}
                  </div>
                  <div className="auth-modal-field">
                    <label className="auth-modal-label" htmlFor="am-fp-pwd">Mật khẩu mới</label>
                    <div className="auth-modal-input-wrap">
                      <input
                        id="am-fp-pwd"
                        type={fpShowPwd ? "text" : "password"}
                        className="auth-modal-input"
                        style={{ paddingRight: "3rem" }}
                        placeholder="Tối thiểu 8 ký tự"
                        value={fpPassword}
                        onChange={(e) => setFpPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                        minLength={8}
                      />
                      <button type="button" className="auth-modal-input-action" onClick={() => setFpShowPwd(!fpShowPwd)} aria-label={fpShowPwd ? "Ẩn mật khẩu" : "Hiện mật khẩu"}>
                        {fpShowPwd ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </>
              )}

              <button type="submit" className="auth-modal-submit" disabled={fpLoading || (fpStep === "otp" && (fpOtp.length < 6 || fpPassword.length < 8))}>
                {fpLoading ? <span className="auth-modal-spinner" /> : null}
                {fpLoading ? "Đang xử lý…" : fpStep === "email" ? "Gửi mã OTP" : "Đặt lại mật khẩu"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
