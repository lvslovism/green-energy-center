import type { Metadata } from "next";
import LenisProvider from "@/components/motion/LenisProvider";
import CustomCursor from "@/components/motion/CustomCursor";
import Loader from "@/components/layout/Loader";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import MarqueeSection from "@/components/sections/MarqueeSection";
import ProductMatrix from "@/components/sections/ProductMatrix";
import StatsSection from "@/components/sections/StatsSection";
import VisionSection from "@/components/sections/VisionSection";
import ContactCTA from "@/components/sections/ContactCTA";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { fetchSiteSettings, fetchProducts } from "@/lib/cms";
import {
  localizeHero,
  localizeStats,
  localizeVision,
  localizeFooter,
  localizeSeo,
  localizeProductCard,
  HOME_MARQUEE,
} from "@/lib/cms-helpers";

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = (isLocale(params.locale) ? params.locale : "zh") as Locale;
  const dict = getDictionary(locale);
  const settings = await fetchSiteSettings();
  const seo = localizeSeo(settings, locale);
  return {
    title: seo.title || dict.home.meta_title,
    description: seo.description || dict.home.meta_description,
    alternates: {
      canonical: `/${locale}/`,
      languages: { zh: "/zh/", en: "/en/", "x-default": "/zh/" },
    },
  };
}

export default async function HomePage({ params }: { params: { locale: string } }) {
  const locale = (isLocale(params.locale) ? params.locale : "zh") as Locale;
  const dict = getDictionary(locale);

  const [settings, products] = await Promise.all([
    fetchSiteSettings(),
    fetchProducts(),
  ]);

  const heroContent = localizeHero(settings, locale, dict);
  const stats = localizeStats(settings, locale, dict);
  const vision = localizeVision(settings, locale, dict);
  const footer = localizeFooter(settings, locale, dict);

  // 產品卡：DB 為主，空陣列時 fallback 不渲染
  const productCards =
    products.length > 0 ? products.map((p) => localizeProductCard(p, locale)) : [];

  return (
    <LenisProvider>
      <Loader brand={dict.common.nav.brand} />
      <CustomCursor />
      <Nav locale={locale} strings={dict.common.nav} />
      <main>
        <Hero content={heroContent} variant="A" />
        <MarqueeSection items={HOME_MARQUEE} />
        <ProductMatrix
          products={productCards}
          label={dict.home.products.label}
          title={dict.home.products.title}
        />
        <StatsSection stats={stats.items} label={stats.label} title={stats.title} />
        <VisionSection label={vision.label} text={vision.text} />
        <ContactCTA
          label={dict.home.contact_cta.label}
          title={dict.home.contact_cta.title}
          buttonLabel={dict.home.contact_cta.button}
          buttonHref={`/${locale}/contact/`}
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
