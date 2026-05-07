import { ArrowUpRight } from "lucide-react";
import type { LocalizedProduct } from "@/lib/i18n/adapters";
import { getOtherLocalizedProducts } from "@/lib/i18n/adapters";
import type { Locale } from "@/lib/i18n/locales";
import type { Dictionary } from "@/lib/i18n";

type ProductCTAProps = {
  product: LocalizedProduct;
  locale: Locale;
  dict: Dictionary;
};

export default function ProductCTA({ product, locale, dict }: ProductCTAProps) {
  const others = getOtherLocalizedProducts(product.slug, dict);
  const shared = dict.products.shared;

  return (
    <section className="product-cta-section">
      <div className="pcta-inner">
        <div className="pcta-top">
          <div>
            <span className="pcta-eyebrow">{shared.cta_eyebrow}</span>
            <h2
              className="pcta-title"
              dangerouslySetInnerHTML={{
                __html: `${shared.cta_title_pre}<em>${product.name}</em>${shared.cta_title_post}`,
              }}
            />
            <p className="pcta-desc">{shared.cta_desc}</p>
          </div>
          <a href={`/${locale}/contact/`} className="pcta-button" data-cursor-hover>
            <span>{shared.cta_button}</span>
            <ArrowUpRight size={16} strokeWidth={1.6} />
          </a>
        </div>

        <div className="pcta-cross">
          <div className="pcta-cross-label">{shared.cross_label}</div>
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
