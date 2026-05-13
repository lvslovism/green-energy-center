import { notFound } from "next/navigation";
import { isLocale, LOCALES } from "@/lib/i18n/locales";
import RuntimeTracking from "@/components/tracking/RuntimeTracking";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) {
    notFound();
  }
  // Tracking + LINE 由 RuntimeTracking 在瀏覽器端從 Supabase 即時讀取，
  // 不再 build-time 嵌入。CMS 改 tracking ID 後使用者下次 page load 即生效。
  return (
    <>
      {children}
      <RuntimeTracking />
    </>
  );
}
