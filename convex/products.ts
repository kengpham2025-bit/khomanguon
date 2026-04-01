import { query } from "../_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("products").order("desc").take(50);
  },
});

export const getById = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.productId);
  },
});

export const getByCategory = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .take(50);
  },
});

export const getHotProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .withIndex("by_hot", (q) => q.eq("isHot", true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(20);
  },
});

export const getSaleProducts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("products")
      .withIndex("by_sale", (q) => q.eq("isSale", true))
      .filter((q) => q.eq(q.field("isActive"), true))
      .take(20);
  },
});

export const getBySeller = query({
  args: { sellerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("products")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .order("desc")
      .take(50);
  },
});

export const search = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const products = await ctx.db.query("products").collect();
    const queryLower = args.query.toLowerCase();
    return products.filter(
      (p) =>
        p.isActive &&
        (p.titleVi.toLowerCase().includes(queryLower) ||
          p.titleEn.toLowerCase().includes(queryLower) ||
          p.descriptionVi.toLowerCase().includes(queryLower) ||
          p.descriptionEn.toLowerCase().includes(queryLower))
    ).slice(0, 20);
  },
});

export const incrementViews = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    const product = await ctx.db.get(args.productId);
    if (product) {
      await ctx.db.patch(args.productId, { views: product.views + 1 });
    }
    return true;
  },
});
