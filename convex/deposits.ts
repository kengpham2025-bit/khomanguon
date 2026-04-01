import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    payosTransactionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const depositId = await ctx.db.insert("deposits", {
      userId: args.userId,
      amount: args.amount,
      payosTransactionId: args.payosTransactionId,
      status: "pending",
      createdAt: Date.now(),
    });
    return depositId;
  },
});

export const complete = mutation({
  args: {
    depositId: v.id("deposits"),
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.depositId, {
      status: "completed",
      completedAt: Date.now(),
    });

    const user = await ctx.db.get(args.userId);
    if (user) {
      await ctx.db.patch(args.userId, {
        balance: user.balance + args.amount,
      });
    }

    if (user?.referredBy) {
      const affiliateAmount = Math.floor(args.amount * 0.01);
      await ctx.db.insert("affiliate_logs", {
        referrerId: user.referredBy,
        referredId: user._id,
        depositId: args.depositId,
        amount: affiliateAmount,
        createdAt: Date.now(),
      });

      const referrer = await ctx.db.get(user.referredBy);
      if (referrer) {
        await ctx.db.patch(user.referredBy, {
          balance: referrer.balance + affiliateAmount,
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
      .query("deposits")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});
