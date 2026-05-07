import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LenisProvider from "@/components/motion/LenisProvider";
import CustomCursor from "@/components/motion/CustomCursor";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import ProductHero from "@/components/products/ProductHero";
import ProductTabs from "@/components/products/ProductTabs";
import ProductCTA from "@/components/products/ProductCTA";
import { products } from "@/lib/products";
import { getDictionary } from "@/lib/i18n";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { getLocalizedProduct } from "@/lib/i18n/adapters";

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of LOCALES) {
    for (const p of products) {
      params.push({ locale, slug: p.slug });
    }
  }
  return params;
}

export function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Metadata {
  const locale = (isLocale(params.locale) ? params.locale : "zh") as Locale;
  const dict = getDictionary(locale);
  const p = getLocalizedProduct(params.slug, dict);
  if (!p) return { title: "Not found" };
  return {
    title: `${p.name} | ${dict.common.nav.brand}`,
    description: p.tagline,
    alternates: {
      canonical: `/${locale}/products/${p.slug}/`,
      languages: {
        zh: `/zh/products/${p.slug}/`,
        en: `/en/products/${p.slug}/`,
        "x-default": `/zh/products/${p.slug}/`,
      },
    },
  };
}

export default function ProductPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const locale = (isLocale(params.locale) ? params.locale : "zh") as Locale;
  const dict = getDictionary(locale);
  const product = getLocalizedProduct(params.slug, dict);
  if (!product) notFound();

  const shared = dict.products.shared;

  return (
    <LenisProvider>
      <CustomCursor />
      <Nav locale={locale} strings={dict.common.nav} />
      <main>
        <ProductHero
          product={product}
          locale={locale}
          breadcrumbHome={shared.breadcrumb_home}
          breadcrumbProducts={shared.breadcrumb_products}
        />
        <ProductTabs
          product={product}
          strings={{
            tabs: shared.tabs,
            panels: shared.panels,
            download: shared.download,
            ours_label: shared.ours_label,
            market_label: shared.market_label,
            lower_better: shared.lower_better,
            perf_note_prefix: shared.perf_note_prefix,
            perf_note_em: shared.perf_note_em,
            perf_note_suffix: shared.perf_note_suffix,
          }}
        />
        <ProductCTA product={product} locale={locale} dict={dict} />
      </main>
      <Footer
        copyright={dict.common.footer.copyright}
        address={dict.common.footer.address}
        email="info@greentech.tw"
        locales={dict.common.footer.locales}
      />
    </LenisProvider>
  );
}
