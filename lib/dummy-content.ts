import type { HeroContent, MarqueeItem, Product, StatItem } from "./types";

/**
 * Step 1 寫死內容。後續 Step 6 會由 Supabase CMS 取代。
 * 結構保持與 SDD §7.2 section_schemas 對齊。
 */

export const HOME_HERO: HeroContent = {
  liveBadge: "LIVE",
  eyebrowSegments: ["NEXT-GEN ENERGY STORAGE", "EST. 2024", "TPE"],
  titleLine1: "儲存能量的",
  titleLine2: "每一種<em>可能</em>。",
  subtitle: "從鈉離子到全超電容，我們以材料工程重新定義電池的能量密度、壽命與安全邊界。",
  ctaPrimary: { label: "探索技術", url: "/technology" },
  ctaSecondary: { label: "觀看簡介", url: "#intro" },
  metaItems: [
    { label: "PRODUCT_LINES", value: "03" },
    { label: "PATENTS", value: "14" },
    { label: "PARTNERS", value: "27" },
  ],
};

export const HOME_MARQUEE: MarqueeItem[] = [
  { text: "SODIUM-ION" },
  { divider: "[ Na+ ]" },
  { text: "鈉離子電池", muted: true },
  { divider: "◆" },
  { text: "LITHIUM-ION" },
  { divider: "[ Li+ ]" },
  { text: "高密度鋰電", muted: true },
  { divider: "◆" },
  { text: "SUPERCAPACITOR" },
  { divider: "[ F/g ]" },
  { text: "全超電容", muted: true },
  { divider: "◆" },
];

export const HOME_PRODUCTS: Product[] = [
  {
    slug: "sodium-ion",
    cardVariant: "A",
    name: "鈉離子電池",
    meta: "SODIUM-ION CELL",
    description:
      "原料豐沛、低溫穩定、循環次數突破 6,000 次。為儲能電廠與商用車隊提供可規模化的鋰電替代方案。",
    specs: [
      { label: "ENERGY DENSITY", value: "160 Wh/kg" },
      { label: "CYCLE LIFE", value: "6,000+" },
      { label: "OP. TEMP.", value: "-40°C ~ 80°C" },
      { label: "STATUS", value: "MASS PROD." },
    ],
  },
  {
    slug: "lithium-ion",
    cardVariant: "B",
    name: "高能量密度鋰電池",
    meta: "LITHIUM-ION HIGH-NICKEL",
    description:
      "340 Wh/kg 級高鎳體系，搭配自研複合電解質，能量密度與安全性雙重突破。為電動車、航太與消費電子而生。",
    specs: [
      { label: "ENERGY DENSITY", value: "340 Wh/kg" },
      { label: "CYCLE LIFE", value: "2,500+" },
      { label: "FAST CHARGE", value: "4C / 15min" },
      { label: "STATUS", value: "PILOT" },
    ],
  },
  {
    slug: "supercapacitor",
    cardVariant: "C",
    name: "全超電容",
    meta: "SUPERCAPACITOR",
    description:
      "秒級充放電、百萬次循環。搭配電池形成混合儲能系統，承擔尖峰功率輸出與煞車能量回收。",
    specs: [
      { label: "POWER DENSITY", value: "15,000 W/kg" },
      { label: "CYCLE LIFE", value: "1M+" },
      { label: "RESPONSE", value: "< 1ms" },
      { label: "STATUS", value: "SHIPPING" },
    ],
  },
];

export const HOME_STATS: StatItem[] = [
  { value: 340, suffix: null, label: "Wh / kg", desc: "高鎳體系實測能量密度，較市售平均高 28%。" },
  { value: 6000, suffix: "+", label: "CYCLES", desc: "鈉電在 80% 容量保持率下的循環壽命實驗數據。" },
  { value: 98, suffix: "%", label: "EFFICIENCY", desc: "超電容混合系統的往返能源效率（round-trip）。" },
];

export const HOME_VISION =
  "當化石燃料退場、再生能源接軌的<em>百年之交</em>，儲能將是文明維持運轉的<em>關鍵節點</em>——我們以材料、製程與系統三層創新，讓<em>每一度電</em>都能被妥善保存。";

/**
 * 一站式 export，方便 page.tsx import
 */
export const HOME_CONTENT = {
  hero: HOME_HERO,
  marquee: HOME_MARQUEE,
  products: HOME_PRODUCTS,
  stats: HOME_STATS,
  vision: HOME_VISION,
};
