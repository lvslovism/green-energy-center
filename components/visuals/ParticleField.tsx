"use client";
import { useEffect, useRef } from "react";

/**
 * Hero Variant A — 粒子場（Canvas 2D）
 * 從 mockup `ion-canvas` 改寫為 React。要點：
 * - useRef 持有 canvas + 動畫 state
 * - useEffect 啟動 RAF loop，cleanup 取消
 * - mousemove 內部自監聽（限制在 canvas bounding rect 內）
 * - resize 自響應，含 DPR scaling（最多 2x 避免 4K 效能爆掉）
 */
export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cw = 0;
    let ch = 0;
    const mPos = { x: -9999, y: -9999 };
    type P = {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      baseSize: number;
      phase: number;
      speed: number;
    };
    let particles: P[] = [];
    let raf = 0;

    const initParticles = () => {
      particles = [];
      const n = window.innerWidth < 768 ? 50 : 130;
      for (let i = 0; i < n; i++) {
        const size = Math.random() * 1.2 + 0.5;
        particles.push({
          x: Math.random() * cw,
          y: Math.random() * ch,
          vx: (Math.random() - 0.4) * 0.4 + 0.15,
          vy: (Math.random() - 0.5) * 0.18,
          size,
          baseSize: size,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.005 + 0.002,
        });
      }
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const parent = canvas.parentElement;
      cw = parent?.clientWidth ?? window.innerWidth;
      ch = parent?.clientHeight ?? window.innerHeight;
      canvas.width = cw * dpr;
      canvas.height = ch * dpr;
      canvas.style.width = `${cw}px`;
      canvas.style.height = `${ch}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
      initParticles();
    };

    const onMouseMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      if (
        e.clientX >= r.left &&
        e.clientX <= r.right &&
        e.clientY >= r.top &&
        e.clientY <= r.bottom
      ) {
        mPos.x = e.clientX - r.left;
        mPos.y = e.clientY - r.top;
      } else {
        mPos.x = -9999;
        mPos.y = -9999;
      }
    };

    const draw = () => {
      ctx.clearRect(0, 0, cw, ch);
      const grd = ctx.createRadialGradient(cw * 0.7, ch * 0.45, 0, cw * 0.7, ch * 0.45, cw * 0.6);
      grd.addColorStop(0, "rgba(94,234,212,.08)");
      grd.addColorStop(1, "rgba(94,234,212,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, cw, ch);

      for (const p of particles) {
        p.phase += p.speed;
        p.x += p.vx + Math.sin(p.phase) * 0.18;
        p.y += p.vy + Math.cos(p.phase * 0.7) * 0.12;
        if (p.x > cw + 20) p.x = -20;
        if (p.x < -20) p.x = cw + 20;
        if (p.y > ch + 20) p.y = -20;
        if (p.y < -20) p.y = ch + 20;
        const dx = p.x - mPos.x;
        const dy = p.y - mPos.y;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < 140) {
          const f = (140 - d) / 140;
          p.x += (dx / d) * f * 2.8;
          p.y += (dy / d) * f * 2.8;
          p.size = p.baseSize + f * 2.5;
        } else {
          p.size = p.baseSize;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = "#5EEAD4";
        ctx.shadowColor = "#5EEAD4";
        ctx.shadowBlur = 10;
        ctx.fill();
      }
      ctx.shadowBlur = 0;
      // connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 110) {
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.strokeStyle = `rgba(94,234,212,${(1 - d / 110) * 0.18})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMouseMove);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
      }}
    />
  );
}
