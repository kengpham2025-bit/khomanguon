import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

export const dynamic = "force-dynamic";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

const CREATE_TABLES_SQL = [
  `CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    clerk_id TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    username TEXT,
    full_name TEXT,
    avatar_url TEXT,
    balance REAL NOT NULL DEFAULT 0,
    role TEXT NOT NULL DEFAULT 'user',
    language TEXT NOT NULL DEFAULT 'vi',
    referral_code TEXT NOT NULL UNIQUE,
    referred_by TEXT,
    kyc_status TEXT NOT NULL DEFAULT 'none',
    kyc_cccd_front TEXT,
    kyc_cccd_back TEXT,
    kyc_cccd_number TEXT,
    kyc_submitted_at INTEGER,
    bank_name TEXT,
    bank_code TEXT,
    bank_account_number TEXT,
    bank_account_holder TEXT,
    is_affiliate_active INTEGER NOT NULL DEFAULT 0,
    total_earnings REAL NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name_vi TEXT NOT NULL,
    name_en TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    icon TEXT NOT NULL,
    description_vi TEXT,
    description_en TEXT,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    parent_id TEXT,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    seller_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    subcategory_id TEXT,
    title_vi TEXT NOT NULL,
    title_en TEXT NOT NULL,
    slug_vi TEXT NOT NULL,
    slug_en TEXT NOT NULL,
    description_vi TEXT NOT NULL DEFAULT '',
    description_en TEXT NOT NULL DEFAULT '',
    demo_images TEXT NOT NULL DEFAULT '[]',
    download_links TEXT NOT NULL DEFAULT '[]',
    is_hot INTEGER NOT NULL DEFAULT 0,
    is_sale INTEGER NOT NULL DEFAULT 0,
    is_new INTEGER NOT NULL DEFAULT 0,
    rating REAL NOT NULL DEFAULT 0,
    review_count INTEGER NOT NULL DEFAULT 0,
    sales INTEGER NOT NULL DEFAULT 0,
    views INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS variants (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    label_vi TEXT NOT NULL,
    label_en TEXT NOT NULL,
    price REAL NOT NULL,
    original_price REAL,
    stock INTEGER NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS cart_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id TEXT NOT NULL REFERENCES variants(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    buyer_id TEXT NOT NULL REFERENCES users(id),
    seller_id TEXT NOT NULL REFERENCES users(id),
    product_id TEXT NOT NULL REFERENCES products(id),
    variant_id TEXT NOT NULL REFERENCES variants(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price REAL NOT NULL,
    total_price REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payment_method TEXT,
    payment_id TEXT,
    payos_transaction_no TEXT,
    transfer_content TEXT,
    delivered_at INTEGER,
    completed_at INTEGER,
    cancellation_reason TEXT,
    dispute_reason TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS deposits (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    payos_order_code TEXT NOT NULL,
    payos_transaction_no TEXT,
    payos_payment_link_id TEXT,
    payos_checkout_url TEXT,
    referral_code TEXT,
    affiliate_commission REAL,
    note TEXT,
    created_at INTEGER NOT NULL,
    completed_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS withdrawals (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    amount REAL NOT NULL,
    bank_name TEXT NOT NULL,
    bank_code TEXT NOT NULL,
    account_number TEXT NOT NULL,
    account_holder TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_note TEXT,
    processed_at INTEGER,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS chat_rooms (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    order_id TEXT,
    buyer_id TEXT,
    seller_id TEXT,
    user_id TEXT,
    last_message TEXT,
    last_message_at INTEGER,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    is_read INTEGER NOT NULL DEFAULT 0,
    attachment_url TEXT,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS reviews (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id),
    product_id TEXT NOT NULL REFERENCES products(id),
    buyer_id TEXT NOT NULL REFERENCES users(id),
    seller_id TEXT NOT NULL REFERENCES users(id),
    rating INTEGER NOT NULL,
    comment_vi TEXT,
    comment_en TEXT,
    is_visible INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS news_articles (
    id TEXT PRIMARY KEY,
    title_vi TEXT NOT NULL,
    title_en TEXT NOT NULL,
    slug_vi TEXT NOT NULL UNIQUE,
    slug_en TEXT NOT NULL UNIQUE,
    excerpt_vi TEXT,
    excerpt_en TEXT,
    content_vi TEXT NOT NULL,
    content_en TEXT NOT NULL,
    author TEXT,
    source_url TEXT,
    cover_image TEXT,
    tags TEXT NOT NULL DEFAULT '[]',
    is_published INTEGER NOT NULL DEFAULT 0,
    is_featured INTEGER NOT NULL DEFAULT 0,
    published_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS seo_settings (
    id TEXT PRIMARY KEY,
    page_key TEXT NOT NULL UNIQUE,
    title_vi TEXT,
    title_en TEXT,
    description_vi TEXT,
    description_en TEXT,
    keywords_vi TEXT,
    keywords_en TEXT,
    og_image TEXT,
    canonical_url TEXT,
    json_ld_schema TEXT,
    no_index INTEGER NOT NULL DEFAULT 0,
    no_follow INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS otp_codes (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    purpose TEXT NOT NULL,
    expires_at INTEGER NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    is_used INTEGER NOT NULL DEFAULT 0,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS admin_logs (
    id TEXT PRIMARY KEY,
    admin_id TEXT NOT NULL REFERENCES users(id),
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT,
    details TEXT,
    ip TEXT,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS affiliate_logs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    referred_user_id TEXT NOT NULL REFERENCES users(id),
    deposit_id TEXT NOT NULL REFERENCES deposits(id),
    commission_amount REAL NOT NULL,
    deposit_amount REAL NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    created_at INTEGER NOT NULL
  )`,
];

const now = Math.floor(Date.now() / 1000);

const SEED_SQL = [
  // Seed user (seller)
  `INSERT OR IGNORE INTO users (id, clerk_id, email, username, full_name, balance, role, language, referral_code, kyc_status, is_affiliate_active, total_earnings, created_at, updated_at)
   VALUES ('seller-1', 'clerk_seed_seller_1', 'seller@khomanguon.io.vn', 'DevStudio', 'Dev Studio Official', 5000000, 'seller', 'vi', 'DEVSTUDIO01', 'approved', 1, 15000000, ${now}, ${now})`,
  `INSERT OR IGNORE INTO users (id, clerk_id, email, username, full_name, balance, role, language, referral_code, kyc_status, is_affiliate_active, total_earnings, created_at, updated_at)
   VALUES ('seller-2', 'clerk_seed_seller_2', 'ai@khomanguon.io.vn', 'AIAccounts', 'AI Accounts Store', 3000000, 'seller', 'vi', 'AIACCOUNT01', 'approved', 0, 8000000, ${now}, ${now})`,

  // Seed categories
  `INSERT OR IGNORE INTO categories (id, name_vi, name_en, slug, icon, sort_order, is_active, created_at)
   VALUES ('cat-1', 'Source Code', 'Source Code', 'source-code', 'Code', 1, 1, ${now})`,
  `INSERT OR IGNORE INTO categories (id, name_vi, name_en, slug, icon, sort_order, is_active, created_at)
   VALUES ('cat-2', 'Tài Khoản', 'Accounts', 'tai-khoan', 'UserCircle', 2, 1, ${now})`,
  `INSERT OR IGNORE INTO categories (id, name_vi, name_en, slug, icon, sort_order, is_active, created_at)
   VALUES ('cat-3', 'Phần Mềm', 'Software', 'phan-mem', 'Package', 3, 1, ${now})`,
  `INSERT OR IGNORE INTO categories (id, name_vi, name_en, slug, icon, sort_order, is_active, created_at)
   VALUES ('cat-4', 'Dịch Vụ', 'Services', 'dich-vu', 'Settings', 4, 1, ${now})`,

  // Seed products
  `INSERT OR IGNORE INTO products (id, seller_id, category_id, title_vi, title_en, slug_vi, slug_en, description_vi, description_en, demo_images, is_hot, is_sale, is_new, rating, review_count, sales, views, is_active, created_at, updated_at)
   VALUES ('prod-1', 'seller-1', 'cat-1', 'Mã nguồn Website Bán Hàng Pro', 'Pro E-commerce Website Source Code', 'ma-nguon-website-ban-hang-pro', 'pro-ecommerce-source-code', 'Mã nguồn website bán hàng chuyên nghiệp, tích hợp thanh toán, quản lý đơn hàng, SEO tối ưu.', 'Professional e-commerce website source code with integrated payment, order management, and SEO optimization.', '["https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop"]', 1, 1, 0, 4.8, 124, 890, 5420, 1, ${now}, ${now})`,
  `INSERT OR IGNORE INTO products (id, seller_id, category_id, title_vi, title_en, slug_vi, slug_en, description_vi, description_en, demo_images, is_hot, is_sale, is_new, rating, review_count, sales, views, is_active, created_at, updated_at)
   VALUES ('prod-2', 'seller-2', 'cat-2', 'Tài khoản ChatGPT Plus', 'ChatGPT Plus Account', 'tai-khoan-chatgpt-plus', 'chatgpt-plus-account', 'Tài khoản ChatGPT Plus Premium bản quyền. Sử dụng GPT-4, GPT-4o, DALL-E 3.', 'Licensed ChatGPT Plus Premium account. Access GPT-4, GPT-4o, DALL-E 3.', '["https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=225&fit=crop"]', 1, 0, 0, 4.9, 342, 2340, 12500, 1, ${now}, ${now})`,
  `INSERT OR IGNORE INTO products (id, seller_id, category_id, title_vi, title_en, slug_vi, slug_en, description_vi, description_en, demo_images, is_hot, is_sale, is_new, rating, review_count, sales, views, is_active, created_at, updated_at)
   VALUES ('prod-3', 'seller-2', 'cat-2', 'Tài khoản Claude Pro', 'Claude Pro Account', 'tai-khoan-claude-pro', 'claude-pro-account', 'Tài khoản Claude Pro by Anthropic. Mô hình AI mạnh mẽ nhất hiện nay.', 'Claude Pro account by Anthropic. The most powerful AI model available.', '["https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=225&fit=crop"]', 1, 1, 1, 4.7, 89, 560, 3200, 1, ${now}, ${now})`,
  `INSERT OR IGNORE INTO products (id, seller_id, category_id, title_vi, title_en, slug_vi, slug_en, description_vi, description_en, demo_images, is_hot, is_sale, is_new, rating, review_count, sales, views, is_active, created_at, updated_at)
   VALUES ('prod-4', 'seller-1', 'cat-3', 'Script Auto SEO Tool', 'Auto SEO Tool Script', 'script-auto-seo-tool', 'auto-seo-tool-script', 'Tool tự động SEO website, phân tích từ khóa, tối ưu meta tags.', 'Automated SEO tool for websites, keyword analysis, meta tag optimization.', '["https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?w=400&h=225&fit=crop"]', 1, 0, 0, 4.5, 56, 420, 2100, 1, ${now}, ${now})`,
  `INSERT OR IGNORE INTO products (id, seller_id, category_id, title_vi, title_en, slug_vi, slug_en, description_vi, description_en, demo_images, is_hot, is_sale, is_new, rating, review_count, sales, views, is_active, created_at, updated_at)
   VALUES ('prod-5', 'seller-2', 'cat-2', 'Tài khoản Midjourney', 'Midjourney Account', 'tai-khoan-midjourney', 'midjourney-account', 'Tài khoản Midjourney Premium tạo hình ảnh AI chất lượng cao.', 'Midjourney Premium account for high-quality AI image generation.', '["https://images.unsplash.com/photo-1547954575-855750c57bd3?w=400&h=225&fit=crop"]', 0, 1, 0, 4.8, 156, 780, 4500, 1, ${now}, ${now})`,

  // Seed variants
  `INSERT OR IGNORE INTO variants (id, product_id, label_vi, label_en, price, original_price, stock, sort_order, is_active, created_at, updated_at)
   VALUES ('var-1', 'prod-1', 'Basic', 'Basic', 299000, 499000, 10, 1, 1, ${now}, ${now})`,
  `INSERT OR IGNORE INTO variants (id, product_id, label_vi, label_en, price, original_price, stock, sort_order, is_active, created_at, updated_at)
   VALUES ('var-2', 'prod-1', 'Pro', 'Pro', 599000, 899000, 5, 2, 1, ${now}, ${now})`,
  `INSERT OR IGNORE INTO variants (id, product_id, label_vi, label_en, price, original_price, stock, sort_order, is_active, created_at, updated_at)
   VALUES ('var-3', 'prod-2', '1 Tháng', '1 Month', 199000, NULL, 50, 1, 1, ${now}, ${now})`,
  `INSERT OR IGNORE INTO variants (id, product_id, label_vi, label_en, price, original_price, stock, sort_order, is_active, created_at, updated_at)
   VALUES ('var-4', 'prod-2', '6 Tháng', '6 Months', 990000, NULL, 20, 2, 1, ${now}, ${now})`,
  `INSERT OR IGNORE INTO variants (id, product_id, label_vi, label_en, price, original_price, stock, sort_order, is_active, created_at, updated_at)
   VALUES ('var-5', 'prod-3', '1 Tháng', '1 Month', 249000, 320000, 30, 1, 1, ${now}, ${now})`,
  `INSERT OR IGNORE INTO variants (id, product_id, label_vi, label_en, price, original_price, stock, sort_order, is_active, created_at, updated_at)
   VALUES ('var-6', 'prod-4', 'Basic', 'Basic', 149000, NULL, 100, 1, 1, ${now}, ${now})`,
  `INSERT OR IGNORE INTO variants (id, product_id, label_vi, label_en, price, original_price, stock, sort_order, is_active, created_at, updated_at)
   VALUES ('var-7', 'prod-4', 'VIP', 'VIP', 349000, NULL, 50, 2, 1, ${now}, ${now})`,
  `INSERT OR IGNORE INTO variants (id, product_id, label_vi, label_en, price, original_price, stock, sort_order, is_active, created_at, updated_at)
   VALUES ('var-8', 'prod-5', 'Basic 200', 'Basic 200', 149000, 249000, 40, 1, 1, ${now}, ${now})`,
];

export async function GET() {
  const results: string[] = [];

  try {
    // Create tables
    for (const sql of CREATE_TABLES_SQL) {
      await client.execute(sql);
      const tableName = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1];
      results.push(`✅ Created table: ${tableName}`);
    }

    // Seed data
    for (const sql of SEED_SQL) {
      try {
        await client.execute(sql);
        results.push(`✅ Seeded data`);
      } catch (e: any) {
        results.push(`⚠️ Seed skipped (may already exist): ${e.message?.slice(0, 80)}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database setup complete!",
      results,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      results,
    }, { status: 500 });
  }
}
