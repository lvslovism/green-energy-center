import { notFound } from "next/navigation";
import type { Metadata } from "next";
import LenisProvider from "@/components/motion/LenisProvider";
import CustomCursor from "@/components/motion/CustomCursor";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import ProductHero from "@/components/products/ProductHero";
import ProductTabs from "@/components/products/ProductTabs";
import ProductCTA from "@/components/products/ProductCTA";
import { getDictionary } from "@/lib/i18n";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import {
  fetchProducts,
  fetchProductBySlug,
  fetchSiteSettings,
} from "@/lib/cms";
import {
  localizeProduct,
  localizeProductSeo,
  localizeFooter,
} from "@/lib/cms-helpers";

const PRODUCT_SLUGS = ["sodium-ion", "lithium-ion", "supercapacitor"] as const;

export function generateStaticParams() {
  const params: { locale: string; slug: string }[] = [];
  for (const locale of LOCALES) {
    for (const slug of PRODUCT_SLUGS) {
      params.push({ locale, slug });
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const locale = (isLocale(params.locale) ? params.locale : "zh") as Locale;
  const dict = getDictionary(locale);
  const row = await fetchProductBySlug(params.slug);
  if (!row) return { title: "Not found" };
  const seo = localizeProductSeo(row, locale);
  const localized = localizeProduct(row, locale);
  return {
    title: seo.title || `${localized.name} | ${dict.common.nav.brand}`,
    description: seo.description || localized.tagline,
    alternates: {
      canonical: `/${locale}/products/${row.slug}/`,
      languages: {
        zh: `/zh/products/${row.slug}/`,
        en: `/en/products/${row.slug}/`,
        "x-default": `/zh/products/${row.slug}/`,
      },
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: { locale: string; slug: string };
}) {
  const locale = (isLocale(params.locale) ? params.locale : "zh") as Locale;
  const dict = getDictionary(locale);

  const [allRows, settings] = await Promise.all([
    fetchProducts(),
    fetchSiteSettings(),
  ]);

  const row = allRows.find((p) => p.slug === params.slug);
  if (!row) notFound();

  const product = localizeProduct(row, locale);
  const others = allRows
    .filter((p) => p.slug !== params.slug)
    .map((p) => localizeProduct(p, locale));

  const shared = dict.products.shared;
  const footer = localizeFooter(settings, locale, dict);

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
        <ProductCTA
          product={product}
          others={others}
          locale={locale}
          strings={{
            cta_eyebrow: shared.cta_eyebrow,
            cta_title_pre: shared.cta_title_pre,
            cta_title_post: shared.cta_title_post,
            cta_desc: shared.cta_desc,
            cta_button: shared.cta_button,
            cross_label: shared.cross_label,
          }}
        />
      </main>
      <Footer
        copyright={footer.copyright}
        address={footer.address}
        email={footer.email}
        locales={footer.locales}
      />
    </LenisProvider>
  );
}
