import { getRequestConfig } from "next-intl/server";
import { notFound } from "next/navigation";

export const locales = ["vi", "en"] as const;
export type Locale = (typeof locales)[number];

export const localeNames: Record<Locale, string> = {
  vi: "Tiếng Việt",
  en: "English",
};

export default getRequestConfig(async ({ locale }) => {
  if (!locales.includes(locale as Locale)) notFound();
  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
