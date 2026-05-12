# CC Instruction — Green Energy Center Step 6: Build-time CMS Fetch

> **前置**：先讀 `CLAUDE.md`，確認 Step 5 已完成（commit `a284309`）
> **工作目錄**：`C:\projects\Green Energy Center`
> **目標**：所有頁面改從 Supabase DB 取資料（build-time），取代 hardcoded dictionary + lib/products.ts
> **部署**：完成後 deploy 到 CF Pages production

---

## 1. 架構設計

### 1.1 資料流

```
Build time (npm run build)
  ↓
  page.tsx 呼叫 lib/cms.ts fetch functions
  ↓
  lib/cms.ts 用 lib/supabase.ts client 查 Supabase
  ↓
  組裝成 component props（同 Step 4 dictionary 形狀）
  ↓
  SSG 產出 static HTML（22 pages）
  ↓
  Deploy 到 CF Pages
```

Runtime 完全不打 Supabase——所有資料在 build 時已嵌入 HTML。

### 1.2 核心原則

1. **components 不改**：所有 component 已經接受 props（Step 4 做的），只需改 page 層的資料來源
2. **lib/cms.ts 是唯一 CMS 介面**：集中所有 Supabase query
3. **dictionaries/ 保留為 fallback**：DB fetch 失敗時降級到 JSON（build 不中斷）
4. **lib/products.ts 可移除**：產品資料完全由 DB 提供
5. **lib/i18n/adapters.ts 重構**：改為接受 DB row 而非 dict JSON

---

## 2. 建立 CMS Fetch 層

### 2.1 `lib/cms.ts`

新建此檔案，所有 Supabase query 集中於此。

```typescript
import { supabase } from './supabase';
import type { Locale } from './i18n/locales';

// ---- helpers ----

/** 從 JSONB i18n 欄位取指定語言值 */
function t(field: Record<string, string> | null, locale: Locale): string {
  if (!field) return '';
  return field[locale] || field['zh'] || '';
}

/** 從 JSONB i18n 欄位取完整 {zh, en} 物件 */
function tAll(field: Record<string, string> | null): { zh: string; en: string } {
  if (!field) return { zh: '', en: '' };
  return { zh: field.zh || '', en: field.en || '' };
}

// ---- fetch functions ----

export async function fetchSiteSettings() {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .single();
  if (error) {
    console.error('[CMS] fetchSiteSettings error:', error.message);
    return null;
  }
  return data;
}

export async function fetchProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('[CMS] fetchProducts error:', error.message);
    return [];
  }
  return data || [];
}

export async function fetchProductBySlug(slug: string) {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();
  if (error) {
    console.error(`[CMS] fetchProductBySlug(${slug}) error:`, error.message);
    return null;
  }
  return data;
}

export async function fetchTechnologyPillars() {
  const { data, error } = await supabase
    .from('technology_pillars')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('[CMS] fetchTechnologyPillars error:', error.message);
    return [];
  }
  return data || [];
}

export async function fetchRdStats() {
  const { data, error } = await supabase
    .from('rd_stats')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('[CMS] fetchRdStats error:', error.message);
    return [];
  }
  return data || [];
}

export async function fetchCertifications() {
  const { data, error } = await supabase
    .from('certifications')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('[CMS] fetchCertifications error:', error.message);
    return [];
  }
  return data || [];
}

export async function fetchMilestones(page: 'technology' | 'about') {
  const { data, error } = await supabase
    .from('milestones')
    .select('*')
    .eq('page', page)
    .order('sort_order', { ascending: true });
  if (error) {
    console.error(`[CMS] fetchMilestones(${page}) error:`, error.message);
    return [];
  }
  return data || [];
}

export async function fetchTeamMembers() {
  const { data, error } = await supabase
    .from('team_members')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) {
    console.error('[CMS] fetchTeamMembers error:', error.message);
    return [];
  }
  return data || [];
}
```

### 2.2 `lib/cms-helpers.ts`

此檔案包含 DB row → component props 的轉換邏輯，取代現有 `lib/i18n/adapters.ts` 的部分功能。

```typescript
import type { Locale } from './i18n/locales';

/** 取 JSONB i18n 值 */
export function t(field: any, locale: Locale): string {
  if (typeof field === 'string') return field;
  if (!field) return '';
  return field[locale] || field['zh'] || '';
}

// ---- Product helpers ----

export function localizeProduct(dbRow: any, locale: Locale) {
  return {
    slug: dbRow.slug,
    name: t(dbRow.name, locale),
    nameSubtitle: t(dbRow.name_subtitle, locale),
    tagline: t(dbRow.tagline, locale),
    status: dbRow.status,
    grade: dbRow.grade,
    heroVisual: dbRow.hero_visual,
    keySpecs: dbRow.key_specs || [],
    specs: dbRow.specs || [],
    performance: dbRow.performance || [],
    useCases: (dbRow.use_cases || []).map((uc: any) => ({
      icon: uc.icon,
      title: t(uc.title, locale),
      description: t(uc.description, locale),
    })),
    documents: (dbRow.documents || []).map((doc: any) => ({
      name: t(doc.name, locale),
      type: doc.type,
      size: doc.size,
      version: doc.version,
      url: doc.url,
    })),
    seo: {
      title: t(dbRow.seo?.title, locale),
      description: t(dbRow.seo?.description, locale),
    },
  };
}

export function localizeProductCard(dbRow: any, locale: Locale) {
  return {
    slug: dbRow.slug,
    name: t(dbRow.name, locale),
    description: t(dbRow.tagline, locale),
    keySpecs: dbRow.key_specs || [],
  };
}

// ---- Site settings helpers ----

export function localizeHero(settings: any, locale: Locale) {
  const h = settings.hero || {};
  return {
    titleLine1: t(h.title_line_1, locale),
    titleLine2: t(h.title_line_2, locale),
    titleAccent: t(h.title_accent, locale),
    subtitle: t(h.subtitle, locale),
  };
}

export function localizeVision(settings: any, locale: Locale) {
  const v = settings.vision || {};
  return {
    label: v.label || '',
    title: t(v.title, locale),
    description: t(v.description, locale),
  };
}

export function localizeStats(settings: any, locale: Locale) {
  const s = settings.stats || {};
  return {
    label: s.label || '',
    title: t(s.title, locale),
    items: (s.items || []).map((item: any) => ({
      value: item.value,
      unit: item.unit,
      label: t(item.label, locale),
    })),
  };
}

export function localizeFooter(settings: any, locale: Locale) {
  const f = settings.footer || {};
  return {
    tagline: t(f.tagline, locale),
    copyright: t(f.copyright, locale),
  };
}

export function localizeContactInfo(settings: any, locale: Locale) {
  const c = settings.contact_info || {};
  return {
    office: t(c.office, locale),
    email: c.email || '',
    phone: c.phone || '',
    hours: t(c.hours, locale),
  };
}

export function localizeSeo(settings: any, locale: Locale) {
  const s = settings.seo || {};
  return {
    title: t(s.title, locale),
    description: t(s.description, locale),
  };
}

// ---- Technology page helpers ----

export function localizePillar(dbRow: any, locale: Locale) {
  return {
    icon: dbRow.icon,
    title: t(dbRow.title, locale),
    description: t(dbRow.description, locale),
  };
}

export function localizeRdStat(dbRow: any, locale: Locale) {
  return {
    value: dbRow.value,
    label: t(dbRow.label, locale),
  };
}

export function localizeMilestone(dbRow: any, locale: Locale) {
  return {
    year: dbRow.year,
    content: t(dbRow.content, locale),
  };
}

// ---- About page helpers ----

export function localizeTeamMember(dbRow: any, locale: Locale) {
  return {
    initials: dbRow.initials,
    name: dbRow.name,
    role: t(dbRow.role, locale),
    avatarUrl: dbRow.avatar_url,
  };
}
```

---

## 3. 更新各頁面

### 3.1 通用模式

每個 page.tsx 的改動模式：

**Before (Step 4)**：
```typescript
const dict = await getDictionary(locale);
// 用 dict.xxx 組裝 props
```

**After (Step 6)**：
```typescript
import { fetchSiteSettings, fetchProducts, ... } from '@/lib/cms';
import { localizeHero, localizeProduct, ... } from '@/lib/cms-helpers';
import { getDictionary } from '@/lib/i18n';

// DB fetch
const [settings, products, ...] = await Promise.all([
  fetchSiteSettings(),
  fetchProducts(),
  ...
]);

// Fallback to dict if DB fails
const dict = await getDictionary(locale);

// 組裝 props（優先 DB，fallback dict）
const hero = settings
  ? localizeHero(settings, locale)
  : { /* from dict */ };
```

### 3.2 首頁 `app/[locale]/page.tsx`

```typescript
import {
  fetchSiteSettings,
  fetchProducts,
} from '@/lib/cms';
import {
  localizeHero,
  localizeStats,
  localizeVision,
  localizeFooter,
  localizeProductCard,
} from '@/lib/cms-helpers';

export default async function HomePage({ params }: { params: { locale: Locale } }) {
  const { locale } = params;

  const [settings, dbProducts] = await Promise.all([
    fetchSiteSettings(),
    fetchProducts(),
  ]);

  // Hero
  const hero = settings ? localizeHero(settings, locale) : /* dict fallback */;

  // Product cards
  const productCards = dbProducts.length > 0
    ? dbProducts.map(p => localizeProductCard(p, locale))
    : /* dict fallback */;

  // Stats
  const stats = settings ? localizeStats(settings, locale) : /* dict fallback */;

  // Vision
  const vision = settings ? localizeVision(settings, locale) : /* dict fallback */;

  // 傳入各 section component（props 形狀不變）
  ...
}
```

### 3.3 產品頁 `app/[locale]/products/[slug]/page.tsx`

```typescript
import { fetchProductBySlug, fetchProducts } from '@/lib/cms';
import { localizeProduct } from '@/lib/cms-helpers';

export default async function ProductPage({ params }) {
  const { locale, slug } = params;

  const [dbProduct, allProducts] = await Promise.all([
    fetchProductBySlug(slug),
    fetchProducts(),
  ]);

  const product = dbProduct
    ? localizeProduct(dbProduct, locale)
    : /* fallback from lib/products.ts or dict */;

  const otherProducts = allProducts
    .filter(p => p.slug !== slug)
    .map(p => localizeProduct(p, locale));

  // 傳入 ProductHero / ProductTabs / ProductCTA
  ...
}

export async function generateMetadata({ params }) {
  const dbProduct = await fetchProductBySlug(params.slug);
  if (dbProduct) {
    const localized = localizeProduct(dbProduct, params.locale);
    return {
      title: localized.seo.title,
      description: localized.seo.description,
    };
  }
  // fallback
  ...
}
```

### 3.4 Technology 頁 `app/[locale]/technology/page.tsx`

```typescript
import {
  fetchTechnologyPillars,
  fetchRdStats,
  fetchCertifications,
  fetchMilestones,
} from '@/lib/cms';
import {
  localizePillar,
  localizeRdStat,
  localizeMilestone,
} from '@/lib/cms-helpers';

export default async function TechnologyPage({ params }) {
  const { locale } = params;

  const [pillars, rdStats, certs, milestones] = await Promise.all([
    fetchTechnologyPillars(),
    fetchRdStats(),
    fetchCertifications(),
    fetchMilestones('technology'),
  ]);

  const localizedPillars = pillars.map(p => localizePillar(p, locale));
  const localizedStats = rdStats.map(s => localizeRdStat(s, locale));
  const localizedMilestones = milestones.map(m => localizeMilestone(m, locale));
  const certNames = certs.map(c => c.name);

  // 傳入各 section component
  ...
}
```

### 3.5 About 頁 `app/[locale]/about/page.tsx`

```typescript
import {
  fetchSiteSettings,
  fetchTeamMembers,
  fetchMilestones,
} from '@/lib/cms';
import {
  localizeTeamMember,
  localizeMilestone,
} from '@/lib/cms-helpers';

export default async function AboutPage({ params }) {
  const { locale } = params;

  const [settings, team, milestones] = await Promise.all([
    fetchSiteSettings(),
    fetchTeamMembers(),
    fetchMilestones('about'),
  ]);

  // About 頁的 story / mission / vision 文字也存在 dict 中
  // 若要完全 DB 化，可在 site_settings 加 about JSONB 欄位
  // 目前先保留 dict 作為 about 文字來源，team + milestones 從 DB
  const dict = await getDictionary(locale);

  const localizedTeam = team.map(m => localizeTeamMember(m, locale));
  const localizedMilestones = milestones.map(m => localizeMilestone(m, locale));

  ...
}
```

### 3.6 Contact 頁 `app/[locale]/contact/page.tsx`

```typescript
import { fetchSiteSettings } from '@/lib/cms';
import { localizeContactInfo } from '@/lib/cms-helpers';

export default async function ContactPage({ params }) {
  const { locale } = params;

  const settings = await fetchSiteSettings();
  const dict = await getDictionary(locale);

  const contactInfo = settings
    ? localizeContactInfo(settings, locale)
    : /* dict fallback */;

  // form labels 仍從 dict（UI 文字不存 DB）
  const formStrings = dict.contact.form;

  ...
}
```

### 3.7 Layout — Nav + Footer

Nav 和 Footer 的文字（nav items、footer copyright）：

- **Nav item labels**（產品/技術/關於/聯絡）：保留從 dict，因為是 UI navigation 文字
- **Footer tagline + copyright**：從 site_settings DB 取
- **Brand name**：從 dict 保留（`common.nav.brand`）

在 `app/[locale]/layout.tsx` 中 fetch site_settings 一次，傳給 Nav/Footer：

```typescript
const settings = await fetchSiteSettings();
const dict = await getDictionary(locale);

const footerData = settings ? localizeFooter(settings, locale) : {
  tagline: dict.common.footer.tagline,
  copyright: dict.common.footer.copyright,
};
```

---

## 4. Dictionary 的定位調整

### 保留 dictionaries/ 的角色

| 內容類型 | 資料來源 | 說明 |
|---|---|---|
| CMS 內容（產品、技術、團隊、里程碑、認證、stats） | **Supabase DB** | 可在 Admin UI 編輯 |
| UI 文字（nav labels、tab labels、form labels、button text、breadcrumb） | **dictionaries/ JSON** | 不常變，留在 code |
| SEO metadata | **Supabase DB**（per page seo JSONB） | 可在 Admin 調整 |
| Footer / Vision | **Supabase DB** | 可編輯 |
| Fallback（DB fetch 失敗時） | **dictionaries/ JSON** | Build 不中斷 |

### 可移除的檔案

| 檔案 | 動作 | 原因 |
|---|---|---|
| `lib/products.ts` | **移除** | 產品資料完全由 DB 提供 |
| `lib/i18n/adapters.ts` | **移除或精簡** | 被 `lib/cms-helpers.ts` 取代 |
| `lib/types.ts` | **精簡** | 移除 Product type，保留其他 UI type |

### 不可移除

| 檔案 | 保留原因 |
|---|---|
| `dictionaries/zh.json` | UI 文字 + fallback |
| `dictionaries/en.json` | UI 文字 + fallback |
| `lib/i18n/index.ts` | getDictionary() 仍用於 UI 文字 |
| `lib/i18n/locales.ts` | Locale type + constants |

---

## 5. Type 統一（Optional but recommended）

產生 Supabase 自動 types（如 CC 有 Supabase CLI access）：

```bash
npx supabase gen types typescript --project-id qilsggczoplnzkugzrmg > lib/database.types.ts
```

然後在 `lib/supabase.ts` 中：

```typescript
import type { Database } from './database.types';
export const supabase = createClient<Database>(...);
```

這樣所有 query 結果都有完整 type safety。

如 CC 沒有 Supabase CLI 或 access token，可跳過此步，手動維護 type。

---

## 6. Build & Deploy

```powershell
Remove-Item -Recurse -Force out, .next -ErrorAction SilentlyContinue

$env:NEXT_OUTPUT = "export"
npm run build

# Build log 應顯示 Supabase fetch（如有 console.log）
# 確認 22 static pages 產出

npx wrangler pages deploy out/ --project-name green-energy-center --branch main
```

⚠️ **Build 時需要 Supabase 可達**——確認 `.env.local` 有正確的 URL + anon key。

---

## 7. Commit

```bash
git add -A
git commit -m "feat: Step 6 — build-time CMS fetch from Supabase

- lib/cms.ts: centralized Supabase fetch functions (8 tables)
- lib/cms-helpers.ts: DB row → component props localization
- All pages fetch from Supabase at build time (SSG)
- dictionaries/ retained for UI strings + fallback
- Removed lib/products.ts (data now in DB)
- Removed/simplified lib/i18n/adapters.ts
- Runtime zero DB calls — all data baked into static HTML"

git push origin main
```

---

## 8. 驗證 Checklist

| # | 驗證項目 | 預期 |
|---|---|---|
| 1 | `npm run build` 成功 | 22 static pages，無 Supabase error log |
| 2 | `/zh/` 首頁內容 | 與 Step 4 完全一致（資料來源改了但輸出不變） |
| 3 | `/en/` 首頁內容 | 同上 |
| 4 | `/zh/products/sodium-ion/` | Tabs 全 4 個內容正確 |
| 5 | `/en/products/sodium-ion/` | English 版內容正確 |
| 6 | `/zh/technology/` | 三柱 + stats + certs + timeline 正確 |
| 7 | `/en/technology/` | English 版正確 |
| 8 | `/zh/about/` | Team + milestones 從 DB，story 從 dict |
| 9 | `/en/about/` | 同上 English |
| 10 | `/zh/contact/` | Office info 從 DB，form labels 從 dict |
| 11 | `/en/contact/` | 同上 English |
| 12 | Contact form submit | 仍正常 POST + success |
| 13 | DB 內容修改後 rebuild | 改一筆 DB 資料 → `npm run build` → 確認產出反映新資料 |
| 14 | `lib/products.ts` 已移除 | 檔案不存在 |

---

## 9. 失敗處理

| 狀況 | 處理 |
|---|---|
| Build 報 `NEXT_PUBLIC_SUPABASE_URL is undefined` | 確認 `.env.local` 存在且格式正確 |
| Supabase fetch 回 `[]` 或 `null` | 檢查 RLS policy，用 anon key 在 SQL Editor 測 SELECT |
| Build 成功但頁面空白 | 確認 fallback logic 有 cover DB=null 的情況 |
| Type error 在 cms-helpers.ts | DB row 結構與預期不符，檢查 JSONB 欄位名是否正確（snake_case） |
| Products 順序錯 | 確認 `order('sort_order', { ascending: true })` |
| 22 頁變少 | 確認 `generateStaticParams` 沒被改壞 |
