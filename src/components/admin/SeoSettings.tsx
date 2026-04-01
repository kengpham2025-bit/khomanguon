"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Globe,
  Eye,
  FileText,
  Code,
  BarChart3,
  Save,
  RefreshCw,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SeoSettingsProps {
  locale?: "vi" | "en";
  initialData?: {
    siteNameVi: string;
    siteNameEn: string;
    metaTitleVi: string;
    metaTitleEn: string;
    metaDescriptionVi: string;
    metaDescriptionEn: string;
    ogImage: string;
    jsonLdSchema: string;
    gaScript: string;
    gtmScript: string;
    fbPixelScript: string;
  };
}

export function SeoSettings({
  locale = "vi",
  initialData,
}: SeoSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    siteNameVi: initialData?.siteNameVi || "KHOMANGUON.IO.VN",
    siteNameEn: initialData?.siteNameEn || "KHOMANGUON.IO.VN",
    metaTitleVi: initialData?.metaTitleVi || "",
    metaTitleEn: initialData?.metaTitleEn || "",
    metaDescriptionVi: initialData?.metaDescriptionVi || "",
    metaDescriptionEn: initialData?.metaDescriptionEn || "",
    ogImage: initialData?.ogImage || "",
    jsonLdSchema: initialData?.jsonLdSchema || "",
    gaScript: initialData?.gaScript || "",
    gtmScript: initialData?.gtmScript || "",
    fbPixelScript: initialData?.fbPixelScript || "",
  });

  const labels = locale === "vi" ? {
    title: "Cài đặt SEO",
    subtitle: "Quản lý cấu hình SEO toàn cục",
    general: "Thông tin chung",
    siteName: "Tên website",
    meta: "Meta Tags",
    metaTitle: "Meta Title",
    metaDescription: "Meta Description",
    ogImage: "Open Graph Image URL",
    schema: "JSON-LD Schema",
    analytics: "Analytics & Tracking",
    gaScript: "Google Analytics Script",
    gtmScript: "Google Tag Manager Script",
    fbPixel: "Facebook Pixel Script",
    save: "Lưu thay đổi",
    saving: "Đang lưu...",
    saved: "Đã lưu!",
  } : {
    title: "SEO Settings",
    subtitle: "Manage global SEO configuration",
    general: "General Information",
    siteName: "Website Name",
    meta: "Meta Tags",
    metaTitle: "Meta Title",
    metaDescription: "Meta Description",
    ogImage: "Open Graph Image URL",
    schema: "JSON-LD Schema",
    analytics: "Analytics & Tracking",
    gaScript: "Google Analytics Script",
    gtmScript: "Google Tag Manager Script",
    fbPixel: "Facebook Pixel Script",
    save: "Save Changes",
    saving: "Saving...",
    saved: "Saved!",
  };

  const handleSave = async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-900">{labels.title}</h2>
        <p className="mt-1 text-sm text-slate-600">{labels.subtitle}</p>
      </div>

      {/* General Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-white p-6 shadow-soft-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100">
            <Globe className="h-5 w-5 text-primary-600" />
          </div>
          <h3 className="font-semibold text-slate-900">{labels.general}</h3>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {labels.siteName} (VI)
            </label>
            <input
              type="text"
              value={formData.siteNameVi}
              onChange={(e) => handleChange("siteNameVi", e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {labels.siteName} (EN)
            </label>
            <input
              type="text"
              value={formData.siteNameEn}
              onChange={(e) => handleChange("siteNameEn", e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
      </motion.div>

      {/* Meta Tags */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl bg-white p-6 shadow-soft-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
            <FileText className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="font-semibold text-slate-900">{labels.meta}</h3>
        </div>

        <div className="space-y-6">
          {/* Meta Title */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {labels.metaTitle} (VI)
            </label>
            <input
              type="text"
              value={formData.metaTitleVi}
              onChange={(e) => handleChange("metaTitleVi", e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {labels.metaTitle} (EN)
            </label>
            <input
              type="text"
              value={formData.metaTitleEn}
              onChange={(e) => handleChange("metaTitleEn", e.target.value)}
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {/* Meta Description */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {labels.metaDescription} (VI)
            </label>
            <textarea
              value={formData.metaDescriptionVi}
              onChange={(e) => handleChange("metaDescriptionVi", e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {labels.metaDescription} (EN)
            </label>
            <textarea
              value={formData.metaDescriptionEn}
              onChange={(e) => handleChange("metaDescriptionEn", e.target.value)}
              rows={3}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {/* OG Image */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {labels.ogImage}
            </label>
            <input
              type="url"
              value={formData.ogImage}
              onChange={(e) => handleChange("ogImage", e.target.value)}
              placeholder="https://example.com/og-image.jpg"
              className="w-full rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {/* JSON-LD Schema */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {labels.schema}
            </label>
            <textarea
              value={formData.jsonLdSchema}
              onChange={(e) => handleChange("jsonLdSchema", e.target.value)}
              rows={8}
              placeholder='{"@context": "https://schema.org", ...}'
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-xs focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
      </motion.div>

      {/* Analytics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white p-6 shadow-soft-sm"
      >
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100">
            <BarChart3 className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-slate-900">{labels.analytics}</h3>
        </div>

        <div className="space-y-6">
          {/* GA Script */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {labels.gaScript}
            </label>
            <textarea
              value={formData.gaScript}
              onChange={(e) => handleChange("gaScript", e.target.value)}
              rows={3}
              placeholder="<!-- Google Analytics -->"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-xs focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {/* GTM Script */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {labels.gtmScript}
            </label>
            <textarea
              value={formData.gtmScript}
              onChange={(e) => handleChange("gtmScript", e.target.value)}
              rows={3}
              placeholder="<!-- Google Tag Manager -->"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-xs focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>

          {/* FB Pixel */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">
              {labels.fbPixel}
            </label>
            <textarea
              value={formData.fbPixelScript}
              onChange={(e) => handleChange("fbPixelScript", e.target.value)}
              rows={3}
              placeholder="<!-- Facebook Pixel -->"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-2.5 font-mono text-xs focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className={cn(
            "flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all",
            isLoading
              ? "cursor-not-allowed bg-primary-400"
              : saved
              ? "bg-green-500 text-white"
              : "bg-primary-600 text-white hover:bg-primary-700"
          )}
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 animate-spin" />
              {labels.saving}
            </>
          ) : saved ? (
            <>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex h-4 w-4 items-center justify-center"
              >
                <Check className="h-4 w-4" />
              </motion.div>
              {labels.saved}
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              {labels.save}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
