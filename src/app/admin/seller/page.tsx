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

  useEffect(() => {
    refresh();
  }, []);

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
      <h1 className="text-2xl font-bold">Đơn đăng ký bán hàng</h1>
      <ul className="mt-8 space-y-4">
        {list.map((a) => (
          <li key={a.id} className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="font-medium">
              {a.name} — {a.email}
            </p>
            <p className="text-xs text-slate-500">Trạng thái: {a.status}</p>
            {a.message ? <p className="mt-2 text-sm text-slate-700">{a.message}</p> : null}
            {a.status === "pending" ? (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  className="rounded-full bg-brand-green px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => act(a.id, "approve")}
                >
                  Duyệt
                </button>
                <button
                  type="button"
                  className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-700"
                  onClick={() => act(a.id, "reject")}
                >
                  Từ chối
                </button>
              </div>
            ) : null}
          </li>
        ))}
        {list.length === 0 ? <p className="text-slate-500">Chưa có đơn.</p> : null}
      </ul>
    </div>
  );
}
