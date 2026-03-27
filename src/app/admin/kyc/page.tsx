"use client";

import { useEffect, useState } from "react";

type U = { id: string; email: string; name: string; kyc_status: string; kyc_submitted_at: number | null };

export default function AdminKycPage() {
  const [list, setList] = useState<U[]>([]);

  async function refresh() {
    const r = await fetch("/api/admin/kyc");
    const d = (await r.json()) as { users?: U[] };
    if (r.ok) setList(d.users || []);
  }

  useEffect(() => { refresh(); }, []);

  async function setStatus(userId: string, status: "verified" | "rejected" | "none") {
    await fetch("/api/admin/kyc", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status }),
    });
    refresh();
  }

  return (
    <div>
      <h1 className="page-title">KYC</h1>
      <div className="admin-list" style={{ marginTop: "var(--space-8)" }}>
        {list.map((u) => (
          <div key={u.id} className="admin-card" style={{ padding: "var(--space-4)" }}>
            <p style={{ fontWeight: 500 }}>{u.name} — {u.email}</p>
            <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "var(--space-1)" }}>
              Trạng thái: <span className={`badge ${u.kyc_status === "pending" ? "badge-warning" : u.kyc_status === "verified" ? "badge-success" : "badge-neutral"}`}>{u.kyc_status}</span>
            </p>
            {u.kyc_status === "pending" ? (
              <div className="flex flex-wrap gap-2" style={{ marginTop: "var(--space-3)" }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => setStatus(u.id, "verified")}>Duyệt (tích xanh)</button>
                <button type="button" className="btn btn-outline btn-sm" style={{ color: "var(--error)", borderColor: "#fecaca" }} onClick={() => setStatus(u.id, "rejected")}>Từ chối</button>
              </div>
            ) : null}
          </div>
        ))}
        {list.length === 0 ? <p style={{ color: "var(--text-muted)" }}>Chưa có hồ sơ.</p> : null}
      </div>
    </div>
  );
}
