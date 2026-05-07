/**
 * 把 dictionary 結構（snake_case JSON）轉成現有 component 的 props 形狀，
 * 避免大量 component 內部欄位重新命名。
 */
import type { Dictionary } from "./index";
import type { HeroContent, MarqueeItem, Product as ProductCardData, StatItem } from "@/lib/types";
import { products as PRODUCT_DATA } from "@/lib/products";
import type { Product, UseCase, ProductDocument } from "@/lib/products";

export function dictToHeroContent(d: Dictionary): HeroContent {
  const h = d.home.hero;
  return {
    liveBadge: h.live_badge,
    eyebrowSegments: h.eyebrow_segments,
    titleLine1: h.title_line_1,
    titleLine2: h.title_line_2,
    subtitle: h.subtitle,
    ctaPrimary: { label: h.cta_primary_label, url: h.cta_primary_url },
    ctaSecondary: { label: h.cta_secondary_label, url: h.cta_secondary_url },
    metaItems: h.meta_items,
  };
}

/**
 * 首頁產品卡用的 4 個 spec 為技術數值，刻意維持英文樣式（mono uppercase）。
 * 這裡集中定義不放 dict，避免 zh/en 重複維護同樣內容。
 */
const HOME_CARD_SPECS: Record<string, { label: string; value: string }[]> = {
  "sodium-ion": [
    { label: "ENERGY DENSITY", value: "160 Wh/kg" },
    { label: "CYCLE LIFE", value: "6,000+" },
    { label: "OP. TEMP.", value: "-40°C ~ 80°C" },
    { label: "STATUS", value: "MASS PROD." },
  ],
  "lithium-ion": [
    { label: "ENERGY DENSITY", value: "340 Wh/kg" },
    { label: "CYCLE LIFE", value: "2,500+" },
    { label: "FAST CHARGE", value: "4C / 15min" },
    { label: "STATUS", value: "PILOT" },
  ],
  supercapacitor: [
    { label: "POWER DENSITY", value: "15,000 W/kg" },
    { label: "CYCLE LIFE", value: "1M+" },
    { label: "RESPONSE", value: "< 1ms" },
    { label: "STATUS", value: "SHIPPING" },
  ],
};

const CARD_VARIANT: Record<string, "A" | "B" | "C"> = {
  "sodium-ion": "A",
  "lithium-ion": "B",
  supercapacitor: "C",
};

export function dictToHomeProducts(d: Dictionary): ProductCardData[] {
  const items = d.products.items as Record<
    string,
    { name: string; card_meta: string; card_desc: string }
  >;
  return Object.entries(items).map(([slug, it]) => ({
    slug,
    cardVariant: CARD_VARIANT[slug] ?? "A",
    name: it.name,
    meta: it.card_meta,
    description: it.card_desc,
    specs: HOME_CARD_SPECS[slug] ?? [],
  }));
}

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

export function dictToStats(d: Dictionary): StatItem[] {
  return d.home.stats.items.map((s) => ({
    value: s.value,
    suffix: s.suffix,
    label: s.label,
    desc: s.desc,
  }));
}

/**
 * 詳細產品頁：把 lib/products.ts 的技術資料 + dict 的可譯文字合併。
 */
export type LocalizedProduct = Omit<Product, "name" | "nameEn" | "tagline" | "useCases" | "documents"> & {
  name: string;
  nameEn: string;
  tagline: string;
  useCases: UseCase[];
  documents: ProductDocument[];
};

export function getLocalizedProduct(slug: string, d: Dictionary): LocalizedProduct | undefined {
  const base = PRODUCT_DATA.find((p) => p.slug === slug);
  if (!base) return undefined;
  const items = d.products.items as Record<
    string,
    {
      name: string;
      name_en: string;
      tagline: string;
      use_cases: UseCase[];
      documents: { name: string }[];
    }
  >;
  const tr = items[slug];
  if (!tr) return undefined;
  // 文件其他欄位（type/size/version）保留 base
  const documents: ProductDocument[] = base.documents.map((doc, i) => ({
    ...doc,
    name: tr.documents[i]?.name ?? doc.name,
  }));
  return {
    ...base,
    name: tr.name,
    nameEn: tr.name_en,
    tagline: tr.tagline,
    useCases: tr.use_cases,
    documents,
  };
}

export function getOtherLocalizedProducts(slug: string, d: Dictionary): LocalizedProduct[] {
  return PRODUCT_DATA.filter((p) => p.slug !== slug)
    .map((p) => getLocalizedProduct(p.slug, d))
    .filter((p): p is LocalizedProduct => Boolean(p));
}
