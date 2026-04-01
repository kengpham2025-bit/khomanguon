import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const getById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

export const create = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
    affiliateCode: v.string(),
    referredBy: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) return existing._id;

    const userId = await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      role: "user",
      balance: 0,
      affiliateCode: args.affiliateCode,
      referredBy: args.referredBy,
      isVerified: false,
      kycStatus: "none",
      language: "vi",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return userId;
  },
});

export const updateBalance = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (user) {
      await ctx.db.patch(args.userId, {
        balance: user.balance + args.amount,
        updatedAt: Date.now(),
      });
    }
    return true;
  },
});

export const updateLanguage = mutation({
  args: {
    userId: v.id("users"),
    language: v.union(v.literal("vi"), v.literal("en")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      language: args.language,
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const submitKyc = mutation({
  args: {
    userId: v.id("users"),
    idFront: v.string(),
    idBack: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      kycStatus: "pending",
      kycDocuments: {
        idFront: args.idFront,
        idBack: args.idBack,
      },
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const approveKyc = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      kycStatus: "approved",
      isVerified: true,
      updatedAt: Date.now(),
    });
    return true;
  },
});

export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("seller"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });
    return true;
  },
});
