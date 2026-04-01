import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const getRooms = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chat_rooms")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

export const getMessages = query({
  args: { roomId: v.id("chat_rooms") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("chat_messages")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("asc")
      .take(100);
  },
});

export const getOrCreateRoom = mutation({
  args: {
    type: v.union(v.literal("buyer_seller"), v.literal("user_admin")),
    userId: v.id("users"),
    partnerId: v.optional(v.id("users")),
    orderId: v.optional(v.id("orders")),
  },
  handler: async (ctx, args) => {
    let room = await ctx.db
      .query("chat_rooms")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("partnerId"), args.partnerId))
      .first();

    if (!room && args.orderId) {
      room = await ctx.db
        .query("chat_rooms")
        .withIndex("by_user", (q) => q.eq("userId", args.userId))
        .filter((q) => q.eq(q.field("orderId"), args.orderId))
        .first();
    }

    if (!room) {
      const roomId = await ctx.db.insert("chat_rooms", {
        type: args.type,
        userId: args.userId,
        partnerId: args.partnerId,
        orderId: args.orderId,
        createdAt: Date.now(),
      });
      return roomId;
    }

    return room._id;
  },
});
