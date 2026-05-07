import type { Metadata } from "next";
import { Atom, Cog, Cpu } from "lucide-react";
import LenisProvider from "@/components/motion/LenisProvider";
import CustomCursor from "@/components/motion/CustomCursor";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Timeline, { type TimelineNode } from "@/components/shared/Timeline";

export const metadata: Metadata = {
  title: "技術實力 | 綠能科技",
  description: "從材料科學到系統整合，綠能科技的三層自主研發技術架構。",
};

const PILLARS = [
  {
    icon: Atom,
    title: "材料科學",
    desc: "自研正極材料與電解質配方。鈉電正極採用層狀氧化物體系，高鎳鋰電搭配複合固態電解質。",
  },
  {
    icon: Cog,
    title: "製程工程",
    desc: "乾法電極塗佈技術，良率 98.5%。單線日產能 2 GWh，製程耗水量較傳統降低 70%。",
  },
  {
    icon: Cpu,
    title: "系統整合",
    desc: "自研 BMS 晶片 + 雲端能源管理平台。支援鈉電 / 鋰電 / 超電容混合架構，AI 預測性維護。",
  },
];

const RD_STATS = [
  { value: "127", label: "Patents" },
  { value: "89", label: "R&D Engineers" },
  { value: "18%", label: "Revenue to R&D" },
  { value: "3", label: "Research Labs" },
];

const CERTS = [
  "ISO 9001",
  "ISO 14001",
  "IATF 16949",
  "UL 1973",
  "IEC 62619",
  "UN38.3",
];

const ROADMAP: TimelineNode[] = [
  { year: "2024 Q4", content: "鈉離子電池量產線投產（Phase 1: 2 GWh）" },
  { year: "2025 Q2", content: "高鎳鋰電池 340 Wh/kg pilot line 驗證完成" },
  { year: "2025 Q4", content: "超電容模組通過車規 AEC-Q200 認證" },
  { year: "2026 Q2", content: "混合儲能系統（鈉電 + 超電容）首個 MW 級案場交付" },
];

export default function TechnologyPage() {
  return (
    <LenisProvider>
      <CustomCursor />
      <Nav />
      <main className="static-page">
        {/* Page header */}
        <header className="static-header">
          <div className="static-header-inner">
            <div className="static-eyebrow">— TECHNOLOGY</div>
            <h1 className="static-h1">技術實力</h1>
            <p className="static-sub">
              從材料分子設計到系統級能源管理，每一層都是自主研發。
            </p>
          </div>
        </header>

        {/* 01 / CORE TECHNOLOGY */}
        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">01 / CORE TECHNOLOGY</div>
              <h2 className="section-title">三層技術架構</h2>
            </div>
            <div className="pillar-grid">
              {PILLARS.map((p, i) => {
                const Icon = p.icon;
                return (
                  <article className="pillar-card" key={p.title} data-cursor-hover>
                    <div className="pillar-idx">0{i + 1}</div>
                    <div className="pillar-icon">
                      <Icon size={28} strokeWidth={1.4} />
                    </div>
                    <h3 className="pillar-title">{p.title}</h3>
                    <p className="pillar-desc">{p.desc}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* 02 / R&D */}
        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">02 / R&amp;D</div>
              <h2 className="section-title">研發實力</h2>
            </div>
            <div className="rd-stat-grid">
              {RD_STATS.map((s, i) => (
                <div className="rd-stat-cell" key={s.label} data-idx={`0${i + 1}`}>
                  <div className="rd-stat-value">{s.value}</div>
                  <div className="rd-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
            <div className="cert-row">
              <div className="cert-label">— CERTIFICATIONS</div>
              <div className="cert-pills">
                {CERTS.map((c) => (
                  <span className="cert-pill" key={c}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 03 / ROADMAP */}
        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">03 / ROADMAP</div>
              <h2 className="section-title">技術里程碑</h2>
            </div>
            <Timeline nodes={ROADMAP} />
          </div>
        </section>
      </main>
      <Footer />
    </LenisProvider>
  );
}
