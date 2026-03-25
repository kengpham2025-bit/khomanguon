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

  useEffect(() => {
    refresh();
  }, []);

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
      <h1 className="text-2xl font-bold">KYC</h1>
      <ul className="mt-8 space-y-4">
        {list.map((u) => (
          <li key={u.id} className="rounded-2xl border border-slate-100 bg-white p-4">
            <p className="font-medium">
              {u.name} — {u.email}
            </p>
            <p className="text-sm text-slate-600">Trạng thái: {u.kyc_status}</p>
            {u.kyc_status === "pending" ? (
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                  onClick={() => setStatus(u.id, "verified")}
                >
                  Duyệt (tích xanh)
                </button>
                <button
                  type="button"
                  className="rounded-full border border-red-200 px-4 py-2 text-sm text-red-700"
                  onClick={() => setStatus(u.id, "rejected")}
                >
                  Từ chối
                </button>
              </div>
            ) : null}
          </li>
        ))}
        {list.length === 0 ? <p className="text-slate-500">Chưa có hồ sơ.</p> : null}
      </ul>
    </div>
  );
}
