import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.id("users"),
    productId: v.id("products"),
    variantId: v.id("variants"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("cart_items")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) =>
        q.and(
          q.eq(q.field("productId"), args.productId),
          q.eq(q.field("variantId"), args.variantId)
        )
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
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

export const remove = mutation({
  args: { cartItemId: v.id("cart_items") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.cartItemId);
    return true;
  },
});

export const updateQuantity = mutation({
  args: {
    cartItemId: v.id("cart_items"),
    quantity: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.cartItemId, { quantity: args.quantity });
    return true;
  },
});

export const clear = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("cart_items")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    for (const item of items) {
      await ctx.db.delete(item._id);
    }
    return true;
  },
});
