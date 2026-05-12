import type { Metadata } from "next";
import LenisProvider from "@/components/motion/LenisProvider";
import CustomCursor from "@/components/motion/CustomCursor";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Timeline from "@/components/shared/Timeline";
import { getDictionary } from "@/lib/i18n";
import { isLocale, type Locale } from "@/lib/i18n/locales";
import {
  fetchSiteSettings,
  fetchTeamMembers,
  fetchMilestones,
} from "@/lib/cms";
import {
  localizeTeamMember,
  localizeMilestone,
  localizeFooter,
} from "@/lib/cms-helpers";

export function generateMetadata({ params }: { params: { locale: string } }): Metadata {
  const locale = (isLocale(params.locale) ? params.locale : "zh") as Locale;
  const dict = getDictionary(locale);
  return {
    title: dict.about.meta_title,
    description: dict.about.meta_description,
    alternates: {
      canonical: `/${locale}/about/`,
      languages: { zh: "/zh/about/", en: "/en/about/", "x-default": "/zh/about/" },
    },
  };
}

export default async function AboutPage({ params }: { params: { locale: string } }) {
  const locale = (isLocale(params.locale) ? params.locale : "zh") as Locale;
  const dict = getDictionary(locale);
  const a = dict.about;

  // Story / mission 來自 dict（屬於 narrative 文本，不放 DB）。
  // Team + milestones 從 DB；空時 fallback dict。
  const [teamRows, milestoneRows, settings] = await Promise.all([
    fetchTeamMembers(),
    fetchMilestones("about"),
    fetchSiteSettings(),
  ]);

  const team =
    teamRows.length > 0
      ? teamRows.map((m) => localizeTeamMember(m, locale))
      : a.team.members.map((m) => ({
          initials: m.initials,
          name: m.name,
          role: m.role,
          avatarUrl: undefined,
        }));

  const milestones =
    milestoneRows.length > 0
      ? milestoneRows.map((m) => localizeMilestone(m, locale))
      : a.milestones.items;

  const footer = localizeFooter(settings, locale, dict);

  return (
    <LenisProvider>
      <CustomCursor />
      <Nav locale={locale} strings={dict.common.nav} />
      <main className="static-page">
        <header className="static-header">
          <div className="static-header-inner">
            <div className="static-eyebrow">{a.header_eyebrow}</div>
            <h1 className="static-h1">{a.header_title}</h1>
            <p className="static-sub">{a.header_sub}</p>
          </div>
        </header>

        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">{a.story.label}</div>
              <h2 className="section-title">{a.story.title}</h2>
            </div>
            <div className="story-grid">
              <p className="story-paragraph">{a.story.p1}</p>
              <p className="story-paragraph">
                {a.story.p2_before}
                <em className="story-accent">{a.story.p2_accent}</em>
              </p>
            </div>
          </div>
        </section>

        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">{a.mission.label}</div>
              <h2 className="section-title">{a.mission.title}</h2>
            </div>
            <div className="mv-grid">
              <article className="mv-card">
                <div className="mv-label">{a.mission.mission_label}</div>
                <p className="mv-text">{a.mission.mission_text}</p>
              </article>
              <article className="mv-card">
                <div className="mv-label">{a.mission.vision_label}</div>
                <p className="mv-text">{a.mission.vision_text}</p>
              </article>
            </div>
          </div>
        </section>

        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">{a.team.label}</div>
              <h2 className="section-title">{a.team.title}</h2>
            </div>
            <div className="team-grid">
              {team.map((m) => (
                <article className="team-card" key={m.name}>
                  <div className="team-avatar" aria-hidden>
                    {m.initials}
                  </div>
                  <div className="team-name">{m.name}</div>
                  <div className="team-role">{m.role}</div>
                </article>
              ))}
            </div>
            <p className="team-note">{a.team.note}</p>
          </div>
        </section>

        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">{a.milestones.label}</div>
              <h2 className="section-title">{a.milestones.title}</h2>
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
