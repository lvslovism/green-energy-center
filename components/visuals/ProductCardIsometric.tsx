"use client";
import type { Product } from "@/lib/types";

/**
 * Card Variant B — Isometric Exploded（等角分解圖）
 * 拷貝自 mockup pc-variant-b。
 */
export default function ProductCardIsometric({ product }: { product: Product }) {
  return (
    <article
      className="product-card pc-variant-b"
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
        <span className="pc-id">[ B · ISOMETRIC ]</span>
      </div>
      <div
        className="pc-visual"
        style={{
          background: "linear-gradient(135deg,#0F1820 0%,#11161E 100%)",
          overflow: "visible",
        }}
      >
        <svg
          viewBox="0 0 320 320"
          width="100%"
          height="100%"
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: "absolute", inset: 0 }}
        >
          <defs>
            <linearGradient id="lg-b" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5EEAD4" stopOpacity=".5" />
              <stop offset="100%" stopColor="#5EEAD4" stopOpacity=".05" />
            </linearGradient>
          </defs>
          <g transform="translate(160, 80)">
            <polygon points="0,0 60,18 0,36 -60,18" fill="url(#lg-b)" stroke="#5EEAD4" strokeWidth="1" />
            <text x="70" y="22" fontFamily="var(--font-jetbrains), monospace" fontSize="8" fill="#5EEAD4" opacity=".7">
              CAP
            </text>
          </g>
          <g transform="translate(160, 130)">
            <polygon points="0,0 60,18 0,36 -60,18" fill="rgba(94,234,212,.06)" stroke="#5EEAD4" strokeWidth="1" />
            <polygon points="0,4 56,20 0,32 -56,20" fill="none" stroke="#5EEAD4" strokeWidth=".4" opacity=".5" />
            <text x="70" y="22" fontFamily="var(--font-jetbrains), monospace" fontSize="8" fill="#5EEAD4" opacity=".7">
              CATHODE
            </text>
          </g>
          <g transform="translate(160, 180)">
            <polygon
              points="0,0 60,18 0,36 -60,18"
              fill="rgba(94,234,212,.03)"
              stroke="#5EEAD4"
              strokeWidth=".7"
              strokeDasharray="3 2"
            />
            <text x="70" y="22" fontFamily="var(--font-jetbrains), monospace" fontSize="8" fill="#5EEAD4" opacity=".7">
              SEPARATOR
            </text>
          </g>
          <g transform="translate(160, 230)">
            <polygon points="0,0 60,18 0,36 -60,18" fill="rgba(94,234,212,.06)" stroke="#5EEAD4" strokeWidth="1" />
            <polygon points="0,4 56,20 0,32 -56,20" fill="none" stroke="#5EEAD4" strokeWidth=".4" opacity=".5" />
            <text x="70" y="22" fontFamily="var(--font-jetbrains), monospace" fontSize="8" fill="#5EEAD4" opacity=".7">
              ANODE
            </text>
          </g>
          <line x1="160" y1="116" x2="160" y2="130" stroke="#5EEAD4" strokeWidth=".5" opacity=".3" strokeDasharray="2 2" />
          <line x1="160" y1="166" x2="160" y2="180" stroke="#5EEAD4" strokeWidth=".5" opacity=".3" strokeDasharray="2 2" />
          <line x1="160" y1="216" x2="160" y2="230" stroke="#5EEAD4" strokeWidth=".5" opacity=".3" strokeDasharray="2 2" />
          <text x="20" y="300" fontFamily="var(--font-jetbrains), monospace" fontSize="9" fill="#5EEAD4" opacity=".5" letterSpacing="2">
            EXPLODED VIEW · Li+
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
