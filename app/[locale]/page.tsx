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
import {
  dictToHeroContent,
  dictToHomeProducts,
  HOME_MARQUEE,
  dictToStats,
} from "@/lib/i18n/adapters";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale = (isLocale(params.locale) ? params.locale : "zh") as Locale;
  const dict = getDictionary(locale);
  return {
    title: dict.home.meta_title,
    description: dict.home.meta_description,
    alternates: {
      canonical: `/${locale}/`,
      languages: {
        zh: "/zh/",
        en: "/en/",
        "x-default": "/zh/",
      },
    },
  };
}

export default function HomePage({ params }: { params: { locale: string } }) {
  const locale = (isLocale(params.locale) ? params.locale : "zh") as Locale;
  const dict = getDictionary(locale);
  const heroContent = dictToHeroContent(dict);
  const homeProducts = dictToHomeProducts(dict);
  const stats = dictToStats(dict);

  return (
    <LenisProvider>
      <Loader brand={dict.common.nav.brand} />
      <CustomCursor />
      <Nav locale={locale} strings={dict.common.nav} />
      <main>
        <Hero content={heroContent} variant="A" />
        <MarqueeSection items={HOME_MARQUEE} />
        <ProductMatrix
          products={homeProducts}
          label={dict.home.products.label}
          title={dict.home.products.title}
        />
        <StatsSection
          stats={stats}
          label={dict.home.stats.label}
          title={dict.home.stats.title}
        />
        <VisionSection label={dict.home.vision.label} text={dict.home.vision.text} />
        <ContactCTA
          label={dict.home.contact_cta.label}
          title={dict.home.contact_cta.title}
          buttonLabel={dict.home.contact_cta.button}
          buttonHref={`/${locale}/contact/`}
        />
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
