import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("news_articles")
      .withIndex("by_published", (q) => q.eq("isPublished", true))
      .order("desc")
      .take(50);
  },
});

export const getById = query({
  args: { articleId: v.id("news_articles") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.articleId);
  },
});

export const publish = mutation({
  args: { articleId: v.id("news_articles") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, {
      isPublished: true,
      publishedAt: Date.now(),
    });
    return true;
  },
});

export const unpublish = mutation({
  args: { articleId: v.id("news_articles") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.articleId, {
      isPublished: false,
    });
    return true;
  },
});
