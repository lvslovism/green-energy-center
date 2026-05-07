export type ProductSpec = {
  label: string;
  value: string;
};

export type Product = {
  slug: string;
  /** "A" / "B" / "C" — 對應卡片視覺風格 */
  cardVariant: "A" | "B" | "C";
  /** 中文產品名 */
  name: string;
  /** 英文 / 大寫副標 */
  meta: string;
  /** 介紹段落 */
  description: string;
  specs: ProductSpec[];
};

export type HeroMetaItem = {
  label: string;
  value: string;
};

export type HeroContent = {
  liveBadge: string;
  eyebrowSegments: string[];
  titleLine1: string;
  titleLine2: string;
  subtitle: string;
  ctaPrimary: { label: string; url: string };
  ctaSecondary: { label: string; url: string };
  metaItems: HeroMetaItem[];
};

export type StatItem = {
  value: number;
  suffix: string | null;
  label: string;
  desc: string;
};

export type MarqueeItem = { text: string; muted?: boolean } | { divider: string };
