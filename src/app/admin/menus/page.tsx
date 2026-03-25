"use client";

import { useEffect, useState } from "react";

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

  async function refresh() {
    const r = await fetch("/api/admin/menus");
    const d = (await r.json()) as { menus?: Row[] };
    if (r.ok) setRows(d.menus || []);
  }

  useEffect(() => {
    refresh();
  }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const r = await fetch("/api/admin/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        label,
        href,
        parentId: parentId || null,
        sortOrder: 0,
      }),
    });
    const d = (await r.json()) as { error?: string };
    if (!r.ok) {
      setErr(d.error || "Lỗi");
      return;
    }
    setLabel("");
    setHref("");
    setParentId("");
    refresh();
  }

  async function remove(id: string) {
    if (!confirm("Xóa menu này?")) return;
    await fetch("/api/admin/menus", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    refresh();
  }

  const parents = rows.filter((x) => !x.parent_id);

  return (
    <div>
      <h1 className="text-2xl font-bold">Menu</h1>
      <p className="mt-2 text-sm text-slate-600">Thêm menu cha (để trống menu cha) hoặc menu con (chọn parent).</p>

      <form onSubmit={add} className="mt-8 grid gap-3 rounded-2xl border border-slate-200 bg-white p-6 sm:grid-cols-2">
        {err ? <p className="sm:col-span-2 text-sm text-red-600">{err}</p> : null}
        <input className="pill-input" placeholder="Nhãn" value={label} onChange={(e) => setLabel(e.target.value)} required />
        <input className="pill-input" placeholder="Đường dẫn (/cua-hang)" value={href} onChange={(e) => setHref(e.target.value)} required />
        <select className="pill-input sm:col-span-2" value={parentId} onChange={(e) => setParentId(e.target.value)}>
          <option value="">Menu cha (cấp 1)</option>
          {parents.map((p) => (
            <option key={p.id} value={p.id}>
              Con của: {p.label}
            </option>
          ))}
        </select>
        <button type="submit" className="sm:col-span-2 rounded-full bg-brand-green py-3 font-semibold text-white">
          Thêm menu
        </button>
      </form>

      <ul className="mt-10 space-y-4">
        {rows.map((m) => (
          <li key={m.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm">
            <span>
              {m.parent_id ? "↳ " : ""}
              <strong>{m.label}</strong> — {m.href}{" "}
              <span className="text-slate-400">({m.is_active ? "bật" : "tắt"})</span>
            </span>
            <button type="button" className="text-red-600 hover:underline" onClick={() => remove(m.id)}>
              Xóa
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
