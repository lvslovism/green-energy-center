"use client";
import React from "react";

export type MarqueeItem = { text: string; muted?: boolean } | { divider: string };

type MarqueeProps = {
  items: MarqueeItem[];
  /** 跑完一輪秒數 */
  durationSec?: number;
  className?: string;
};

/**
 * 雙 track 無縫銜接 marquee（CSS animation）。
 * hover 整個 section 暫停（透過 :hover 的 animation-play-state）。
 */
export default function Marquee({ items, durationSec = 38, className = "" }: MarqueeProps) {
  const renderTrack = (key: string, ariaHidden = false) => (
    <div
      key={key}
      className="marquee-track"
      aria-hidden={ariaHidden || undefined}
      style={{
        display: "flex",
        gap: "2.5rem",
        animation: `marquee ${durationSec}s linear infinite`,
        flexShrink: 0,
        paddingRight: "2.5rem",
        whiteSpace: "nowrap",
      }}
    >
      {items.map((it, i) => {
        if ("divider" in it) {
          return (
            <span
              key={`d-${i}`}
              className="font-mono"
              style={{
                display: "inline-flex",
                alignItems: "center",
                color: "var(--accent)",
                fontSize: "0.7em",
              }}
            >
              {it.divider}
            </span>
          );
        }
        return (
          <span
            key={`t-${i}`}
            style={{
              fontWeight: 500,
              fontSize: "clamp(1.75rem, 4vw, 3.5rem)",
              letterSpacing: "-0.025em",
              color: it.muted ? "var(--muted)" : undefined,
            }}
          >
            {it.text}
          </span>
        );
      })}
    </div>
  );

  return (
    <div
      className={`marquee ${className}`}
      style={{
        display: "flex",
        overflow: "hidden",
        whiteSpace: "nowrap",
        padding: "1.5rem 0",
      }}
    >
      {renderTrack("a", false)}
      {renderTrack("b", true)}
      <style jsx>{`
        @keyframes marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-100%);
          }
        }
        .marquee:hover :global(.marquee-track) {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
