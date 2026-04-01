import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Doc } from "./_generated/dataModel";

// ─── QUERIES ────────────────────────────────────────────────────────────────

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    // Remove sensitive fields
    const { clerkId: _c, ...pub } = user;
    return pub;
  },
});

export const getCategories = query({
  args: { parentId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (!args.parentId) {
      return await ctx.db
        .query("categories")
        .withIndex("by_parent", (q) => q.eq("parentId", undefined))
        .order("asc")
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
    }
    return await ctx.db
      .query("categories")
      .withIndex("by_parent", (q) => q.eq("parentId", args.parentId as string))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getProducts = query({
  args: {
    categoryId: v.optional(v.string()),
    subcategoryId: v.optional(v.string()),
    sellerId: v.optional(v.string()),
    isHot: v.optional(v.boolean()),
    isSale: v.optional(v.boolean()),
    isNew: v.optional(v.boolean()),
    query: v.optional(v.string()),
    locale: v.optional(v.union(v.literal("vi"), v.literal("en"))),
    minPrice: v.optional(v.number()),
    maxPrice: v.optional(v.number()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let baseQuery = ctx.db.query("products").withIndex("by_active", (q) => q.eq("isActive", true));

    let results = await baseQuery.collect();

    if (args.categoryId) {
      results = results.filter((p) => p.categoryId === args.categoryId);
    }
    if (args.sellerId) {
      results = results.filter((p) => p.sellerId === args.sellerId);
    }
    if (args.isHot !== undefined) {
      results = results.filter((p) => p.isHot === args.isHot);
    }
    if (args.isSale !== undefined) {
      results = results.filter((p) => p.isSale === args.isSale);
    }
    if (args.isNew !== undefined) {
      results = results.filter((p) => p.isNew === args.isNew);
    }
    if (args.query) {
      const q = args.query.toLowerCase();
      const field = args.locale === "en" ? "titleEn" : "titleVi";
      results = results.filter((p) => (p[field] as string).toLowerCase().includes(q));
    }

    // Pagination
    const limit = args.limit ?? 20;
    let start = 0;
    if (args.cursor) {
      const idx = results.findIndex((r) => r._id === args.cursor);
      start = idx + 1;
    }
    const items = results.slice(start, start + limit);
    const nextCursor = items.length === limit ? items[items.length - 1]._id : null;

    return { items, nextCursor };
  },
});

export const getProductById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.productId);
  },
});

export const getVariantsByProduct = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("variants")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getCartItems = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("cart_items")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const enriched = await Promise.all(
      items.map(async (item) => {
        const product = await ctx.db.get(item.productId);
        const variant = await ctx.db.get(item.variantId);
        const seller = product ? await ctx.db.get(product.sellerId) : null;
        return { ...item, product, variant, seller };
      })
    );

    return enriched.filter((i) => i.product && i.variant);
  },
});

export const getCartCount = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("cart_items")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()
      .then((items) => items.reduce((sum, i) => sum + i.quantity, 0));
  },
});

export const getUserOrders = query({
  args: {
    userId: v.id("users"),
    role: v.optional(v.union(v.literal("buyer"), v.literal("seller"))),
  },
  handler: async (ctx, args) => {
    const idx = args.role === "seller" ? "by_seller" : "by_buyer";
    const orders = await ctx.db
      .query("orders")
      .withIndex(idx, (q) => q.eq(args.role === "seller" ? "sellerId" : "buyerId", args.userId))
      .collect();

    const enriched = await Promise.all(
      orders.map(async (order) => {
        const product = await ctx.db.get(order.productId);
        const variant = await ctx.db.get(order.variantId);
        const buyer = await ctx.db.get(order.buyerId);
        const seller = await ctx.db.get(order.sellerId);
        return { ...order, product, variant, buyer, seller };
      })
    );

    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getUserDeposits = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("deposits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()
      .then((d) => d.sort((a, b) => b.createdAt - a.createdAt));
  },
});

export const getUserWithdrawals = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("withdrawals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()
      .then((w) => w.sort((a, b) => b.createdAt - a.createdAt));
  },
});

export const getAffiliateLogs = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("affiliate_logs")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect()
      .then((l) => l.sort((a, b) => b.createdAt - a.createdAt));
  },
});

export const getChatRooms = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const rooms = await ctx.db.query("chat_rooms").collect();
    const filtered = rooms.filter(
      (r) =>
        r.userId === args.userId ||
        r.buyerId === args.userId ||
        r.sellerId === args.userId
    );
    const enriched = await Promise.all(
      filtered.map(async (room) => {
        const messages = await ctx.db
          .query("chat_messages")
          .withIndex("by_room", (q) => q.eq("roomId", room._id))
          .collect()
          .then((msgs) => msgs.sort((a, b) => b.createdAt - a.createdAt).slice(0, 1));
        return { ...room, lastMessage: messages[0] };
      })
    );
    return enriched.sort((a, b) => (b.lastMessageAt ?? 0) - (a.lastMessageAt ?? 0));
  },
});

export const getChatMessages = query({
  args: { roomId: v.id("chat_rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chat_messages")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .collect()
      .then((msgs) => msgs.sort((a, b) => a.createdAt - b.createdAt));
  },
});

export const getProductReviews = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("isVisible"), true))
      .collect();
    const enriched = await Promise.all(
      reviews.map(async (r) => {
        const buyer = await ctx.db.get(r.buyerId);
        return { ...r, buyer };
      })
    );
    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getNewsArticles = query({
  args: {
    isPublished: v.optional(v.boolean()),
    isFeatured: v.optional(v.boolean()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let articles = await ctx.db.query("news_articles").collect();
    if (args.isPublished !== undefined) {
      articles = articles.filter((a) => a.isPublished === args.isPublished);
    }
    if (args.isFeatured !== undefined) {
      articles = articles.filter((a) => a.isFeatured === args.isFeatured);
    }
    articles.sort((a, b) => (b.publishedAt ?? 0) - (a.publishedAt ?? 0));
    return articles.slice(0, args.limit ?? 50);
  },
});

export const getSeoSettings = query({
  args: { pageKey: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("seo_settings")
      .withIndex("by_page_key", (q) => q.eq("pageKey", args.pageKey))
      .first();
  },
});

export const getAllSeoSettings = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("seo_settings").collect();
  },
});

export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    const [users, products, orders, pendingWithdrawals, pendingKyc] = await Promise.all([
      ctx.db.query("users").collect(),
      ctx.db.query("products").collect(),
      ctx.db.query("orders").collect(),
      ctx.db.query("withdrawals").withIndex("by_status", (q) => q.eq("status", "pending")).collect(),
      ctx.db.query("users").collect().then((u) => u.filter((u) => u.kycStatus === "pending")),
    ]);

    const totalRevenue = orders
      .filter((o) => o.status === "completed" || o.status === "delivered")
      .reduce((sum, o) => sum + o.totalPrice, 0);

    const recentOrders = orders
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);

    return {
      totalUsers: users.length,
      totalProducts: products.length,
      totalOrders: orders.length,
      totalRevenue,
      pendingWithdrawals: pendingWithdrawals.length,
      pendingKyc: pendingKyc.length,
      recentOrders,
    };
  },
});

export const getPendingWithdrawals = query({
  args: {},
  handler: async (ctx) => {
    const withdrawals = await ctx.db
      .query("withdrawals")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    const enriched = await Promise.all(
      withdrawals.map(async (w) => {
        const user = await ctx.db.get(w.userId);
        return { ...w, user };
      })
    );
    return enriched.sort((a, b) => a.createdAt - b.createdAt);
  },
});

export const getPendingKyc = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => u.kycStatus === "pending")
      .sort((a, b) => (a.kycData?.submittedAt ?? 0) - (b.kycData?.submittedAt ?? 0));
  },
});

export const getAllUsers = query({
  args: { role: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    if (args.role) return users.filter((u) => u.role === args.role);
    return users;
  },
});

export const getAllOrders = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let orders = await ctx.db.query("orders").collect();
    if (args.status) {
      orders = orders.filter((o) => o.status === args.status);
    }
    const enriched = await Promise.all(
      orders.map(async (order) => {
        const product = await ctx.db.get(order.productId);
        const buyer = await ctx.db.get(order.buyerId);
        const seller = await ctx.db.get(order.sellerId);
        return { ...order, product, buyer, seller };
      })
    );
    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getAllProductsAdmin = query({
  args: { sellerId: v.optional(v.string()), isActive: v.optional(v.boolean()) },
  handler: async (ctx, args) => {
    let products = await ctx.db.query("products").collect();
    if (args.sellerId) products = products.filter((p) => p.sellerId === args.sellerId);
    if (args.isActive !== undefined) products = products.filter((p) => p.isActive === args.isActive);
    const enriched = await Promise.all(
      products.map(async (p) => {
        const seller = await ctx.db.get(p.sellerId);
        const variants = await ctx.db.query("variants").withIndex("by_product", (q) => q.eq("productId", p._id)).collect();
        return { ...p, seller, variantCount: variants.length, totalStock: variants.reduce((s, v) => s + v.stock, 0) };
      })
    );
    return enriched.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getUserByReferralCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_referral_code", (q) => q.eq("referralCode", args.code))
      .first();
  },
});

export const checkVariantStock = query({
  args: { variantId: v.id("variants") },
  handler: async (ctx, args) => {
    const variant = await ctx.db.get(args.variantId);
    return variant?.stock ?? 0;
  },
});

// ─── MUTATIONS ───────────────────────────────────────────────────────────────

export const createUser = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    username: v.optional(v.string()),
    referralCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", args.clerkId))
      .first();
    if (existing) return existing._id;

    const myCode = `AFF${Date.now().toString(36).toUpperCase()}`;
    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      username: args.username,
      balance: 0,
      role: "user",
      language: "vi",
      referralCode: myCode,
      referredBy: args.referralCode,
      kycStatus: "none",
      isAffiliateActive: true,
      totalEarnings: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Credit referrer if valid
    if (args.referralCode) {
      const referrer = await ctx.db
        .query("users")
        .withIndex("by_referral_code", (q) => q.eq("referralCode", args.referralCode))
        .first();
      if (referrer) {
        await ctx.db.insert("affiliate_logs", {
          userId: referrer._id,
          referredUserId: userId,
          depositId: userId as any,
          commissionAmount: 0,
          depositAmount: 0,
          level: 1,
          createdAt: Date.now(),
        });
      }
    }

    return userId;
  },
});

export const updateUserProfile = mutation({
  args: {
    userId: v.id("users"),
    fullName: v.optional(v.string()),
    username: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    language: v.optional(v.union(v.literal("vi"), v.literal("en"))),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      ...(args.fullName !== undefined && { fullName: args.fullName }),
      ...(args.username !== undefined && { username: args.username }),
      ...(args.avatarUrl !== undefined && { avatarUrl: args.avatarUrl }),
      ...(args.language !== undefined && { language: args.language }),
      updatedAt: Date.now(),
    });
  },
});

export const submitKyc = mutation({
  args: {
    userId: v.id("users"),
    cccdFront: v.string(),
    cccdBack: v.string(),
    cccdNumber: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      kycStatus: "pending",
      kycData: {
        cccdFront: args.cccdFront,
        cccdBack: args.cccdBack,
        cccdNumber: args.cccdNumber,
        submittedAt: Date.now(),
      },
      updatedAt: Date.now(),
    });
  },
});

export const approveKyc = mutation({
  args: { userId: v.id("users"), adminId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      kycStatus: "approved",
      role: "seller",
      updatedAt: Date.now(),
    });
    await ctx.db.insert("admin_logs", {
      adminId: args.adminId,
      action: "approve_kyc",
      targetType: "user",
      targetId: args.userId,
      createdAt: Date.now(),
    });
  },
});

export const rejectKyc = mutation({
  args: { userId: v.id("users"), adminId: v.id("users"), reason: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      kycStatus: "rejected",
      kycData: undefined,
      updatedAt: Date.now(),
    });
    await ctx.db.insert("admin_logs", {
      adminId: args.adminId,
      action: "reject_kyc",
      targetType: "user",
      targetId: args.userId,
      details: args.reason,
      createdAt: Date.now(),
    });
  },
});

export const addToCart = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
    variantId: v.id("variants"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    // Check stock
    const variant = await ctx.db.get(args.variantId);
    if (!variant || variant.stock < args.quantity) {
      throw new Error("Insufficient stock");
    }

    // Check existing
    const existing = await ctx.db
      .query("cart_items")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", args.userId).eq("productId", args.productId)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        variantId: args.variantId,
        quantity: existing.quantity + args.quantity,
      });
      return existing._id;
    }

    return await ctx.db.insert("cart_items", {
      userId: args.userId,
      productId: args.productId,
      variantId: args.variantId,
      quantity: args.quantity,
      createdAt: Date.now(),
    });
  },
});

export const updateCartQuantity = mutation({
  args: { cartItemId: v.id("cart_items"), quantity: v.number() },
  handler: async (ctx, args) => {
    if (args.quantity <= 0) {
      await ctx.db.delete(args.cartItemId);
    } else {
      await ctx.db.patch(args.cartItemId, { quantity: args.quantity });
    }
  },
});

export const removeFromCart = mutation({
  args: { cartItemId: v.id("cart_items") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.cartItemId);
  },
});

export const clearCart = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("cart_items")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();
    await Promise.all(items.map((i) => ctx.db.delete(i._id)));
  },
});

export const createProduct = mutation({
  args: {
    sellerId: v.id("users"),
    categoryId: v.id("categories"),
    subcategoryId: v.optional(v.id("categories")),
    titleVi: v.string(),
    titleEn: v.string(),
    descriptionVi: v.string(),
    descriptionEn: v.string(),
    demoImages: v.array(v.string()),
    downloadLinks: v.array(v.string()),
    variants: v.array(v.object({
      labelVi: v.string(),
      labelEn: v.string(),
      price: v.number(),
      originalPrice: v.optional(v.number()),
      stock: v.number(),
      sortOrder: v.number(),
    })),
    isHot: v.boolean(),
    isSale: v.boolean(),
    isNew: v.boolean(),
  },
  handler: async (ctx, args) => {
    const slugVi = args.titleVi.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const slugEn = args.titleEn.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    const productId = await ctx.db.insert("products", {
      sellerId: args.sellerId,
      categoryId: args.categoryId,
      subcategoryId: args.subcategoryId,
      titleVi: args.titleVi,
      titleEn: args.titleEn,
      slugVi,
      slugEn,
      descriptionVi: args.descriptionVi,
      descriptionEn: args.descriptionEn,
      demoImages: args.demoImages,
      downloadLinks: args.downloadLinks,
      isHot: args.isHot,
      isSale: args.isSale,
      isNew: args.isNew,
      rating: 0,
      reviewCount: 0,
      sales: 0,
      views: 0,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    for (const v of args.variants) {
      await ctx.db.insert("variants", {
        productId,
        labelVi: v.labelVi,
        labelEn: v.labelEn,
        price: v.price,
        originalPrice: v.originalPrice,
        stock: v.stock,
        sortOrder: v.sortOrder,
        isActive: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return productId;
  },
});

export const updateProduct = mutation({
  args: {
    productId: v.id("products"),
    titleVi: v.optional(v.string()),
    titleEn: v.optional(v.string()),
    descriptionVi: v.optional(v.string()),
    descriptionEn: v.optional(v.string()),
    demoImages: v.optional(v.array(v.string())),
    downloadLinks: v.optional(v.array(v.string())),
    isHot: v.optional(v.boolean()),
    isSale: v.optional(v.boolean()),
    isNew: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { productId, ...updates } = args;
    const slugVi = updates.titleVi?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const slugEn = updates.titleEn?.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

    await ctx.db.patch(productId, {
      ...(updates.titleVi !== undefined && { titleVi: updates.titleVi, slugVi }),
      ...(updates.titleEn !== undefined && { titleEn: updates.titleEn, slugEn }),
      ...(updates.descriptionVi !== undefined && { descriptionVi: updates.descriptionVi }),
      ...(updates.descriptionEn !== undefined && { descriptionEn: updates.descriptionEn }),
      ...(updates.demoImages !== undefined && { demoImages: updates.demoImages }),
      ...(updates.downloadLinks !== undefined && { downloadLinks: updates.downloadLinks }),
      ...(updates.isHot !== undefined && { isHot: updates.isHot }),
      ...(updates.isSale !== undefined && { isSale: updates.isSale }),
      ...(updates.isNew !== undefined && { isNew: updates.isNew }),
      ...(updates.isActive !== undefined && { isActive: updates.isActive }),
      updatedAt: Date.now(),
    });
  },
});

export const createVariant = mutation({
  args: {
    productId: v.id("products"),
    labelVi: v.string(),
    labelEn: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    stock: v.number(),
    sortOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("variants", {
      productId: args.productId,
      labelVi: args.labelVi,
      labelEn: args.labelEn,
      price: args.price,
      originalPrice: args.originalPrice,
      stock: args.stock,
      sortOrder: args.sortOrder,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateVariant = mutation({
  args: {
    variantId: v.id("variants"),
    labelVi: v.optional(v.string()),
    labelEn: v.optional(v.string()),
    price: v.optional(v.number()),
    originalPrice: v.optional(v.number()),
    stock: v.optional(v.number()),
    sortOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { variantId, ...updates } = args;
    await ctx.db.patch(variantId, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteVariant = mutation({
  args: { variantId: v.id("variants") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.variantId, { isActive: false, updatedAt: Date.now() });
  },
});

export const createOrder = mutation({
  args: {
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    productId: v.id("products"),
    variantId: v.id("variants"),
    quantity: v.number(),
    unitPrice: v.number(),
    transferContent: v.string(),
  },
  handler: async (ctx, args) => {
    const variant = await ctx.db.get(args.variantId);
    if (!variant || variant.stock < args.quantity) {
      throw new Error("Insufficient stock");
    }

    const totalPrice = args.unitPrice * args.quantity;
    const buyer = await ctx.db.get(args.buyerId);
    if (!buyer || buyer.balance < totalPrice) {
      throw new Error("Insufficient balance");
    }

    // Deduct balance
    await ctx.db.patch(args.buyerId, {
      balance: buyer.balance - totalPrice,
      updatedAt: Date.now(),
    });

    // Deduct stock
    await ctx.db.patch(args.variantId, {
      stock: variant.stock - args.quantity,
      updatedAt: Date.now(),
    });

    // Remove from cart
    const cartItem = await ctx.db
      .query("cart_items")
      .withIndex("by_user_product", (q) =>
        q.eq("userId", args.buyerId).eq("productId", args.productId)
      )
      .first();
    if (cartItem) await ctx.db.delete(cartItem._id);

    const orderId = await ctx.db.insert("orders", {
      buyerId: args.buyerId,
      sellerId: args.sellerId,
      productId: args.productId,
      variantId: args.variantId,
      quantity: args.quantity,
      unitPrice: args.unitPrice,
      totalPrice,
      status: "paid",
      transferContent: args.transferContent,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update product sales count
    const product = await ctx.db.get(args.productId);
    if (product) {
      await ctx.db.patch(args.productId, {
        sales: product.sales + args.quantity,
        updatedAt: Date.now(),
      });
    }

    return orderId;
  },
});

export const updateOrderStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("delivered"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("refunded"),
      v.literal("disputed")
    ),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db.get(args.orderId);
    if (!order) throw new Error("Order not found");

    const updates: any = { status: args.status, updatedAt: Date.now() };

    if (args.status === "delivered") {
      updates.deliveredAt = Date.now();
    }
    if (args.status === "completed") {
      updates.completedAt = Date.now();
      // Credit seller
      const seller = await ctx.db.get(order.sellerId);
      if (seller) {
        await ctx.db.patch(order.sellerId, {
          balance: seller.balance + order.totalPrice,
          updatedAt: Date.now(),
        });
      }
    }
    if (args.status === "cancelled" || args.status === "refunded") {
      updates.cancellationReason = args.adminNote;
      // Refund buyer
      const buyer = await ctx.db.get(order.buyerId);
      if (buyer) {
        await ctx.db.patch(order.buyerId, {
          balance: buyer.balance + order.totalPrice,
          updatedAt: Date.now(),
        });
      }
      // Restore stock
      const variant = await ctx.db.get(order.variantId);
      if (variant) {
        await ctx.db.patch(order.variantId, {
          stock: variant.stock + order.quantity,
          updatedAt: Date.now(),
        });
      }
    }

    await ctx.db.patch(args.orderId, updates);
  },
});

export const createDeposit = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    payosOrderCode: v.string(),
    payosCheckoutUrl: v.optional(v.string()),
    referralCode: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("deposits", {
      userId: args.userId,
      amount: args.amount,
      status: "pending",
      payosOrderCode: args.payosOrderCode,
      payosCheckoutUrl: args.payosCheckoutUrl,
      referralCode: args.referralCode,
      createdAt: Date.now(),
    });
  },
});

export const completeDeposit = mutation({
  args: {
    depositId: v.id("deposits"),
    payosTransactionNo: v.string(),
  },
  handler: async (ctx, args) => {
    const deposit = await ctx.db.get(args.depositId);
    if (!deposit) throw new Error("Deposit not found");

    await ctx.db.patch(args.depositId, {
      status: "completed",
      payosTransactionNo: args.payosTransactionNo,
      completedAt: Date.now(),
    });

    const user = await ctx.db.get(deposit.userId);
    if (user) {
      await ctx.db.patch(deposit.userId, {
        balance: user.balance + deposit.amount,
        updatedAt: Date.now(),
      });
    }

    // Affiliate commission (1%)
    if (user?.referredBy) {
      const referrer = await ctx.db
        .query("users")
        .withIndex("by_referral_code", (q) => q.eq("referralCode", user.referredBy))
        .first();
      if (referrer && referrer.isAffiliateActive) {
        const commission = Math.floor(deposit.amount * 0.01);
        await ctx.db.patch(deposit.depositId, { affiliateCommission: commission });
        await ctx.db.patch(referrer._id, {
          balance: referrer.balance + commission,
          totalEarnings: referrer.totalEarnings + commission,
          updatedAt: Date.now(),
        });
        await ctx.db.insert("affiliate_logs", {
          userId: referrer._id,
          referredUserId: deposit.userId,
          depositId: deposit._id,
          commissionAmount: commission,
          depositAmount: deposit.amount,
          level: 1,
          createdAt: Date.now(),
        });
      }
    }
  },
});

export const requestWithdrawal = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    bankName: v.string(),
    bankCode: v.string(),
    accountNumber: v.string(),
    accountHolder: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    if (user.balance < args.amount) throw new Error("Insufficient balance");
    if (args.amount < 50000) throw new Error("Minimum withdrawal is 50,000 VND");

    return await ctx.db.insert("withdrawals", {
      userId: args.userId,
      amount: args.amount,
      bankName: args.bankName,
      bankCode: args.bankCode,
      accountNumber: args.accountNumber,
      accountHolder: args.accountHolder,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const approveWithdrawal = mutation({
  args: { withdrawalId: v.id("withdrawals"), adminId: v.id("users") },
  handler: async (ctx, args) => {
    const withdrawal = await ctx.db.get(args.withdrawalId);
    if (!withdrawal) throw new Error("Withdrawal not found");

    await ctx.db.patch(args.withdrawalId, {
      status: "approved",
      processedAt: Date.now(),
    });

    const user = await ctx.db.get(withdrawal.userId);
    if (user) {
      await ctx.db.patch(withdrawal.userId, {
        balance: user.balance - withdrawal.amount,
        updatedAt: Date.now(),
      });
    }

    await ctx.db.insert("admin_logs", {
      adminId: args.adminId,
      action: "approve_withdrawal",
      targetType: "withdrawal",
      targetId: args.withdrawalId,
      details: `Approved withdrawal of ${withdrawal.amount} VND`,
      createdAt: Date.now(),
    });
  },
});

export const rejectWithdrawal = mutation({
  args: { withdrawalId: v.id("withdrawals"), adminId: v.id("users"), reason: v.string() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.withdrawalId, {
      status: "rejected",
      adminNote: args.reason,
      processedAt: Date.now(),
    });

    await ctx.db.insert("admin_logs", {
      adminId: args.adminId,
      action: "reject_withdrawal",
      targetType: "withdrawal",
      targetId: args.withdrawalId,
      details: args.reason,
      createdAt: Date.now(),
    });
  },
});

export const addBankAccount = mutation({
  args: {
    userId: v.id("users"),
    bankName: v.string(),
    bankCode: v.string(),
    accountNumber: v.string(),
    accountHolder: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      bankAccount: {
        bankName: args.bankName,
        bankCode: args.bankCode,
        accountNumber: args.accountNumber,
        accountHolder: args.accountHolder,
      },
      updatedAt: Date.now(),
    });
  },
});

export const createChatRoom = mutation({
  args: {
    type: v.union(v.literal("buyer_seller"), v.literal("user_admin")),
    orderId: v.optional(v.id("orders")),
    buyerId: v.optional(v.id("users")),
    sellerId: v.optional(v.id("users")),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Check if room already exists
    const existing = await ctx.db.query("chat_rooms").collect();
    const found = existing.find((r) => {
      if (args.type === "buyer_seller") {
        return r.buyerId === args.buyerId && r.sellerId === args.sellerId && r.orderId === args.orderId;
      }
      return r.userId === args.userId && r.type === "user_admin";
    });
    if (found) return found._id;

    return await ctx.db.insert("chat_rooms", {
      type: args.type,
      orderId: args.orderId,
      buyerId: args.buyerId,
      sellerId: args.sellerId,
      userId: args.userId,
      createdAt: Date.now(),
    });
  },
});

export const sendChatMessage = mutation({
  args: {
    roomId: v.id("chat_rooms"),
    senderId: v.id("users"),
    content: v.string(),
    attachmentUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("chat_messages", {
      roomId: args.roomId,
      senderId: args.senderId,
      content: args.content,
      isRead: false,
      attachmentUrl: args.attachmentUrl,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.roomId, {
      lastMessage: args.content.slice(0, 100),
      lastMessageAt: Date.now(),
    });

    return messageId;
  },
});

export const markMessagesAsRead = mutation({
  args: { roomId: v.id("chat_rooms"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chat_messages")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    await Promise.all(
      messages
        .filter((m) => m.senderId !== args.userId)
        .map((m) => ctx.db.patch(m._id, { isRead: true }))
    );
  },
});

export const createReview = mutation({
  args: {
    orderId: v.id("orders"),
    productId: v.id("products"),
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    rating: v.number(),
    commentVi: v.optional(v.string()),
    commentEn: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const reviewId = await ctx.db.insert("reviews", {
      orderId: args.orderId,
      productId: args.productId,
      buyerId: args.buyerId,
      sellerId: args.sellerId,
      rating: args.rating,
      commentVi: args.commentVi,
      commentEn: args.commentEn,
      isVisible: true,
      createdAt: Date.now(),
    });

    // Update product rating
    const reviews = await ctx.db
      .query("reviews")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("isVisible"), true))
      .collect();
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await ctx.db.patch(args.productId, {
      rating: avgRating,
      reviewCount: reviews.length,
      updatedAt: Date.now(),
    });

    return reviewId;
  },
});

export const updateUserRole = mutation({
  args: { userId: v.id("users"), role: v.union(v.literal("user"), v.literal("seller"), v.literal("vendor"), v.literal("admin")) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, { role: args.role, updatedAt: Date.now() });
  },
});

export const deleteProduct = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.productId, { isActive: false, updatedAt: Date.now() });
  },
});

export const incrementProductViews = mutation({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (product) {
      await ctx.db.patch(args.productId, { views: product.views + 1, updatedAt: Date.now() });
    }
  },
});

export const updateSeoSettings = mutation({
  args: {
    pageKey: v.string(),
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
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("seo_settings")
      .withIndex("by_page_key", (q) => q.eq("pageKey", args.pageKey))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { ...args, updatedAt: Date.now() });
    } else {
      await ctx.db.insert("seo_settings", { ...args, updatedAt: Date.now() });
    }
  },
});

export const createCategory = mutation({
  args: {
    nameVi: v.string(),
    nameEn: v.string(),
    slug: v.string(),
    icon: v.string(),
    descriptionVi: v.optional(v.string()),
    descriptionEn: v.optional(v.string()),
    sortOrder: v.number(),
    parentId: v.optional(v.id("categories")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("categories", {
      nameVi: args.nameVi,
      nameEn: args.nameEn,
      slug: args.slug,
      icon: args.icon,
      descriptionVi: args.descriptionVi,
      descriptionEn: args.descriptionEn,
      sortOrder: args.sortOrder,
      parentId: args.parentId,
      isActive: true,
      createdAt: Date.now(),
    });
  },
});

export const updateCategory = mutation({
  args: {
    categoryId: v.id("categories"),
    nameVi: v.optional(v.string()),
    nameEn: v.optional(v.string()),
    slug: v.optional(v.string()),
    icon: v.optional(v.string()),
    descriptionVi: v.optional(v.string()),
    descriptionEn: v.optional(v.string()),
    sortOrder: v.optional(v.number()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { categoryId, ...updates } = args;
    await ctx.db.patch(categoryId, updates);
  },
});

export const createNewsArticle = mutation({
  args: {
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("news_articles", {
      ...args,
      publishedAt: args.isPublished ? Date.now() : undefined,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const publishNewsArticle = mutation({
  args: { articleId: v.id("news_articles") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, {
      isPublished: true,
      publishedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const deleteNewsArticle = mutation({
  args: { articleId: v.id("news_articles") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, {
      isPublished: false,
      updatedAt: Date.now(),
    });
  },
});
