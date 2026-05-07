"use client";
import type { Product } from "@/lib/types";

const ASCII_ART = `   ╔═══════╗
   ║ ░░░░░ ║
   ║ ░░▓░░ ║
   ║ ░▓█▓░ ║
   ║ ░░▓░░ ║
   ║ ░░░░░ ║
   ╚═══╤═══╝
       │
       ⚡`;

/**
 * Card Variant C — Data Sheet Readout（規格表 + ASCII art）
 * 拷貝自 mockup pc-variant-c。
 */
export default function ProductCardDataSheet({ product }: { product: Product }) {
  return (
    <article
      className="product-card pc-variant-c"
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
        <span className="pc-id">[ C · DATA SHEET ]</span>
      </div>
      <div
        className="pc-visual"
        style={{
          background: "#0C1218",
          display: "flex",
          flexDirection: "column",
          padding: "1rem",
          gap: "0.5rem",
        }}
      >
        <div className="spec-row">
          <span className="sk">MODEL</span>
          <span className="sv">SC-EDLC-3000</span>
        </div>
        <div className="spec-row">
          <span className="sk">CAPACITANCE</span>
          <span className="sv">3,000 F</span>
        </div>
        <div className="spec-row">
          <span className="sk">VOLTAGE</span>
          <span className="sv">2.7 V</span>
        </div>
        <div className="spec-row">
          <span className="sk">ESR</span>
          <span className="sv">0.29 mΩ</span>
        </div>
        <div className="spec-row">
          <span className="sk">CYCLES</span>
          <span className="sv">1,000,000+</span>
        </div>
        <div className="ascii-art">{ASCII_ART}</div>
        <div className="spec-row">
          <span className="sk">STATUS</span>
          <span className="sv">● ACTIVE</span>
        </div>
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
