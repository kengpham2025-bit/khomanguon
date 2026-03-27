"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { IconX, IconEye, IconEyeOff } from "@/components/Icons";
import { BottomWaves } from "@/components/Waves";
import { SiteLogo } from "@/components/SiteLogo";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { notifyError, notifySuccess } from "@/lib/notify";
import { useAuthModal } from "@/components/AuthModal";

type OauthConfig = { google: boolean; facebook: boolean };

export function LoginForm() {
  const router = useRouter();
  const { open: openAuth } = useAuthModal();
  const sp = useSearchParams();
  const next = sp.get("next") || "/tai-khoan";
  const oauthError = sp.get("oauth_error");
  const [oauthConfig, setOauthConfig] = useState<OauthConfig>({ google: false, facebook: false });
  const [oauthErrMsg, setOauthErrMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [siteKey, setSiteKey] = useState("");

  useEffect(() => {
    if (oauthError) {
      const friendly: Record<string, string> = {
        access_denied: "Bạn đã hủy đăng nhập Google/Facebook.",
        state_expired: "Phiên đăng nhập đã hết hạn. Vui lòng thử lại.",
        invalid_state: "Liên kết không hợp lệ. Thử lại.",
      };
      setOauthErrMsg(friendly[oauthError] || `Đăng nhập bằng Google/Facebook không thành công.`);
      router.replace("/dang-nhap", { scroll: false });
    }
    fetch("/api/auth/oauth/config")
      .then((r) => r.json() as Promise<OauthConfig>)
      .then(setOauthConfig)
      .catch(() => {});
    fetch("/api/settings")
      .then((r) => r.json() as Promise<{ settings?: Record<string, string> }>)
      .then((d) => setSiteKey(d.settings?.turnstile_site_key ?? ""))
      .catch(() => {});
  }, [oauthError, router]);

  const googleHref = useCallback(() => {
    const params = new URLSearchParams({ next });
    return `/api/auth/oauth/google?${params}`;
  }, [next]);

  const facebookHref = useCallback(() => {
    const params = new URLSearchParams({ next });
    return `/api/auth/oauth/facebook?${params}`;
  }, [next]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!siteKey) {
      const m = "Thiếu NEXT_PUBLIC_TURNSTILE_SITE_KEY";
      setErr(m);
      notifyError(m);
      return;
    }
    if (!token) {
      const m = "Vui lòng hoàn thành Captcha";
      setErr(m);
      notifyError(m);
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
        const m = data.error || "Đăng nhập thất bại";
        setErr(m);
        notifyError(m);
        setLoading(false);
        return;
      }
      notifySuccess("Đăng nhập thành công");
      router.push(next);
      router.refresh();
    } catch {
      const m = "Lỗi mạng";
      setErr(m);
      notifyError(m);
    }
    setLoading(false);
  }

  return (
    <>
      {loading && <LoadingOverlay label="Đang đăng nhập…" />}
      <div className="auth-page">
      <Link href="/" className="close-btn" aria-label="Đóng">
        <IconX size={20} />
      </Link>
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <SiteLogo height={48} className="justify-center" />
            <h1 className="auth-title">Đăng nhập vào tài khoản của bạn</h1>
          </div>

          <form onSubmit={onSubmit} className="form-space" style={{ marginTop: "var(--space-8)" }}>
            {oauthErrMsg ? (
              <div className="alert alert-error" style={{ justifyContent: "center", fontSize: "0.875rem" }}>{oauthErrMsg}</div>
            ) : null}
            {err ? <p style={{ textAlign: "center", fontSize: "0.875rem", color: "var(--error-text)" }}>{err}</p> : null}
            <input
              className="input"
              placeholder="Email đăng nhập"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="input-password-wrap">
              <input
                className="input"
                style={{ paddingRight: "3rem" }}
                placeholder="Mật khẩu đăng nhập"
                type={show ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShow(!show)}
                aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              >
                {show ? <IconEyeOff size={20} /> : <IconEye size={20} />}
              </button>
            </div>
            <div style={{ textAlign: "right", fontFamily: "var(--font-ui)", fontSize: "0.875rem" }}>
              <button type="button" className="link-brand" style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }} onClick={() => openAuth("forgot")}>
                Quên mật khẩu?
              </button>
            </div>

            <div className="flex justify-center" style={{ padding: "var(--space-2) 0" }}>
              {siteKey ? (
                <Turnstile siteKey={siteKey} onSuccess={setToken} onExpire={() => setToken("")} />
              ) : (
                <p style={{ fontSize: "0.75rem", color: "var(--warning-text)" }}>Cấu hình Turnstile để bật Captcha</p>
              )}
            </div>

            <button type="submit" disabled={loading} className="pill-btn-primary">
              {loading ? "Đang đăng nhập…" : "Đăng nhập"}
            </button>
          </form>

          {oauthConfig.google || oauthConfig.facebook ? (
            <>
              <div className="divider"><span>hoặc đăng nhập bằng</span></div>
              <div className="flex gap-3">
                {oauthConfig.google ? (
                  <a href={googleHref()} className="oauth-btn">
                    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }} aria-hidden>
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                    Google
                  </a>
                ) : (
                  <span className="oauth-btn-disabled">Google</span>
                )}
                {oauthConfig.facebook ? (
                  <a href={facebookHref()} className="oauth-btn">
                    <svg viewBox="0 0 24 24" style={{ width: 20, height: 20 }} aria-hidden>
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2" />
                    </svg>
                    Facebook
                  </a>
                ) : (
                  <span className="oauth-btn-disabled">Facebook</span>
                )}
              </div>
            </>
          ) : null}
          <p style={{ marginTop: "var(--space-6)", textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Chưa có tài khoản?{" "}
            <button type="button" className="link-brand" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }} onClick={() => openAuth("register")}>
              Đăng ký
            </button>
          </p>
        </div>
      </div>
    </div>
    <BottomWaves />
    </>
  );
}
