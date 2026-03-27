"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconArrowLeft, IconStore, IconCheckCircle, IconAlertCircle } from "@/components/Icons";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { useAuthModal } from "@/components/AuthModal";

export default function SellerApplyPage() {
  const router = useRouter();
  const { open: openAuth } = useAuthModal();
  const [me, setMe] = useState<{ id?: string } | null | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() as Promise<{ user?: { id?: string } }> : null))
      .then((d) => setMe(d?.user ?? null))
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    if (me === null) {
      // Chưa đăng nhập → mở modal đăng ký
      openAuth("register");
    }
  }, [me, openAuth]);

  if (me === undefined) {
    return (<><SiteHeader /><p style={{ padding: "6rem 0", textAlign: "center" }}>Đang tải…</p><SiteFooter /></>);
  }
  if (!me) {
    return (
      <>
        <SiteHeader />
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "5rem 1rem", textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)", marginBottom: "var(--space-4)" }}>Bạn cần đăng nhập để đăng ký bán hàng.</p>
          <button type="button" className="btn btn-primary" style={{ display: "inline-flex" }} onClick={() => openAuth("login")}>Đăng nhập</button>
        </div>
        <SiteFooter />
      </>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await fetch("/api/seller/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message }) });
    const d = (await res.json()) as { error?: string; ok?: boolean };
    setLoading(false);
    if (!res.ok) { setErr(d.error || "Lỗi"); return; }
    router.push("/tai-khoan");
  }

  return (
    <>
      {loading && <LoadingOverlay label="Đang gửi đơn đăng ký…" />}
      <SiteHeader />
      <main className="page-sm">
        <Link href="/tai-khoan" className="back-link"><IconArrowLeft size={16} /> Tài khoản</Link>
        <div className="flex items-center gap-3" style={{ marginTop: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "var(--radius-full)", background: "var(--brand-blue-light)" }}>
            <IconStore size={24} color="var(--brand-blue)" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Đăng ký bán hàng</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Mở gian hàng trên Kho Mã Nguồn.</p>
          </div>
        </div>
        <p className="page-desc" style={{ marginTop: "var(--space-4)" }}>Admin duyệt thủ công. Sau khi duyệt bạn có thể thêm sản phẩm và sử dụng rút tiền (OTP email).</p>
        <form onSubmit={submit} className="form-space" style={{ marginTop: "var(--space-8)" }}>
          {err ? <div className="alert alert-error"><IconAlertCircle size={16} />{err}</div> : null}
          <textarea className="input-area" placeholder="Giới thiệu ngắn / loại hàng dự kiến (tuỳ chọn)" value={message} onChange={(e) => setMessage(e.target.value)} />
          <button type="submit" disabled={loading} className="btn btn-primary w-full">
            {loading ? "Đang gửi…" : "Gửi đơn"}
          </button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
