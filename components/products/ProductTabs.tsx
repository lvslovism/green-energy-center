"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import type { Product } from "@/lib/products";
import SpecGrid from "./SpecGrid";
import UseCaseGrid from "./UseCaseGrid";
import DocumentList from "./DocumentList";

// recharts 在 SSR 時會嘗試讀 ResizeObserver / window，static export 改 client-only 載入
const PerformanceChart = dynamic(() => import("./PerformanceChart"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        minHeight: 360,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--muted)",
        fontFamily: "var(--font-jetbrains), monospace",
        fontSize: 11,
        letterSpacing: "0.25em",
        textTransform: "uppercase",
      }}
    >
      Loading chart…
    </div>
  ),
});

type TabId = "specs" | "performance" | "applications" | "documents";

const TABS: { id: TabId; label: string; index: string }[] = [
  { id: "specs", label: "規格", index: "01" },
  { id: "performance", label: "效能對比", index: "02" },
  { id: "applications", label: "應用場景", index: "03" },
  { id: "documents", label: "文件下載", index: "04" },
];

export default function ProductTabs({ product }: { product: Product }) {
  const [active, setActive] = useState<TabId>("specs");

  return (
    <section className="product-tabs">
      {/* Tab bar — sticky 在 nav 下方 */}
      <div className="pt-bar-wrap">
        <div
          className="pt-bar"
          role="tablist"
          aria-label="Product information tabs"
        >
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              id={`tab-${t.id}`}
              aria-controls={`panel-${t.id}`}
              aria-selected={active === t.id}
              tabIndex={active === t.id ? 0 : -1}
              className={`pt-tab ${active === t.id ? "active" : ""}`}
              data-cursor-hover
              onClick={() => setActive(t.id)}
            >
              <span className="pt-tab-idx">{t.index}</span>
              <span className="pt-tab-label">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="pt-content">
        {/* Specs */}
        {active === "specs" && (
          <div role="tabpanel" id="panel-specs" aria-labelledby="tab-specs" className="pt-panel">
            <header className="pt-panel-header">
              <span className="pt-panel-idx">01 / SPECIFICATION</span>
              <h2 className="pt-panel-title">完整規格表</h2>
            </header>
            <SpecGrid specs={product.specs} />
          </div>
        )}

        {/* Performance */}
        {active === "performance" && (
          <div role="tabpanel" id="panel-performance" aria-labelledby="tab-performance" className="pt-panel">
            <header className="pt-panel-header">
              <span className="pt-panel-idx">02 / BENCHMARK</span>
              <h2 className="pt-panel-title">效能對比</h2>
              <p className="pt-panel-sub">
                自家產品（accent 色）vs. 市場平均值（dim）四項關鍵指標。
              </p>
            </header>
            <PerformanceChart data={product.performance} />
          </div>
        )}

        {/* Applications */}
        {active === "applications" && (
          <div role="tabpanel" id="panel-applications" aria-labelledby="tab-applications" className="pt-panel">
            <header className="pt-panel-header">
              <span className="pt-panel-idx">03 / APPLICATIONS</span>
              <h2 className="pt-panel-title">應用場景</h2>
            </header>
            <UseCaseGrid useCases={product.useCases} />
          </div>
        )}

        {/* Documents */}
        {active === "documents" && (
          <div role="tabpanel" id="panel-documents" aria-labelledby="tab-documents" className="pt-panel">
            <header className="pt-panel-header">
              <span className="pt-panel-idx">04 / DOCUMENTS</span>
              <h2 className="pt-panel-title">技術文件</h2>
              <p className="pt-panel-sub">
                正式文件正建構中，目前以 hardcoded 範例呈現，Step 6 接 CMS 後即可下載。
              </p>
            </header>
            <DocumentList documents={product.documents} />
          </div>
        )}
      </div>
    </section>
  );
}
