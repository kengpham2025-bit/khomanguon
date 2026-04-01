import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    bankCode: v.string(),
    bankAccountNumber: v.string(),
    bankAccountName: v.string(),
  },
  handler: async (ctx, args) => {
    const withdrawalId = await ctx.db.insert("withdrawals", {
      userId: args.userId,
      amount: args.amount,
      bankCode: args.bankCode,
      bankAccountNumber: args.bankAccountNumber,
      bankAccountName: args.bankAccountName,
      status: "pending",
      createdAt: Date.now(),
    });
    return withdrawalId;
  },
});

export const approve = mutation({
  args: {
    withdrawalId: v.id("withdrawals"),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const withdrawal = await ctx.db.get(args.withdrawalId);
    if (withdrawal) {
      await ctx.db.patch(args.withdrawalId, {
        status: "approved",
        adminNote: args.adminNote,
        processedAt: Date.now(),
      });
    }
    return true;
  },
});

export const reject = mutation({
  args: {
    withdrawalId: v.id("withdrawals"),
    adminNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const withdrawal = await ctx.db.get(args.withdrawalId);
    if (withdrawal) {
      await ctx.db.patch(args.withdrawalId, {
        status: "rejected",
        adminNote: args.adminNote,
        processedAt: Date.now(),
      });

      const user = await ctx.db.get(withdrawal.userId);
      if (user) {
        await ctx.db.patch(withdrawal.userId, {
          balance: user.balance + withdrawal.amount,
        });
      }
    }
    return true;
  },
});

export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("withdrawals")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

export const getPending = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("withdrawals")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("asc")
      .take(50);
  },
});
