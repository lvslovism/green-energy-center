import type { Metadata } from "next";
import LenisProvider from "@/components/motion/LenisProvider";
import CustomCursor from "@/components/motion/CustomCursor";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Timeline, { type TimelineNode } from "@/components/shared/Timeline";

export const metadata: Metadata = {
  title: "關於我們 | 綠能科技",
  description: "綠能科技的故事、使命與核心團隊。從 2021 年台北實驗室起步，致力於下一代儲能技術。",
};

const TEAM = [
  { initials: "CL", name: "Chen Li", role: "CEO / Co-founder" },
  { initials: "WH", name: "Wang Hao", role: "CTO" },
  { initials: "LY", name: "Lin Yu", role: "VP Materials" },
  { initials: "ZW", name: "Zhang Wei", role: "VP Engineering" },
];

const MILESTONES: TimelineNode[] = [
  { year: "2021", content: "台北實驗室成立，完成首顆鈉離子原型電芯" },
  { year: "2022", content: "Pre-A 輪融資完成，啟動中試線建設" },
  { year: "2023", content: "超電容產品線量產出貨，首批客戶交付" },
  { year: "2024", content: "鈉電量產線投產（2 GWh），取得 ISO 9001 / 14001" },
  { year: "2025", content: "高鎳鋰電池進入 pilot 階段，團隊擴展至 200+ 人" },
];

export default function AboutPage() {
  return (
    <LenisProvider>
      <CustomCursor />
      <Nav />
      <main className="static-page">
        <header className="static-header">
          <div className="static-header-inner">
            <div className="static-eyebrow">— ABOUT</div>
            <h1 className="static-h1">關於我們</h1>
            <p className="static-sub">
              從 2021 年台北實驗室起步，致力於下一代儲能技術。
            </p>
          </div>
        </header>

        {/* 01 / OUR STORY */}
        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">01 / OUR STORY</div>
              <h2 className="section-title">重新定義儲能的可能</h2>
            </div>
            <div className="story-grid">
              <p className="story-paragraph">
                綠能科技成立於 2021
                年，由一群來自電化學、材料科學與能源系統的研究者創辦。我們相信，下一代儲能技術不該只是鋰電池的改良，而是從材料根本出發的全新解法。
              </p>
              <p className="story-paragraph">
                從台北實驗室的第一顆鈉離子原型電芯，到今天三條產品線、兩座量產基地，我們始終聚焦一件事：
                <em className="story-accent">讓每一度電都能被妥善保存。</em>
              </p>
            </div>
          </div>
        </section>

        {/* 02 / MISSION */}
        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">02 / MISSION</div>
              <h2 className="section-title">使命與願景</h2>
            </div>
            <div className="mv-grid">
              <article className="mv-card">
                <div className="mv-label">— MISSION</div>
                <p className="mv-text">
                  以材料創新驅動儲能成本持續下降，加速全球能源轉型。
                </p>
              </article>
              <article className="mv-card">
                <div className="mv-label">— VISION</div>
                <p className="mv-text">
                  2030 年前成為亞太區鈉離子儲能系統市佔率第一的技術供應商。
                </p>
              </article>
            </div>
          </div>
        </section>

        {/* 03 / TEAM */}
        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">03 / TEAM</div>
              <h2 className="section-title">核心團隊</h2>
            </div>
            <div className="team-grid">
              {TEAM.map((m) => (
                <article className="team-card" key={m.name}>
                  <div className="team-avatar" aria-hidden>
                    {m.initials}
                  </div>
                  <div className="team-name">{m.name}</div>
                  <div className="team-role">{m.role}</div>
                </article>
              ))}
            </div>
            <p className="team-note">
              團隊成員照片與完整介紹將於正式上線前更新。
            </p>
          </div>
        </section>

        {/* 04 / MILESTONES */}
        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">04 / MILESTONES</div>
              <h2 className="section-title">發展歷程</h2>
            </div>
            <Timeline nodes={MILESTONES} />
          </div>
        </section>
      </main>
      <Footer />
    </LenisProvider>
  );
}
