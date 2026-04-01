# KHOMANGUON.IO.VN - 項目規範文檔

## 1. 概念與願景

**KHOMANGUON.IO.VN** 是一個高端雙語（越南語/英語）數字市場平台，專注於源代碼、AI 帳號、Email、社交媒體帳號和 MMO 服務的銷售。採用 "Soft-UI" 設計語言，融合玻璃擬態（Glassmorphism）與柔和陰影，打造專業、可信賴的 SaaS 購物體驗。

## 2. 設計語言

### 色彩系統
- **主色調**: `indigo-600` (#4F46E5)
- **次要色**: `indigo-500` (#6366F1)
- **背景色**: `bg-slate-50` (#F8FAFC)
- **卡片背景**: `bg-white` (#FFFFFF)
- **成功色**: `green-500`
- **警告色**: `amber-500`
- **危險色**: `red-500`
- **文字主色**: `slate-900`
- **文字次色**: `slate-500`

### 形狀系統
- **卡片/模態**: `rounded-2xl` (16px 圓角)
- **按鈕/輸入框**: `rounded-full` (全圓角)
- **分類欄**: `rounded-xl` (12px 圓角)

### 效果系統
- **玻璃擬態**: `backdrop-blur-md bg-white/70`
- **陰影過渡**: `shadow-sm` → `shadow-xl hover:shadow-xl`
- **過渡動畫**: `transition-all duration-300 ease-in-out`

### 字體系統
- **主字體**: Inter (Google Fonts)
- **越南語字體**: 優先支援 Unicode 字元
- **字重**: 400 (正文), 500 (標題), 600 (強調), 700 (品牌)

### 圖標系統
- **100% lucide-react SVG 圖標**
- **嚴禁使用 Emoji**

## 3. 技術架構

### 前端技術棧
- **框架**: Next.js 14+ (App Router, i18n Routing)
- **UI/Styling**: Tailwind CSS, Shadcn UI, Framer Motion
- **圖標**: lucide-react
- **國際化**: next-intl

### 後端技術棧
- **數據庫**: Turso libSQL + Drizzle ORM
  - Cloud: `libsql://khomanguon-kengpham.aws-ap-northeast-1.turso.io`
  - Local dev: SQLite file (set `TURSO_LOCAL_URL=file:local_dev.db`)
- **ORM**: Drizzle ORM (type-safe, lightweight)
- **認證**: Clerk
- **驗證碼**: hCaptcha (replacing Cloudflare Turnstile)
- **郵件/OTP**: Resend API
- **支付**: PayOS API
- **AI 重寫**: Groq API (Llama 3/Mixtral)

## 4. Turso libSQL 數據模型 (Drizzle ORM)

### 核心表結構

#### users
- `_id`: v.id()
- `clerkId`: string (Clerk 用戶 ID)
- `email`: string
- `name`: string
- `avatarUrl`: string?
- `role`: "user" | "seller" | "admin"
- `balance`: number (VND)
- `affiliateCode`: string
- `referredBy`: v.id("users")?
- `isVerified`: boolean
- `kycStatus`: "none" | "pending" | "approved" | "rejected"
- `kycDocuments`: { idFront: string, idBack: string }?
- `language`: "vi" | "en"
- `createdAt`: number
- `updatedAt`: number

#### categories
- `_id`: v.id()
- `nameVi`: string
- `nameEn`: string
- `slug`: string
- `icon`: string (lucide icon name)
- `order`: number
- `isActive`: boolean
- `createdAt`: number

#### subcategories
- `_id`: v.id()
- `categoryId`: v.id("categories")
- `nameVi`: string
- `nameEn`: string
- `slug`: string
- `order`: number
- `isActive`: boolean

#### products
- `_id`: v.id()
- `sellerId`: v.id("users")
- `categoryId`: v.id("categories")
- `subcategoryId`: v.id("subcategories")?
- `titleVi`: string
- `titleEn`: string
- `descriptionVi`: string
- `descriptionEn`: string
- `images`: string[] (外部 URL)
- `demoImages`: string[] (外部 URL)
- `downloadLinks`: { label: string, url: string }[]
- `isHot`: boolean
- `isSale`: boolean
- `salePercent`: number?
- `views`: number
- `sales`: number
- `rating`: number
- `reviewCount`: number
- `isActive`: boolean
- `createdAt`: number
- `updatedAt`: number

#### variants
- `_id`: v.id()
- `productId`: v.id("products")
- `labelVi`: string (如 "7 Ngày", "1 Tháng", "Chính chủ")
- `labelEn`: string (如 "7 Days", "1 Month", "Official")
- `price`: number (VND)
- `originalPrice`: number?
- `stock`: number
- `isActive`: boolean

#### orders
- `_id`: v.id()
- `buyerId`: v.id("users")
- `sellerId`: v.id("users")
- `productId`: v.id("products")
- `variantId`: v.id("variants")
- `amount`: number (VND)
- `status`: "pending" | "paid" | "delivered" | "completed" | "cancelled" | "refunded"
- `paymentMethod`: "payos" | "balance"
- `payosTransactionId`: string?
- `deliveryData`: string? (加密的交付信息)
- `createdAt`: number
- `paidAt`: number?
- `deliveredAt`: number?
- `completedAt`: number?

#### deposits
- `_id`: v.id()
- `userId`: v.id("users")
- `amount`: number (VND)
- `payosTransactionId`: string?
- `status`: "pending" | "completed" | "failed"
- `createdAt`: number
- `completedAt`: number?

#### chat_rooms
- `_id`: v.id()
- `type`: "buyer_seller" | "user_admin"
- `userId`: v.id("users")
- `partnerId`: v.id("users")?
- `orderId`: v.id("orders")?
- `lastMessage`: string?
- `lastMessageAt`: number?
- `createdAt`: number

#### chat_messages
- `_id`: v.id()
- `roomId`: v.id("chat_rooms")
- `senderId`: v.id("users")
- `content`: string
- `isRead`: boolean
- `createdAt`: number

#### affiliate_logs
- `_id`: v.id()
- `referrerId`: v.id("users")
- `referredId`: v.id("users")
- `depositId`: v.id("deposits")
- `amount`: number (1% of deposit)
- `createdAt`: number

#### news_articles
- `_id`: v.id()
- `sourceUrl`: string
- `titleVi`: string
- `titleEn`: string
- `contentVi`: string (HTML)
- `contentEn`: string (HTML)
- `imageUrls`: string[]
- `seoKeywords`: string[]
- `isPublished`: boolean
- `authorId`: v.id("users")?
- `createdAt`: number
- `publishedAt`: number?

#### seo_settings
- `_id`: v.id("seo_settings")
- `siteNameVi`: string
- `siteNameEn`: string
- `metaTitleVi`: string
- `metaTitleEn`: string
- `metaDescriptionVi`: string
- `metaDescriptionEn`: string
- `ogImage`: string
- `jsonLdSchema`: string (JSON string)
- `gaScript`: string
- `gtmScript`: string
- `fbPixelScript`: string
- `hcaptchaSiteKey`: string
- `updatedAt`: number

#### withdrawals
- `_id`: v.id()
- `userId`: v.id("users")
- `amount`: number (VND)
- `bankCode`: string
- `bankAccountNumber`: string
- `bankAccountName`: string
- `status`: "pending" | "approved" | "rejected"
- `adminNote`: string?
- `createdAt`: number
- `processedAt`: number?

## 5. 組件清單

### ProductCard (智能變體卡片)
- 16:9 圖片比例
- Hot/Sale 徽章 (絕對定位)
- 藍色認證標記 (Tích xanh)
- 變體選擇器 (膠囊形狀)
- 動態價格更新
- 加入購物車按鈕
- 銷售數量顯示

### Header
- 玻璃擬態效果
- 實時搜索 (桌面端)
- 搜索圖標 (移動端)
- 語言切換 (VI/EN)
- 認證/購物車按鈕
- 漢堡菜單 (移動端)

### Sidebar
- 嵌套折疊導航
- Framer Motion 動畫
- 價格範圍篩選器
- 自定義範圍滑塊

### Footer
- SEO 優化連結
- 雙語站點地圖
- 社交媒體連結

## 6. 安全要求

### OTP 驗證
以下敏感操作必須 OTP 驗證:
- 註冊
- 提現
- 添加銀行帳戶
- 修改密碼

### CAPTCHA
所有認證流程使用 hCaptcha (取代 Cloudflare Turnstile)

## 7. 聯盟系統

- 每個用戶有唯一推薦連結
- 1 級推薦: 獲得充值金額的 1%
- 系統自動記錄並發放獎勵

## 8. AI 新聞系統

- 管理員輸入外部文章 URL
- Cheerio 爬取完整 HTML
- Groq API 重寫為越南語和英語
- 嚴格保留所有 `<img>` 標籤
- 自動注入 MMO/Tech SEO 關鍵詞

## 9. Database Setup (Turso + Drizzle)

### Local Development
```bash
# 1. Copy env example
cp .env.example .env.local

# 2. Set local SQLite for dev
TURSO_DATABASE_URL=libsql://khomanguon-kengpham.aws-ap-northeast-1.turso.io
TURSO_AUTH_TOKEN=your_auth_token_here
TURSO_LOCAL_URL=file:local_dev.db

# 3. Generate migrations from schema
npm run db:generate

# 4. Push schema to local SQLite
npm run db:push

# 5. (Optional) Open Drizzle Studio
npm run db:studio
```

### Production (Turso Cloud)
```bash
# Use TURSO_DATABASE_URL and TURSO_AUTH_TOKEN in production env
```

### Get Turso Auth Token
```bash
# Install Turso CLI
curl -sSfL https://get.tur.so/install.sh | bash

# Authenticate
turso auth login

# Get auth token
turso auth token
```

### Migration Workflow
- `npm run db:generate` — Generate SQL from schema changes
- `npm run db:push` — Push schema to database (dev)
- `npm run db:migrate` — Apply migrations (production)
- `npm run db:studio` — Visual DB editor
