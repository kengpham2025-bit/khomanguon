import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const list = query({
  args: { productId: v.id("products") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("variants")
      .withIndex("by_product", (q) => q.eq("productId", args.productId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getById = query({
  args: { variantId: v.id("variants") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.variantId);
  },
});

export const create = mutation({
  args: {
    productId: v.id("products"),
    labelVi: v.string(),
    labelEn: v.string(),
    price: v.number(),
    originalPrice: v.optional(v.number()),
    stock: v.number(),
  },
  handler: async (ctx, args) => {
    const variantId = await ctx.db.insert("variants", {
      productId: args.productId,
      labelVi: args.labelVi,
      labelEn: args.labelEn,
      price: args.price,
      originalPrice: args.originalPrice,
      stock: args.stock,
      isActive: true,
    });
    return variantId;
  },
});

export const updateStock = mutation({
  args: {
    variantId: v.id("variants"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const variant = await ctx.db.get(args.variantId);
    if (variant) {
      const newStock = variant.stock - args.quantity;
      await ctx.db.patch(args.variantId, { stock: Math.max(0, newStock) });
    }
    return true;
  },
});
