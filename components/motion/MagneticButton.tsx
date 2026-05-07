"use client";
import { useRef, AnchorHTMLAttributes } from "react";
import gsap from "gsap";

type MagneticButtonProps = {
  children: React.ReactNode;
  className?: string;
  href?: string;
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">;

export default function MagneticButton({
  children,
  className = "",
  href = "#",
  ...props
}: MagneticButtonProps) {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  const onMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const btn = btnRef.current;
    if (!btn) return;
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: "power3.out" });
    if (innerRef.current) {
      gsap.to(innerRef.current, { x: x * 0.15, y: y * 0.15, duration: 0.4, ease: "power3.out" });
    }
  };

  const onLeave = () => {
    if (btnRef.current) {
      gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    }
    if (innerRef.current) {
      gsap.to(innerRef.current, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    }
  };

  return (
    <a
      ref={btnRef}
      href={href}
      className={className}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      data-cursor-hover
      {...props}
    >
      <span ref={innerRef} className="inline-flex items-center gap-3 will-change-transform">
        {children}
      </span>
    </a>
  );
}
