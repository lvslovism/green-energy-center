/**
 * 產品比較頁專用資料。
 * 比較邏輯（best per row、應用矩陣）需跨產品判斷，故獨立於 DB（lib/products.ts / Supabase）。
 * 可譯欄位用 {zh, en} 物件，由 page.tsx 依 locale 解出單一語言。
 */

export type Bi = { zh: string; en: string };

export type ProductKey = "na" | "li" | "sc";

export const PRODUCT_KEYS: ProductKey[] = ["na", "li", "sc"];

export const PRODUCT_META: Record<
  ProductKey,
  {
    slug: string;
    nameZh: string;
    nameEn: string;
    subtitle: string;
    grade: string;
    colorVar: string;
  }
> = {
  na: {
    slug: "sodium-ion",
    nameZh: "鈉離子電池",
    nameEn: "Sodium-ion",
    subtitle: "Na-ion cell",
    grade: "ESS GRADE",
    colorVar: "var(--color-na)",
  },
  li: {
    slug: "lithium-ion",
    nameZh: "高能量密度鋰電池",
    nameEn: "High-energy Li-ion",
    subtitle: "Lithium-ion high-nickel",
    grade: "EV GRADE",
    colorVar: "var(--color-li)",
  },
  sc: {
    slug: "supercapacitor",
    nameZh: "全超電容",
    nameEn: "Supercapacitor",
    subtitle: "EDLC",
    grade: "INDUSTRIAL",
    colorVar: "var(--color-sc)",
  },
};

/** Section 01: Key Specs 比較表 */
export type ComparisonSpec = {
  /** Spec 名稱 */
  label: Bi;
  /** 三產品的顯示值（— 表示不適用） */
  values: Record<ProductKey, Bi>;
  /** 哪些產品在此維度是最佳（多個皆最佳時可包含多個 key） */
  best: ProductKey[];
};

export const COMPARISON_SPECS: ComparisonSpec[] = [
  {
    label: { zh: "能量密度 Energy density", en: "Energy density" },
    values: {
      na: { zh: "160 Wh/kg", en: "160 Wh/kg" },
      li: { zh: "340 Wh/kg", en: "340 Wh/kg" },
      sc: { zh: "—", en: "—" },
    },
    best: ["li"],
  },
  {
    label: { zh: "功率密度 Power density", en: "Power density" },
    values: {
      na: { zh: "—", en: "—" },
      li: { zh: "—", en: "—" },
      sc: { zh: "15,000 W/kg", en: "15,000 W/kg" },
    },
    best: ["sc"],
  },
  {
    label: { zh: "循環壽命 Cycle life", en: "Cycle life" },
    values: {
      na: { zh: "6,000+", en: "6,000+" },
      li: { zh: "2,500+", en: "2,500+" },
      sc: { zh: "1,000,000+", en: "1,000,000+" },
    },
    best: ["sc"],
  },
  {
    label: { zh: "工作溫域 Operating temp", en: "Operating temp" },
    values: {
      na: { zh: "-40 ~ 80 °C", en: "-40 ~ 80 °C" },
      li: { zh: "-20 ~ 60 °C", en: "-20 ~ 60 °C" },
      sc: { zh: "-40 ~ 70 °C", en: "-40 ~ 70 °C" },
    },
    best: ["na"],
  },
  {
    label: { zh: "響應時間 Response time", en: "Response time" },
    values: {
      na: { zh: "秒級 Seconds", en: "Seconds" },
      li: { zh: "秒級 Seconds", en: "Seconds" },
      sc: { zh: "< 1 ms", en: "< 1 ms" },
    },
    best: ["sc"],
  },
  {
    label: { zh: "快充能力 Fast charge", en: "Fast charge" },
    values: {
      na: { zh: "4C (15 min)", en: "4C (15 min)" },
      li: { zh: "4C (15 min)", en: "4C (15 min)" },
      sc: { zh: "秒級全充 Full in sec", en: "Full in sec" },
    },
    best: ["sc"],
  },
  {
    label: { zh: "日曆壽命 Calendar life", en: "Calendar life" },
    values: {
      na: { zh: "15 years", en: "15 years" },
      li: { zh: "10 years", en: "10 years" },
      sc: { zh: "15+ years", en: "15+ years" },
    },
    best: ["na", "sc"],
  },
  {
    label: { zh: "成本指數 Cost index (lower=better)", en: "Cost index (lower=better)" },
    values: {
      na: { zh: "0.30", en: "0.30" },
      li: { zh: "1.00", en: "1.00" },
      sc: { zh: "0.80", en: "0.80" },
    },
    best: ["na"],
  },
];

/** Section 02: Performance grouped bars */
export type PerformanceMetric = {
  label: Bi;
  /** 三產品數值（用於 bar 長度） */
  values: Record<ProductKey, number>;
  /** 顯示在 bar 右側的格式化字串 */
  display: Record<ProductKey, string>;
  /** Bar 計算的最大值（用於 width %） */
  max: number;
  /** 是否為「越低越好」指標（圖表上反向呈現） */
  inverted?: boolean;
  /** 該維度最佳的產品 */
  best: ProductKey;
};

export const PERFORMANCE_METRICS: PerformanceMetric[] = [
  {
    label: { zh: "能量密度 (Wh/kg)", en: "Energy density (Wh/kg)" },
    values: { na: 160, li: 340, sc: 10 },
    display: { na: "160", li: "340", sc: "10" },
    max: 340,
    best: "li",
  },
  {
    label: { zh: "循環壽命 (×1,000)", en: "Cycle life (×1,000)" },
    values: { na: 6, li: 2.5, sc: 1000 },
    display: { na: "6,000", li: "2,500", sc: "1,000,000+" },
    max: 1000,
    best: "sc",
  },
  {
    label: { zh: "溫域範圍 (°C span)", en: "Temp range (°C span)" },
    values: { na: 120, li: 80, sc: 110 },
    display: { na: "120°", li: "80°", sc: "110°" },
    max: 120,
    best: "na",
  },
  {
    label: { zh: "成本指數（越低越好）", en: "Cost index (lower=better)" },
    values: { na: 0.3, li: 1.0, sc: 0.8 },
    display: { na: "0.30", li: "1.00", sc: "0.80" },
    max: 1.0,
    inverted: true,
    best: "na",
  },
];

/** Section 03: Use Case Fit 矩陣 */
export type FitLevel = "best" | "suitable" | "hybrid" | "na";

export type UseCaseRow = {
  scenario: Bi;
  /** 詳細補充（顯示在 fit 文字後，可選） */
  detail?: Record<ProductKey, Bi | null>;
  fit: Record<ProductKey, FitLevel>;
};

export const USE_CASE_MATRIX: UseCaseRow[] = [
  {
    scenario: { zh: "電網級儲能", en: "Grid-scale storage" },
    fit: { na: "best", li: "suitable", sc: "hybrid" },
  },
  {
    scenario: { zh: "電動車動力", en: "EV powertrains" },
    detail: {
      na: { zh: "城市短程", en: "Urban short-range" },
      li: null,
      sc: null,
    },
    fit: { na: "suitable", li: "best", sc: "na" },
  },
  {
    scenario: { zh: "商用車隊", en: "Commercial fleets" },
    fit: { na: "best", li: "suitable", sc: "na" },
  },
  {
    scenario: { zh: "煞車能量回收", en: "Regenerative braking" },
    fit: { na: "na", li: "na", sc: "best" },
  },
  {
    scenario: { zh: "UPS 不斷電", en: "UPS backup" },
    fit: { na: "suitable", li: "suitable", sc: "best" },
  },
  {
    scenario: { zh: "消費電子", en: "Consumer electronics" },
    fit: { na: "na", li: "best", sc: "na" },
  },
  {
    scenario: { zh: "離網太陽能", en: "Off-grid solar" },
    fit: { na: "best", li: "suitable", sc: "hybrid" },
  },
  {
    scenario: { zh: "港口起重機", en: "Port cranes" },
    fit: { na: "na", li: "na", sc: "best" },
  },
];
