"use client";
import RevealUp from "@/components/motion/RevealUp";
import ProductCardWireframe from "@/components/visuals/ProductCardWireframe";
import ProductCardIsometric from "@/components/visuals/ProductCardIsometric";
import ProductCardDataSheet from "@/components/visuals/ProductCardDataSheet";
import type { Product } from "@/lib/types";

type ProductMatrixProps = {
  products: Product[];
  label: string;
  title: string;
};

export default function ProductMatrix({ products, label, title }: ProductMatrixProps) {
  return (
    <section
      id="products"
      style={{
        padding: "7rem 2rem",
        position: "relative",
        zIndex: 2,
        background: "var(--bg)",
      }}
    >
      <div style={{ maxWidth: 1500, margin: "0 auto" }}>
        <SectionHeader index={label} title={title} />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 1,
            background: "var(--line-soft)",
            border: "1px solid var(--line-soft)",
          }}
        >
          {products.map((p) => {
            if (p.cardVariant === "A") return <ProductCardWireframe key={p.slug} product={p} />;
            if (p.cardVariant === "B") return <ProductCardIsometric key={p.slug} product={p} />;
            return <ProductCardDataSheet key={p.slug} product={p} />;
          })}
        </div>
      </div>
    </section>
  );
}

function SectionHeader({ index, title }: { index: string; title: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: "2rem",
        marginBottom: "5rem",
        flexWrap: "wrap",
      }}
    >
      <div>
        <RevealUp>
          <div className="section-index">{index}</div>
        </RevealUp>
        <RevealUp>
          <h2
            className="section-title"
            dangerouslySetInnerHTML={{ __html: title }}
          />
        </RevealUp>
      </div>
    </div>
  );
}
