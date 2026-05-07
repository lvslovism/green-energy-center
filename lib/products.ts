/**
 * Step 2 詳細產品資料。
 * 與 lib/types.ts 中的 ProductCardData（首頁卡片用）並存：
 *   - lib/types.ts ProductCardData：首頁產品矩陣 → 顯示用，欄位精簡
 *   - lib/products.ts Product（本檔）：產品詳情頁 → 完整規格、效能、應用、文件
 * 兩者用 slug 對應。Step 6 會由 Supabase CMS 取代。
 */

export interface ProductSpec {
  key: string;
  value: string;
}

export interface PerformanceMetric {
  label: string;
  ours: number;
  oursLabel: string;
  market: number;
  marketLabel: string;
  maxValue: number;
  /** 反向指標（越低越好），目前用於 raw material cost / response time */
  inverted?: boolean;
}

export interface UseCase {
  /** Lucide icon 名稱 */
  icon: string;
  title: string;
  description: string;
}

export interface ProductDocument {
  name: string;
  type: "PDF" | "STEP" | string;
  size: string;
  version?: string;
}

export interface Product {
  slug: string;
  nameZh: string;
  nameEn: string;
  tagline: string;
  status: "MASS PRODUCTION" | "PILOT" | "SHIPPING" | string;
  grade: string;
  /** 恰好 4 格 */
  keySpecs: { value: string; label: string }[];
  specs: ProductSpec[];
  performance: PerformanceMetric[];
  useCases: UseCase[];
  documents: ProductDocument[];
}

export const products: Product[] = [
  {
    slug: "sodium-ion",
    nameZh: "鈉離子電池",
    nameEn: "Sodium-ion cell",
    tagline:
      "原料豐沛、低溫穩定、循環次數突破 6,000 次。為儲能電廠與商用車隊提供可規模化的鋰電替代方案。",
    status: "MASS PRODUCTION",
    grade: "ESS GRADE",
    keySpecs: [
      { value: "160", label: "Wh / kg" },
      { value: "6,000+", label: "Cycles" },
      { value: "-40 ~ 80", label: "Op. Temp (°C)" },
      { value: "4C", label: "Fast charge" },
    ],
    specs: [
      { key: "Cell type", value: "Prismatic" },
      { key: "Nominal voltage", value: "3.1 V" },
      { key: "Capacity", value: "210 Ah" },
      { key: "Energy density", value: "160 Wh/kg" },
      { key: "Cycle life (@80% DoD)", value: "6,000+" },
      { key: "Calendar life", value: "15 years" },
      { key: "Charge temp", value: "-20 ~ 55 °C" },
      { key: "Discharge temp", value: "-40 ~ 80 °C" },
      { key: "Fast charge rate", value: "4C (15 min)" },
      { key: "Dimension", value: "174 × 72 × 208 mm" },
      { key: "Weight", value: "4.1 kg" },
      { key: "Certifications", value: "UN38.3 / IEC 62619" },
    ],
    performance: [
      {
        label: "Energy density (Wh/kg)",
        ours: 160,
        oursLabel: "160",
        market: 125,
        marketLabel: "125 Market avg",
        maxValue: 340,
      },
      {
        label: "Cycle life (×1,000)",
        ours: 6,
        oursLabel: "6,000",
        market: 3,
        marketLabel: "3,000 Market avg",
        maxValue: 10,
      },
      {
        label: "Low-temp retention @ -20°C",
        ours: 88,
        oursLabel: "88%",
        market: 65,
        marketLabel: "65% Market avg",
        maxValue: 100,
      },
      {
        label: "Raw material cost index (lower = better)",
        ours: 0.3,
        oursLabel: "0.30",
        market: 1.0,
        marketLabel: "1.00 Market avg",
        maxValue: 1.0,
        inverted: true,
      },
    ],
    useCases: [
      {
        icon: "Zap",
        title: "電網級儲能",
        description: "搭配再生能源，為電網提供秒級頻率調節與小時級能量平衡。",
      },
      {
        icon: "Truck",
        title: "商用車隊",
        description: "低溫啟動穩定、循環壽命長，最適合都市配送與固定路線車隊。",
      },
      {
        icon: "Sun",
        title: "離網太陽能",
        description: "白天充電、夜間放電，週期性高頻使用下保持容量保留率。",
      },
      {
        icon: "Radio",
        title: "通訊基站",
        description: "備援電源耐受極端溫度，免空調機房即可長期穩定運作。",
      },
    ],
    documents: [
      { name: "Product datasheet", type: "PDF", size: "2.4 MB", version: "v3.1" },
      { name: "UN38.3 test report", type: "PDF", size: "1.8 MB" },
      { name: "MSDS / SDS", type: "PDF", size: "680 KB" },
      { name: "3D CAD model", type: "STEP", size: "12 MB" },
    ],
  },
  {
    slug: "lithium-ion",
    nameZh: "高能量密度鋰電池",
    nameEn: "Lithium-ion high-nickel",
    tagline:
      "340 Wh/kg 級高鎳體系，搭配自研複合電解質，能量密度與安全性雙重突破。為電動車、航太與消費電子而生。",
    status: "PILOT",
    grade: "EV GRADE",
    keySpecs: [
      { value: "340", label: "Wh / kg" },
      { value: "2,500+", label: "Cycles" },
      { value: "-20 ~ 60", label: "Op. Temp (°C)" },
      { value: "4C / 15min", label: "Fast charge" },
    ],
    specs: [
      { key: "Cell type", value: "Pouch" },
      { key: "Nominal voltage", value: "3.7 V" },
      { key: "Capacity", value: "120 Ah" },
      { key: "Energy density", value: "340 Wh/kg" },
      { key: "Cycle life (@80% DoD)", value: "2,500+" },
      { key: "Calendar life", value: "10 years" },
      { key: "Charge temp", value: "0 ~ 45 °C" },
      { key: "Discharge temp", value: "-20 ~ 60 °C" },
      { key: "Fast charge rate", value: "4C (15 min)" },
      { key: "Dimension", value: "325 × 100 × 12 mm" },
      { key: "Weight", value: "1.3 kg" },
      { key: "Certifications", value: "UN38.3 / IEC 62660" },
    ],
    performance: [
      {
        label: "Energy density (Wh/kg)",
        ours: 340,
        oursLabel: "340",
        market: 265,
        marketLabel: "265 Market avg",
        maxValue: 400,
      },
      {
        label: "Cycle life (×1,000)",
        ours: 2.5,
        oursLabel: "2,500",
        market: 1.5,
        marketLabel: "1,500 Market avg",
        maxValue: 10,
      },
      {
        label: "Volumetric density (Wh/L)",
        ours: 750,
        oursLabel: "750",
        market: 600,
        marketLabel: "600 Market avg",
        maxValue: 800,
      },
      {
        label: "Thermal runaway temp (°C)",
        ours: 240,
        oursLabel: "240 °C",
        market: 180,
        marketLabel: "180 °C Market avg",
        maxValue: 300,
      },
    ],
    useCases: [
      {
        icon: "Car",
        title: "電動車動力",
        description: "高能量密度 + 4C 快充，500km+ 續航搭配 15 分鐘充電。",
      },
      {
        icon: "Plane",
        title: "航太電源",
        description: "輕量化 pouch 形態，符合 DO-311A 航太電源規範。",
      },
      {
        icon: "Smartphone",
        title: "消費電子",
        description: "薄型化設計適合筆電、無人機、AR/VR 裝置。",
      },
      {
        icon: "HeartPulse",
        title: "醫療設備",
        description: "穩定電壓平台支援可攜式診斷儀器與電動手術工具。",
      },
    ],
    documents: [
      { name: "Product datasheet", type: "PDF", size: "3.1 MB", version: "v2.0" },
      { name: "IEC 62660 test report", type: "PDF", size: "2.2 MB" },
      { name: "MSDS / SDS", type: "PDF", size: "720 KB" },
      { name: "3D CAD model", type: "STEP", size: "8 MB" },
    ],
  },
  {
    slug: "supercapacitor",
    nameZh: "全超電容",
    nameEn: "Supercapacitor",
    tagline:
      "秒級充放電、百萬次循環。搭配電池形成混合儲能系統，承擔尖峰功率輸出與煞車能量回收。",
    status: "SHIPPING",
    grade: "INDUSTRIAL",
    keySpecs: [
      { value: "15,000", label: "W / kg" },
      { value: "1M+", label: "Cycles" },
      { value: "< 1ms", label: "Response" },
      { value: "2.7 V", label: "Voltage" },
    ],
    specs: [
      { key: "Type", value: "EDLC (Electric Double Layer)" },
      { key: "Model", value: "SC-EDLC-3000" },
      { key: "Capacitance", value: "3,000 F" },
      { key: "Rated voltage", value: "2.7 V" },
      { key: "ESR (DC)", value: "0.29 mΩ" },
      { key: "Power density", value: "15,000 W/kg" },
      { key: "Cycle life", value: "1,000,000+" },
      { key: "Op. temp", value: "-40 ~ 70 °C" },
      { key: "Response time", value: "< 1 ms" },
      { key: "Dimension", value: "60 × 138 mm (cylindrical)" },
      { key: "Weight", value: "0.52 kg" },
      { key: "Certifications", value: "AEC-Q200 / IEC 62391" },
    ],
    performance: [
      {
        label: "Power density (W/kg)",
        ours: 15000,
        oursLabel: "15,000",
        market: 10000,
        marketLabel: "10,000 Market avg",
        maxValue: 20000,
      },
      {
        label: "Cycle life",
        ours: 1000000,
        oursLabel: "1,000,000+",
        market: 500000,
        marketLabel: "500,000 Market avg",
        maxValue: 1000000,
      },
      {
        label: "Response time (ms, lower = better)",
        ours: 0.5,
        oursLabel: "0.5",
        market: 5,
        marketLabel: "5 Market avg",
        maxValue: 10,
        inverted: true,
      },
      {
        label: "Round-trip efficiency",
        ours: 98,
        oursLabel: "98%",
        market: 92,
        marketLabel: "92% Market avg",
        maxValue: 100,
      },
    ],
    useCases: [
      {
        icon: "RefreshCw",
        title: "煞車能量回收",
        description: "瞬時吸收動能轉電能，效率達 95% 以上、毫秒級響應。",
      },
      {
        icon: "Activity",
        title: "電網頻率調節",
        description: "百萬次循環免維護，承擔再生能源造成的高頻率波動。",
      },
      {
        icon: "ShieldCheck",
        title: "UPS 不斷電",
        description: "毫秒切換、無維護週期，取代傳統鉛酸電池備援系統。",
      },
      {
        icon: "Anchor",
        title: "港口起重機",
        description: "重複起降的能量回收與功率峰值削減，降低柴油發電機負荷。",
      },
    ],
    documents: [
      { name: "Product datasheet", type: "PDF", size: "1.9 MB", version: "v4.2" },
      { name: "AEC-Q200 test report", type: "PDF", size: "1.4 MB" },
      { name: "MSDS / SDS", type: "PDF", size: "550 KB" },
      { name: "Application note", type: "PDF", size: "3.2 MB" },
    ],
  },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getOtherProducts(slug: string): Product[] {
  return products.filter((p) => p.slug !== slug);
}
