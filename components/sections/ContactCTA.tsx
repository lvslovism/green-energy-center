"use client";
import RevealUp from "@/components/motion/RevealUp";
import MagneticButton from "@/components/motion/MagneticButton";

type ContactCTAProps = {
  label: string;
  title: string;
  buttonLabel: string;
  buttonHref: string;
};

export default function ContactCTA({ label, title, buttonLabel, buttonHref }: ContactCTAProps) {
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
              {label}
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
              dangerouslySetInnerHTML={{ __html: title }}
            />
          </RevealUp>
        </div>
        <div className="contact-cta-btn-wrap">
          <MagneticButton href={buttonHref} className="btn-primary">
            {buttonLabel}
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
