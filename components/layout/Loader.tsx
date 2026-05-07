"use client";
import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const STORAGE_KEY = "greentech_loader_seen";

/**
 * 首次進站 loader，sessionStorage gate（第二次以後跳過）。
 * 進度條最長 1.2s，超時強制 finish。
 */
export default function Loader({ brand }: { brand: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  // 預設 false → 一律不渲染，避免 SSR / 第一次 client mount mismatch
  const [show, setShow] = useState(false);

  useEffect(() => {
    // sessionStorage 在 client 才存在；首次進站才顯示
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // sessionStorage 不可用就直接跳過
      return;
    }
    setShow(true);
    sessionStorage.setItem(STORAGE_KEY, "1");
  }, []);

  useEffect(() => {
    if (!show) return;
    let progress = 0;
    let done = false;
    const interval = window.setInterval(() => {
      progress += Math.random() * 9 + 5;
      if (progress >= 100) {
        progress = 100;
        window.clearInterval(interval);
        finish();
      }
      if (percentRef.current) {
        percentRef.current.textContent = String(Math.floor(progress)).padStart(2, "0");
      }
      if (barRef.current) {
        barRef.current.style.width = `${progress}%`;
      }
    }, 80);

    const safety = window.setTimeout(() => {
      if (!done) finish();
    }, 3500);

    function finish() {
      if (done) return;
      done = true;
      window.clearInterval(interval);
      window.clearTimeout(safety);
      const root = rootRef.current;
      if (!root) return;
      gsap.to(root, {
        opacity: 0,
        duration: 0.7,
        ease: "power2.inOut",
        onComplete: () => {
          if (root) root.style.display = "none";
        },
      });
    }

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(safety);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      ref={rootRef}
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--bg)",
        zIndex: 100,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "1.25rem",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "0.65rem" }}>
        <span
          style={{
            position: "relative",
            width: 14,
            height: 14,
            background: "var(--accent)",
            boxShadow: "0 0 10px var(--accent-glow)",
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 3,
              background: "var(--bg)",
              display: "block",
            }}
          />
        </span>
        <span
          style={{
            fontFamily: "var(--font-geist-sans), sans-serif",
            fontSize: "1.5rem",
            fontWeight: 500,
            letterSpacing: "-0.025em",
          }}
        >
          {brand}
        </span>
      </div>
      <div
        style={{
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 10,
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "var(--accent)",
        }}
      >
        <span ref={percentRef}>00</span>
        <span style={{ opacity: 0.3 }}>&nbsp;/&nbsp;100</span>
      </div>
      <div
        style={{
          width: 280,
          height: 1,
          background: "rgba(229,233,240,0.08)",
          position: "relative",
        }}
      >
        <div
          ref={barRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            height: "100%",
            width: "0%",
            background: "var(--accent)",
            boxShadow: "0 0 12px var(--accent-glow)",
          }}
        />
      </div>
    </div>
  );
}
