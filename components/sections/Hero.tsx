"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import type { HeroContent } from "@/lib/types";
import ParticleField from "@/components/visuals/ParticleField";
import MeshGrid from "@/components/visuals/MeshGrid";
import BatteryCell3D from "@/components/visuals/BatteryCell3D";
import MagneticButton from "@/components/motion/MagneticButton";
import SplitText from "@/components/motion/SplitText";

type HeroProps = {
  content: HeroContent;
  /** A = ParticleField（首頁預設）/ B = MeshGrid / C = BatteryCell3D */
  variant?: "A" | "B" | "C";
};

export default function Hero({ content, variant = "A" }: HeroProps) {
  const ctaRef = useRef<HTMLDivElement>(null);
  const metaRef = useRef<HTMLDivElement>(null);
  const eyebrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // CTA + meta + eyebrow 進場：與 mockup 一致 delay 1.3s
    if (eyebrowRef.current) {
      gsap.fromTo(
        eyebrowRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1, delay: 0.1, ease: "power2.out" },
      );
    }
    const items: HTMLElement[] = [];
    if (ctaRef.current) items.push(ctaRef.current);
    if (metaRef.current) items.push(metaRef.current);
    if (items.length === 0) return;
    gsap.fromTo(
      items,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, delay: 1.3, stagger: 0.12, ease: "power2.out" },
    );
  }, []);

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        borderBottom: "1px solid var(--line-soft)",
      }}
    >
      {/* Corner brackets */}
      <div className="corner-brackets">
        <div className="cb-bl" />
        <div className="cb-br" />
      </div>

      {/* Hero visual layer */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {variant === "A" && <ParticleField />}
        {variant === "B" && <MeshGrid />}
        {variant === "C" && <BatteryCell3D />}
      </div>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "7rem 2rem 4rem",
        }}
      >
        <div style={{ maxWidth: 1500, margin: "0 auto", width: "100%" }}>
          {/* Eyebrow */}
          <div
            ref={eyebrowRef}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 10,
              letterSpacing: "0.3em",
              textTransform: "uppercase",
              color: "var(--muted)",
              marginBottom: "2rem",
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                padding: "0.35rem 0.75rem",
                border: "1px solid var(--line)",
                color: "var(--accent)",
                background: "var(--accent-soft)",
              }}
            >
              ● {content.liveBadge}
            </span>
            {content.eyebrowSegments.map((seg, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                <span>{seg}</span>
                {i < content.eyebrowSegments.length - 1 && (
                  <span
                    style={{
                      flex: "0 0 auto",
                      width: 8,
                      height: 1,
                      background: "var(--line-soft)",
                      opacity: 0.4,
                    }}
                  />
                )}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1
            style={{
              fontWeight: 500,
              fontSize: "clamp(2.5rem, 7.5vw, 8rem)",
              lineHeight: 0.95,
              letterSpacing: "-0.04em",
              margin: 0,
            }}
          >
            <span style={{ display: "block", overflow: "hidden" }}>
              <SplitText html={content.titleLine1} delay={0.25} as="span" />
            </span>
            <span style={{ display: "block", overflow: "hidden" }}>
              <SplitText html={content.titleLine2} delay={0.43} as="span" />
            </span>
          </h1>

          {/* CTA */}
          <div ref={ctaRef} style={{ display: "flex", gap: "1rem", marginTop: "3rem", flexWrap: "wrap" }}>
            <MagneticButton href={content.ctaPrimary.url} className="btn-primary">
              <span
                style={{
                  width: 6,
                  height: 6,
                  background: "currentColor",
                  borderRadius: "50%",
                  display: "inline-block",
                }}
              />
              {content.ctaPrimary.label}
            </MagneticButton>
            <MagneticButton href={content.ctaSecondary.url} className="btn-ghost">
              {content.ctaSecondary.label}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 8h8m0 0L8 5m3 3L8 11" stroke="currentColor" strokeWidth="1.2" />
              </svg>
            </MagneticButton>
          </div>

          {/* Meta */}
          <div
            ref={metaRef}
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: "2rem",
              marginTop: "3rem",
              paddingTop: "2rem",
              borderTop: "1px solid var(--line-soft)",
              maxWidth: 600,
            }}
          >
            {content.metaItems.map((m) => (
              <div
                key={m.label}
                style={{
                  fontFamily: "var(--font-jetbrains), monospace",
                  fontSize: 10,
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                  color: "var(--muted)",
                }}
              >
                {m.label}
                <strong
                  style={{
                    display: "block",
                    fontWeight: 500,
                    color: "var(--text)",
                    fontSize: 13,
                    marginTop: "0.35rem",
                    letterSpacing: "0.05em",
                  }}
                >
                  {m.value}
                </strong>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            fontFamily: "var(--font-jetbrains), monospace",
            fontSize: 10,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "var(--muted)",
            zIndex: 3,
          }}
        >
          <span>SCROLL</span>
          <div className="scroll-line" />
          <span style={{ opacity: 0.5 }}>01 / 05</span>
        </div>
      </div>

      <style>{`
        .corner-brackets {
          position: absolute;
          inset: 1.5rem;
          pointer-events: none;
          z-index: 3;
        }
        .corner-brackets::before, .corner-brackets::after, .cb-bl, .cb-br {
          position: absolute;
          width: 24px;
          height: 24px;
          border: 1px solid var(--accent);
          opacity: 0.5;
        }
        .corner-brackets::before {
          content: '';
          top: 0;
          left: 0;
          border-right: none;
          border-bottom: none;
        }
        .corner-brackets::after {
          content: '';
          top: 0;
          right: 0;
          border-left: none;
          border-bottom: none;
        }
        .cb-bl {
          bottom: 0;
          left: 0;
          border-right: none;
          border-top: none;
        }
        .cb-br {
          bottom: 0;
          right: 0;
          border-left: none;
          border-top: none;
        }
        .scroll-line {
          width: 40px;
          height: 1px;
          background: var(--line);
          position: relative;
          overflow: hidden;
        }
        .scroll-line::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: var(--accent);
          animation: scrollPulse 2.5s linear infinite;
        }
        @keyframes scrollPulse {
          to { left: 100%; }
        }
        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.95rem 1.75rem;
          background: var(--accent);
          color: var(--bg);
          border: 1px solid var(--accent);
          font-family: var(--font-jetbrains), monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-weight: 500;
          text-decoration: none;
          transition: all 0.3s;
        }
        .btn-primary:hover {
          box-shadow: 0 0 30px var(--accent-glow);
        }
        .btn-ghost {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.95rem 1.75rem;
          background: transparent;
          color: var(--text);
          border: 1px solid var(--line);
          font-family: var(--font-jetbrains), monospace;
          font-size: 11px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          text-decoration: none;
          transition: all 0.3s;
        }
        .btn-ghost:hover {
          border-color: var(--accent);
          color: var(--accent);
        }
      `}</style>
    </section>
  );
}
