import { mutation } from "../_generated/server";
import { v } from "convex/values";

export const request = mutation({
  args: {
    userId: v.id("users"),
    email: v.string(),
    purpose: v.union(
      v.literal("register"),
      v.literal("withdraw"),
      v.literal("add_bank"),
      v.literal("change_password")
    ),
  },
  handler: async (ctx, args) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    await ctx.db.insert("otp_codes", {
      userId: args.userId,
      email: args.email,
      code,
      purpose: args.purpose,
      expiresAt: Date.now() + 5 * 60 * 1000,
      isUsed: false,
      createdAt: Date.now(),
    });

    return code;
  },
});

export const verify = mutation({
  args: {
    email: v.string(),
    code: v.string(),
    purpose: v.union(
      v.literal("register"),
      v.literal("withdraw"),
      v.literal("add_bank"),
      v.literal("change_password")
    ),
  },
  handler: async (ctx, args) => {
    const otp = await ctx.db
      .query("otp_codes")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .filter((q) => q.eq(q.field("email"), args.email))
      .filter((q) => q.eq(q.field("purpose"), args.purpose))
      .filter((q) => q.eq(q.field("isUsed"), false))
      .filter((q) => q.gt(q.field("expiresAt"), Date.now()))
      .first();

    if (!otp) return false;

    await ctx.db.patch(otp._id, { isUsed: true });
    return true;
  },
});
