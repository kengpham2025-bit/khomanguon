import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    buyerId: v.id("users"),
    sellerId: v.id("users"),
    productId: v.id("products"),
    variantId: v.id("variants"),
    amount: v.number(),
    paymentMethod: v.union(v.literal("payos"), v.literal("balance")),
  },
  handler: async (ctx, args) => {
    const orderId = await ctx.db.insert("orders", {
      ...args,
      status: "pending",
      createdAt: Date.now(),
    });
    return orderId;
  },
});

export const updateStatus = mutation({
  args: {
    orderId: v.id("orders"),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("delivered"),
      v.literal("completed"),
      v.literal("cancelled"),
      v.literal("refunded")
    ),
  },
  handler: async (ctx, args) => {
    const updates: Record<string, unknown> = { status: args.status };

    if (args.status === "paid") updates.paidAt = Date.now();
    if (args.status === "delivered") updates.deliveredAt = Date.now();
    if (args.status === "completed") updates.completedAt = Date.now();

    await ctx.db.patch(args.orderId, updates);
    return true;
  },
});

export const getById = query({
  args: { orderId: v.id("orders") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.orderId);
  },
});

export const getByBuyer = query({
  args: { buyerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_buyer", (q) => q.eq("buyerId", args.buyerId))
      .order("desc")
      .take(50);
  },
});

export const getBySeller = query({
  args: { sellerId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_seller", (q) => q.eq("sellerId", args.sellerId))
      .order("desc")
      .take(50);
  },
});
