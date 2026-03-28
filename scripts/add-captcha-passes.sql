-- Chạy một lần nếu DB cũ chưa có bảng (vé captcha không JWT):
-- wrangler d1 execute khomanguonnew --remote --file=./scripts/add-captcha-passes.sql

CREATE TABLE IF NOT EXISTS captcha_passes (
  id TEXT PRIMARY KEY,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_captcha_passes_expires ON captcha_passes(expires_at);
