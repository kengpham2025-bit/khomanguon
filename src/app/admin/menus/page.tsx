"use client";

import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { notifyError, notifySuccess } from "@/lib/notify";

type Row = {
  id: string;
  parent_id: string | null;
  label: string;
  href: string;
  sort_order: number;
  is_active: number;
};

export default function AdminMenusPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [label, setLabel] = useState("");
  const [href, setHref] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [err, setErr] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  async function refresh() {
    const r = await fetch("/api/admin/menus");
    const d = (await r.json()) as { menus?: Row[] };
    if (r.ok) setRows(d.menus || []);
  }

  useEffect(() => { refresh(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/admin/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label, href, parentId: parentId || null, sortOrder: 0 }),
    });
    const d = (await r.json()) as { error?: string };
    if (!r.ok) {
      const m = d.error || "Lỗi";
      setErr(m);
      notifyError(m);
      return;
    }
    notifySuccess("Đã thêm menu");
    setLabel(""); setHref(""); setParentId("");
    refresh();
  }

  async function confirmDelete(id: string) {
    await fetch("/api/admin/menus", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setDeleteId(null);
    notifySuccess("Đã xóa menu");
    await refresh();
  }

  const parents = rows.filter((x) => !x.parent_id);

  return (
    <div>
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={(open) => { if (!open) setDeleteId(null); }}
        title="Xóa menu?"
        description="Thao tác không hoàn tác. Menu sẽ biến mất trên header."
        confirmLabel="Xóa"
        variant="danger"
        onConfirm={() => { if (deleteId) void confirmDelete(deleteId); }}
      />
      <h1 className="page-title">Menu</h1>
      <p className="page-desc">Thêm menu cha (để trống menu cha) hoặc menu con (chọn parent).</p>

      <form onSubmit={add} className="admin-card" style={{ marginTop: "var(--space-8)", display: "grid", gap: "var(--space-3)" }}>
        {err ? <p style={{ gridColumn: "1 / -1", fontSize: "0.875rem", color: "var(--error-text)" }}>{err}</p> : null}
        <div className="grid sm\:grid-2 gap-3">
          <input className="input" placeholder="Nhãn" value={label} onChange={(e) => setLabel(e.target.value)} required />
          <input className="input" placeholder="Đường dẫn (vd. /tin-tuc)" value={href} onChange={(e) => setHref(e.target.value)} required />
        </div>
        <select className="select" value={parentId} onChange={(e) => setParentId(e.target.value)}>
          <option value="">Menu cha (cấp 1)</option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>Con của: {p.label}</option>
          ))}
        </select>
        <button type="submit" className="btn btn-primary w-full">Thêm menu</button>
      </form>

      <div className="admin-list" style={{ marginTop: "var(--space-10)" }}>
        {rows.map((m) => (
          <div key={m.id} className="admin-item">
            <span>
              {m.parent_id ? "↳ " : ""}
              <strong>{m.label}</strong> — {m.href}{" "}
              <span style={{ color: "var(--text-muted)" }}>({m.is_active ? "bật" : "tắt"})</span>
            </span>
            <button type="button" className="btn btn-ghost" style={{ color: "var(--error)", fontSize: "0.8125rem" }} onClick={() => setDeleteId(m.id)}>
              Xóa
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
