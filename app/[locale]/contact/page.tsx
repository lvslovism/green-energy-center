import type { Metadata } from "next";
import { MapPin, Mail, Phone, Clock, type LucideIcon } from "lucide-react";
import LenisProvider from "@/components/motion/LenisProvider";
import CustomCursor from "@/components/motion/CustomCursor";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/contact/ContactForm";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import { fetchSiteSettings } from "@/lib/cms";
import { localizeContactInfo, localizeFooter } from "@/lib/cms-helpers";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale = (isLocale(params.locale) ? params.locale : "zh") as Locale;
  const dict = getDictionary(locale);
  return {
    title: dict.contact.meta_title,
    description: dict.contact.meta_description,
    alternates: {
      canonical: `/${locale}/contact/`,
      languages: { zh: "/zh/contact/", en: "/en/contact/", "x-default": "/zh/contact/" },
    },
  };
}

export default async function ContactPage({ params }: { params: { locale: string } }) {
  const locale = (isLocale(params.locale) ? params.locale : "zh") as Locale;
  const dict = getDictionary(locale);
  const c = dict.contact;

  const settings = await fetchSiteSettings();
  const info = localizeContactInfo(settings, locale, dict);
  const footer = localizeFooter(settings, locale, dict);

  const ROWS: { Icon: LucideIcon; label: string; value: string; accent?: boolean }[] = [
    { Icon: MapPin, label: c.info.office_label, value: info.office },
    { Icon: Mail, label: c.info.email_label, value: info.email, accent: true },
    { Icon: Phone, label: c.info.phone_label, value: info.phone },
    { Icon: Clock, label: c.info.hours_label, value: info.hours },
  ];

  return (
    <LenisProvider>
      <CustomCursor />
      <Nav locale={locale} strings={dict.common.nav} />
      <main className="static-page">
        <header className="static-header">
          <div className="static-header-inner">
            <div className="static-eyebrow">{c.header_eyebrow}</div>
            <h1 className="static-h1">{c.header_title}</h1>
            <p className="static-sub">{c.header_sub}</p>
          </div>
        </header>

        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">{c.section_label}</div>
              <h2 className="section-title">{c.section_title}</h2>
            </div>
            <div className="contact-grid">
              <div className="contact-form-col">
                <ContactForm strings={c.form} locale={locale} />
              </div>
              <aside className="contact-info-col">
                <div className="contact-info-card">
                  {ROWS.map((item) => {
                    const { Icon } = item;
                    return (
                      <div className="contact-info-row" key={item.label}>
                        <div className="contact-info-icon" aria-hidden>
                          <Icon size={18} strokeWidth={1.5} />
                        </div>
                        <div className="contact-info-text">
                          <div className="contact-info-label">{item.label}</div>
                          <div
                            className="contact-info-value"
                            style={item.accent ? { color: "var(--accent)" } : undefined}
                          >
                            {item.value}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="map-placeholder">{c.info.map_placeholder}</div>
              </aside>
            </div>
          </div>
        </section>
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
