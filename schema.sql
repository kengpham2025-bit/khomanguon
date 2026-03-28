-- Kho Mã Nguồn — D1 schema (chạy: npm run d1:migrate hoặc d1:migrate:local)
PRAGMA foreign_keys = ON;

-- =====================
-- BẢNG CƠ BẢN
-- =====================

CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','seller','admin')),
  email_verified_at INTEGER,
  seller_status TEXT NOT NULL DEFAULT 'none' CHECK (seller_status IN ('none','pending','approved','rejected')),
  kyc_status TEXT NOT NULL DEFAULT 'none' CHECK (kyc_status IN ('none','pending','verified','rejected')),
  kyc_cccd_note TEXT,
  kyc_submitted_at INTEGER,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

-- =====================
-- BẢNG SỐ DƯ & NẠP TIỀN
-- =====================

-- Số dư tài khoản của người bán
CREATE TABLE IF NOT EXISTS user_balances (
  user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  balance_cents INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

-- Lịch sử nạp tiền qua PayOS
CREATE TABLE IF NOT EXISTS deposits (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  order_code INTEGER NOT NULL UNIQUE,
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','success','failed','cancelled')),
  payos_transaction_no TEXT,
  payos_reference TEXT,
  description TEXT,
  checkout_url TEXT,
  created_at INTEGER NOT NULL,
  completed_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_deposits_user ON deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_deposits_order_code ON deposits(order_code);

-- =====================
-- BẢNG HỖ TRỢ
-- =====================

CREATE TABLE IF NOT EXISTS tokens (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email_verify','withdraw_otp')),
  ref_id TEXT,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tokens_user ON tokens(user_id);

CREATE TABLE IF NOT EXISTS menus (
  id TEXT PRIMARY KEY,
  parent_id TEXT REFERENCES menus(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active INTEGER NOT NULL DEFAULT 1,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  seller_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  price_cents INTEGER NOT NULL DEFAULT 0,
  category_slug TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_products_seller ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

-- =====================
-- TIN TỨC (chỉ /tin-tuc, không hiển thị trên trang chủ)
-- =====================

CREATE TABLE IF NOT EXISTS news_posts (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  excerpt TEXT,
  content_html TEXT NOT NULL,
  source_url TEXT,
  seo_keywords TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL,
  published_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_news_status ON news_posts(status);
CREATE INDEX IF NOT EXISTS idx_news_published ON news_posts(published_at);

-- =====================
-- OAUTH (Google / Facebook)
-- =====================

CREATE TABLE IF NOT EXISTS oauth_states (
  id TEXT PRIMARY KEY,
  state TEXT NOT NULL UNIQUE,
  redirect_to TEXT NOT NULL,
  provider TEXT NOT NULL CHECK (provider IN ('google','facebook')),
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_oauth_state ON oauth_states(state);
CREATE INDEX IF NOT EXISTS idx_oauth_expires ON oauth_states(expires_at);

CREATE TABLE IF NOT EXISTS seller_applications (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  created_at INTEGER NOT NULL,
  reviewed_at INTEGER
);

CREATE TABLE IF NOT EXISTS bank_accounts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bank_code TEXT NOT NULL,
  account_number TEXT NOT NULL,
  account_name TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS withdrawals (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  bank_account_id TEXT NOT NULL REFERENCES bank_accounts(id),
  amount_cents INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_otp' CHECK (status IN ('pending_otp','processing','done','rejected')),
  created_at INTEGER NOT NULL,
  completed_at INTEGER
);

-- =====================
-- MÃ CAPTCHA
-- =====================
CREATE TABLE IF NOT EXISTS captchas (
  id TEXT PRIMARY KEY,
  code_hash TEXT NOT NULL,
  ip TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_captchas_expires ON captchas(expires_at);

-- Vé xác minh captcha một lần (không dùng JWT_SECRET)
CREATE TABLE IF NOT EXISTS captcha_passes (
  id TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_captcha_passes_expires ON captcha_passes(expires_at);

-- =====================
-- SESSION (D1-based, không dùng JWT_SECRET)
-- =====================
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);

-- =====================
-- CẤU HÌNH HỆ THỐNG (admin quản lý qua /admin/settings)
-- =====================
CREATE TABLE IF NOT EXISTS settings (
  id TEXT PRIMARY KEY,
  "group" TEXT NOT NULL DEFAULT 'general',
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'string' CHECK (type IN ('string','number','boolean','json')),
  label TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  is_secret INTEGER NOT NULL DEFAULT 0,
  updated_at INTEGER NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_group ON settings("group");
