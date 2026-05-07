"use client";

type BatteryCell3DProps = {
  /** 例如 "CELL 01.A"，產品頁可差異化 */
  cellLabel?: string;
};

/**
 * Hero Variant C — CSS 3D 旋轉電池芯
 * 純 CSS，無 canvas。直接搬 mockup 的 .battery-cell-3d 結構並 inline 樣式。
 */
export default function BatteryCell3D({ cellLabel = "CELL 01.A" }: BatteryCell3DProps) {
  return (
    <div className="cell-3d-stage">
      <div className="battery-cell-3d">
        <div className="bc-face bc-front">
          <div className="bc-line l1" />
          <div className="bc-line l2" />
          <div className="bc-line l3" />
          <div className="bc-line l4" />
          <div className="bc-label">{cellLabel}</div>
        </div>
        <div className="bc-face bc-back" />
        <div className="bc-face bc-left" />
        <div className="bc-face bc-right" />
        <div className="bc-face bc-top" />
        <div className="bc-face bc-bottom" />
        <div className="bc-electrode" />
      </div>
      <style jsx>{`
        .cell-3d-stage {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1200px;
          pointer-events: none;
        }
        .battery-cell-3d {
          width: 200px;
          height: 340px;
          position: relative;
          transform-style: preserve-3d;
          animation: cellRotate 18s linear infinite;
        }
        @keyframes cellRotate {
          from {
            transform: rotateY(0);
          }
          to {
            transform: rotateY(360deg);
          }
        }
        .bc-face {
          position: absolute;
          border: 1px solid var(--accent);
          background: rgba(94, 234, 212, 0.04);
        }
        .bc-front {
          width: 200px;
          height: 340px;
          transform: translateZ(60px);
          background: linear-gradient(180deg, rgba(94, 234, 212, 0.08), rgba(94, 234, 212, 0.02));
        }
        .bc-back {
          width: 200px;
          height: 340px;
          transform: translateZ(-60px) rotateY(180deg);
        }
        .bc-left {
          width: 120px;
          height: 340px;
          left: 40px;
          transform: rotateY(-90deg) translateZ(60px);
        }
        .bc-right {
          width: 120px;
          height: 340px;
          left: 40px;
          transform: rotateY(90deg) translateZ(60px);
        }
        .bc-top {
          width: 200px;
          height: 120px;
          top: 0;
          transform: rotateX(90deg) translateZ(60px);
        }
        .bc-bottom {
          width: 200px;
          height: 120px;
          bottom: 0;
          transform: rotateX(-90deg) translateZ(60px);
        }
        .bc-electrode {
          position: absolute;
          width: 30px;
          height: 14px;
          background: var(--accent);
          box-shadow: 0 0 12px var(--accent-glow);
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
        }
        .bc-line {
          position: absolute;
          left: 8px;
          right: 8px;
          height: 1px;
          background: var(--accent);
          opacity: 0.3;
        }
        .l1 {
          top: 60px;
        }
        .l2 {
          top: 130px;
        }
        .l3 {
          top: 210px;
        }
        .l4 {
          top: 280px;
        }
        .bc-label {
          position: absolute;
          font-family: var(--font-jetbrains), monospace;
          font-size: 9px;
          color: var(--accent);
          letter-spacing: 0.2em;
          left: 8px;
          top: 8px;
        }
      `}</style>
    </div>
  );
}
