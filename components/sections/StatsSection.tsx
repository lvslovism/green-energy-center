"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import RevealUp from "@/components/motion/RevealUp";
import type { StatItem } from "@/lib/types";

function Counter({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    const obj = { val: 0 };
    const tween = gsap.to(obj, {
      val: target,
      duration: 2.2,
      ease: "power2.out",
      onUpdate: () => {
        el.textContent = Math.floor(obj.val).toLocaleString();
      },
      scrollTrigger: { trigger: el, start: "top 82%", once: true },
    });
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [target]);
  return <span ref={ref}>0</span>;
}

export default function StatsSection({ stats }: { stats: StatItem[] }) {
  return (
    <section
      style={{
        padding: "7rem 2rem",
        borderTop: "1px solid var(--line-soft)",
        position: "relative",
        zIndex: 2,
        background: "var(--bg)",
      }}
    >
      <div style={{ maxWidth: 1500, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "2rem",
            marginBottom: "5rem",
            flexWrap: "wrap",
          }}
        >
          <div>
            <RevealUp>
              <div className="section-index">02 / VALIDATED</div>
            </RevealUp>
            <RevealUp>
              <h2 className="section-title" dangerouslySetInnerHTML={{ __html: "數據驗證，<em>不靠口號。</em>" }} />
            </RevealUp>
          </div>
        </div>

        <div className="stat-grid">
          {stats.map((s, i) => (
            <div className="stat-cell" key={s.label} data-idx={`2.${i + 1}`}>
              <div className="stat-num">
                <Counter target={s.value} />
                {s.suffix && <span className="stat-suffix">{s.suffix}</span>}
              </div>
              <div className="stat-label">{s.label}</div>
              <p className="stat-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
