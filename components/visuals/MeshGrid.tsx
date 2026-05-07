"use client";
import { useEffect, useRef } from "react";

/**
 * Hero Variant B — 透視網格 + 能量脈衝（Canvas 2D）
 * 從 mockup `mesh-canvas` 改寫為 React。
 */
export default function MeshGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let cw = 0;
    let ch = 0;
    let raf = 0;
    type Pulse = { x: number; y: number; life: number; maxLife: number };
    const pulses: Pulse[] = [];

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
    };

    const spawnInterval = window.setInterval(() => {
      pulses.push({
        x: Math.random() * cw,
        y: Math.random() * ch * 0.8 + ch * 0.1,
        life: 0,
        maxLife: 80,
      });
      if (pulses.length > 8) pulses.shift();
    }, 1200);

    const draw = () => {
      ctx.clearRect(0, 0, cw, ch);
      const horizon = ch * 0.55;
      const vp = { x: cw * 0.5, y: horizon };
      ctx.strokeStyle = "rgba(94,234,212,.18)";
      ctx.lineWidth = 0.6;
      const rows = 14;
      for (let i = 1; i <= rows; i++) {
        const t = i / rows;
        const eased = Math.pow(t, 1.6);
        const y = horizon + (ch - horizon) * eased;
        ctx.globalAlpha = 1 - eased * 0.4;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(cw, y);
        ctx.stroke();
      }
      const cols = 24;
      for (let i = 0; i <= cols; i++) {
        const t = i / cols;
        const xBottom = t * cw * 1.6 - cw * 0.3;
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.moveTo(vp.x, vp.y);
        ctx.lineTo(xBottom, ch);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // sky scanlines
      for (let y = 0; y < horizon; y += 4) {
        ctx.globalAlpha = 0.04;
        ctx.fillStyle = "#5EEAD4";
        ctx.fillRect(0, y, cw, 1);
      }
      // pulses
      ctx.globalAlpha = 1;
      for (const p of pulses) {
        p.life++;
        const r = p.life * 4;
        const alpha = (1 - p.life / p.maxLife) * 0.5;
        if (alpha <= 0) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(94,234,212,${alpha})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(p.x, p.y, r * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(94,234,212,${alpha * 0.6})`;
        ctx.stroke();
      }
      // remove expired
      while (pulses.length && pulses[0].life >= pulses[0].maxLife) {
        pulses.shift();
      }
      // horizon glow
      const hGrad = ctx.createLinearGradient(0, horizon - 80, 0, horizon + 80);
      hGrad.addColorStop(0, "rgba(94,234,212,0)");
      hGrad.addColorStop(0.5, "rgba(94,234,212,.15)");
      hGrad.addColorStop(1, "rgba(94,234,212,0)");
      ctx.fillStyle = hGrad;
      ctx.fillRect(0, horizon - 80, cw, 160);

      raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.clearInterval(spawnInterval);
      window.removeEventListener("resize", resize);
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
