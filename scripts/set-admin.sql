-- =====================================================
-- TẠO TÀI KHOẢN ADMIN MẶC ĐỊNH
-- =====================================================
-- Chạy trên D1 local:
--   wrangler d1 execute khomanguonnew --local --file=./scripts/set-admin.sql
--
-- Chạy trên D1 remote (Cloudflare):
--   wrangler d1 execute khomanguonnew --remote --file=./scripts/set-admin.sql
-- =====================================================

-- Tài khoản admin mặc định:
--   Email:    admin@khomanguon.io.vn
--   Password: Admin@123456
--   Role:     admin (full access)
--   Email đã xác minh (email_verified_at set)

INSERT OR IGNORE INTO users (id, email, password_hash, name, phone, role, email_verified_at, seller_status, kyc_status, created_at, updated_at)
VALUES (
  '85de8f0d-2fec-4416-b41b-adca756740a2',
  'admin@khomanguon.io.vn',
  'v1.yj/cKLejc40f3+nRNZpu0w==.2XzqyB085KNwaPczb2s0Xz7KYzxfZiUIiwGMHGghMno=',
  'Quản trị viên',
  '',
  'admin',
  1735689600000,  -- 2025-01-01 00:00:00 UTC
  'none',
  'none',
  1735689600000,
  1735689600000
);
