import { ArrowUpRight } from "lucide-react";
import type { Product } from "@/lib/products";
import { getOtherProducts } from "@/lib/products";

export default function ProductCTA({ product }: { product: Product }) {
  const others = getOtherProducts(product.slug);

  return (
    <section className="product-cta-section">
      <div className="pcta-inner">
        {/* 頂部 CTA */}
        <div className="pcta-top">
          <div>
            <span className="pcta-eyebrow">— 取得樣品</span>
            <h2 className="pcta-title">
              準備好為你的產品<br />
              整合 <em>{product.nameZh}</em> 了嗎？
            </h2>
            <p className="pcta-desc">
              提供應用情境與年使用量，我們的工程師會在 3 個工作日內回覆完整方案。
            </p>
          </div>
          <a href="/#contact" className="pcta-button" data-cursor-hover>
            <span>聯絡銷售</span>
            <ArrowUpRight size={16} strokeWidth={1.6} />
          </a>
        </div>

        {/* 交叉連結 */}
        <div className="pcta-cross">
          <div className="pcta-cross-label">— 其他產品線</div>
          <div className="pcta-cross-grid">
            {others.map((p) => (
              <a
                key={p.slug}
                href={`/products/${p.slug}/`}
                className="pcta-cross-card"
                data-cursor-hover
              >
                <div className="pcta-cross-meta">
                  <span>{p.nameEn.toUpperCase()}</span>
                  <ArrowUpRight size={14} strokeWidth={1.5} />
                </div>
                <div className="pcta-cross-title">{p.nameZh}</div>
                <div className="pcta-cross-grade">{p.grade}</div>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
