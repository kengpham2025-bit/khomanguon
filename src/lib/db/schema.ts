import { sqliteTable, text, integer, real, index } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ─────────────────────────────────────────
//  USERS
// ─────────────────────────────────────────
export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  clerkId: text("clerk_id").notNull().unique(),
  email: text("email").notNull().unique(),
  username: text("username"),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  balance: real("balance").notNull().default(0),           // VND
  role: text("role", { enum: ["user", "seller", "vendor", "admin"] }).notNull().default("user"),
  language: text("language", { enum: ["vi", "en"] }).notNull().default("vi"),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"),                          // referrer's referralCode
  kycStatus: text("kyc_status", {
    enum: ["none", "pending", "approved", "rejected"]
  }).notNull().default("none"),
  // KYC stored as separate columns
  kycCccdFront: text("kyc_cccd_front"),
  kycCccdBack: text("kyc_cccd_back"),
  kycCccdNumber: text("kyc_cccd_number"),
  kycSubmittedAt: integer("kyc_submitted_at", { mode: "timestamp" }),
  // bankAccount stored as separate columns
  bankName: text("bank_name"),
  bankCode: text("bank_code"),
  bankAccountNumber: text("bank_account_number"),
  bankAccountHolder: text("bank_account_holder"),
  isAffiliateActive: integer("is_affiliate_active", { mode: "boolean" }).notNull().default(false),
  totalEarnings: real("total_earnings").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const usersByClerkId = index("by_clerk").on(users.clerkId);
export const usersByEmail = index("by_email").on(users.email);
export const usersByReferralCode = index("by_referral_code").on(users.referralCode);
export const usersByRole = index("by_role").on(users.role);

// ─────────────────────────────────────────
//  CATEGORIES
// ─────────────────────────────────────────
export const categories = sqliteTable("categories", {
  id: text("id").primaryKey(),
  nameVi: text("name_vi").notNull(),
  nameEn: text("name_en").notNull(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").notNull(),
  descriptionVi: text("description_vi"),
  descriptionEn: text("description_en"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  parentId: text("parent_id"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const categoriesBySlug = index("by_cat_slug").on(categories.slug);
export const categoriesByParent = index("by_cat_parent").on(categories.parentId);
export const categoriesBySort = index("by_cat_sort").on(categories.sortOrder);

// ─────────────────────────────────────────
//  PRODUCTS
// ─────────────────────────────────────────
export const products = sqliteTable("products", {
  id: text("id").primaryKey(),
  sellerId: text("seller_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  categoryId: text("category_id").notNull().references(() => categories.id, { onDelete: "restrict" }),
  subcategoryId: text("subcategory_id"),
  titleVi: text("title_vi").notNull(),
  titleEn: text("title_en").notNull(),
  slugVi: text("slug_vi").notNull(),
  slugEn: text("slug_en").notNull(),
  descriptionVi: text("description_vi").notNull().default(""),
  descriptionEn: text("description_en").notNull().default(""),
  demoImages: text("demo_images").notNull().default("[]"),
  downloadLinks: text("download_links").notNull().default("[]"),
  isHot: integer("is_hot", { mode: "boolean" }).notNull().default(false),
  isSale: integer("is_sale", { mode: "boolean" }).notNull().default(false),
  isNew: integer("is_new", { mode: "boolean" }).notNull().default(false),
  rating: real("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  sales: integer("sales").notNull().default(0),
  views: integer("views").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const productsBySeller = index("by_prod_seller").on(products.sellerId);
export const productsByCategory = index("by_prod_category").on(products.categoryId);
export const productsBySlugVi = index("by_prod_slug_vi").on(products.slugVi);
export const productsBySlugEn = index("by_prod_slug_en").on(products.slugEn);
export const productsByHot = index("by_prod_hot").on(products.isHot);
export const productsBySale = index("by_prod_sale").on(products.isSale);
export const productsByActive = index("by_prod_active").on(products.isActive);

// ─────────────────────────────────────────
//  VARIANTS
// ─────────────────────────────────────────
export const variants = sqliteTable("variants", {
  id: text("id").primaryKey(),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  labelVi: text("label_vi").notNull(),
  labelEn: text("label_en").notNull(),
  price: real("price").notNull(),
  originalPrice: real("original_price"),
  stock: integer("stock").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const variantsByProduct = index("by_var_product").on(variants.productId);
export const variantsByActive = index("by_var_active").on(variants.isActive);

// ─────────────────────────────────────────
//  CART ITEMS
// ─────────────────────────────────────────
export const cartItems = sqliteTable("cart_items", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "cascade" }),
  variantId: text("variant_id").notNull().references(() => variants.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const cartItemsByUser = index("by_cart_user").on(cartItems.userId);
export const cartItemsByUserProduct = index("by_cart_user_product").on(cartItems.userId, cartItems.productId);
export const cartItemsByVariant = index("by_cart_variant").on(cartItems.variantId);

// ─────────────────────────────────────────
//  ORDERS
// ─────────────────────────────────────────
export const orders = sqliteTable("orders", {
  id: text("id").primaryKey(),
  buyerId: text("buyer_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  sellerId: text("seller_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  variantId: text("variant_id").notNull().references(() => variants.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: real("unit_price").notNull(),
  totalPrice: real("total_price").notNull(),
  status: text("status", {
    enum: ["pending", "paid", "delivered", "completed", "cancelled", "refunded", "disputed"]
  }).notNull().default("pending"),
  paymentMethod: text("payment_method"),
  paymentId: text("payment_id"),
  payosTransactionNo: text("payos_transaction_no"),
  transferContent: text("transfer_content"),
  deliveredAt: integer("delivered_at", { mode: "timestamp" }),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  cancellationReason: text("cancellation_reason"),
  disputeReason: text("dispute_reason"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const ordersByBuyer = index("by_order_buyer").on(orders.buyerId);
export const ordersBySeller = index("by_order_seller").on(orders.sellerId);
export const ordersByProduct = index("by_order_product").on(orders.productId);
export const ordersByStatus = index("by_order_status").on(orders.status);
export const ordersByPaymentId = index("by_order_payment").on(orders.paymentId);

// ─────────────────────────────────────────
//  DEPOSITS (PayOS top-ups)
// ─────────────────────────────────────────
export const deposits = sqliteTable("deposits", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  amount: real("amount").notNull(),
  status: text("status", {
    enum: ["pending", "completed", "failed", "cancelled"]
  }).notNull().default("pending"),
  payosOrderCode: text("payos_order_code").notNull(),
  payosTransactionNo: text("payos_transaction_no"),
  payosPaymentLinkId: text("payos_payment_link_id"),
  payosCheckoutUrl: text("payos_checkout_url"),
  referralCode: text("referral_code"),
  affiliateCommission: real("affiliate_commission"),
  note: text("note"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  completedAt: integer("completed_at", { mode: "timestamp" }),
});

export const depositsByUser = index("by_deposit_user").on(deposits.userId);
export const depositsByPayosOrder = index("by_deposit_payos").on(deposits.payosOrderCode);
export const depositsByStatus = index("by_deposit_status").on(deposits.status);

// ─────────────────────────────────────────
//  WITHDRAWALS
// ─────────────────────────────────────────
export const withdrawals = sqliteTable("withdrawals", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  amount: real("amount").notNull(),
  bankName: text("bank_name").notNull(),
  bankCode: text("bank_code").notNull(),
  accountNumber: text("account_number").notNull(),
  accountHolder: text("account_holder").notNull(),
  status: text("status", {
    enum: ["pending", "approved", "rejected"]
  }).notNull().default("pending"),
  adminNote: text("admin_note"),
  processedAt: integer("processed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const withdrawalsByUser = index("by_withdraw_user").on(withdrawals.userId);
export const withdrawalsByStatus = index("by_withdraw_status").on(withdrawals.status);

// ─────────────────────────────────────────
//  CHAT ROOMS
// ─────────────────────────────────────────
export const chatRooms = sqliteTable("chat_rooms", {
  id: text("id").primaryKey(),
  type: text("type", { enum: ["buyer_seller", "user_admin"] }).notNull(),
  orderId: text("order_id"),
  buyerId: text("buyer_id"),
  sellerId: text("seller_id"),
  userId: text("user_id"),
  lastMessage: text("last_message"),
  lastMessageAt: integer("last_message_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const chatRoomsByBuyer = index("by_chat_buyer").on(chatRooms.buyerId);
export const chatRoomsBySeller = index("by_chat_seller").on(chatRooms.sellerId);
export const chatRoomsByUser = index("by_chat_user").on(chatRooms.userId);
export const chatRoomsByOrder = index("by_chat_order").on(chatRooms.orderId);
export const chatRoomsByType = index("by_chat_type").on(chatRooms.type);

// ─────────────────────────────────────────
//  CHAT MESSAGES
// ─────────────────────────────────────────
export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey(),
  roomId: text("room_id").notNull().references(() => chatRooms.id, { onDelete: "cascade" }),
  senderId: text("sender_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  content: text("content").notNull(),
  isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
  attachmentUrl: text("attachment_url"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const chatMessagesByRoom = index("by_msg_room").on(chatMessages.roomId);
export const chatMessagesBySender = index("by_msg_sender").on(chatMessages.senderId);

// ─────────────────────────────────────────
//  REVIEWS
// ─────────────────────────────────────────
export const reviews = sqliteTable("reviews", {
  id: text("id").primaryKey(),
  orderId: text("order_id").notNull().references(() => orders.id, { onDelete: "restrict" }),
  productId: text("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  buyerId: text("buyer_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  sellerId: text("seller_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  rating: integer("rating").notNull(),
  commentVi: text("comment_vi"),
  commentEn: text("comment_en"),
  isVisible: integer("is_visible", { mode: "boolean" }).notNull().default(true),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const reviewsByProduct = index("by_review_product").on(reviews.productId);
export const reviewsBySeller = index("by_review_seller").on(reviews.sellerId);
export const reviewsByBuyer = index("by_review_buyer").on(reviews.buyerId);
export const reviewsByOrder = index("by_review_order").on(reviews.orderId);

// ─────────────────────────────────────────
//  AFFILIATE LOGS
// ─────────────────────────────────────────
export const affiliateLogs = sqliteTable("affiliate_logs", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  referredUserId: text("referred_user_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  depositId: text("deposit_id").notNull().references(() => deposits.id, { onDelete: "restrict" }),
  commissionAmount: real("commission_amount").notNull(),
  depositAmount: real("deposit_amount").notNull(),
  level: integer("level").notNull().default(1),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const affiliateLogsByUser = index("by_aff_user").on(affiliateLogs.userId);
export const affiliateLogsByDeposit = index("by_aff_deposit").on(affiliateLogs.depositId);
export const affiliateLogsByReferred = index("by_aff_referred").on(affiliateLogs.referredUserId);

// ─────────────────────────────────────────
//  NEWS ARTICLES (AI-generated)
// ─────────────────────────────────────────
export const newsArticles = sqliteTable("news_articles", {
  id: text("id").primaryKey(),
  titleVi: text("title_vi").notNull(),
  titleEn: text("title_en").notNull(),
  slugVi: text("slug_vi").notNull().unique(),
  slugEn: text("slug_en").notNull().unique(),
  excerptVi: text("excerpt_vi"),
  excerptEn: text("excerpt_en"),
  contentVi: text("content_vi").notNull(),
  contentEn: text("content_en").notNull(),
  author: text("author"),
  sourceUrl: text("source_url"),
  coverImage: text("cover_image"),
  tags: text("tags").notNull().default("[]"),
  isPublished: integer("is_published", { mode: "boolean" }).notNull().default(false),
  isFeatured: integer("is_featured", { mode: "boolean" }).notNull().default(false),
  publishedAt: integer("published_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const newsArticlesBySlugVi = index("by_news_slug_vi").on(newsArticles.slugVi);
export const newsArticlesBySlugEn = index("by_news_slug_en").on(newsArticles.slugEn);
export const newsArticlesByPublished = index("by_news_published").on(newsArticles.isPublished);
export const newsArticlesByFeatured = index("by_news_featured").on(newsArticles.isFeatured);

// ─────────────────────────────────────────
//  SEO SETTINGS
// ─────────────────────────────────────────
export const seoSettings = sqliteTable("seo_settings", {
  id: text("id").primaryKey(),
  pageKey: text("page_key").notNull().unique(),
  titleVi: text("title_vi"),
  titleEn: text("title_en"),
  descriptionVi: text("description_vi"),
  descriptionEn: text("description_en"),
  keywordsVi: text("keywords_vi"),
  keywordsEn: text("keywords_en"),
  ogImage: text("og_image"),
  canonicalUrl: text("canonical_url"),
  jsonLdSchema: text("json_ld_schema"),
  noIndex: integer("no_index", { mode: "boolean" }).notNull().default(false),
  noFollow: integer("no_follow", { mode: "boolean" }).notNull().default(false),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const seoSettingsByPageKey = index("by_seo_page_key").on(seoSettings.pageKey);

// ─────────────────────────────────────────
//  OTP CODES
// ─────────────────────────────────────────
export const otpCodes = sqliteTable("otp_codes", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  code: text("code").notNull(),
  purpose: text("purpose", {
    enum: ["register", "login", "withdraw", "add_bank", "change_password", "change_email"]
  }).notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  attempts: integer("attempts").notNull().default(0),
  isUsed: integer("is_used", { mode: "boolean" }).notNull().default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const otpCodesByEmail = index("by_otp_email").on(otpCodes.email);
export const otpCodesByCode = index("by_otp_code").on(otpCodes.code);
export const otpCodesByPurpose = index("by_otp_purpose").on(otpCodes.purpose);

// ─────────────────────────────────────────
//  ADMIN AUDIT LOG
// ─────────────────────────────────────────
export const adminLogs = sqliteTable("admin_logs", {
  id: text("id").primaryKey(),
  adminId: text("admin_id").notNull().references(() => users.id, { onDelete: "restrict" }),
  action: text("action").notNull(),
  targetType: text("target_type").notNull(),
  targetId: text("target_id"),
  details: text("details"),
  ip: text("ip"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const adminLogsByAdmin = index("by_admin_log_admin").on(adminLogs.adminId);
export const adminLogsByTarget = index("by_admin_log_target").on(adminLogs.targetType, adminLogs.targetId);
