"use client";
import RevealUp from "@/components/motion/RevealUp";
import MagneticButton from "@/components/motion/MagneticButton";

export default function ContactCTA() {
  return (
    <section
      id="contact"
      style={{
        padding: "5rem 2rem 5rem",
        borderTop: "1px solid var(--line)",
        position: "relative",
        zIndex: 2,
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "3rem",
          alignItems: "end",
        }}
        className="contact-cta-grid"
      >
        <div>
          <RevealUp>
            <div className="section-index" style={{ marginBottom: "2rem" }}>
              04 / CONTACT
            </div>
          </RevealUp>
          <RevealUp>
            <h2
              style={{
                fontWeight: 500,
                fontSize: "clamp(2rem, 5vw, 4.5rem)",
                letterSpacing: "-0.04em",
                lineHeight: 0.95,
                margin: 0,
              }}
              dangerouslySetInnerHTML={{ __html: "一起重新定義<br/><em>能量。</em>" }}
            />
          </RevealUp>
        </div>
        <div className="contact-cta-btn-wrap">
          <MagneticButton href="#contact" className="btn-primary">
            聯絡我們
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 8h8m0 0L8 5m3 3L8 11" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </MagneticButton>
        </div>
      </div>
      <style>{`
        @media (min-width: 768px) {
          .contact-cta-grid {
            grid-template-columns: 1fr auto !important;
          }
          .contact-cta-btn-wrap {
            display: flex;
            justify-content: flex-end;
          }
        }
      `}</style>
    </section>
  );
}
