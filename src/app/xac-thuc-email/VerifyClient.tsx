"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function VerifyClient() {
  const sp = useSearchParams();
  const token = sp.get("token");
  const [msg, setMsg] = useState("Đang xác nhận…");
  const [ok, setOk] = useState(false);

  useEffect(() => {
    if (!token) {
      setMsg("Thiếu liên kết xác nhận.");
      return;
    }
    fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (r) => {
        const d = (await r.json()) as { error?: string; ok?: boolean };
        if (!r.ok) {
          setMsg(d.error || "Xác nhận thất bại");
          return;
        }
        setOk(true);
        setMsg("Email đã được xác nhận. Bạn có thể đăng nhập.");
      })
      .catch(() => setMsg("Lỗi mạng"));
  }, [token]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <p className={`text-center text-lg ${ok ? "text-emerald-600" : "text-slate-800"}`}>{msg}</p>
      <Link href="/dang-nhap" className="mt-6 text-brand-blue underline">
        Đăng nhập
      </Link>
    </div>
  );
}
