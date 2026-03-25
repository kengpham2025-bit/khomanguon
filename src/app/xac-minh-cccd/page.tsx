"use client";

import Link from "next/link";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function KycPage() {
  const [note, setNote] = useState("");
  const [fileName, setFileName] = useState("");
  const [b64, setB64] = useState<string | null>(null);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  function onFile(f: File | null) {
    setB64(null);
    setFileName("");
    if (!f) return;
    if (f.size > 350_000) {
      setErr("Ảnh tối đa ~350KB. Vui lòng nén lại.");
      return;
    }
    setErr("");
    setFileName(f.name);
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result || "");
      setB64(s);
    };
    r.readAsDataURL(f);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    const res = await fetch("/api/kyc/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note, cccdImageBase64: b64 ?? undefined }),
    });
    const d = (await res.json()) as { error?: string; message?: string; ok?: boolean };
    if (!res.ok) {
      setErr(d.error || "Lỗi");
      return;
    }
    setMsg(d.message || "Đã gửi.");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-12">
        <Link href="/tai-khoan" className="text-sm text-brand-blue">
          ← Tài khoản
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Xác minh CCCD</h1>
        <p className="mt-2 text-sm text-slate-600">
          Sau khi admin duyệt, tài khoản có trạng thái KYC; sản phẩm của bạn không còn cảnh báo đỏ. Chưa KYC vẫn bán được.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {err ? <p className="text-sm text-red-600">{err}</p> : null}
          {msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}
          <textarea
            className="pill-input min-h-[80px] rounded-2xl"
            placeholder="Ghi chú (họ tên trên CCCD, số CCCD — tuỳ bạn)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div>
            <label className="text-sm font-medium text-slate-700">Ảnh CCCD (tuỳ chọn, nhỏ gọn)</label>
            <input
              type="file"
              accept="image/*"
              className="mt-2 block w-full text-sm"
              onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            />
            {fileName ? <p className="mt-1 text-xs text-slate-500">{fileName}</p> : null}
          </div>
          <button type="submit" className="w-full rounded-full bg-brand-blue py-3 font-semibold text-white">
            Gửi hồ sơ
          </button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
