"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  IconBadgeCheck, IconLogOut, IconStore, IconWallet, IconPlusCircle, IconShieldCheck,
  IconAlertTriangle, IconX, IconSearch, IconSettings, IconUser,
} from "@/components/Icons";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { PageSpinner } from "@/components/ui/PageSpinner";
import { notifyError, notifySuccess } from "@/lib/notify";
import { useAuthModal } from "@/components/AuthModal";

type Me = {
  id: string;
  email: string;
  name: string;
  role: string;
  seller_status: string;
  kyc_status: string;
  isSellerApproved: boolean;
  kycVerified: boolean;
};

type BalanceData = { balanceCents: number; formatted: string };

function formatVnd(cents: number) { return cents.toLocaleString("vi-VN"); }

export default function AccountPage() {
  const router = useRouter();
  const { open: openAuth } = useAuthModal();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [pub, setPub] = useState(true);
  const [msg, setMsg] = useState("");
  const [logoutOpen, setLogoutOpen] = useState(false);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() as Promise<{ user?: Me }> : null))
      .then((d) => setMe(d?.user ?? null))
      .catch(() => setMe(null));
  }, []);

  useEffect(() => {
    if (!me) return;
    fetch("/api/balance")
      .then((r) => r.ok ? r.json() as Promise<BalanceData> : null)
      .then((d) => { if (d) setBalance(d); })
      .catch(() => {});
  }, [me]);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    notifySuccess("Đã đăng xuất");
    router.push("/");
    router.refresh();
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const priceVnd = Number(String(price).replace(/\D/g, ""));
    if (!title.trim() || !priceVnd) {
      const m = "Nhập tiêu đề và giá (VND)";
      setMsg(m);
      notifyError(m);
      return;
    }
    const res = await fetch("/api/seller/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: title.trim(), description: desc, priceCents: priceVnd, publish: pub }),
    });
    const d = (await res.json()) as { error?: string; ok?: boolean; id?: string; slug?: string };
    if (!res.ok) {
      const m = d.error || "Lỗi";
      setMsg(m);
      notifyError(m);
      return;
    }
    setMsg("Đã thêm sản phẩm.");
    notifySuccess("Đã thêm sản phẩm");
    setTitle(""); setDesc(""); setPrice("");
  }

  if (me === undefined) {
    return (<><SiteHeader /><PageSpinner /><SiteFooter /></>);
  }

  if (!me) {
    return (
      <>
        <SiteHeader />
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "5rem 1rem", textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Bạn cần đăng nhập.</p>
          <button type="button" className="btn btn-blue" style={{ marginTop: "var(--space-4)", display: "inline-flex" }} onClick={() => openAuth("login")}>Đăng nhập</button>
        </div>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="page-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="page-title">Tài khoản</h1>
            <p style={{ color: "var(--text-secondary)" }}>{me.email}</p>
            <p style={{ fontSize: "0.875rem", color: "var(--text-muted)", marginTop: "var(--space-2)" }}>{me.name}</p>
            <div className="flex flex-wrap gap-2" style={{ marginTop: "var(--space-3)" }}>
              {me.kycVerified ? (
                <span className="badge badge-success"><IconBadgeCheck size={14} /> Đã KYC</span>
              ) : (
                <span className="badge badge-neutral">Chưa KYC / đang chờ</span>
              )}
              {me.isSellerApproved ? (
                <span className="badge badge-blue"><IconStore size={14} /> Người bán</span>
              ) : (
                <span className="badge badge-warning">Chưa duyệt bán hàng</span>
              )}
            </div>
          </div>
          <button type="button" onClick={() => setLogoutOpen(true)} className="btn btn-secondary">
            <IconLogOut size={16} /> Đăng xuất
          </button>
        </div>

        <ConfirmDialog
          open={logoutOpen}
          onOpenChange={setLogoutOpen}
          title="Đăng xuất?"
          description="Bạn sẽ cần đăng nhập lại để vào tài khoản và thao tác nạp tiền, bán hàng."
          confirmLabel="Đăng xuất"
          cancelLabel="Ở lại"
          onConfirm={logout}
        />

        {/* ═══ Balance ═══ */}
        <section className="account-balance" style={{ marginTop: "var(--space-8)" }}>
          <div>
            <p className="balance-label">Số dư tài khoản</p>
            <p className="balance-value">
              {balance ? formatVnd(balance.balanceCents) : "—"} <span className="balance-unit">VND</span>
            </p>
          </div>
          <Link href="/nap-tien" className="btn btn-primary">
            <IconPlusCircle size={16} /> Nạp tiền
          </Link>
        </section>

        {/* ═══ Action cards ═══ */}
        <div className="grid sm\:grid-2 gap-4" style={{ marginTop: "var(--space-10)" }}>
          <Link href="/nap-tien" className="action-card">
            <IconPlusCircle size={32} color="var(--brand-green)" />
            <h2>Nạp tiền</h2>
            <p>Nạp qua PayOS — VietQR, ATM, Visa, Mastercard.</p>
          </Link>
          <button type="button" className="action-card" style={{ textAlign: "left", cursor: "pointer", border: "none" }} onClick={() => openAuth("register")}>
            <IconStore size={32} color="var(--brand-blue)" />
            <h2>Đăng ký bán hàng</h2>
            <p>Gửi đơn chờ admin duyệt.</p>
          </button>
          <Link href="/xac-minh-cccd" className="action-card">
            <IconShieldCheck size={32} color="var(--brand-accent)" />
            <h2>KYC CCCD</h2>
            <p>Tải ảnh / ghi chú để được tích xanh.</p>
          </Link>
          {me.isSellerApproved ? (
            <Link href="/rut-tien" className="action-card" style={{ gridColumn: "1 / -1" }}>
              <IconWallet size={32} color="var(--brand-green)" />
              <h2>Rút tiền (OTP email)</h2>
              <p>Chỉ người bán đã duyệt. Thêm TK ngân hàng + Captcha.</p>
            </Link>
          ) : null}
        </div>

        {/* ═══ Add product ═══ */}
        {me.isSellerApproved ? (
          <section className="card" style={{ marginTop: "var(--space-12)", background: "var(--surface-muted)" }}>
            <h2 style={{ fontSize: "1.125rem", fontWeight: 600 }}>Thêm sản phẩm</h2>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Chưa KYC vẫn đăng được; sản phẩm sẽ có cảnh báo đỏ trên cửa hàng.</p>
            <form onSubmit={addProduct} className="form-space" style={{ marginTop: "var(--space-4)" }}>
              {msg ? <p style={{ fontSize: "0.875rem", color: "var(--success-text)" }}>{msg}</p> : null}
              <input className="input" style={{ background: "var(--surface)" }} placeholder="Tiêu đề" value={title} onChange={(e) => setTitle(e.target.value)} />
              <textarea className="input-area" style={{ background: "var(--surface)" }} placeholder="Mô tả" value={desc} onChange={(e) => setDesc(e.target.value)} />
              <input className="input" style={{ background: "var(--surface)" }} placeholder="Giá (VND)" value={price} onChange={(e) => setPrice(e.target.value)} />
              <label className="flex items-center gap-2" style={{ fontSize: "0.875rem", cursor: "pointer" }}>
                <input type="checkbox" checked={pub} onChange={(e) => setPub(e.target.checked)} />
                Xuất bản ngay
              </label>
              <button type="submit" className="btn btn-primary">Lưu sản phẩm</button>
            </form>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
