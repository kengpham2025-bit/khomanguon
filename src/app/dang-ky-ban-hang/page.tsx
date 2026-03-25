"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function SellerApplyPage() {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setLoading(true);
    const res = await fetch("/api/seller/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    const d = (await res.json()) as { error?: string; ok?: boolean };
    setLoading(false);
    if (!res.ok) {
      setErr(d.error || "Lỗi");
      return;
    }
    router.push("/tai-khoan");
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-12">
        <Link href="/tai-khoan" className="text-sm text-brand-blue">
          ← Tài khoản
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Đăng ký bán hàng</h1>
        <p className="mt-2 text-sm text-slate-600">
          Admin duyệt thủ công. Sau khi duyệt bạn có thể thêm sản phẩm và sử dụng rút tiền (OTP email).
        </p>
        <form onSubmit={submit} className="mt-8 space-y-4">
          {err ? <p className="text-sm text-red-600">{err}</p> : null}
          <textarea
            className="pill-input min-h-[120px] rounded-2xl"
            placeholder="Giới thiệu ngắn / loại hàng dự kiến (tuỳ chọn)"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-brand-green py-3 font-semibold text-white disabled:opacity-60"
          >
            {loading ? "Đang gửi…" : "Gửi đơn"}
          </button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}
