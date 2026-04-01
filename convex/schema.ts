import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ─────────────────────────────────────────
  //  USERS
  // ─────────────────────────────────────────
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    username: v.optional(v.string()),
    fullName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    balance: v.number(),                   // VND
    role: v.union(
      v.literal("user"),
      v.literal("seller"),
      v.literal("vendor"),
      v.literal("admin")
    ),
    language: v.union(v.literal("vi"), v.literal("en")),
    referralCode: v.string(),
    referredBy: v.optional(v.string()),    // referrer's referralCode
    kycStatus: v.union(
      v.literal("none"),
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    kycData: v.optional(v.object({
      cccdFront: v.string(),
      cccdBack: v.string(),
      cccdNumber: v.string(),
      submittedAt: v.number(),
    })),
    bankAccount: v.optional(v.object({
      bankName: v.string(),
      bankCode: v.string(),
      accountNumber: v.string(),
      accountHolder: v.string(),
    })),
    isAffiliateActive: v.boolean(),
    totalEarnings: v.number(),             // affiliate earnings
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_referral_code", ["referralCode"])
    .index("by_role", ["role"])
    .searchIndex("search_email", { searchField: "email" })
    .searchIndex("search_username", { searchField: "username" }),

  // ─────────────────────────────────────────
  //  CATEGORIES
  // ─────────────────────────────────────────
  categories: defineTable({
    nameVi: v.string(),
    nameEn: v.string(),
    slug: v.string(),
    icon: v.string(),
    descriptionVi: v.optional(v.string()),
    descriptionEn: v.optional(v.string()),
    sortOrder: v.number(),
    isActive: v.boolean(),
    parentId: v.optional(v.id("categories")),  // null = top-level
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_parent", ["parentId"])
    .index("by_sort", ["sortOrder"]),

  // ─────────────────────────────────────────
  //  PRODUCTS
  // ─────────────────────────────────────────
  products: defineTable({
    sellerId: v.id("users"),
    categoryId: v.id("categories"),
    subcategoryId: v.optional(v.id("categories")),
    titleVi: v.string(),
    titleEn: v.string(),
    slugVi: v.string(),
    slugEn: v.string(),
    descriptionVi: v.string(),
    descriptionEn: v.string(),
    demoImages: v.array(v.string()),         // array of external URLs
    downloadLinks: v.array(v.string()),      // external URLs only
    isHot: v.boolean(),
    isSale: v.boolean(),
    isNew: v.boolean(),
    rating: v.number(),
    reviewCount: v.number(),
    sales: v.number(),
    views: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_seller", ["sellerId"])
    .index("by_category", ["categoryId"])
    .index("by_slug_vi", ["slugVi"])
    .index("by_slug_en", ["slugEn"])
    .index("by_hot", ["isHot"])
    .index("by_sale", ["isSale"])
    .index("by_active", ["isActive"])
    .searchIndex("search_vi", { searchField: "titleVi" })
    .searchIndex("search_en", { searchField: "titleEn" }),

  // ─────────────────────────────────────────
  //  VARIANTS
  // ─────────────────────────────────────────
  variants: defineTable({
    productId: v.id("products"),
    labelVi: v.string(),
    labelEn: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    stock: v.number(),
    sortOrder: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_active", ["isActive"]),

  // ─────────────────────────────────────────
  //  CART ITEMS
  // ─────────────────────────────────────────
  cart_items: defineTable({
    userId: v.id("users"),
    productId: v.id("products"),
    variantId: v.id("variants"),
    quantity: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_product", ["userId", "productId"])
    .index("by_variant", ["variantId"]),

  // ─────────────────────────────────────────
  //  ORDERS
  // ─────────────────────────────────────────
  orders: defineTable({
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    productId: v.id("products"),
    variantId: v.id("variants"),
    quantity: v.number(),
    unitPrice: v.number(),           // price at time of purchase
    totalPrice: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("delivered"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("refunded"),
      v.literal("disputed")
    ),
    paymentMethod: v.optional(v.string()),
    paymentId: v.optional(v.string()),
    payosTransactionNo: v.optional(v.string()),
    transferContent: v.optional(v.string()),
    deliveredAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    cancellationReason: v.optional(v.string()),
    disputeReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_buyer", ["buyerId"])
    .index("by_seller", ["sellerId"])
    .index("by_product", ["productId"])
    .index("by_status", ["status"])
    .index("by_payment", ["paymentId"]),

  // ─────────────────────────────────────────
  //  DEPOSITS (PayOS top-ups)
  // ─────────────────────────────────────────
  deposits: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("completed"),
      v.literal("failed"),
      v.literal("cancelled")
    ),
    payosOrderCode: v.string(),
    payosTransactionNo: v.optional(v.string()),
    payosPaymentLinkId: v.optional(v.string()),
    payosCheckoutUrl: v.optional(v.string()),
    referralCode: v.optional(v.string()),
    affiliateCommission: v.optional(v.number()),
    note: v.optional(v.string()),
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_payos_order", ["payosOrderCode"])
    .index("by_status", ["status"]),

  // ─────────────────────────────────────────
  //  WITHDRAWALS
  // ─────────────────────────────────────────
  withdrawals: defineTable({
    userId: v.id("users"),
    amount: v.number(),
    bankName: v.string(),
    bankCode: v.string(),
    accountNumber: v.string(),
    accountHolder: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    adminNote: v.optional(v.string()),
    processedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // ─────────────────────────────────────────
  //  CHAT ROOMS
  // ─────────────────────────────────────────
  chat_rooms: defineTable({
    type: v.union(v.literal("buyer_seller"), v.literal("user_admin")),
    orderId: v.optional(v.id("orders")),       // for buyer_seller
    buyerId: v.optional(v.id("users")),
    sellerId: v.optional(v.id("users")),
    userId: v.optional(v.id("users")),          // for user_admin
    lastMessage: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_buyer", ["buyerId"])
    .index("by_seller", ["sellerId"])
    .index("by_user", ["userId"])
    .index("by_order", ["orderId"])
    .index("by_type", ["type"]),

  // ─────────────────────────────────────────
  //  CHAT MESSAGES
  // ─────────────────────────────────────────
  chat_messages: defineTable({
    roomId: v.id("chat_rooms"),
    senderId: v.id("users"),
    content: v.string(),
    isRead: v.boolean(),
    attachmentUrl: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_sender", ["senderId"])
    .index("by_unread", ["roomId", "isRead"]),

  // ─────────────────────────────────────────
  //  REVIEWS
  // ─────────────────────────────────────────
  reviews: defineTable({
    orderId: v.id("orders"),
    productId: v.id("products"),
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    rating: v.number(),                  // 1-5
    commentVi: v.optional(v.string()),
    commentEn: v.optional(v.string()),
    isVisible: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_product", ["productId"])
    .index("by_seller", ["sellerId"])
    .index("by_buyer", ["buyerId"])
    .index("by_order", ["orderId"]),

  // ─────────────────────────────────────────
  //  AFFILIATE LOGS
  // ─────────────────────────────────────────
  affiliate_logs: defineTable({
    userId: v.id("users"),               // referrer (earner)
    referredUserId: v.id("users"),       // the person who deposited
    depositId: v.id("deposits"),
    commissionAmount: v.number(),
    depositAmount: v.number(),
    level: v.literal(1),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_deposit", ["depositId"])
    .index("by_referred", ["referredUserId"]),

  // ─────────────────────────────────────────
  //  NEWS ARTICLES (AI-generated)
  // ─────────────────────────────────────────
  news_articles: defineTable({
    titleVi: v.string(),
    titleEn: v.string(),
    slugVi: v.string(),
    slugEn: v.string(),
    excerptVi: v.optional(v.string()),
    excerptEn: v.optional(v.string()),
    contentVi: v.string(),
    contentEn: v.string(),
    author: v.optional(v.string()),
    sourceUrl: v.optional(v.string()),
    coverImage: v.optional(v.string()),
    tags: v.array(v.string()),
    isPublished: v.boolean(),
    isFeatured: v.boolean(),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug_vi", ["slugVi"])
    .index("by_slug_en", ["slugEn"])
    .index("by_published", ["isPublished"])
    .index("by_featured", ["isFeatured"])
    .searchIndex("search_vi", { searchField: "titleVi" })
    .searchIndex("search_en", { searchField: "titleEn" }),

  // ─────────────────────────────────────────
  //  SEO SETTINGS
  // ─────────────────────────────────────────
  seo_settings: defineTable({
    pageKey: v.string(),                  // "home", "products", "news", etc.
    titleVi: v.optional(v.string()),
    titleEn: v.optional(v.string()),
    descriptionVi: v.optional(v.string()),
    descriptionEn: v.optional(v.string()),
    keywordsVi: v.optional(v.string()),
    keywordsEn: v.optional(v.string()),
    ogImage: v.optional(v.string()),
    canonicalUrl: v.optional(v.string()),
    jsonLdSchema: v.optional(v.string()),
    noIndex: v.boolean(),
    noFollow: v.boolean(),
    updatedAt: v.number(),
  })
    .index("by_page_key", ["pageKey"]),

  // ─────────────────────────────────────────
  //  OTP CODES
  // ─────────────────────────────────────────
  otp_codes: defineTable({
    email: v.string(),
    code: v.string(),
    purpose: v.union(
      v.literal("register"),
      v.literal("login"),
      v.literal("withdraw"),
      v.literal("add_bank"),
      v.literal("change_password"),
      v.literal("change_email")
    ),
    expiresAt: v.number(),
    attempts: v.number(),
    isUsed: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_code", ["code"])
    .index("by_purpose", ["purpose"]),

  // ─────────────────────────────────────────
  //  ADMIN AUDIT LOG
  // ─────────────────────────────────────────
  admin_logs: defineTable({
    adminId: v.id("users"),
    action: v.string(),
    targetType: v.string(),               // "user", "product", "order", etc.
    targetId: v.optional(v.string()),
    details: v.optional(v.string()),
    ip: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_admin", ["adminId"])
    .index("by_target", ["targetType", "targetId"]),
});
