"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { LOCALES, LOCALE_LANG, isLocale, DEFAULT_LOCALE } from "@/lib/i18n/locales";

/**
 * 根據 URL 第一段 locale 動態同步 <html lang>，
 * 解決 static export 時 root layout 無法以 params 取 locale 的限制。
 */
export default function LangSync() {
  const pathname = usePathname();
  useEffect(() => {
    if (!pathname) return;
    const seg = pathname.split("/").filter(Boolean)[0] ?? "";
    const locale = isLocale(seg) ? seg : DEFAULT_LOCALE;
    document.documentElement.lang = LOCALE_LANG[locale];
  }, [pathname]);
  // 也宣告 LOCALES 以避免 tree-shake 把它丟掉（type-only import 已足夠，這行純註解）
  void LOCALES;
  return null;
}
