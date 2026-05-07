"use client";
import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type SplitTextProps = {
  /** 用 HTML 字串以支援 <em> 等 inline 標籤 */
  html: string;
  className?: string;
  /** 進場延遲（秒） */
  delay?: number;
  /** stagger 步長（秒） */
  stagger?: number;
  /** 是否在 scroll 進入視窗時觸發；若否則 mount 後立即播放 */
  trigger?: "scroll" | "load";
  /** ScrollTrigger start，僅 trigger="scroll" 時有效 */
  start?: string;
  as?: "span" | "div";
};

/**
 * 將文字按字元拆分為 inline-block <span class="split-char">，
 * 用 GSAP 從 y:'110%' opacity:0 stagger 進場（與 mockup 行為一致）。
 * 父層應有 overflow:hidden 才能達成「字從下方滾上」效果。
 */
export default function SplitText({
  html,
  className = "",
  delay = 0,
  stagger = 0.022,
  trigger = "load",
  start = "top 88%",
  as = "span",
}: SplitTextProps) {
  const elRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    // 拆字
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    el.innerHTML = "";

    const wrap = (text: string, parent: HTMLElement) => {
      for (const ch of text) {
        const s = document.createElement("span");
        s.className = "split-char";
        s.textContent = ch === " " ? "\u00A0" : ch;
        s.style.display = "inline-block";
        parent.appendChild(s);
      }
    };

    tmp.childNodes.forEach((node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        wrap(node.textContent ?? "", el);
      } else if (node.nodeName === "EM") {
        const em = document.createElement("em");
        wrap(node.textContent ?? "", em);
        el.appendChild(em);
      } else {
        el.appendChild(node.cloneNode(true));
      }
    });

    const chars = el.querySelectorAll<HTMLSpanElement>(".split-char");
    if (chars.length === 0) return;

    gsap.set(chars, { y: "110%", opacity: 0 });

    if (trigger === "scroll") {
      gsap.registerPlugin(ScrollTrigger);
      const tween = gsap.to(chars, {
        y: 0,
        opacity: 1,
        duration: 1.05,
        delay,
        stagger,
        ease: "power3.out",
        scrollTrigger: { trigger: el, start, once: true },
      });
      return () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    } else {
      const tween = gsap.to(chars, {
        y: 0,
        opacity: 1,
        duration: 1.05,
        delay,
        stagger,
        ease: "power3.out",
      });
      return () => {
        tween.kill();
      };
    }
  }, [html, delay, stagger, trigger, start]);

  if (as === "div") {
    return <div ref={elRef as React.RefObject<HTMLDivElement>} className={className} />;
  }
  return <span ref={elRef as React.RefObject<HTMLSpanElement>} className={className} />;
}
