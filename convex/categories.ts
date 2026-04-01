import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").order("asc").collect();
  },
});

export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

export const listSubcategories = query({
  args: { categoryId: v.id("categories") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("subcategories")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .order("asc")
      .collect();
  },
});

export const create = mutation({
  args: {
    nameVi: v.string(),
    nameEn: v.string(),
    slug: v.string(),
    icon: v.string(),
    order: v.number(),
  },
  handler: async (ctx, args) => {
    const categoryId = await ctx.db.insert("categories", {
      ...args,
      isActive: true,
      createdAt: Date.now(),
    });
    return categoryId;
  },
});
