"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import SpecGrid from "./SpecGrid";
import UseCaseGrid from "./UseCaseGrid";
import DocumentList from "./DocumentList";
import type { LocalizedProduct } from "@/lib/i18n/adapters";

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

export type ProductTabsStrings = {
  tabs: {
    specs: string;
    performance: string;
    applications: string;
    documents: string;
  };
  panels: {
    specs_idx: string;
    specs_title: string;
    performance_idx: string;
    performance_title: string;
    performance_sub: string;
    applications_idx: string;
    applications_title: string;
    documents_idx: string;
    documents_title: string;
    documents_sub: string;
  };
  download: string;
  ours_label: string;
  market_label: string;
  lower_better: string;
  perf_note_prefix: string;
  perf_note_em: string;
  perf_note_suffix: string;
};

type ProductTabsProps = {
  product: LocalizedProduct;
  strings: ProductTabsStrings;
};

export default function ProductTabs({ product, strings }: ProductTabsProps) {
  const [active, setActive] = useState<TabId>("specs");

  const TABS: { id: TabId; label: string; index: string }[] = [
    { id: "specs", label: strings.tabs.specs, index: "01" },
    { id: "performance", label: strings.tabs.performance, index: "02" },
    { id: "applications", label: strings.tabs.applications, index: "03" },
    { id: "documents", label: strings.tabs.documents, index: "04" },
  ];

  return (
    <section className="product-tabs">
      <div className="pt-bar-wrap">
        <div className="pt-bar" role="tablist" aria-label="Product information tabs">
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
        {active === "specs" && (
          <div role="tabpanel" id="panel-specs" aria-labelledby="tab-specs" className="pt-panel">
            <header className="pt-panel-header">
              <span className="pt-panel-idx">{strings.panels.specs_idx}</span>
              <h2 className="pt-panel-title">{strings.panels.specs_title}</h2>
            </header>
            <SpecGrid specs={product.specs} />
          </div>
        )}

        {active === "performance" && (
          <div role="tabpanel" id="panel-performance" aria-labelledby="tab-performance" className="pt-panel">
            <header className="pt-panel-header">
              <span className="pt-panel-idx">{strings.panels.performance_idx}</span>
              <h2 className="pt-panel-title">{strings.panels.performance_title}</h2>
              <p className="pt-panel-sub">{strings.panels.performance_sub}</p>
            </header>
            <PerformanceChart
              data={product.performance}
              labels={{
                ours: strings.ours_label,
                market: strings.market_label,
                lowerBetter: strings.lower_better,
                notePrefix: strings.perf_note_prefix,
                noteEm: strings.perf_note_em,
                noteSuffix: strings.perf_note_suffix,
              }}
            />
          </div>
        )}

        {active === "applications" && (
          <div role="tabpanel" id="panel-applications" aria-labelledby="tab-applications" className="pt-panel">
            <header className="pt-panel-header">
              <span className="pt-panel-idx">{strings.panels.applications_idx}</span>
              <h2 className="pt-panel-title">{strings.panels.applications_title}</h2>
            </header>
            <UseCaseGrid useCases={product.useCases} />
          </div>
        )}

        {active === "documents" && (
          <div role="tabpanel" id="panel-documents" aria-labelledby="tab-documents" className="pt-panel">
            <header className="pt-panel-header">
              <span className="pt-panel-idx">{strings.panels.documents_idx}</span>
              <h2 className="pt-panel-title">{strings.panels.documents_title}</h2>
              <p className="pt-panel-sub">{strings.panels.documents_sub}</p>
            </header>
            <DocumentList documents={product.documents} downloadLabel={strings.download} />
          </div>
        )}
      </div>
    </section>
  );
}
