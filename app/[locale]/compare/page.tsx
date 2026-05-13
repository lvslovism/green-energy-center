import type { Metadata } from "next";
import LenisProvider from "@/components/motion/LenisProvider";
import CustomCursor from "@/components/motion/CustomCursor";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import { getDictionary } from "@/lib/i18n";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n/locales";
import { fetchSiteSettings } from "@/lib/cms";
import { localizeFooter } from "@/lib/cms-helpers";
import {
  COMPARISON_SPECS,
  PERFORMANCE_METRICS,
  USE_CASE_MATRIX,
  PRODUCT_KEYS,
  PRODUCT_META,
  type ProductKey,
  type FitLevel,
  type Bi,
} from "@/lib/compare-data";

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const locale = (isLocale(params.locale) ? params.locale : "zh") as Locale;
  const dict = getDictionary(locale);
  return {
    title: dict.compare.meta_title,
    description: dict.compare.meta_description,
    alternates: {
      canonical: `/${locale}/compare/`,
      languages: {
        zh: "/zh/compare/",
        en: "/en/compare/",
        "x-default": "/zh/compare/",
      },
    },
  };
}

function t(b: Bi, locale: Locale) {
  return locale === "en" ? b.en : b.zh;
}

function productName(key: ProductKey, locale: Locale) {
  const m = PRODUCT_META[key];
  return locale === "en" ? m.nameEn : m.nameZh;
}

export default async function ComparePage({ params }: { params: { locale: string } }) {
  const locale = (isLocale(params.locale) ? params.locale : "zh") as Locale;
  const dict = getDictionary(locale);
  const c = dict.compare;

  const settings = await fetchSiteSettings();
  const footer = localizeFooter(settings, locale, dict);

  // 三個產品色（用於 inline style，避免 dynamic class 被 tailwind purge）
  const productColor = (k: ProductKey) => `var(${PRODUCT_META[k].colorVar.match(/--[a-z-]+/)![0]})`;

  // Fit label 對應
  const fitText = (level: FitLevel): { text: string; cls: string } => {
    switch (level) {
      case "best":
        return { text: c.best, cls: "cmp-fit-best" };
      case "suitable":
        return { text: c.suitable, cls: "cmp-fit-suitable" };
      case "hybrid":
        return { text: c.hybrid, cls: "cmp-fit-hybrid" };
      case "na":
      default:
        return { text: c.na, cls: "cmp-fit-na" };
    }
  };

  return (
    <LenisProvider>
      <CustomCursor />
      <Nav locale={locale} strings={dict.common.nav} />
      <main className="static-page">
        {/* ----- Header ----- */}
        <header className="static-header">
          <div className="static-header-inner">
            <div className="static-eyebrow">{c.label}</div>
            <h1 className="static-h1">{c.title}</h1>
            <p className="static-sub">{c.subtitle}</p>
            <div className="cmp-identity-grid">
              {PRODUCT_KEYS.map((k) => {
                const m = PRODUCT_META[k];
                const color = productColor(k);
                return (
                  <article
                    key={k}
                    className="cmp-identity-card"
                    style={{ borderTopColor: color }}
                  >
                    <div className="cmp-identity-name">{productName(k, locale)}</div>
                    <div className="cmp-identity-sub">{m.subtitle}</div>
                    <span
                      className="cmp-identity-grade"
                      style={{
                        background:
                          k === "na"
                            ? "var(--color-na-soft)"
                            : k === "li"
                              ? "var(--color-li-soft)"
                              : "var(--color-sc-soft)",
                        color,
                      }}
                    >
                      {m.grade}
                    </span>
                  </article>
                );
              })}
            </div>
          </div>
        </header>

        {/* ----- Section 01: Key specs ----- */}
        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">{c.specs_label}</div>
              <h2 className="section-title">{c.specs_title}</h2>
            </div>
            <div className="cmp-table-wrap">
              <table className="cmp-table">
                <thead>
                  <tr>
                    <th>SPEC</th>
                    {PRODUCT_KEYS.map((k) => (
                      <th
                        key={k}
                        className="cmp-th-product"
                        style={{ borderTopColor: productColor(k) }}
                      >
                        {productName(k, locale)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_SPECS.map((spec) => (
                    <tr key={spec.label.en}>
                      <td className="cmp-cell-label">{t(spec.label, locale)}</td>
                      {PRODUCT_KEYS.map((k) => {
                        const isBest = spec.best.includes(k);
                        return (
                          <td
                            key={k}
                            className={isBest ? "cmp-cell-best" : undefined}
                          >
                            {t(spec.values[k], locale)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="cmp-best-note">{c.specs_best_note}</div>
          </div>
        </section>

        {/* ----- Section 02: Performance grouped bars ----- */}
        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">{c.perf_label}</div>
              <h2 className="section-title">{c.perf_title}</h2>
            </div>
            <div className="cmp-perf">
              {PERFORMANCE_METRICS.map((metric) => (
                <div className="cmp-perf-row" key={metric.label.en}>
                  <div className="cmp-perf-row-title">{t(metric.label, locale)}</div>
                  <div className="cmp-perf-bars">
                    {PRODUCT_KEYS.map((k) => {
                      const v = metric.values[k];
                      const widthPct = metric.inverted
                        ? Math.max(6, ((metric.max - v) / metric.max) * 100)
                        : Math.max(6, (v / metric.max) * 100);
                      const isBest = metric.best === k;
                      return (
                        <div
                          key={k}
                          className={`cmp-perf-bar-row ${isBest ? "cmp-perf-bar-best" : ""}`}
                        >
                          <div className="cmp-perf-bar-label">
                            {locale === "en" ? PRODUCT_META[k].nameEn : PRODUCT_META[k].nameZh}
                          </div>
                          <div className="cmp-perf-bar-track">
                            <div
                              className="cmp-perf-bar-fill"
                              style={{
                                width: `${widthPct}%`,
                                background: productColor(k),
                              }}
                            />
                            <div className="cmp-perf-bar-value">{metric.display[k]}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
              <div className="cmp-perf-legend">
                {PRODUCT_KEYS.map((k) => (
                  <span key={k} className="cmp-perf-legend-item">
                    <span
                      className="cmp-perf-legend-dot"
                      style={{ background: productColor(k) }}
                    />
                    {productName(k, locale)}
                  </span>
                ))}
                <span className="cmp-perf-legend-item">
                  <span className="cmp-perf-legend-star">★</span>
                  {c.perf_best_note}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ----- Section 03: Use case fit ----- */}
        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">{c.usecase_label}</div>
              <h2 className="section-title">{c.usecase_title}</h2>
            </div>
            <div className="cmp-matrix-wrap">
              <table className="cmp-matrix">
                <thead>
                  <tr>
                    <th>{locale === "en" ? "SCENARIO" : "場景"}</th>
                    {PRODUCT_KEYS.map((k) => (
                      <th
                        key={k}
                        className="cmp-th-product"
                        style={{ borderTopColor: productColor(k) }}
                      >
                        {productName(k, locale)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {USE_CASE_MATRIX.map((row) => (
                    <tr key={row.scenario.en}>
                      <td className="cmp-scenario">{t(row.scenario, locale)}</td>
                      {PRODUCT_KEYS.map((k) => {
                        const f = fitText(row.fit[k]);
                        const detail = row.detail?.[k];
                        return (
                          <td key={k}>
                            <span className={f.cls}>{f.text}</span>
                            {detail && (
                              <span className="cmp-fit-detail">{t(detail, locale)}</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ----- Section 04: CTA ----- */}
        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">{c.cta_label}</div>
              <h2 className="section-title">{c.cta_title}</h2>
            </div>
            <p className="static-sub" style={{ marginBottom: "1rem" }}>
              {c.cta_subtitle}
            </p>
            <div className="cmp-cta-grid">
              {PRODUCT_KEYS.map((k) => {
                const m = PRODUCT_META[k];
                return (
                  <a
                    key={k}
                    href={`/${locale}/products/${m.slug}/`}
                    className="cmp-cta-link"
                    data-cursor-hover
                    style={{ borderTopColor: productColor(k) }}
                  >
                    <span className="cmp-cta-link-meta">{m.subtitle}</span>
                    <span className="cmp-cta-link-name">{productName(k, locale)}</span>
                    <span className="cmp-cta-link-arrow" style={{ color: productColor(k) }}>
                      {c.cta_view_specs}
                    </span>
                  </a>
                );
              })}
            </div>
            <div className="cmp-cta-contact-wrap">
              <a href={`/${locale}/contact/`} className="cmp-cta-contact" data-cursor-hover>
                {c.cta_contact}
              </a>
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
