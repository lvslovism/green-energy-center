/**
 * 產品 hero 區大圖 SVG。三個變體沿用首頁 product card 的視覺語言但放大、加入更多標註線。
 * 純靜態 SVG，可在 Server Component 中使用。
 */

export function ProductHeroSvgSodiumIon() {
  return (
    <svg
      viewBox="0 0 480 480"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <radialGradient id="phs-rg-na" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#5EEAD4" stopOpacity=".4" />
          <stop offset="100%" stopColor="#5EEAD4" stopOpacity="0" />
        </radialGradient>
        <pattern id="phs-grid-na" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#5EEAD4" strokeWidth=".3" opacity=".15" />
        </pattern>
      </defs>
      <rect width="480" height="480" fill="url(#phs-grid-na)" />
      <circle cx="240" cy="240" r="160" fill="url(#phs-rg-na)" />

      {/* Hexagonal cell — 放大 */}
      <polygon
        points="240,90 340,150 340,270 240,330 140,270 140,150"
        fill="none"
        stroke="#5EEAD4"
        strokeWidth="1.2"
        opacity=".7"
      />
      <polygon
        points="240,120 320,165 320,255 240,300 160,255 160,165"
        fill="none"
        stroke="#5EEAD4"
        strokeWidth=".7"
        opacity=".5"
      />
      <polygon
        points="240,150 300,180 300,240 240,270 180,240 180,180"
        fill="none"
        stroke="#5EEAD4"
        strokeWidth=".5"
        opacity=".3"
      />

      {/* Center node */}
      <circle cx="240" cy="210" r="4" fill="#5EEAD4" />

      {/* Connection lines */}
      <line x1="240" y1="210" x2="195" y2="180" stroke="#5EEAD4" strokeWidth=".6" opacity=".5" />
      <line x1="240" y1="210" x2="285" y2="180" stroke="#5EEAD4" strokeWidth=".6" opacity=".5" />
      <line x1="240" y1="210" x2="240" y2="270" stroke="#5EEAD4" strokeWidth=".6" opacity=".5" />

      {/* Animated ions */}
      <circle cx="195" cy="180" r="3" fill="#5EEAD4">
        <animate attributeName="opacity" values="1;.3;1" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="285" cy="180" r="3" fill="#5EEAD4">
        <animate attributeName="opacity" values=".3;1;.3" dur="2.4s" repeatCount="indefinite" />
      </circle>
      <circle cx="240" cy="270" r="3" fill="#5EEAD4">
        <animate attributeName="opacity" values="1;.3;1" dur="2.8s" repeatCount="indefinite" />
      </circle>

      {/* 標註線 */}
      <line x1="340" y1="150" x2="400" y2="120" stroke="#5EEAD4" strokeWidth=".4" opacity=".5" />
      <line x1="340" y1="270" x2="400" y2="300" stroke="#5EEAD4" strokeWidth=".4" opacity=".5" />
      <line x1="140" y1="150" x2="80" y2="120" stroke="#5EEAD4" strokeWidth=".4" opacity=".5" />
      <line x1="140" y1="270" x2="80" y2="300" stroke="#5EEAD4" strokeWidth=".4" opacity=".5" />

      <text x="404" y="116" fontFamily="var(--font-jetbrains), monospace" fontSize="9" fill="#5EEAD4" opacity=".7" letterSpacing="2">
        CATHODE
      </text>
      <text x="404" y="306" fontFamily="var(--font-jetbrains), monospace" fontSize="9" fill="#5EEAD4" opacity=".7" letterSpacing="2">
        ANODE
      </text>
      <text x="20" y="116" fontFamily="var(--font-jetbrains), monospace" fontSize="9" fill="#5EEAD4" opacity=".7" letterSpacing="2">
        SEPARATOR
      </text>
      <text x="20" y="306" fontFamily="var(--font-jetbrains), monospace" fontSize="9" fill="#5EEAD4" opacity=".7" letterSpacing="2">
        ELECTROLYTE
      </text>

      {/* Bottom mono labels */}
      <text x="40" y="450" fontFamily="var(--font-jetbrains), monospace" fontSize="11" fill="#5EEAD4" opacity=".6" letterSpacing="2">
        Na+
      </text>
      <text x="380" y="450" fontFamily="var(--font-jetbrains), monospace" fontSize="11" fill="#5EEAD4" opacity=".4" letterSpacing="1">
        [6,000 cyc]
      </text>

      {/* Crosshair top-left */}
      <line x1="40" y1="50" x2="80" y2="50" stroke="#5EEAD4" strokeWidth=".5" opacity=".4" />
      <line x1="40" y1="50" x2="40" y2="80" stroke="#5EEAD4" strokeWidth=".5" opacity=".4" />
    </svg>
  );
}

export function ProductHeroSvgLithiumIon() {
  return (
    <svg
      viewBox="0 0 480 480"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="phs-lg-li" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#5EEAD4" stopOpacity=".5" />
          <stop offset="100%" stopColor="#5EEAD4" stopOpacity=".05" />
        </linearGradient>
      </defs>

      {/* Iso layered components — 放大 */}
      <g transform="translate(240, 100)">
        <polygon points="0,0 90,28 0,56 -90,28" fill="url(#phs-lg-li)" stroke="#5EEAD4" strokeWidth="1.2" />
        <text x="105" y="34" fontFamily="var(--font-jetbrains), monospace" fontSize="10" fill="#5EEAD4" opacity=".8" letterSpacing="2">
          CAP
        </text>
      </g>
      <g transform="translate(240, 180)">
        <polygon points="0,0 90,28 0,56 -90,28" fill="rgba(94,234,212,.06)" stroke="#5EEAD4" strokeWidth="1.2" />
        <polygon points="0,6 84,30 0,50 -84,30" fill="none" stroke="#5EEAD4" strokeWidth=".5" opacity=".5" />
        <text x="105" y="34" fontFamily="var(--font-jetbrains), monospace" fontSize="10" fill="#5EEAD4" opacity=".8" letterSpacing="2">
          CATHODE
        </text>
      </g>
      <g transform="translate(240, 260)">
        <polygon
          points="0,0 90,28 0,56 -90,28"
          fill="rgba(94,234,212,.03)"
          stroke="#5EEAD4"
          strokeWidth=".9"
          strokeDasharray="3 2"
        />
        <text x="105" y="34" fontFamily="var(--font-jetbrains), monospace" fontSize="10" fill="#5EEAD4" opacity=".8" letterSpacing="2">
          SEPARATOR
        </text>
      </g>
      <g transform="translate(240, 340)">
        <polygon points="0,0 90,28 0,56 -90,28" fill="rgba(94,234,212,.06)" stroke="#5EEAD4" strokeWidth="1.2" />
        <polygon points="0,6 84,30 0,50 -84,30" fill="none" stroke="#5EEAD4" strokeWidth=".5" opacity=".5" />
        <text x="105" y="34" fontFamily="var(--font-jetbrains), monospace" fontSize="10" fill="#5EEAD4" opacity=".8" letterSpacing="2">
          ANODE
        </text>
      </g>

      {/* Vertical connectors */}
      <line x1="240" y1="156" x2="240" y2="180" stroke="#5EEAD4" strokeWidth=".6" opacity=".4" strokeDasharray="2 2" />
      <line x1="240" y1="236" x2="240" y2="260" stroke="#5EEAD4" strokeWidth=".6" opacity=".4" strokeDasharray="2 2" />
      <line x1="240" y1="316" x2="240" y2="340" stroke="#5EEAD4" strokeWidth=".6" opacity=".4" strokeDasharray="2 2" />

      {/* Bottom labels */}
      <text x="40" y="450" fontFamily="var(--font-jetbrains), monospace" fontSize="11" fill="#5EEAD4" opacity=".6" letterSpacing="2">
        EXPLODED VIEW · Li+
      </text>
      <text x="340" y="450" fontFamily="var(--font-jetbrains), monospace" fontSize="11" fill="#5EEAD4" opacity=".4" letterSpacing="1">
        [340 Wh/kg]
      </text>

      <line x1="40" y1="50" x2="80" y2="50" stroke="#5EEAD4" strokeWidth=".5" opacity=".4" />
      <line x1="40" y1="50" x2="40" y2="80" stroke="#5EEAD4" strokeWidth=".5" opacity=".4" />
    </svg>
  );
}

export function ProductHeroSvgSupercapacitor() {
  // 規格表大圖 + ASCII 中央示意
  const rows = [
    { k: "MODEL", v: "SC-EDLC-3000" },
    { k: "CAPACITANCE", v: "3,000 F" },
    { k: "VOLTAGE", v: "2.7 V" },
    { k: "ESR", v: "0.29 mΩ" },
    { k: "CYCLES", v: "1,000,000+" },
    { k: "RESPONSE", v: "< 1 ms" },
    { k: "OP. TEMP", v: "-40 ~ 70 °C" },
    { k: "STATUS", v: "● ACTIVE" },
  ];

  return (
    <svg
      viewBox="0 0 480 480"
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "block" }}
    >
      {/* 規格表 */}
      {rows.map((r, i) => {
        const y = 80 + i * 32;
        return (
          <g key={r.k}>
            <line x1="32" y1={y + 14} x2="448" y2={y + 14} stroke="rgba(94,234,212,0.06)" strokeWidth="1" />
            <text
              x="40"
              y={y + 8}
              fontFamily="var(--font-jetbrains), monospace"
              fontSize="11"
              fill="#8290A4"
              letterSpacing="3"
            >
              {r.k}
            </text>
            <text
              x="448"
              y={y + 8}
              fontFamily="var(--font-jetbrains), monospace"
              fontSize="11"
              fill="#5EEAD4"
              fontWeight="500"
              textAnchor="end"
            >
              {r.v}
            </text>
          </g>
        );
      })}

      {/* ASCII art 風格中央方塊 */}
      <g transform="translate(180, 372)" fontFamily="var(--font-jetbrains), monospace" fontSize="11" fill="#5EEAD4">
        <rect x="0" y="0" width="120" height="60" fill="none" stroke="#5EEAD4" strokeWidth=".7" opacity=".4" />
        <text x="60" y="20" textAnchor="middle" opacity=".5">
          ░ ▓ █ ▓ ░
        </text>
        <text x="60" y="40" textAnchor="middle" opacity=".7">
          ▓ █ ⚡ █ ▓
        </text>
        <line x1="60" y1="60" x2="60" y2="80" stroke="#5EEAD4" strokeWidth="1" opacity=".5" />
        <text x="60" y="92" textAnchor="middle" opacity=".7" fontSize="14">
          ⚡
        </text>
      </g>

      {/* Crosshair top-left */}
      <line x1="20" y1="40" x2="60" y2="40" stroke="#5EEAD4" strokeWidth=".5" opacity=".4" />
      <line x1="20" y1="40" x2="20" y2="70" stroke="#5EEAD4" strokeWidth=".5" opacity=".4" />
    </svg>
  );
}

export function ProductHeroSvg({ slug }: { slug: string }) {
  if (slug === "sodium-ion") return <ProductHeroSvgSodiumIon />;
  if (slug === "lithium-ion") return <ProductHeroSvgLithiumIon />;
  return <ProductHeroSvgSupercapacitor />;
}
