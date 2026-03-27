/**
 * src/lib/settings.ts
 *
 * Đọc / ghi cấu hình hệ thống từ bảng `settings` (D1).
 * Giá trị env var dùng làm DEFAULT khi chưa có trong DB.
 *
 * Các cặp key → label / mô tả / nhóm được khai báo tại SETTINGS_DEFINITIONS.
 */

import { getDb } from "@/lib/db";
import { turnstileSecret, turnstileSiteKey } from "@/lib/env-edge";
import { newId } from "@/lib/ids";

// ─── Types ─────────────────────────────────────────────────────────────────

export type SettingType = "string" | "number" | "boolean" | "json";

export type SettingDefinition = {
  key: string;
  group: string;
  label: string;
  description: string;
  type: SettingType;
  isSecret: boolean;
  defaultValue: string;
  placeholder?: string;
};

export type SettingRow = {
  id: string;
  key: string;
  value: string;
  type: SettingType;
  label: string;
  description: string;
  is_secret: number;
  group: string;
  updated_at: number;
};

// ─── Definitions ─────────────────────────────────────────────────────────────

export const SETTINGS_DEFINITIONS: SettingDefinition[] = [
  // ── Chung ────────────────────────────────────────────────────────────────
  {
    key: "app_name",
    group: "general",
    label: "Tên website",
    description: "Tên hiển thị trên thanh tiêu đề trình duyệt và email.",
    type: "string",
    isSecret: false,
    defaultValue: "Kho Mã Nguồn",
    placeholder: "Kho Mã Nguồn",
  },
  {
    key: "app_url",
    group: "general",
    label: "URL website",
    description: "Dùng để tạo liên kết tuyệt đối trong email (đăng ký, quên mật khẩu…).",
    type: "string",
    isSecret: false,
    defaultValue: process.env.NEXT_PUBLIC_APP_URL ?? "https://khomanguon.io.vn",
    placeholder: "https://khomanguon.io.vn",
  },
  {
    key: "app_phone",
    group: "general",
    label: "Số điện thoại hotline",
    description: "Hiển thị ở top-bar và trang liên hệ.",
    type: "string",
    isSecret: false,
    defaultValue: "0901 234 567",
    placeholder: "0901 234 567",
  },
  {
    key: "app_email",
    group: "general",
    label: "Email hỗ trợ",
    description: "Hiển thị ở top-bar, footer và dùng làm địa chỉ gửi email tự động.",
    type: "string",
    isSecret: false,
    defaultValue: "support@khomanguon.io.vn",
    placeholder: "support@khomanguon.io.vn",
  },

  // ── Captcha ──────────────────────────────────────────────────────────────
  {
    key: "turnstile_site_key",
    group: "security",
    label: "Turnstile Site Key",
    description: "Client key hiển thị trên form đăng nhập / đăng ký. Lấy từ cloudflare.com/turnstile.",
    type: "string",
    isSecret: false,
    defaultValue: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "",
    placeholder: "0x4AAAAAAB…",
  },
  {
    key: "turnstile_secret_key",
    group: "security",
    label: "Turnstile Secret Key",
    description: "Server key để xác thực token phía backend. Không hiển thị ra bên ngoài.",
    type: "string",
    isSecret: true,
    defaultValue: process.env.TURNSTILE_SECRET_KEY ?? "",
    placeholder: "0x4AAAAAAB…",
  },

  // ── Email ─────────────────────────────────────────────────────────────────
  {
    key: "resend_api_key",
    group: "email",
    label: "Resend API Key",
    description: "Key gửi email qua Resend (resend.com). Không hiển thị.",
    type: "string",
    isSecret: true,
    defaultValue: process.env.RESEND_API_KEY ?? "",
    placeholder: "re_…",
  },
  {
    key: "email_from",
    group: "email",
    label: "Địa chỉ gửi (From)",
    description: "Địa chỉ email dùng làm người gửi khi hệ thống gửi mail tự động.",
    type: "string",
    isSecret: false,
    defaultValue: process.env.EMAIL_FROM ?? '"Kho Mã Nguồn" <noreply@khomanguon.io.vn>',
    placeholder: '"Kho Mã Nguồn" <noreply@khomanguon.io.vn>',
  },

  // ── PayOS ────────────────────────────────────────────────────────────────
  {
    key: "payos_client_id",
    group: "payment",
    label: "PayOS Client ID",
    description: "Lấy từ merchant.payos.vn → Cài đặt → Thông tin tích hợp.",
    type: "string",
    isSecret: true,
    defaultValue: process.env.PAYOS_CLIENT_ID ?? "",
    placeholder: "…",
  },
  {
    key: "payos_api_key",
    group: "payment",
    label: "PayOS API Key",
    description: "Lấy từ merchant.payos.vn. Không hiển thị.",
    type: "string",
    isSecret: true,
    defaultValue: process.env.PAYOS_API_KEY ?? "",
    placeholder: "…",
  },
  {
    key: "payos_checksum_key",
    group: "payment",
    label: "PayOS Checksum Key",
    description: "Lấy từ merchant.payos.vn. Không hiển thị.",
    type: "string",
    isSecret: true,
    defaultValue: process.env.PAYOS_CHECKSUM_KEY ?? "",
    placeholder: "…",
  },

  // ── AI Rewrite ────────────────────────────────────────────────────────────
  {
    key: "groq_api_key",
    group: "ai",
    label: "Groq API Key",
    description: "Key dùng để biên tập lại nội dung tin tức tự động. Lấy từ console.groq.com.",
    type: "string",
    isSecret: true,
    defaultValue: process.env.GROQ_API_KEY ?? "",
    placeholder: "gsk_…",
  },

  // ── OAuth ─────────────────────────────────────────────────────────────────
  {
    key: "google_client_id",
    group: "oauth",
    label: "Google Client ID",
    description: "OAuth Client ID từ Google Cloud Console. Redirect URI: {APP_URL}/api/auth/oauth/google/callback",
    type: "string",
    isSecret: true,
    defaultValue: process.env.GOOGLE_CLIENT_ID ?? "",
    placeholder: "…apps.googleusercontent.com",
  },
  {
    key: "google_client_secret",
    group: "oauth",
    label: "Google Client Secret",
    description: "OAuth Client Secret từ Google Cloud Console. Không hiển thị.",
    type: "string",
    isSecret: true,
    defaultValue: process.env.GOOGLE_CLIENT_SECRET ?? "",
    placeholder: "…",
  },
  {
    key: "facebook_app_id",
    group: "oauth",
    label: "Facebook App ID",
    description: "App ID từ Meta for Developers. Redirect URI: {APP_URL}/api/auth/oauth/facebook/callback",
    type: "string",
    isSecret: true,
    defaultValue: process.env.FACEBOOK_APP_ID ?? "",
    placeholder: "…",
  },
  {
    key: "facebook_app_secret",
    group: "oauth",
    label: "Facebook App Secret",
    description: "App Secret từ Meta for Developers. Không hiển thị.",
    type: "string",
    isSecret: true,
    defaultValue: process.env.FACEBOOK_APP_SECRET ?? "",
    placeholder: "…",
  },
];

// ─── In-memory cache ─────────────────────────────────────────────────────────

interface CacheEntry {
  rows: SettingRow[];
  ts: number;
}

let _cache: CacheEntry | null = null;
const CACHE_TTL_MS = 30_000; // 30s

function cacheValid() {
  return _cache && Date.now() - _cache.ts < CACHE_TTL_MS;
}

// ─── Core DB helpers ─────────────────────────────────────────────────────────

export async function _fetchAllRows(): Promise<SettingRow[]> {
  const db = await getDb();
  const rows = await db
    .prepare("SELECT * FROM settings ORDER BY \"group\", key")
    .all<SettingRow>();
  return rows.results ?? [];
}

/** Đọc toàn bộ settings (dùng cache). */
export async function getAllSettings(): Promise<SettingRow[]> {
  if (cacheValid()) return _cache!.rows;
  const rows = await _fetchAllRows();
  _cache = { rows, ts: Date.now() };
  return rows;
}

/** Đọc giá trị một key, fallback về defaultValue định nghĩa ở trên. */
export async function getSetting(key: string): Promise<string> {
  const rows = await getAllSettings();
  const row = rows.find((r) => r.key === key);
  const def = SETTINGS_DEFINITIONS.find((d) => d.key === key);
  // Turnstile: ưu tiên env Worker (Dashboard) trước D1 — tránh seed/admin lưu secret cũ/sai làm siteverify fail
  if (key === "turnstile_site_key") {
    const site = turnstileSiteKey();
    if (site) return site;
  }
  if (key === "turnstile_secret_key") {
    const sec = turnstileSecret();
    if (sec) return sec;
  }
  if (row !== undefined && row.value.trim() !== "") return row.value;
  return def?.defaultValue ?? "";
}

/** Đọc nhiều key cùng lúc. */
export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  for (const k of keys) {
    result[k] = await getSetting(k);
  }
  return result;
}

/** Cập nhật một setting. Tự tạo nếu chưa có. */
export async function upsertSetting(
  key: string,
  value: string,
  type: SettingType = "string"
): Promise<void> {
  const db = await getDb();
  const now = Math.floor(Date.now() / 1000);
  const def = SETTINGS_DEFINITIONS.find((d) => d.key === key);
  await db
    .prepare(
      `INSERT INTO settings (id, "group", key, value, type, label, description, is_secret, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
       ON CONFLICT(key) DO UPDATE SET
         value = excluded.value,
         type  = excluded.type,
         label = excluded.label,
         description = excluded.description,
         is_secret   = excluded.is_secret,
         updated_at  = excluded.updated_at`
    )
    .bind(
      newId(),
      def?.group ?? "general",
      key,
      value,
      type,
      def?.label ?? key,
      def?.description ?? "",
      def?.isSecret ? 1 : 0,
      now
    )
    .run();
  _cache = null; // invalidate
}

/** Xoá cache để buộc đọc lại từ DB. */
export function invalidateCache() {
  _cache = null;
}

// ─── Seeding ─────────────────────────────────────────────────────────────────

/**
 * Seed bảng settings từ giá trị mặc định (env var hoặc chuỗi rỗng).
 * Chỉ chèn những key chưa tồn tại — KHÔNG ghi đè giá trị hiện có trong DB.
 */
export async function seedSettings(): Promise<void> {
  const db = await getDb();
  const now = Math.floor(Date.now() / 1000);

  for (const def of SETTINGS_DEFINITIONS) {
    const existing = await db
      .prepare("SELECT 1 FROM settings WHERE key = ?1")
      .bind(def.key)
      .first();
    if (existing) continue;

    await db
      .prepare(
        `INSERT INTO settings (id, "group", key, value, type, label, description, is_secret, updated_at)
         VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`
      )
      .bind(
        newId(),
        def.group,
        def.key,
        def.defaultValue,
        def.type,
        def.label,
        def.description,
        def.isSecret ? 1 : 0,
        now
      )
      .run();
  }

  _cache = null;
}

// ─── Grouped helpers (dùng trong admin UI) ───────────────────────────────────

export type SettingsGroup = {
  group: string;
  label: string;
  items: SettingRow[];
};

export async function getSettingsGrouped(): Promise<SettingsGroup[]> {
  const rows = await getAllSettings();
  const groups = new Map<string, SettingsGroup>();

  for (const def of SETTINGS_DEFINITIONS) {
    if (!groups.has(def.group)) {
      groups.set(def.group, { group: def.group, label: groupLabel(def.group), items: [] });
    }
  }

  for (const row of rows) {
    const g = groups.get(row.group);
    if (g) g.items.push(row);
  }

  return Array.from(groups.values()).filter((g) => g.items.length > 0);
}

const GROUP_LABELS: Record<string, string> = {
  general: "Tổng quan",
  security: "Bảo mật & Captcha",
  email: "Email",
  payment: "Thanh toán (PayOS)",
  ai: "AI (Groq)",
  oauth: "Đăng nhập OAuth",
};

function groupLabel(key: string): string {
  return GROUP_LABELS[key] ?? key;
}
