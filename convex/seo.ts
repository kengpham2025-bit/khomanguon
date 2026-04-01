import { query, mutation } from "../_generated/server";
import { v } from "convex/values";

export const getSettings = query({
  args: {},
  handler: async (ctx) => {
    const settings = await ctx.db.query("seo_settings").first();
    if (!settings) {
      const id = await ctx.db.insert("seo_settings", {
        siteNameVi: "KHOMANGUON.IO.VN",
        siteNameEn: "KHOMANGUON.IO.VN",
        metaTitleVi: "Thị trường kỹ thuật số cao cấp",
        metaTitleEn: "Premium Digital Marketplace",
        metaDescriptionVi: "Nền tảng thị trường kỹ thuật số cao cấp",
        metaDescriptionEn: "Premium digital marketplace platform",
        ogImage: "",
        jsonLdSchema: "{}",
        gaScript: "",
        gtmScript: "",
        fbPixelScript: "",
        turnstileSiteKey: "",
        updatedAt: Date.now(),
      });
      return await ctx.db.get(id);
    }
    return settings;
  },
});

export const updateSettings = mutation({
  args: {
    siteNameVi: v.string(),
    siteNameEn: v.string(),
    metaTitleVi: v.string(),
    metaTitleEn: v.string(),
    metaDescriptionVi: v.string(),
    metaDescriptionEn: v.string(),
    ogImage: v.string(),
    jsonLdSchema: v.string(),
    gaScript: v.string(),
    gtmScript: v.string(),
    fbPixelScript: v.string(),
    turnstileSiteKey: v.string(),
  },
  handler: async (ctx, args) => {
    const settings = await ctx.db.query("seo_settings").first();
    if (settings) {
      await ctx.db.patch(settings._id, {
        ...args,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("seo_settings", {
        ...args,
        updatedAt: Date.now(),
      });
    }
    return true;
  },
});
