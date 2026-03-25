"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { BankIcon } from "@/components/BankIcon";
import { VN_BANKS } from "@/lib/vn-banks";

const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

type Account = { id: string; bank_code: string; account_number: string; account_name: string };

export default function WithdrawPage() {
  const [meOk, setMeOk] = useState<boolean | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [banks, setBanks] = useState<{ code: string; name: string }[]>([]);
  const [bankCode, setBankCode] = useState("");
  const [accNum, setAccNum] = useState("");
  const [accName, setAccName] = useState("");
  const [selId, setSelId] = useState("");
  const [amount, setAmount] = useState("");
  const [otp, setOtp] = useState("");
  const [wid, setWid] = useState<string | null>(null);
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  async function load() {
    const m = (await fetch("/api/me").then((r) => r.json())) as { user?: { isSellerApproved?: boolean } };
    const ok = Boolean(m.user?.isSellerApproved);
    setMeOk(ok);
    if (!ok) return;
    const b = (await fetch("/api/bank-accounts").then((r) => r.json())) as { accounts?: Account[]; banks?: { code: string; name: string }[] };
    if (b.accounts) {
      setAccounts(b.accounts);
      setBanks(b.banks || VN_BANKS);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addBank(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch("/api/bank-accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bankCode,
        accountNumber: accNum,
        accountName: accName,
        isDefault: true,
      }),
    });
    const d = (await res.json()) as { error?: string; message?: string; ok?: boolean; withdrawalId?: string };
    if (!res.ok) {
      setErr(d.error || "Lỗi");
      return;
    }
    setBankCode("");
    setAccNum("");
    setAccName("");
    load();
  }

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (!siteKey || !token) {
      setErr("Cần Captcha");
      return;
    }
    const vnd = Number(String(amount).replace(/\D/g, ""));
    if (!selId || !vnd) {
      setErr("Chọn TK ngân hàng và nhập số tiền");
      return;
    }
    const res = await fetch("/api/withdraw/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bankAccountId: selId,
        amountVnd: vnd,
        turnstileToken: token,
      }),
    });
    const d = (await res.json()) as { error?: string; message?: string; ok?: boolean; withdrawalId?: string };
    if (!res.ok) {
      setErr(d.error || "Lỗi");
      return;
    }
    setWid(d.withdrawalId ?? null);
    setMsg(d.message || "Đã gửi OTP.");
  }

  async function confirmOtp(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!wid) return;
    const res = await fetch("/api/withdraw/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ withdrawalId: wid, otp }),
    });
    const d = (await res.json()) as { error?: string; message?: string; ok?: boolean; withdrawalId?: string };
    if (!res.ok) {
      setErr(d.error || "Lỗi");
      return;
    }
    setMsg(d.message || "OK");
    setWid(null);
    setOtp("");
  }

  if (meOk === null) {
    return (
      <>
        <SiteHeader />
        <p className="py-24 text-center">Đang tải…</p>
      </>
    );
  }

  if (!meOk) {
    return (
      <>
        <SiteHeader />
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <p className="text-slate-600">Chỉ người bán đã duyệt mới rút tiền được.</p>
          <Link href="/dang-ky-ban-hang" className="mt-4 inline-block text-brand-blue">
            Đăng ký bán hàng
          </Link>
        </div>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-lg px-4 py-12">
        <Link href="/tai-khoan" className="text-sm text-brand-blue">
          ← Tài khoản
        </Link>
        <h1 className="mt-4 text-2xl font-bold">Rút tiền</h1>
        <p className="mt-2 text-sm text-slate-600">OTP gửi về email. Icon ngân hàng lấy từ thư mục /symbol/banks.</p>

        <section className="mt-8 rounded-2xl border border-slate-100 bg-slate-50 p-6">
          <h2 className="font-semibold">Thêm tài khoản ngân hàng</h2>
          <form onSubmit={addBank} className="mt-4 space-y-3">
            <div className="grid max-h-48 grid-cols-4 gap-2 overflow-y-auto">
              {banks.map((b) => (
                <button
                  key={b.code}
                  type="button"
                  title={b.name}
                  onClick={() => setBankCode(b.code)}
                  className={`rounded-lg border p-2 ${bankCode === b.code ? "border-brand-green ring-2 ring-brand-green/30" : "border-slate-200"}`}
                >
                  <BankIcon code={b.code} name={b.name} />
                </button>
              ))}
            </div>
            <input className="pill-input bg-white" placeholder="Số tài khoản" value={accNum} onChange={(e) => setAccNum(e.target.value)} />
            <input className="pill-input bg-white" placeholder="Tên chủ TK" value={accName} onChange={(e) => setAccName(e.target.value)} />
            <button type="submit" className="rounded-full bg-slate-800 px-6 py-2 text-sm font-semibold text-white">
              Lưu
            </button>
          </form>
        </section>

        <section className="mt-8 rounded-2xl border border-slate-100 p-6">
          <h2 className="font-semibold">Yêu cầu rút</h2>
          {err ? <p className="mt-2 text-sm text-red-600">{err}</p> : null}
          {msg ? <p className="mt-2 text-sm text-emerald-700">{msg}</p> : null}
          <form onSubmit={requestOtp} className="mt-4 space-y-3">
            <select className="pill-input bg-white" value={selId} onChange={(e) => setSelId(e.target.value)} required>
              <option value="">Chọn TK đã lưu</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.bank_code} — {a.account_number} — {a.account_name}
                </option>
              ))}
            </select>
            <input className="pill-input" placeholder="Số tiền (VND)" value={amount} onChange={(e) => setAmount(e.target.value)} />
            {siteKey ? (
              <div className="flex justify-center">
                <Turnstile siteKey={siteKey} onSuccess={setToken} onExpire={() => setToken("")} />
              </div>
            ) : null}
            <button type="submit" className="w-full rounded-full bg-brand-green py-3 font-semibold text-white">
              Gửi OTP email
            </button>
          </form>

          {wid ? (
            <form onSubmit={confirmOtp} className="mt-6 space-y-3 border-t border-slate-100 pt-6">
              <p className="text-sm text-slate-600">Nhập mã 6 số từ email</p>
              <input className="pill-input" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} />
              <button type="submit" className="w-full rounded-full bg-brand-blue py-3 font-semibold text-white">
                Xác nhận rút tiền
              </button>
            </form>
          ) : null}
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
