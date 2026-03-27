"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IconCheckCircle, IconArrowLeft, IconWallet } from "@/components/Icons";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

type Deposit = { id: string; orderCode: number; amountCents: number; status: string };

function formatVnd(cents: number) { return cents.toLocaleString("vi-VN"); }

export default function NapTienThanhCongPage() {
  const [deposit, setDeposit] = useState<Deposit | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const depositId = params.get("depositId");
    if (!depositId) { setError("Thiếu mã giao dịch."); setLoading(false); return; }
    fetch("/api/deposit/history")
      .then((r) => r.json())
      .then((data: unknown) => {
        const { deposits } = data as { deposits?: Deposit[] };
        const found = (deposits ?? []).find((d) => d.id === depositId);
        setDeposit(found || { id: depositId, orderCode: 0, amountCents: 0, status: "pending" });
        setLoading(false);
      })
      .catch(() => { setError("Không thể tải thông tin giao dịch."); setLoading(false); });
  }, []);

  return (
    <>
      <SiteHeader />
      <main className="page-sm" style={{ textAlign: "center", paddingTop: "5rem", paddingBottom: "5rem" }}>
        {loading ? (
          <p style={{ color: "var(--text-muted)" }}>Đang kiểm tra giao dịch…</p>
        ) : error ? (
          <div>
            <p style={{ color: "var(--error-text)" }}>{error}</p>
            <Link href="/nap-tien" className="link-brand" style={{ display: "inline-block", marginTop: "var(--space-6)" }}>
              Quay lại trang nạp tiền
            </Link>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-6)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 80, height: 80, margin: "0 auto", borderRadius: "var(--radius-full)", background: "var(--success-bg)" }}>
              <IconCheckCircle size={40} color="var(--brand-green)" />
            </div>
            <div>
              <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--success-text)" }}>Nạp tiền thành công!</h1>
              <p style={{ marginTop: "var(--space-2)", color: "var(--text-secondary)" }}>Cảm ơn bạn đã nạp tiền. Số dư tài khoản đã được cập nhật.</p>
            </div>
            {deposit && deposit.amountCents > 0 && (
              <div className="card" style={{ textAlign: "left", background: "var(--success-bg)", borderColor: "#a7f3d0" }}>
                <div className="flex items-center gap-2" style={{ color: "var(--success-text)" }}>
                  <IconWallet size={20} />
                  <span style={{ fontWeight: 600 }}>Thông tin giao dịch</span>
                </div>
                <div style={{ marginTop: "var(--space-3)", fontSize: "0.875rem", display: "flex", flexDirection: "column", gap: "var(--space-2)" }}>
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-secondary)" }}>Số tiền</span>
                    <span style={{ fontWeight: 700, color: "var(--success-text)" }}>{formatVnd(deposit.amountCents)} VND</span>
                  </div>
                  {deposit.orderCode > 0 && (
                    <div className="flex justify-between">
                      <span style={{ color: "var(--text-secondary)" }}>Mã đơn</span>
                      <span style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>{deposit.orderCode}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span style={{ color: "var(--text-secondary)" }}>Trạng thái</span>
                    <span className="badge badge-success">{deposit.status === "success" ? "Thành công" : "Đang xử lý"}</span>
                  </div>
                </div>
              </div>
            )}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-3)" }}>
              <Link href="/tai-khoan" className="pill-btn-primary" style={{ textDecoration: "none" }}>Quay về tài khoản</Link>
              <Link href="/nap-tien" className="btn btn-secondary" style={{ justifyContent: "center" }}>
                <IconArrowLeft size={16} /> Nạp thêm tiền
              </Link>
            </div>
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
