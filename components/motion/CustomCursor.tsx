"use client";
import { useEffect, useRef, useState } from "react";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // 桌機 only：用 matchMedia 偵測，並在 resize 時更新
    const mq = window.matchMedia("(min-width: 769px)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let raf = 0;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.left = `${mx}px`;
      dot.style.top = `${my}px`;
    };

    const loop = () => {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.left = `${rx}px`;
      ring.style.top = `${ry}px`;
      raf = requestAnimationFrame(loop);
    };

    const onEnter = () => {
      dot.classList.add("hover");
      ring.classList.add("hover");
    };
    const onLeave = () => {
      dot.classList.remove("hover");
      ring.classList.remove("hover");
    };

    window.addEventListener("mousemove", onMove);
    raf = requestAnimationFrame(loop);

    // 委派：對 [data-cursor-hover] 元素啟用 hover 狀態
    const targets = document.querySelectorAll<HTMLElement>("[data-cursor-hover]");
    targets.forEach((el) => {
      el.addEventListener("mouseenter", onEnter);
      el.addEventListener("mouseleave", onLeave);
    });

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      targets.forEach((el) => {
        el.removeEventListener("mouseenter", onEnter);
        el.removeEventListener("mouseleave", onLeave);
      });
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          width: 5,
          height: 5,
          background: "var(--accent)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9999,
          transform: "translate(-50%, -50%)",
          transition: "width 0.25s, height 0.25s",
          mixBlendMode: "difference",
        }}
        className="cursor-dot"
      />
      <div
        ref={ringRef}
        style={{
          position: "fixed",
          width: 34,
          height: 34,
          border: "1px solid var(--accent)",
          borderRadius: "50%",
          pointerEvents: "none",
          zIndex: 9998,
          transform: "translate(-50%, -50%)",
          transition: "width 0.35s cubic-bezier(0.2, 0.6, 0.2, 1), height 0.35s cubic-bezier(0.2, 0.6, 0.2, 1), opacity 0.3s",
          opacity: 0.4,
        }}
        className="cursor-ring"
      />
      <style jsx>{`
        :global(.cursor-dot.hover) {
          width: 12px !important;
          height: 12px !important;
        }
        :global(.cursor-ring.hover) {
          width: 60px !important;
          height: 60px !important;
          opacity: 1 !important;
        }
      `}</style>
    </>
  );
}
