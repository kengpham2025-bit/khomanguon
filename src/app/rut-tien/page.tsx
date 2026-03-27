"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IconArrowLeft, IconWallet, IconPlus, IconAlertCircle, IconCheckCircle, IconMail } from "@/components/Icons";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { BankIcon } from "@/components/BankIcon";
import { VN_BANKS } from "@/lib/vn-banks";
import { useAuthModal } from "@/components/AuthModal";
import { CaptchaInput } from "@/components/CaptchaInput";

type Account = { id: string; bank_code: string; account_number: string; account_name: string };

export default function WithdrawPage() {
  const [meOk, setMeOk] = useState<boolean | null>(null);
  const { open: openAuth } = useAuthModal();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [banks, setBanks] = useState<{ code: string; name: string }[]>([]);
  const [bankCode, setBankCode] = useState("");
  const [accNum, setAccNum] = useState("");
  const [accName, setAccName] = useState("");
  const [selId, setSelId] = useState("");
  const [amount, setAmount] = useState("");
  const [otp, setOtp] = useState("");
  const [wid, setWid] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [addLoading, setAddLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  async function load() {
    const m = (await fetch("/api/me").then((r) => r.json())) as { user?: { isSellerApproved?: boolean } };
    const ok = Boolean(m.user?.isSellerApproved);
    setMeOk(ok);
    if (!ok) return;
    const b = (await fetch("/api/bank-accounts").then((r) => r.json())) as { accounts?: Account[]; banks?: { code: string; name: string }[] };
    if (b.accounts) { setAccounts(b.accounts); setBanks(b.banks || VN_BANKS); }
  }

  useEffect(() => { void load(); }, []);

  async function addBank(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setAddLoading(true);
    const res = await fetch("/api/bank-accounts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bankCode, accountNumber: accNum, accountName: accName, isDefault: true }) });
    const d = (await res.json()) as { error?: string };
    setAddLoading(false);
    if (!res.ok) { setErr(d.error || "Lỗi"); return; }
    setBankCode(""); setAccNum(""); setAccName(""); void load();
  }

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setMsg("");
    if (!captchaToken) { setErr("Vui lòng hoàn thành mã bảo vệ"); return; }
    const vnd = Number(String(amount).replace(/\D/g, ""));
    if (!selId || !vnd) { setErr("Chọn TK ngân hàng và nhập số tiền"); return; }
    setOtpLoading(true);
    const res = await fetch("/api/withdraw/request", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bankAccountId: selId, amountVnd: vnd, captchaToken }) });
    const d = (await res.json()) as { error?: string; message?: string; withdrawalId?: string };
    setOtpLoading(false);
    if (!res.ok) { setErr(d.error || "Lỗi"); void load(); return; }
    setWid(d.withdrawalId ?? null);
    setCaptchaToken("");
    setMsg(d.message || "Đã gửi OTP.");
  }

  async function confirmOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!wid) return;
    setConfirmLoading(true);
    const res = await fetch("/api/withdraw/confirm", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ withdrawalId: wid, otp }) });
    const d = (await res.json()) as { error?: string; message?: string };
    setConfirmLoading(false);
    if (!res.ok) { setErr(d.error || "Lỗi"); return; }
    setMsg(d.message || "OK");
    setWid(null); setOtp("");
  }

  if (meOk === null) {
    return (<><SiteHeader /><p style={{ padding: "6rem 0", textAlign: "center" }}>Đang tải…</p></>);
  }
  if (!meOk) {
    return (
      <>
        <SiteHeader />
        <div style={{ maxWidth: 480, margin: "0 auto", padding: "5rem 1rem", textAlign: "center" }}>
          <p style={{ color: "var(--text-secondary)" }}>Chỉ người bán đã duyệt mới rút tiền được.</p>
          <button type="button" className="link-brand" style={{ display: "inline-block", marginTop: "var(--space-4)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-ui)", fontSize: "inherit", fontWeight: 600 }} onClick={() => openAuth("register")}>Đăng ký bán hàng</button>
        </div>
        <SiteFooter />
      </>
    );
  }

  const isLoading = addLoading || otpLoading || confirmLoading;

  return (
    <>
      {isLoading && <LoadingOverlay label={otpLoading ? "Đang gửi OTP…" : confirmLoading ? "Đang xác nhận rút tiền…" : "Đang xử lý…"} />}
      <SiteHeader />
      <main className="page-sm">
        <Link href="/tai-khoan" className="back-link"><IconArrowLeft size={16} /> Tài khoản</Link>
        <div className="flex items-center gap-3" style={{ marginTop: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "var(--radius-full)", background: "var(--brand-blue-light)" }}>
            <IconWallet size={24} color="var(--brand-blue)" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Rút tiền</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>OTP gửi về email bảo mật.</p>
          </div>
        </div>

        <section className="card" style={{ marginTop: "var(--space-8)", background: "var(--surface-muted)" }}>
          <h2 style={{ fontWeight: 600 }}>Thêm tài khoản ngân hàng</h2>
          <form onSubmit={addBank} className="form-space" style={{ marginTop: "var(--space-4)" }}>
            <div className="bank-grid">
              {banks.map((b) => (
                <button key={b.code} type="button" title={b.name} onClick={() => setBankCode(b.code)} className={`bank-btn ${bankCode === b.code ? "bank-btn-active" : ""}`}>
                  <BankIcon code={b.code} name={b.name} />
                </button>
              ))}
            </div>
            <input className="input" style={{ background: "var(--surface)" }} placeholder="Số tài khoản" value={accNum} onChange={(e) => setAccNum(e.target.value)} />
            <input className="input" style={{ background: "var(--surface)" }} placeholder="Tên chủ TK" value={accName} onChange={(e) => setAccName(e.target.value)} />
            <button type="submit" disabled={addLoading} className="btn btn-secondary"><IconPlus size={16} /> Lưu tài khoản</button>
          </form>
        </section>

        <section className="card" style={{ marginTop: "var(--space-8)" }}>
          <h2 style={{ fontWeight: 600 }}>Yêu cầu rút</h2>
          {err ? <p style={{ marginTop: "var(--space-2)", fontSize: "0.875rem", color: "var(--error-text)" }}><IconAlertCircle size={14} /> {err}</p> : null}
          {msg ? <p style={{ marginTop: "var(--space-2)", fontSize: "0.875rem", color: "var(--success-text)" }}><IconCheckCircle size={14} /> {msg}</p> : null}
          <form onSubmit={requestOtp} className="form-space" style={{ marginTop: "var(--space-4)" }}>
            <select className="select" value={selId} onChange={(e) => setSelId(e.target.value)} required>
              <option value="">Chọn TK đã lưu</option>
              {accounts.map((a) => (<option key={a.id} value={a.id}>{a.bank_code} — {a.account_number} — {a.account_name}</option>))}
            </select>
            <input className="input" placeholder="Số tiền (VND)" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <CaptchaInput onVerify={setCaptchaToken} disabled={otpLoading} />
            <button type="submit" disabled={otpLoading || !captchaToken} className="btn btn-primary w-full"><IconMail size={16} /> Gửi OTP email</button>
          </form>
          {wid ? (
            <form onSubmit={confirmOtp} className="form-space" style={{ marginTop: "var(--space-6)", borderTop: "1px solid var(--border-light)", paddingTop: "var(--space-6)" }}>
              <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Nhập mã 6 số từ email</p>
              <input className="input" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} placeholder="Mã OTP 6 chữ số" />
              <button type="submit" disabled={confirmLoading} className="btn btn-blue w-full">Xác nhận rút tiền</button>
            </form>
          ) : null}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
