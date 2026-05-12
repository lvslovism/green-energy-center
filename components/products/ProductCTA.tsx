import { ArrowUpRight } from "lucide-react";
import type { LocalizedProduct } from "@/lib/cms-helpers";
import type { Locale } from "@/lib/i18n/locales";

type ProductCTAProps = {
  product: LocalizedProduct;
  others: LocalizedProduct[];
  locale: Locale;
  strings: {
    cta_eyebrow: string;
    cta_title_pre: string;
    cta_title_post: string;
    cta_desc: string;
    cta_button: string;
    cross_label: string;
  };
};

export default function ProductCTA({ product, others, locale, strings }: ProductCTAProps) {
  return (
    <section className="product-cta-section">
      <div className="pcta-inner">
        <div className="pcta-top">
          <div>
            <span className="pcta-eyebrow">{strings.cta_eyebrow}</span>
            <h2
              className="pcta-title"
              dangerouslySetInnerHTML={{
                __html: `${strings.cta_title_pre}<em>${product.name}</em>${strings.cta_title_post}`,
              }}
            />
            <p className="pcta-desc">{strings.cta_desc}</p>
          </div>
          <a href={`/${locale}/contact/`} className="pcta-button" data-cursor-hover>
            <span>{strings.cta_button}</span>
            <ArrowUpRight size={16} strokeWidth={1.6} />
          </a>
        </div>

        <div className="pcta-cross">
          <div className="pcta-cross-label">{strings.cross_label}</div>
          <div className="pcta-cross-grid">
            {others.map((p) => (
              <a
                key={p.slug}
                href={`/${locale}/products/${p.slug}/`}
                className="pcta-cross-card"
                data-cursor-hover
              >
                <div className="pcta-cross-meta">
                  <span>{p.nameEn.toUpperCase()}</span>
                  <ArrowUpRight size={14} strokeWidth={1.5} />
                </div>
                <div className="pcta-cross-title">{p.name}</div>
                <div className="pcta-cross-grade">{p.grade}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
