"use client";
import RevealUp from "@/components/motion/RevealUp";

export default function VisionSection({ text }: { text: string }) {
  return (
    <section
      style={{
        padding: "9rem 2rem",
        borderTop: "1px solid var(--line-soft)",
        position: "relative",
        zIndex: 2,
        background: "var(--bg)",
      }}
    >
      <div style={{ maxWidth: 1500, margin: "0 auto" }}>
        <RevealUp>
          <div className="section-index" style={{ marginBottom: "3rem" }}>
            03 / VISION
          </div>
        </RevealUp>
        <RevealUp>
          <p
            style={{
              fontWeight: 400,
              fontSize: "clamp(1.4rem, 2.8vw, 2.5rem)",
              lineHeight: 1.35,
              letterSpacing: "-0.025em",
              maxWidth: 1000,
            }}
            dangerouslySetInnerHTML={{ __html: text }}
          />
        </RevealUp>
      </div>
    </section>
  );
}
