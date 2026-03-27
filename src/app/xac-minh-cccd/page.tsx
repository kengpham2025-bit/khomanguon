"use client";

import Link from "next/link";
import { useState } from "react";
import { IconArrowLeft, IconShieldCheck, IconUpload, IconCheckCircle, IconAlertCircle } from "@/components/Icons";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function KycPage() {
  const [note, setNote] = useState("");
  const [fileName, setFileName] = useState("");
  const [b64, setB64] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  function onFile(f: File | null) {
    setB64(null); setFileName("");
    if (!f) return;
    if (f.size > 350_000) { setErr("Ảnh tối đa ~350KB. Vui lòng nén lại."); return; }
    setErr(""); setFileName(f.name);
    const r = new FileReader();
    r.onload = () => { setB64(String(r.result || "")); };
    r.readAsDataURL(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(""); setMsg("");
    const res = await fetch("/api/kyc/submit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ note, cccdImageBase64: b64 ?? undefined }) });
    const d = (await res.json()) as { error?: string; message?: string; ok?: boolean };
    if (!res.ok) { setErr(d.error || "Lỗi"); return; }
    setMsg(d.message || "Đã gửi.");
  }

  return (
    <>
      <SiteHeader />
      <main className="page-sm">
        <Link href="/tai-khoan" className="back-link"><IconArrowLeft size={16} /> Tài khoản</Link>
        <div className="flex items-center gap-3" style={{ marginTop: "var(--space-6)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, borderRadius: "var(--radius-full)", background: "rgba(139,92,246,0.1)" }}>
            <IconShieldCheck size={24} color="var(--brand-accent)" />
          </div>
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: 700 }}>Xác minh CCCD</h1>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)" }}>Tích xanh — tăng độ tin cậy trên sản phẩm.</p>
          </div>
        </div>
        <p className="page-desc" style={{ marginTop: "var(--space-4)" }}>
          Sau khi admin duyệt, tài khoản có trạng thái KYC; sản phẩm của bạn không còn cảnh báo đỏ. Chưa KYC vẫn bán được.
        </p>
        <form onSubmit={submit} className="form-space" style={{ marginTop: "var(--space-8)" }}>
          {err ? <div className="alert alert-error"><IconAlertCircle size={16} />{err}</div> : null}
          {msg ? <div className="alert alert-success"><IconCheckCircle size={16} />{msg}</div> : null}
          <textarea className="input-area" style={{ minHeight: 80 }} placeholder="Ghi chú (họ tên trên CCCD, số CCCD — tuỳ bạn)" value={note} onChange={(e) => setNote(e.target.value)} />
          <div>
            <label style={{ fontSize: "0.875rem", fontWeight: 500, color: "var(--text-primary)" }}>Ảnh CCCD (tuỳ chọn, nhỏ gọn)</label>
            <input type="file" accept="image/*" style={{ display: "block", marginTop: "var(--space-2)", fontSize: "0.875rem" }} onChange={(e) => onFile(e.target.files?.[0] ?? null)} />
            {fileName ? <p style={{ marginTop: "var(--space-1)", fontSize: "0.75rem", color: "var(--text-muted)" }}><IconCheckCircle size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {fileName}</p> : null}
          </div>
          <button type="submit" className="btn btn-blue w-full"><IconUpload size={16} /> Gửi hồ sơ</button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
