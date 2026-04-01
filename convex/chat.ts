import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const createRoom = mutation({
  args: {
    type: v.union(v.literal("buyer_seller"), v.literal("user_admin")),
    userId: v.id("users"),
    partnerId: v.optional(v.id("users")),
    orderId: v.optional(v.id("orders")),
  },
  handler: async (ctx, args) => {
    const roomId = await ctx.db.insert("chat_rooms", {
      type: args.type,
      userId: args.userId,
      partnerId: args.partnerId,
      orderId: args.orderId,
      createdAt: Date.now(),
    });
    return roomId;
  },
});

export const sendMessage = mutation({
  args: {
    roomId: v.id("chat_rooms"),
    senderId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const messageId = await ctx.db.insert("chat_messages", {
      roomId: args.roomId,
      senderId: args.senderId,
      content: args.content,
      isRead: false,
      createdAt: Date.now(),
    });

    await ctx.db.patch(args.roomId, {
      lastMessage: args.content,
      lastMessageAt: Date.now(),
    });

    return messageId;
  },
});

export const markAsRead = mutation({
  args: { roomId: v.id("chat_rooms"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("chat_messages")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("isRead"), false))
      .collect();

    for (const msg of messages) {
      if (msg.senderId !== args.userId) {
        await ctx.db.patch(msg._id, { isRead: true });
      }
    }
    return true;
  },
});
