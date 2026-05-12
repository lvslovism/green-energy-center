import type { Metadata } from "next";
import { Atom, Cog, Cpu, type LucideIcon } from "lucide-react";
import LenisProvider from "@/components/motion/LenisProvider";
import CustomCursor from "@/components/motion/CustomCursor";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Timeline from "@/components/shared/Timeline";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import {
  fetchSiteSettings,
  fetchTechnologyPillars,
  fetchRdStats,
  fetchCertifications,
  fetchMilestones,
} from "@/lib/cms";
import {
  localizePillar,
  localizeRdStat,
  localizeMilestone,
  localizeFooter,
} from "@/lib/cms-helpers";

const ICONS: Record<string, LucideIcon> = { Atom, Cog, Cpu };

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale = (isLocale(params.locale) ? params.locale : "zh") as Locale;
  const dict = getDictionary(locale);
  return {
    title: dict.technology.meta_title,
    description: dict.technology.meta_description,
    alternates: {
      canonical: `/${locale}/technology/`,
      languages: { zh: "/zh/technology/", en: "/en/technology/", "x-default": "/zh/technology/" },
    },
  };
}

export default async function TechnologyPage({ params }: { params: { locale: string } }) {
  const locale = (isLocale(params.locale) ? params.locale : "zh") as Locale;
  const dict = getDictionary(locale);
  const t = dict.technology;

  const [pillarRows, rdRows, certRows, milestoneRows, settings] = await Promise.all([
    fetchTechnologyPillars(),
    fetchRdStats(),
    fetchCertifications(),
    fetchMilestones("technology"),
    fetchSiteSettings(),
  ]);

  // DB → component shapes，空陣列時 fallback dict
  const pillars =
    pillarRows.length > 0
      ? pillarRows.map((p) => localizePillar(p, locale))
      : t.pillars.items;
  const rdStats =
    rdRows.length > 0
      ? rdRows.map((r) => localizeRdStat(r, locale))
      : t.rd.stats;
  const certs = certRows.length > 0 ? certRows.map((c) => c.name) : t.rd.certs;
  const milestones =
    milestoneRows.length > 0
      ? milestoneRows.map((m) => localizeMilestone(m, locale))
      : t.roadmap.items;
  const footer = localizeFooter(settings, locale, dict);

  return (
    <LenisProvider>
      <CustomCursor />
      <Nav locale={locale} strings={dict.common.nav} />
      <main className="static-page">
        <header className="static-header">
          <div className="static-header-inner">
            <div className="static-eyebrow">{t.header_eyebrow}</div>
            <h1 className="static-h1">{t.header_title}</h1>
            <p className="static-sub">{t.header_sub}</p>
          </div>
        </header>

        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">{t.pillars.label}</div>
              <h2 className="section-title">{t.pillars.title}</h2>
            </div>
            <div className="pillar-grid">
              {pillars.map((p, i) => {
                const Icon = ICONS[p.icon] ?? Atom;
                return (
                  <article className="pillar-card" key={p.title} data-cursor-hover>
                    <div className="pillar-idx">0{i + 1}</div>
                    <div className="pillar-icon">
                      <Icon size={28} strokeWidth={1.4} />
                    </div>
                    <h3 className="pillar-title">{p.title}</h3>
                    <p className="pillar-desc">{p.desc}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">{t.rd.label}</div>
              <h2 className="section-title">{t.rd.title}</h2>
            </div>
            <div className="rd-stat-grid">
              {rdStats.map((s, i) => (
                <div className="rd-stat-cell" key={s.label} data-idx={`0${i + 1}`}>
                  <div className="rd-stat-value">{s.value}</div>
                  <div className="rd-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="cert-row">
              <div className="cert-label">{t.rd.certs_label}</div>
              <div className="cert-pills">
                {certs.map((c) => (
                  <span className="cert-pill" key={c}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">{t.roadmap.label}</div>
              <h2 className="section-title">{t.roadmap.title}</h2>
            </div>
            <Timeline
              nodes={milestones.map((it) => ({ year: it.year, content: it.content }))}
            />
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
