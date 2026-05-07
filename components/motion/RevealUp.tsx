"use client";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type RevealUpProps = {
  children: React.ReactNode;
  /** 預設 top 88% */
  start?: string;
  /** 距離 px */
  y?: number;
  duration?: number;
  delay?: number;
  className?: string;
  as?: "div" | "section" | "span" | "p" | "h2" | "h3";
};

/**
 * ScrollTrigger 進場：from { y, opacity:0 } → { y:0, opacity:1 }
 * 預設 trigger top 88%，once: true。
 */
export default function RevealUp({
  children,
  start = "top 88%",
  y = 50,
  duration = 1,
  delay = 0,
  className = "",
  as = "div",
}: RevealUpProps) {
  const elRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    gsap.registerPlugin(ScrollTrigger);

    gsap.set(el, { y, opacity: 0 });
    const tween = gsap.to(el, {
      y: 0,
      opacity: 1,
      duration,
      delay,
      ease: "power3.out",
      scrollTrigger: { trigger: el, start, once: true },
    });

    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, [start, y, duration, delay]);

  const Tag = as as keyof JSX.IntrinsicElements;
  return React.createElement(
    Tag,
    {
      ref: elRef as React.RefObject<HTMLElement>,
      className,
    },
    children,
  );
}
