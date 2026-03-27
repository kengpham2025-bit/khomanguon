"use client";

import { useEffect, useState } from "react";

type AppRow = {
  id: string;
  user_id: string;
  message: string | null;
  status: string;
  created_at: number;
  email: string;
  name: string;
};

export default function AdminSellerPage() {
  const [list, setList] = useState<AppRow[]>([]);

  async function refresh() {
    const r = await fetch("/api/admin/seller-applications");
    const d = (await r.json()) as { applications?: AppRow[] };
    if (r.ok) setList(d.applications || []);
  }

  useEffect(() => { refresh(); }, []);

  async function act(id: string, action: "approve" | "reject") {
    await fetch("/api/admin/seller-applications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    refresh();
  }

  return (
    <div>
      <h1 className="page-title">Đơn đăng ký bán hàng</h1>
      <div className="admin-list" style={{ marginTop: "var(--space-8)" }}>
        {list.map((a) => (
          <div key={a.id} className="admin-card" style={{ padding: "var(--space-4)" }}>
            <p style={{ fontWeight: 500 }}>{a.name} — {a.email}</p>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "var(--space-1)" }}>
              Trạng thái: <span className={`badge ${a.status === "pending" ? "badge-warning" : a.status === "approved" ? "badge-success" : "badge-error"}`}>{a.status}</span>
            </p>
            {a.message ? <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginTop: "var(--space-2)" }}>{a.message}</p> : null}
            {a.status === "pending" ? (
              <div className="flex gap-2" style={{ marginTop: "var(--space-3)" }}>
                <button type="button" className="btn btn-primary btn-sm" onClick={() => act(a.id, "approve")}>Duyệt</button>
                <button type="button" className="btn btn-outline btn-sm" style={{ color: "var(--error)", borderColor: "#fecaca" }} onClick={() => act(a.id, "reject")}>Từ chối</button>
              </div>
            ) : null}
          </div>
        ))}
        {list.length === 0 ? <p style={{ color: "var(--text-muted)" }}>Chưa có đơn.</p> : null}
      </div>
    </div>
  );
}
