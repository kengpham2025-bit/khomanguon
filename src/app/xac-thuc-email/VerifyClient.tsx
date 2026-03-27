"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { IconCheckCircle, IconXCircle, IconLoader } from "@/components/Icons";
import { useAuthModal } from "@/components/AuthModal";

export function VerifyClient() {
  const sp = useSearchParams();
  const { open: openAuth } = useAuthModal();
  const token = sp.get("token");
  const [msg, setMsg] = useState("Đang xác nhận…");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!token) { setMsg("Thiếu liên kết xác nhận."); return; }
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (r) => {
        const d = (await r.json()) as { error?: string; ok?: boolean };
        if (!r.ok) { setMsg(d.error || "Xác nhận thất bại"); return; }
        setOk(true);
        setMsg("Email đã được xác nhận. Bạn có thể đăng nhập.");
      })
      .catch(() => setMsg("Lỗi mạng"));
  }, [token]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      minHeight: "100vh", padding: "0 var(--space-4)", background: "var(--surface-muted)"
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "var(--space-3)",
        background: "var(--surface)", border: "1px solid var(--border-light)",
        borderRadius: "var(--radius-2xl)", padding: "var(--space-6) var(--space-8)",
        boxShadow: "var(--shadow-card)", textAlign: "center",
      }}>
        {ok ? (
          <IconCheckCircle size={32} color="var(--brand-green)" />
        ) : msg === "Đang xác nhận…" ? (
          <IconLoader size={32} color="var(--brand-blue)" style={{ animation: "spin 0.8s linear infinite" }} />
        ) : (
          <IconXCircle size={32} color="var(--error)" />
        )}
        <p style={{ fontSize: "1.0625rem", color: ok ? "var(--success-text)" : "var(--text-primary)", fontFamily: "var(--font-ui)" }}>{msg}</p>
      </div>
      {ok ? (
        <button type="button" className="btn btn-primary" style={{ marginTop: "var(--space-6)" }} onClick={() => openAuth("login")}>
          Đăng nhập ngay
        </button>
      ) : (
        <Link href="/" className="btn btn-outline" style={{ marginTop: "var(--space-6)" }}>
          Về trang chủ
        </Link>
      )}
    </div>
  );
}
