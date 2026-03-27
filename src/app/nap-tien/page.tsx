"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  IconWallet, IconArrowLeft, IconHistory, IconAlertCircle, IconCheckCircle,
  IconXCircle, IconClock, IconPlus, IconCreditCard,
} from "@/components/Icons";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay";
import { notifyError, notifyInfo } from "@/lib/notify";

type Deposit = {
  id: string;
  orderCode: number;
  amountCents: number;
  status: string;
  transactionNo: string | null;
  description: string | null;
  createdAt: number;
  completedAt: number | null;
};

function StatusBadge({ status }: { status: string }) {
  if (status === "success") {
    return (<span className="badge badge-success"><IconCheckCircle size={14} /> Thành công</span>);
  }
  if (status === "pending") {
    return (<span className="badge badge-warning"><IconClock size={14} /> Đang chờ</span>);
  }
  if (status === "cancelled") {
    return (<span className="badge badge-neutral"><IconXCircle size={14} /> Đã hủy</span>);
  }
  return (<span className="badge badge-error"><IconAlertCircle size={14} /> Thất bại</span>);
}

function formatVnd(cents: number) { return cents.toLocaleString("vi-VN"); }

function formatDate(ts: number) {
  return new Date(ts).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

const PRESET_AMOUNTS = [50000, 100000, 200000, 500000, 1000000, 2000000];

export default function NapTienPage() {
  const [amount, setAmount] = useState("");
  const [preset, setPreset] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancelled, setCancelled] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("cancelled") === "1") setCancelled(true);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const rawAmount = Number(String(amount).replace(/\D/g, ""));
    if (!rawAmount || rawAmount < 10000) { const m = "Số tiền tối thiểu là 10.000 VND."; setError(m); notifyError(m); return; }
    if (rawAmount > 1_000_000_000) { const m = "Số tiền tối đa là 1.000.000.000 VND."; setError(m); notifyError(m); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/deposit/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ amount: rawAmount }) });
      const data = (await res.json()) as { error?: string; checkoutUrl?: string; ok?: boolean };
      if (!res.ok || data.error) { const m = data.error || "Tạo link thanh toán thất bại."; setError(m); notifyError(m); setLoading(false); return; }
      if (data.checkoutUrl) { notifyInfo("Đang chuyển đến cổng thanh toán…"); window.location.href = data.checkoutUrl; }
    } catch { const m = "Lỗi kết nối. Vui lòng thử lại."; setError(m); notifyError(m); setLoading(false); }
  }

  async function loadHistory() {
    setHistoryLoading(true);
    try { const res = await fetch("/api/deposit/history"); if (res.ok) { const data = (await res.json()) as { deposits?: Deposit[] }; setDeposits(data.deposits ?? []); } }
    finally { setHistoryLoading(false); }
  }

  function toggleHistory() { if (!showHistory) loadHistory(); setShowHistory((v) => !v); }
  function selectPreset(v: number) { setPreset(v); setAmount(String(v)); }

  return (
    <>
      {loading && <LoadingOverlay label="Đang tạo link thanh toán…" />}
      <SiteHeader />
      <main className="page-sm">
        <Link href="/tai-khoan" className="back-link"><IconArrowLeft size={16} /> Tài khoản</Link>
        <div className="flex items-center gap-3" style={{ marginTop: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "var(--radius-full)", background: "var(--brand-green-light)" }}>
            <IconWallet size={24} color="var(--brand-green)" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Nạp tiền</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Thanh toán qua PayOS — Ví điện tử &amp; Ngân hàng</p>
          </div>
        </div>

        {cancelled && (
          <div className="alert alert-warning" style={{ marginTop: "var(--space-6)" }}>
            <IconAlertCircle size={20} />
            <p>Bạn đã hủy thanh toán. Số tiền chưa được nạp vào tài khoản.</p>
          </div>
        )}

        <section className="card" style={{ marginTop: "var(--space-8)" }}>
          <h2 style={{ fontWeight: 600 }}>Chọn số tiền nạp</h2>
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>Tối thiểu 10.000 VND — Tối đa 1 tỷ VND</p>
          <div className="preset-grid" style={{ marginTop: "var(--space-4)" }}>
            {PRESET_AMOUNTS.map((v) => (
              <button key={v} type="button" onClick={() => selectPreset(v)} className={`preset-btn ${preset === v ? "preset-btn-active" : ""}`}>
                {formatVnd(v)}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="form-space" style={{ marginTop: "var(--space-5)" }}>
            <div>
              <input className="input" style={{ fontSize: "1.125rem" }} placeholder="Nhập số tiền khác (VND)" value={amount} onChange={(e) => { setAmount(e.target.value); setPreset(null); }} />
              {amount && (<p style={{ marginTop: "var(--space-1)", fontSize: "0.75rem", color: "var(--text-muted)" }}>= {formatVnd(Number(String(amount).replace(/\D/g, "")))} VND</p>)}
            </div>
            {error && (<div className="alert alert-error"><IconAlertCircle size={16} />{error}</div>)}
            <button type="submit" disabled={loading} className="pill-btn-primary">{loading ? "Đang chuyển sang PayOS…" : "Nạp tiền qua PayOS"}</button>
          </form>
          <p style={{ marginTop: "var(--space-4)", textAlign: "center", fontSize: "0.75rem", color: "var(--text-muted)" }}>
            Thanh toán an toàn qua PayOS. Hỗ trợ: VietQR, thẻ ATM, Visa, Mastercard.
          </p>
        </section>

        <section style={{ marginTop: "var(--space-6)" }}>
          <button type="button" onClick={toggleHistory} className="card w-full" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "var(--space-4)", cursor: "pointer", textAlign: "left" }}>
            <span className="flex items-center gap-2" style={{ fontWeight: 600 }}><IconHistory size={20} color="var(--text-muted)" /> Lịch sử nạp tiền</span>
            <span style={{ fontSize: "0.875rem", color: "var(--brand-blue)" }}>{showHistory ? "Ẩn" : "Xem"}</span>
          </button>
          {showHistory && (
            <div className="card" style={{ marginTop: "var(--space-2)", padding: "var(--space-4)" }}>
              {historyLoading ? (<p style={{ padding: "var(--space-4) 0", textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>Đang tải…</p>)
               : deposits.length === 0 ? (<p style={{ padding: "var(--space-4) 0", textAlign: "center", fontSize: "0.875rem", color: "var(--text-muted)" }}>Chưa có giao dịch nạp tiền nào.</p>)
               : (
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
                  {deposits.map((d) => (
                    <div key={d.id} className="flex items-center justify-between" style={{ padding: "var(--space-3)", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-light)" }}>
                      <div>
                        <p style={{ fontWeight: 500 }}>{formatVnd(d.amountCents)} VND</p>
                        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Mã GD: {d.orderCode} · {formatDate(d.createdAt)}</p>
                      </div>
                      <StatusBadge status={d.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
