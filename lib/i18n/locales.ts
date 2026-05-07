export const LOCALES = ["zh", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "zh";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

/** UI 顯示用的對立語言 label */
export const LOCALE_TOGGLE_LABEL: Record<Locale, string> = {
  zh: "EN",
  en: "中",
};

/** SEO 用的 BCP-47 / hreflang 值 */
export const LOCALE_LANG: Record<Locale, string> = {
  zh: "zh-Hant",
  en: "en",
};
