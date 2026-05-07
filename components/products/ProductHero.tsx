import { ProductHeroSvg } from "./ProductHeroSvg";
import type { LocalizedProduct } from "@/lib/i18n/adapters";
import type { Locale } from "@/lib/i18n/locales";

const STATUS_COLORS: Record<string, { bg: string; color: string }> = {
  "MASS PRODUCTION": { bg: "rgba(94,234,212,0.18)", color: "var(--accent)" },
  PILOT: { bg: "rgba(255,180,86,0.16)", color: "#FFB456" },
  SHIPPING: { bg: "rgba(94,234,212,0.18)", color: "var(--accent)" },
};

type ProductHeroProps = {
  product: LocalizedProduct;
  locale: Locale;
  breadcrumbHome: string;
  breadcrumbProducts: string;
};

export default function ProductHero({
  product,
  locale,
  breadcrumbHome,
  breadcrumbProducts,
}: ProductHeroProps) {
  const statusStyle = STATUS_COLORS[product.status] || {
    bg: "var(--accent-soft)",
    color: "var(--accent)",
  };

  return (
    <section className="ph-hero">
      <div className="ph-corner ph-corner-tl" />
      <div className="ph-corner ph-corner-tr" />
      <div className="ph-corner ph-corner-bl" />
      <div className="ph-corner ph-corner-br" />

      <div className="ph-inner">
        <nav className="ph-crumb" aria-label="Breadcrumb">
          <a href={`/${locale}/`} className="ph-crumb-link" data-cursor-hover>
            {breadcrumbHome}
          </a>
          <span className="ph-crumb-sep">/</span>
          <a href={`/${locale}/#products`} className="ph-crumb-link" data-cursor-hover>
            {breadcrumbProducts}
          </a>
          <span className="ph-crumb-sep">/</span>
          <span className="ph-crumb-current">{product.nameEn.toUpperCase()}</span>
        </nav>

        <div className="ph-grid">
          <div className="ph-text">
            <div className="ph-meta-row">
              <span className="ph-meta-en">{product.nameEn}</span>
              <span className="ph-grade">{product.grade}</span>
            </div>
            <h1 className="ph-title">{product.name}</h1>
            <p className="ph-tagline">{product.tagline}</p>

            <div className="ph-status-row">
              <span
                className="ph-status-pill"
                style={{
                  background: statusStyle.bg,
                  color: statusStyle.color,
                  borderColor: statusStyle.color,
                }}
              >
                ● {product.status}
              </span>
            </div>
          </div>

          <div className="ph-visual">
            <ProductHeroSvg slug={product.slug} />
          </div>
        </div>

        <div className="ph-keyspecs">
          {product.keySpecs.map((s, i) => (
            <div key={s.label} className="ph-keyspec" data-idx={`0${i + 1}`}>
              <div className="ph-keyspec-value">{s.value}</div>
              <div className="ph-keyspec-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
