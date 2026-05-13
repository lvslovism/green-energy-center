import { notFound } from "next/navigation";
import { isLocale, LOCALES } from "@/lib/i18n/locales";
import { fetchSiteSettings } from "@/lib/cms";
import { getTrackingConfig } from "@/lib/cms-helpers";
import TrackingScripts from "@/components/tracking/TrackingScripts";
import LineFloatingButton from "@/components/tracking/LineFloatingButton";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!isLocale(params.locale)) {
    notFound();
  }
  // Build-time fetch — tracking config 在 SSG 時注入靜態 HTML
  const settings = await fetchSiteSettings();
  const tracking = getTrackingConfig(settings);

  return (
    <>
      {children}
      <TrackingScripts
        ga4Id={tracking.ga4Id}
        gtmId={tracking.gtmId}
        metaPixelId={tracking.metaPixelId}
        linkedinPartnerId={tracking.linkedinPartnerId}
        clarityProjectId={tracking.clarityProjectId}
      />
      {tracking.lineOaUrl && <LineFloatingButton url={tracking.lineOaUrl} />}
    </>
  );
}
