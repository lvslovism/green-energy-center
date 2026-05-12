/**
 * DB row → component props 轉換層。
 * 把 Supabase JSONB i18n 結構（{zh, en}）攤平成單語字串，
 * 並對齊現有 component 的 prop 形狀。
 */
import type { Locale } from "./i18n/locales";
import type { Dictionary } from "./i18n";
import type {
  SiteSettingsRow,
  ProductRow,
  PillarRow,
  RdStatRow,
  MilestoneRow,
  TeamMemberRow,
} from "./cms";
import type {
  HeroContent,
  Product as ProductCardData,
  StatItem,
  MarqueeItem,
} from "./types";

// ---- i18n value helpers ----

type I18nField = string | { zh?: string; en?: string } | null | undefined;

export function t(field: I18nField | unknown, locale: Locale): string {
  if (typeof field === "string") return field;
  if (!field || typeof field !== "object") return "";
  const obj = field as Record<string, unknown>;
  const v = obj[locale] ?? obj["zh"] ?? "";
  return typeof v === "string" ? v : "";
}

// ---- Hero (page-level: DB content + dict UI bits) ----

export function localizeHero(
  settings: SiteSettingsRow | null,
  locale: Locale,
  dict: Dictionary,
): HeroContent {
  const dh = dict.home.hero;

  // 沒有 DB → 純 dict fallback
  if (!settings?.hero) {
    return {
      liveBadge: dh.live_badge,
      eyebrowSegments: dh.eyebrow_segments,
      titleLine1: dh.title_line_1,
      titleLine2: dh.title_line_2,
      subtitle: dh.subtitle,
      ctaPrimary: { label: dh.cta_primary_label, url: dh.cta_primary_url },
      ctaSecondary: { label: dh.cta_secondary_label, url: dh.cta_secondary_url },
      metaItems: dh.meta_items,
    };
  }

  const h = settings.hero as Record<string, unknown>;
  const sep = locale === "zh" ? "" : " ";
  const period = locale === "zh" ? "。" : ".";

  const titleLine1 = t(h.title_line_1 as I18nField, locale) || dh.title_line_1;
  const dbLine2 = t(h.title_line_2 as I18nField, locale);
  const dbAccent = t(h.title_accent as I18nField, locale);
  const titleLine2 =
    dbLine2 && dbAccent
      ? `${dbLine2}${sep}<em>${dbAccent}</em>${period}`
      : dbLine2 || dh.title_line_2;
  const subtitle = t(h.subtitle as I18nField, locale) || dh.subtitle;

  return {
    liveBadge: dh.live_badge,
    eyebrowSegments: dh.eyebrow_segments,
    titleLine1,
    titleLine2,
    subtitle,
    ctaPrimary: { label: dh.cta_primary_label, url: dh.cta_primary_url },
    ctaSecondary: { label: dh.cta_secondary_label, url: dh.cta_secondary_url },
    metaItems: dh.meta_items,
  };
}

// ---- Vision ----

export function localizeVision(
  settings: SiteSettingsRow | null,
  locale: Locale,
  dict: Dictionary,
): { label: string; text: string } {
  const dv = dict.home.vision;
  if (!settings?.vision) {
    return { label: dv.label, text: dv.text };
  }
  const v = settings.vision as Record<string, unknown>;
  const label = typeof v.label === "string" ? v.label : dv.label;
  const dbTitle = t(v.title as I18nField, locale);
  const dbDesc = t(v.description as I18nField, locale);
  // 若 DB 有 title + description 就用 DB 重組，否則 fallback 整段 dict.text
  const text = dbTitle && dbDesc ? `<em>${dbTitle}</em>—${dbDesc}` : dv.text;
  return { label, text };
}

// ---- Footer ----

export function localizeFooter(
  settings: SiteSettingsRow | null,
  locale: Locale,
  dict: Dictionary,
): { copyright: string; address: string; email: string; locales: string } {
  const df = dict.common.footer;
  const f = (settings?.footer ?? {}) as Record<string, unknown>;
  const ci = (settings?.contact_info ?? {}) as Record<string, unknown>;
  return {
    copyright: t(f.copyright as I18nField, locale) || df.copyright,
    address: t(ci.office as I18nField, locale) || df.address,
    email: typeof ci.email === "string" && ci.email ? ci.email : "info@greentech.tw",
    locales: df.locales,
  };
}

// ---- Contact info (used by /contact page) ----

export function localizeContactInfo(
  settings: SiteSettingsRow | null,
  locale: Locale,
  dict: Dictionary,
): {
  office: string;
  email: string;
  phone: string;
  hours: string;
} {
  const di = dict.contact.info;
  const ci = (settings?.contact_info ?? {}) as Record<string, unknown>;
  return {
    office: t(ci.office as I18nField, locale) || di.office_value,
    email: typeof ci.email === "string" && ci.email ? ci.email : di.email_value,
    phone: typeof ci.phone === "string" && ci.phone ? ci.phone : di.phone_value,
    hours: t(ci.hours as I18nField, locale) || di.hours_value,
  };
}

// ---- SEO ----

export function localizeSeo(
  settings: SiteSettingsRow | null,
  locale: Locale,
): { title?: string; description?: string } {
  const s = (settings?.seo ?? {}) as Record<string, unknown>;
  return {
    title: t(s.title as I18nField, locale) || undefined,
    description: t(s.description as I18nField, locale) || undefined,
  };
}

// ---- Products ----

/**
 * 首頁產品卡：DB → ProductCardData（Step 1 設計的精簡卡片形狀）
 */
const CARD_VARIANT: Record<string, "A" | "B" | "C"> = {
  "sodium-ion": "A",
  "lithium-ion": "B",
  supercapacitor: "C",
};

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

export function localizeProductCard(p: ProductRow, locale: Locale): ProductCardData {
  return {
    slug: p.slug,
    cardVariant: CARD_VARIANT[p.slug] ?? "A",
    name: t(p.name as I18nField, locale),
    meta: t(p.name_subtitle as I18nField, locale).toUpperCase(),
    description: t(p.tagline as I18nField, locale),
    specs: HOME_CARD_SPECS[p.slug] ?? [],
  };
}

/**
 * 詳細產品頁完整型別。沿用 Step 4 LocalizedProduct 形狀，
 * 接 DB JSONB 後解出單一語言字串。
 */
export type LocalizedUseCase = { icon: string; title: string; description: string };
export type UseCase = LocalizedUseCase; // alias for existing component imports
export type LocalizedDoc = {
  name: string;
  type: string;
  size: string;
  version?: string;
};
export type ProductDocument = LocalizedDoc;
export type ProductSpec = { key: string; value: string };
export type PerformanceMetric = {
  label: string;
  ours: number;
  oursLabel: string;
  market: number;
  marketLabel: string;
  maxValue: number;
  inverted?: boolean;
};
export type LocalizedProduct = {
  slug: string;
  name: string;
  nameEn: string;
  tagline: string;
  status: string;
  grade: string;
  heroVisual: string;
  keySpecs: { value: string; label: string }[];
  specs: { key: string; value: string }[];
  performance: {
    label: string;
    ours: number;
    oursLabel: string;
    market: number;
    marketLabel: string;
    maxValue: number;
    inverted?: boolean;
  }[];
  useCases: LocalizedUseCase[];
  documents: LocalizedDoc[];
};

export function localizeProduct(p: ProductRow, locale: Locale): LocalizedProduct {
  const useCases = ((p.use_cases as unknown[]) ?? []).map((uc) => {
    const u = uc as Record<string, unknown>;
    return {
      icon: typeof u.icon === "string" ? u.icon : "",
      title: t(u.title as I18nField, locale),
      description: t(u.description as I18nField, locale),
    };
  });
  const documents = ((p.documents as unknown[]) ?? []).map((d) => {
    const doc = d as Record<string, unknown>;
    return {
      name: t(doc.name as I18nField, locale),
      type: typeof doc.type === "string" ? doc.type : "",
      size: typeof doc.size === "string" ? doc.size : "",
      version: typeof doc.version === "string" ? doc.version : undefined,
    };
  });
  return {
    slug: p.slug,
    name: t(p.name as I18nField, locale),
    nameEn: t(p.name_subtitle as I18nField, locale),
    tagline: t(p.tagline as I18nField, locale),
    status: p.status,
    grade: p.grade,
    heroVisual: p.hero_visual,
    keySpecs: ((p.key_specs as unknown[]) ?? []) as LocalizedProduct["keySpecs"],
    specs: ((p.specs as unknown[]) ?? []) as LocalizedProduct["specs"],
    performance: ((p.performance as unknown[]) ?? []) as LocalizedProduct["performance"],
    useCases,
    documents,
  };
}

export function localizeProductSeo(
  p: ProductRow,
  locale: Locale,
): { title: string; description: string } {
  const seo = (p.seo ?? {}) as Record<string, unknown>;
  return {
    title: t(seo.title as I18nField, locale),
    description: t(seo.description as I18nField, locale),
  };
}

// ---- Technology ----

export function localizePillar(p: PillarRow, locale: Locale) {
  return {
    icon: p.icon,
    title: t(p.title as I18nField, locale),
    desc: t(p.description as I18nField, locale),
  };
}

export function localizeRdStat(s: RdStatRow, locale: Locale) {
  return {
    value: s.value,
    label: t(s.label as I18nField, locale),
  };
}

export function localizeMilestone(m: MilestoneRow, locale: Locale) {
  return {
    year: m.year,
    content: t(m.content as I18nField, locale),
  };
}

// ---- About: team ----

export function localizeTeamMember(m: TeamMemberRow, locale: Locale) {
  return {
    initials: m.initials,
    name: m.name,
    role: t(m.role as I18nField, locale),
    avatarUrl: m.avatar_url ?? undefined,
  };
}

// ---- Stats (home) ----

/**
 * DB stats.items 形狀與 Step 1 component 略不同。為保持 visual 一致，
 * 解析 DB value（去逗號 / 解後綴），對應原 StatItem。
 * 若 DB 無資料，fallback dict。
 */
function parseStatValue(raw: string): { num: number; suffix: string | null } {
  const cleaned = raw.replace(/,/g, "");
  const m = cleaned.match(/^([<>]?)\s*(-?\d+(?:\.\d+)?)(.*)$/);
  if (!m) return { num: 0, suffix: null };
  const num = parseFloat(m[2]);
  const suffix = (m[1] + m[3]).trim();
  return { num, suffix: suffix || null };
}

export function localizeStats(
  settings: SiteSettingsRow | null,
  locale: Locale,
  dict: Dictionary,
): { label: string; title: string; items: StatItem[] } {
  const ds = dict.home.stats;
  const s = (settings?.stats ?? {}) as Record<string, unknown>;
  const label = typeof s.label === "string" && s.label ? s.label : ds.label;
  const title = t(s.title as I18nField, locale) || ds.title;
  const dbItems = Array.isArray(s.items) ? (s.items as Record<string, unknown>[]) : [];

  if (dbItems.length === 0) {
    return {
      label,
      title,
      items: ds.items.map((it) => ({
        value: it.value,
        suffix: it.suffix,
        label: it.label,
        desc: it.desc,
      })),
    };
  }

  // DB 模式：value 字串 → 數字 + suffix，desc 暫用 localized label 補
  const items: StatItem[] = dbItems.slice(0, 3).map((it) => {
    const raw = typeof it.value === "string" ? it.value : "0";
    const { num, suffix } = parseStatValue(raw);
    return {
      value: num,
      suffix,
      label: typeof it.unit === "string" ? it.unit : "",
      desc: t(it.label as I18nField, locale),
    };
  });
  return { label, title, items };
}

// ---- Marquee (static bilingual content, not in DB) ----

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
