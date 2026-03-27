"use client";

import { useCallback, useEffect, useState } from "react";
import { IconSettings, IconEye, IconEyeOff, IconCheck, IconAlertCircle } from "@/components/Icons";
import { notifyError, notifySuccess } from "@/lib/notify";

type SettingRow = {
  key: string;
  value: string;
  type: string;
  label: string;
  description: string;
  is_secret: number;
  group: string;
  updated_at: number;
};

type Group = { group: string; label: string; items: SettingRow[] };

const GROUP_ICONS: Record<string, string> = {
  general: "🏢",
  security: "🔐",
  email: "✉️",
  payment: "💳",
  ai: "🤖",
  oauth: "🔑",
};

export default function AdminSettingsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [hidden, setHidden] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string>("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = (await res.json()) as { groups?: Group[]; error?: string };
      if (!res.ok) {
        notifyError(data.error || "Không tải được cài đặt");
        return;
      }
      const gs = data.groups ?? [];
      setGroups(gs);
      if (gs.length && !activeGroup) setActiveGroup(gs[0].group);

      const vals: Record<string, string> = {};
      const hd: Record<string, boolean> = {};
      for (const g of gs) {
        for (const item of g.items) {
          vals[item.key] = item.value;
          hd[item.key] = Boolean(item.is_secret && !item.value);
        }
      }
      setValues(vals);
      setHidden(hd);
    } catch {
      notifyError("Lỗi kết nối");
    } finally {
      setLoading(false);
    }
  }, [activeGroup]);

  useEffect(() => { load(); }, [load]);

  async function handleSave(key: string) {
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/settings/${encodeURIComponent(key)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value: values[key] ?? "" }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        notifyError(data.error || "Lưu thất bại");
        return;
      }
      setSaved((s) => ({ ...s, [key]: true }));
      setLastSaved(new Date().toLocaleTimeString("vi-VN"));
      notifySuccess("�ã lưu: " + key);
      setTimeout(() => setSaved((s) => ({ ...s, [key]: false })), 2000);
    } catch {
      notifyError("Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  }

  function toggleHidden(key: string) {
    setHidden((h) => ({ ...h, [key]: !h[key] }));
  }

  if (loading) {
    return (
      <div className="admin-page">
        <div className="admin-card">
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: "2rem" }}>
            Đang tải cài đặt…
          </p>
        </div>
      </div>
    );
  }

  const currentGroup = groups.find((g) => g.group === activeGroup);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "var(--space-4)", flexWrap: "wrap" }}>
        <div>
          <h1 className="page-title">
            <IconSettings size={22} style={{ display: "inline", marginRight: "0.5rem" }} />
            Cài đặt hệ thống
          </h1>
          <p className="page-desc">
            Cấu hình website — thông tin này được lưu trong database và có thể thay đổi bất kỳ lúc nào.
          </p>
        </div>
        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", paddingTop: "var(--space-2)" }}>
          Lưu lần cuối: {lastSaved || "—"}
        </div>
      </div>

      <div className="settings-layout" style={{ marginTop: "var(--space-6)" }}>
        {/* Sidebar tabs */}
        <nav className="settings-sidebar">
          {groups.map((g) => (
            <button
              key={g.group}
              type="button"
              className={`settings-tab ${activeGroup === g.group ? "settings-tab-active" : ""}`}
              onClick={() => setActiveGroup(g.group)}
            >
              <span>{GROUP_ICONS[g.group] ?? "⚙️"}</span>
              {g.label}
            </button>
          ))}
        </nav>

        {/* Fields */}
        <div className="settings-content">
          {currentGroup ? (
            <>
              <h2 className="settings-group-title">
                {GROUP_ICONS[currentGroup.group] ?? "⚙️"} {currentGroup.label}
              </h2>

              <div className="settings-fields">
                {currentGroup.items.map((item) => {
                  const isSecret = Boolean(item.is_secret);
                  const isHidden = hidden[item.key] && isSecret;
                  return (
                    <div key={item.key} className="settings-field">
                      <div className="settings-field-header">
                        <label className="settings-field-label" htmlFor={`field-${item.key}`}>
                          {item.label}
                          {isSecret && (
                            <span className="settings-badge-secret">Bí mật</span>
                          )}
                        </label>
                        <span className="settings-field-key">{item.key}</span>
                      </div>
                      <p className="settings-field-desc">{item.description}</p>

                      <div className="settings-input-wrap">
                        <input
                          id={`field-${item.key}`}
                          type={isSecret && isHidden ? "password" : "text"}
                          className="settings-input"
                          value={values[item.key] ?? ""}
                          onChange={(e) =>
                            setValues((v) => ({ ...v, [item.key]: e.target.value }))
                          }
                          placeholder={item.key}
                          autoComplete="off"
                          spellCheck={false}
                        />
                        {isSecret ? (
                          <button
                            type="button"
                            className="settings-input-action"
                            onClick={() => toggleHidden(item.key)}
                            aria-label={isHidden ? "Hiện giá trị" : "Ẩn giá trị"}
                          >
                            {isHidden ? <IconEye size={16} /> : <IconEyeOff size={16} />}
                          </button>
                        ) : null}
                        <button
                          type="button"
                          className={`settings-save-btn ${saved[item.key] ? "settings-save-btn-ok" : ""}`}
                          onClick={() => handleSave(item.key)}
                          disabled={saving}
                          aria-label="Lưu"
                        >
                          {saved[item.key] ? <IconCheck size={15} /> : <IconAlertCircle size={15} />}
                          {saved[item.key] ? "Đã lưu" : "Lưu"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <p style={{ color: "var(--text-muted)", textAlign: "center" }}>Không có nhóm nào.</p>
          )}
        </div>
      </div>
    </div>
  );
}
