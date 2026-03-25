"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BadgeCheck, LogOut, Store, Wallet } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

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

export default function AccountPage() {
  const router = useRouter();
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [price, setPrice] = useState("");
  const [pub, setPub] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() as Promise<{ user?: Me }> : null))
      .then((d) => setMe(d?.user ?? null))
      .catch(() => setMe(null));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function addProduct(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const priceVnd = Number(String(price).replace(/\D/g, ""));
    if (!title.trim() || !priceVnd) {
      setMsg("Nhập tiêu đề và giá (VND)");
      return;
    }
    const res = await fetch("/api/seller/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        description: desc,
        priceCents: priceVnd,
        publish: pub,
      }),
    });
    const d = (await res.json()) as { error?: string; ok?: boolean; id?: string; slug?: string };
    if (!res.ok) {
      setMsg(d.error || "Lỗi");
      return;
    }
    setMsg("Đã thêm sản phẩm.");
    setTitle("");
    setDesc("");
    setPrice("");
  }

  if (me === undefined) {
    return (
      <>
        <SiteHeader />
        <p className="py-24 text-center">Đang tải…</p>
      </>
    );
  }

  if (!me) {
    return (
      <>
        <SiteHeader />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-slate-600">Bạn cần đăng nhập.</p>
          <Link href="/dang-nhap" className="mt-4 inline-block text-brand-blue">
            Đăng nhập
          </Link>
        </div>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Tài khoản</h1>
            <p className="text-slate-600">{me.email}</p>
            <p className="mt-2 text-sm text-slate-500">{me.name}</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              {me.kycVerified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1 font-medium text-emerald-800">
                  <BadgeCheck className="h-3.5 w-3.5" /> Đã KYC
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">Chưa KYC / đang chờ</span>
              )}
              {me.isSellerApproved ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-3 py-1 font-medium text-blue-800">
                  <Store className="h-3.5 w-3.5" /> Người bán
                </span>
              ) : (
                <span className="rounded-full bg-amber-50 px-3 py-1 text-amber-800">Chưa duyệt bán hàng</span>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm hover:bg-slate-50"
          >
            <LogOut className="h-4 w-4" />
            Đăng xuất
          </button>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <Link
            href="/dang-ky-ban-hang"
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:border-brand-green/40"
          >
            <Store className="h-8 w-8 text-brand-green" />
            <h2 className="mt-3 font-semibold">Đăng ký bán hàng</h2>
            <p className="mt-1 text-sm text-slate-600">Gửi đơn chờ admin duyệt.</p>
          </Link>
          <Link
            href="/xac-minh-cccd"
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:border-brand-blue/40"
          >
            <BadgeCheck className="h-8 w-8 text-brand-blue" />
            <h2 className="mt-3 font-semibold">KYC CCCD</h2>
            <p className="mt-1 text-sm text-slate-600">Tải ảnh / ghi chú để được tích xanh.</p>
          </Link>
          {me.isSellerApproved ? (
            <Link
              href="/rut-tien"
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm hover:border-emerald-300 sm:col-span-2"
            >
              <Wallet className="h-8 w-8 text-emerald-600" />
              <h2 className="mt-3 font-semibold">Rút tiền (OTP email)</h2>
              <p className="mt-1 text-sm text-slate-600">Chỉ người bán đã duyệt. Thêm TK ngân hàng + Captcha.</p>
            </Link>
          ) : null}
        </div>

        {me.isSellerApproved ? (
          <section className="mt-12 rounded-2xl border border-slate-100 bg-slate-50/50 p-6">
            <h2 className="text-lg font-semibold">Thêm sản phẩm</h2>
            <p className="text-sm text-slate-600">Chưa KYC vẫn đăng được; sản phẩm sẽ có cảnh báo đỏ trên cửa hàng.</p>
            <form onSubmit={addProduct} className="mt-4 space-y-3">
              {msg ? <p className="text-sm text-emerald-700">{msg}</p> : null}
              <input
                className="pill-input bg-white"
                placeholder="Tiêu đề"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <textarea
                className="pill-input min-h-[100px] rounded-2xl bg-white py-3"
                placeholder="Mô tả"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
              />
              <input
                className="pill-input bg-white"
                placeholder="Giá (VND)"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={pub} onChange={(e) => setPub(e.target.checked)} />
                Xuất bản ngay
              </label>
              <button type="submit" className="rounded-full bg-brand-green px-6 py-3 text-sm font-semibold text-white">
                Lưu sản phẩm
              </button>
            </form>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </>
  );
}
