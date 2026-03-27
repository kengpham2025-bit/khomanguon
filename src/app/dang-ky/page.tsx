"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { IconChevronLeft } from "@/components/Icons";
import { SiteLogo } from "@/components/SiteLogo";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { BottomWaves } from "@/components/Waves";
import { notifyError, notifySuccess } from "@/lib/notify";
import { useAuthModal } from "@/components/AuthModal";

type OauthConfig = { google: boolean; facebook: boolean };

export default function RegisterPage() {
  const router = useRouter();
  const { open: openAuth } = useAuthModal();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(false);
  const [token, setToken] = useState("");
  const [err, setErr] = useState("");
  const [okMsg, setOkMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthConfig, setOauthConfig] = useState<OauthConfig>({ google: false, facebook: false });
  const [siteKey, setSiteKey] = useState("");

  useEffect(() => {
    fetch("/api/auth/oauth/config")
      .then((r) => r.json() as Promise<OauthConfig>)
      .then(setOauthConfig)
      .catch(() => {});
    fetch("/api/settings")
      .then((r) => r.json() as Promise<{ settings?: Record<string, string> }>)
      .then((d) => setSiteKey(d.settings?.turnstile_site_key ?? ""))
      .catch(() => {});
  }, []);

  const canSubmit = useMemo(() => {
    const captchaOk = siteKey ? Boolean(token) : false;
    return name.length >= 2 && email.includes("@") && password.length >= 8 && agree && captchaOk;
  }, [name, email, password, agree, token, siteKey]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setOkMsg("");
    if (!siteKey) {
      const m = "Biểu mẫu bảo vệ chưa sẵn sàng. Vui lòng thử lại sau hoặc liên hệ hỗ trợ.";
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
    if (!agree) {
      const m = "Vui lòng đồng ý điều khoản";
      setErr(m);
      notifyError(m);
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
        const m = data.error || "Đăng ký thất bại";
        setErr(m);
        notifyError(m);
        setLoading(false);
        return;
      }
      const ok = data.message || "Kiểm tra email để xác nhận.";
      setOkMsg(ok);
      notifySuccess("Đăng ký thành công", ok);
      setTimeout(() => router.push("/dang-nhap"), 2500);
    } catch {
      const m = "Lỗi mạng";
      setErr(m);
      notifyError(m);
    }
    setLoading(false);
  }

  return (
    <>
      {loading && <LoadingOverlay label="Đang đăng ký…" />}
      <div className="auth-page">
      <Link
        href="/"
        className="back-link"
        style={{ position: "absolute", left: "var(--space-4)", top: "var(--space-4)", zIndex: 20, fontFamily: "var(--font-ui)", fontWeight: 500, color: "var(--text-secondary)" }}
      >
        <IconChevronLeft size={16} />
        Về trang chủ
      </Link>

      <div className="auth-container" style={{ maxWidth: 540 }}>
        <div className="auth-card">
          <div className="auth-header">
            <SiteLogo height={52} className="justify-center" />
            <h1 className="auth-title" style={{ fontSize: "1.375rem" }}>
              Tạo tài khoản thành viên
            </h1>
            <p className="auth-desc">
              Bạn đang mở tài khoản thành viên <strong style={{ color: "var(--text-primary)" }}>Kho Mã Nguồn</strong>. Sau khi
              hoàn tất, hệ thống gửi email để bạn xác nhận — chỉ cần bấm link trong thư là có thể đăng nhập. Muốn mở gian
              hàng bán hàng, bạn làm thêm bước đăng ký bán trong trang tài khoản sau khi đã đăng nhập.
            </p>
          </div>

          <form onSubmit={onSubmit} className="form-space" style={{ marginTop: "var(--space-8)" }}>
            {err ? <div className="alert alert-error" style={{ justifyContent: "center", fontSize: "0.875rem" }}>{err}</div> : null}
            {okMsg ? <div className="alert alert-success" style={{ justifyContent: "center", fontSize: "0.875rem" }}>{okMsg}</div> : null}

            <input className="input" placeholder="Họ tên của bạn" value={name} onChange={(e) => setName(e.target.value)} required />
            <input className="input" placeholder="Số điện thoại (tuỳ chọn)" value={phone} onChange={(e) => setPhone(e.target.value)} />
            <input className="input" type="email" placeholder="Email đăng nhập" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input className="input" type="password" placeholder="Mật khẩu (tối thiểu 8 ký tự)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} />

            <label className="checkbox-wrap">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              <span>
                Tôi đã đọc và đồng ý với{" "}
                <span style={{ fontWeight: 500, color: "var(--brand-blue)" }}>Chính sách bảo vệ dữ liệu &amp; Quy định sử dụng</span> của Kho Mã Nguồn.
              </span>
            </label>

            <div className="flex justify-center" style={{ padding: "var(--space-1) 0" }}>
              {siteKey ? (
                <Turnstile siteKey={siteKey} onSuccess={setToken} onExpire={() => setToken("")} />
              ) : (
                <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--warning-text)" }}>
                  Ô xác minh an toàn chưa hiển thị. Tải lại trang hoặc thử trình duyệt khác.
                </p>
              )}
            </div>

            <button type="submit" disabled={!canSubmit || loading} className="pill-btn-primary">
              {loading ? "Đang gửi…" : "Hoàn tất đăng ký"}
            </button>
          </form>

          {oauthConfig.google || oauthConfig.facebook ? (
            <>
              <div className="divider"><span>hoặc</span></div>
              <div className="flex gap-3">
                {oauthConfig.google ? (
                  <a href="/api/auth/oauth/google" className="oauth-btn">
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
                  <a href="/api/auth/oauth/facebook" className="oauth-btn">
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

          <p style={{ marginTop: "var(--space-8)", textAlign: "center", fontSize: "0.875rem", color: "var(--text-secondary)" }}>
            Đã có tài khoản?{" "}
            <button type="button" className="link-brand" style={{ background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }} onClick={() => openAuth("login")}>
              Đăng nhập
            </button>
          </p>
        </div>
      </div>
      <BottomWaves />
    </div>
    </>
  );
}
