"use client";
import type { Product } from "@/lib/types";

/**
 * Card Variant A — Wireframe（六邊形晶格 + 動態離子）
 * 拷貝自 mockup pc-variant-a，包成 props 化 component。
 */
export default function ProductCardWireframe({ product }: { product: Product }) {
  return (
    <article
      className="product-card pc-variant-a"
      data-cursor-hover
      style={{
        position: "relative",
        background: "var(--bg)",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        transition: "background 0.4s, transform 0.4s",
        willChange: "transform",
      }}
    >
      <div className="pc-meta">
        <span>{product.meta}</span>
        <span className="pc-id">[ A · WIREFRAME ]</span>
      </div>
      <div className="pc-visual" style={{ background: "radial-gradient(ellipse at center,#142028 0%,#0A0E14 100%)" }}>
        <svg
          viewBox="0 0 320 320"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <radialGradient id="rg-a" cx="50%" cy="50%">
              <stop offset="0%" stopColor="#5EEAD4" stopOpacity=".4" />
              <stop offset="100%" stopColor="#5EEAD4" stopOpacity="0" />
            </radialGradient>
            <pattern id="grid-a" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#5EEAD4" strokeWidth=".3" opacity=".15" />
            </pattern>
          </defs>
          <rect width="320" height="320" fill="url(#grid-a)" />
          <circle cx="160" cy="160" r="100" fill="url(#rg-a)" />
          <polygon points="160,70 220,105 220,175 160,210 100,175 100,105" fill="none" stroke="#5EEAD4" strokeWidth="1" opacity=".7" />
          <polygon points="160,90 205,115 205,170 160,195 115,170 115,115" fill="none" stroke="#5EEAD4" strokeWidth=".5" opacity=".4" />
          <circle cx="160" cy="142" r="3" fill="#5EEAD4" />
          <line x1="160" y1="142" x2="130" y2="120" stroke="#5EEAD4" strokeWidth=".5" opacity=".5" />
          <line x1="160" y1="142" x2="190" y2="120" stroke="#5EEAD4" strokeWidth=".5" opacity=".5" />
          <line x1="160" y1="142" x2="160" y2="178" stroke="#5EEAD4" strokeWidth=".5" opacity=".5" />
          <circle cx="130" cy="120" r="2" fill="#5EEAD4">
            <animate attributeName="opacity" values="1;.3;1" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="190" cy="120" r="2" fill="#5EEAD4">
            <animate attributeName="opacity" values=".3;1;.3" dur="2.4s" repeatCount="indefinite" />
          </circle>
          <circle cx="160" cy="178" r="2" fill="#5EEAD4">
            <animate attributeName="opacity" values="1;.3;1" dur="2.8s" repeatCount="indefinite" />
          </circle>
          <line x1="160" y1="240" x2="160" y2="280" stroke="#5EEAD4" strokeWidth=".5" opacity=".4" />
          <line x1="50" y1="40" x2="80" y2="40" stroke="#5EEAD4" strokeWidth=".5" opacity=".4" />
          <text x="50" y="290" fontFamily="var(--font-jetbrains), monospace" fontSize="9" fill="#5EEAD4" opacity=".6" letterSpacing="2">
            Na+
          </text>
          <text x="220" y="290" fontFamily="var(--font-jetbrains), monospace" fontSize="9" fill="#5EEAD4" opacity=".4" letterSpacing="1">
            [6,000 cyc]
          </text>
        </svg>
      </div>
      <h3 className="pc-title">{product.name}</h3>
      <p className="pc-desc">{product.description}</p>
      <div className="pc-specs">
        {product.specs.map((s) => (
          <div key={s.label}>
            {s.label}
            <strong style={s.label === "STATUS" ? { color: "var(--accent)" } : undefined}>{s.value}</strong>
          </div>
        ))}
      </div>
      <a href={`/products/${product.slug}/`} className="pc-link" data-cursor-hover>
        VIEW SPECS →
      </a>
    </article>
  );
}
