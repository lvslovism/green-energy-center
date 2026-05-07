# 綠能科技 形象站 SDD v1

> **Status**: Draft v1 · 2026-05-04
> **Owner**: 你（PM/架構）
> **Executor**: Claude Code
> **Stack**: Next.js 14 (App Router, Static Export) + Supabase + Cloudflare Pages

---

## 0. Decisions Log（已確認）

| # | 決策 | 確認值 |
|---|---|---|
| 1 | 站台範圍 | 一個品牌站，三條產品線分頁 |
| 2 | 是否併入 seo-site-network | 否，獨立 repo |
| 3 | 動畫 stack | GSAP + Lenis（free tier） |
| 4 | SplitText 方案 | 自寫 split function（免費） |
| 5 | 多語 | 4 locales: `zh-Hant`(default) / `zh-Hans` / `en` / `ja` |
| 6 | 配色 | `#0A0E14` 石板黑 + `#5EEAD4` 薄荷青 |
| 7 | CMS | Supabase form-based admin |
| 8 | Hero 視覺策略 | A→B→C 三變體，依 scroll 階段切換 |
| 9 | 產品卡視覺策略 | A/B/C 對應三條產品線（語意混搭） |
| 10 | WebGL | 不用 Three.js，純 Canvas 2D + CSS 3D |
| 11 | 字體 | Geist Sans + JetBrains Mono（無 serif） |

---

## 1. Architecture

### 1.1 Stack

| Layer | 選型 | 備註 |
|---|---|---|
| 框架 | Next.js 14（App Router） | `output: 'export'` 靜態匯出 |
| 語言 | TypeScript（strict） | |
| 樣式 | Tailwind CSS | 配合 CSS variables for tokens |
| 動畫 | GSAP 3.12 + ScrollTrigger | Free, MIT |
| Smooth Scroll | Lenis（@studio-freight/lenis） | |
| 字體 | Geist（npm `geist`）+ JetBrains Mono（`next/font/google`） | build-time 下載 self-host |
| DB / Auth / Storage | Supabase（schema: `greentech`） | 不可動 `public` schema |
| Edge | Cloudflare Pages Functions（`functions/`） | 接表單、deploy hook 中繼 |
| 部署 | Cloudflare Pages | branch `main` → 正式 |
| 版控 | GitHub `lvslovism/greentech-image-site` | 獨立 repo |
| 圖片 | Supabase Storage bucket `greentech-assets` | 公開讀 |

### 1.2 Repo 結構

```
greentech-image-site/
├── app/
│   ├── [locale]/
│   │   ├── layout.tsx
│   │   ├── page.tsx                    # 首頁
│   │   ├── products/
│   │   │   └── [slug]/page.tsx         # 產品頁（3 instances）
│   │   ├── technology/page.tsx
│   │   ├── about/page.tsx
│   │   └── contact/page.tsx
│   ├── admin/
│   │   ├── layout.tsx
│   │   ├── login/page.tsx
│   │   ├── page.tsx                    # dashboard
│   │   ├── pages/[slug]/page.tsx       # edit page sections
│   │   ├── products/[slug]/page.tsx    # edit product
│   │   └── settings/page.tsx
│   └── globals.css
├── components/
│   ├── visuals/
│   │   ├── ParticleField.tsx           # Hero variant A
│   │   ├── MeshGrid.tsx                # Hero variant B
│   │   ├── BatteryCell3D.tsx           # Hero variant C
│   │   ├── ProductCardWireframe.tsx    # Card variant A
│   │   ├── ProductCardIsometric.tsx    # Card variant B
│   │   └── ProductCardDataSheet.tsx    # Card variant C
│   ├── motion/
│   │   ├── CustomCursor.tsx
│   │   ├── MagneticButton.tsx
│   │   ├── SplitText.tsx
│   │   ├── Marquee.tsx
│   │   ├── RevealUp.tsx
│   │   └── LenisProvider.tsx
│   ├── layout/
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   └── LocaleSwitcher.tsx
│   └── sections/
│       ├── Hero.tsx
│       ├── ProductMatrix.tsx
│       ├── Stats.tsx
│       ├── Vision.tsx
│       └── ContactCTA.tsx
├── lib/
│   ├── supabase.ts                     # client + server clients
│   ├── cms.ts                          # CMS fetch helpers (build-time)
│   ├── i18n/
│   │   ├── config.ts
│   │   ├── dictionaries/
│   │   │   ├── zh-Hant.json
│   │   │   ├── zh-Hans.json
│   │   │   ├── en.json
│   │   │   └── ja.json
│   │   └── get-dictionary.ts
│   └── section-schemas.ts              # admin form schemas
├── functions/                           # Cloudflare Pages Functions
│   ├── api/contact.ts                  # POST contact form
│   └── api/trigger-rebuild.ts          # Supabase webhook → CF deploy hook
├── public/
│   └── fonts/
│       ├── geist/
│       └── jetbrains-mono/
├── docs/
│   └── CLAUDE.md                       # CC 上下文
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .env.local.example
```

### 1.3 Build / Deploy 流程

```
┌─ Git push to main ─┐         ┌─ Supabase CMS edit ─┐
│                    │         │                     │
└────────┬───────────┘         └──────────┬──────────┘
         │                                │
         │                    Supabase webhook
         │                                │
         ▼                                ▼
   Cloudflare Pages           functions/api/trigger-rebuild
   build trigger              ──────────► CF deploy hook URL
         │                                │
         └──────────┬─────────────────────┘
                    ▼
              npm run build
         (fetches CMS data at build time)
                    │
                    ▼
         Static HTML in /out
                    │
                    ▼
         Cloudflare Pages CDN
```

**關鍵點**：CMS 改完 → Supabase trigger 呼叫 webhook → 觸發 CF deploy → 1-2 分鐘後上線。不走 runtime fetch，保 SEO + 首屏速度。

---

## 2. Information Architecture

### 2.1 Sitemap

```
/                               首頁
├── /products/sodium-ion        鈉離子電池
├── /products/lithium-ion       高密度鋰電
├── /products/supercapacitor    全超電容
├── /technology                 技術原理
├── /about                      關於我們
├── /contact                    聯絡
└── /admin                      （auth-gated）
    ├── /admin/login
    ├── /admin/pages/:slug
    ├── /admin/products/:slug
    └── /admin/settings
```

多語前綴：`/en/...`、`/zh-Hans/...`、`/ja/...`，預設 zh-Hant 不加前綴。

### 2.2 Nav 結構

```
[Logo]  產品 ▾   技術   關於   聯絡   |   EN ▾
        ├ 鈉離子電池
        ├ 高密度鋰電
        └ 全超電容
```

手機版漢堡選單，全屏 overlay。

---

## 3. Pages

### 3.1 Home `/`

| # | Section | 內容 | 視覺特效 |
|---|---|---|---|
| 0 | Loader | 品牌 + 進度條 | 第一次進站 fade-out |
| 1 | Nav | sticky, blur background | mix-blend-difference |
| 2 | Hero | 大標 + eyebrow + 雙 CTA + meta | **Variant A · Particle Field** + split text + magnetic |
| 3 | Marquee | 三產品線中英穿插 | 無限跑馬，hover 暫停 |
| 4 | Tech Brief | 三層創新（材料 / 製程 / 系統）短介紹 | 背景切到 **Variant B · Mesh Grid**（Canvas pinned） |
| 5 | Product Matrix | 三張產品卡 | A/B/C 卡片風格混搭（見 §5.2） |
| 6 | Stats | 三組數字 | counter 動畫 + bento border |
| 7 | Vision | 一段大字 | 進場 split-line reveal |
| 8 | News（optional） | 最新 3 篇 insights | 水平 scroll |
| 9 | Contact CTA | 大標 + magnetic 按鈕 | reveal-up |
| 10 | Footer | metadata + sitemap | static |

### 3.2 Product Page `/products/:slug`

統一模板，內容由 `cms_products` 提供。

| # | Section | 內容 |
|---|---|---|
| 1 | Hero | 產品名 + tagline + key spec | **Variant C · 3D Cell**（每產品有自己的 cell 視覺） |
| 2 | Principle | 技術原理（圖文） | scroll-driven SVG path drawing |
| 3 | Spec Sheet | 完整規格表 | sticky left col + scrollable right |
| 4 | Use Cases | 應用場景（卡片） | 3-4 cards, hover lift |
| 5 | Performance | 圖表（充放電曲線、循環衰退） | recharts，scroll trigger 動畫 |
| 6 | Related | 其他兩條產品線連結 | hover preview |
| 7 | CTA | 取得樣品 / 諮詢 | magnetic button |

### 3.3 Technology `/technology`

| # | Section |
|---|---|
| 1 | Hero with Mesh Grid background |
| 2 | Layer 1: 材料科學 |
| 3 | Layer 2: 製程工藝 |
| 4 | Layer 3: 系統整合 |
| 5 | R&D Pipeline 時間軸 |
| 6 | Patents & Publications |

### 3.4 About `/about`

| # | Section |
|---|---|
| 1 | Hero（公司宣言） |
| 2 | Founders / 創辦團隊 |
| 3 | Timeline（橫向 scroll） |
| 4 | Investors / Partners logos |
| 5 | Office locations + map |

### 3.5 Contact `/contact`

- 表單：name / email / company / 主題 / 訊息
- 提交 → `functions/api/contact.ts` → 寫入 `contact_submissions` + Email notify
- 客戶端 honeypot 防 bot
- Rate limit 5/min/IP via Cloudflare

### 3.6 Admin `/admin`

見 §7.

---

## 4. Visual System

### 4.1 Color Tokens（CSS variables）

```css
:root {
  /* Backgrounds */
  --bg: #0A0E14;
  --bg-soft: #11161E;
  --bg-soft-2: #161C26;

  /* Lines */
  --line: rgba(94, 234, 212, 0.14);
  --line-soft: rgba(229, 233, 240, 0.06);

  /* Text */
  --text: #E5E9F0;
  --muted: #6B7689;

  /* Accent */
  --accent: #5EEAD4;
  --accent-soft: rgba(94, 234, 212, 0.15);
  --accent-glow: rgba(94, 234, 212, 0.4);

  /* States */
  --success: #5EEAD4;
  --warning: #FFB456;
  --error: #FF6B6B;
}
```

### 4.2 Typography

| Role | Font | Weight | Size scale |
|---|---|---|---|
| Display | Geist | 500 | `clamp(2.5rem, 7.5vw, 8rem)` |
| H2 | Geist | 500 | `clamp(1.875rem, 4vw, 3.25rem)` |
| H3 | Geist | 500 | `1.65rem` |
| Body | Geist | 400 | `1rem` / `0.85rem` (small) |
| Mono / Label | JetBrains Mono | 400-500 | `10-12px`, `letter-spacing: 0.25em-0.3em`, uppercase |

字體透過 `geist` npm 套件 + `next/font/google` 在 build 時下載並打包到自身 domain，不走 runtime CDN（無 GDPR 議題、無第三方 cookie）。

### 4.3 Spacing

8px-based scale: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192, 256` (px).

Section padding: `7rem` desktop / `4rem` mobile.

### 4.4 Motion Tokens

```ts
export const motion = {
  ease: {
    out: 'power3.out',
    inOut: 'power2.inOut',
    elastic: 'elastic.out(1, 0.4)',
  },
  duration: {
    micro: 0.25,
    fast: 0.4,
    base: 1.0,
    slow: 1.2,
  },
  scrollStart: 'top 88%',
  lenis: { duration: 1.2 },
};
```

### 4.5 視覺密度規則

- 每個 section header 必有 mono 章節編號（`01 / PRODUCT_MATRIX`）
- 數據區塊以 1px border bento grid 呈現
- 角落座標標記（corner brackets）出現在 hero + 重大 section
- 跑馬燈中英文穿插
- 所有技術數據必有單位 + label，避免裸數字

---

## 5. Interaction & Motion

### 5.1 Hero 視覺策略（scroll-driven 三變體）

```
進站 ━━━━━━━━━━► scroll ━━━━━━━━━━► section 4
   Variant A                           Variant B
   Particle Field                      Mesh Grid
   (welcome)                           (educational)

   [產品頁] ━► Variant C
              3D Cell
              (concrete)
```

實作：
- 首頁 Hero 預設 Variant A
- 滾動到 §4 Tech Brief 時，背景 Canvas swap 成 Variant B（GSAP ScrollTrigger pin 一段時間）
- 產品頁 Hero 直接是 Variant C（CSS 3D rotating cell）

### 5.2 產品卡語意混搭

| 產品 | 卡片風格 | 賣點 |
|---|---|---|
| 鈉離子電池 | **A · Wireframe**（六邊形晶格 + 動態離子） | 材料科學突破 |
| 高密度鋰電 | **B · Isometric**（分層分解圖） | 工程結構突破 |
| 全超電容 | **C · Data Sheet**（規格表 + ASCII） | 性能突破 |

三張卡並排時，視覺差異本身傳達「三線各有所長」。

### 5.3 全站特效清單

| 特效 | 元件 | 觸發 |
|---|---|---|
| Custom cursor | `<CustomCursor />` | 預設啟用，桌機 only |
| Lenis smooth scroll | `<LenisProvider />` | 全站 |
| Magnetic button | `<MagneticButton />` | hover |
| Split text reveal | `<SplitText />` | 進場 + ScrollTrigger |
| Marquee | `<Marquee />` | 持續 |
| Reveal-up | `<RevealUp />` | ScrollTrigger top 88% |
| Counter | section 內 | 進入視窗 once |
| Image clip-path | section 內 | ScrollTrigger |
| Bg color transition | layout level | ScrollTrigger pin |
| Page transition | route change | fade overlay |
| Loading screen | first visit | sessionStorage gate |
| Corner brackets | hero / 大 section | static |
| Mix-blend nav | nav | scroll-aware |

---

## 6. i18n

### 6.1 路由策略

App Router `[locale]` segment:

```
app/[locale]/page.tsx                      → /, /en, /zh-Hans, /ja
app/[locale]/products/[slug]/page.tsx      → /products/sodium-ion, /en/products/...
```

`generateStaticParams` 為每個 locale 產出 build。

`zh-Hant` 為 default，URL 不加前綴（middleware rewrite）。

### 6.2 翻譯來源拆分

| 內容類型 | 存放 | 例 |
|---|---|---|
| **UI strings**（nav、buttons、labels、error） | repo `lib/i18n/dictionaries/*.json` | `nav.products`, `cta.contact_us` |
| **內容**（hero 標題、產品描述、stats 文案） | Supabase `cms_*` JSONB columns | `cms_products.name = { "zh-Hant": "鈉離子電池", "en": "Sodium-Ion" }` |

理由：UI 字串穩定且需開發者維護；內容字串需 PM 隨時改，走 CMS。

### 6.3 Locale 切換 UX

Nav 右上角 `EN ▾` dropdown：
- 列出所有 enabled locales
- 切換時 push 到對應 URL（保留路徑）
- 切換動作淡入動畫
- 用戶選擇存 `localStorage` (`preferred_locale`)，下次進站自動跳轉（首次例外）

### 6.4 字體 fallback

中英不同字體權重表現：
- `zh-Hant` / `zh-Hans` 大標：Geist + 系統中文 fallback（`PingFang TC`, `Microsoft YaHei`）
- `ja` 大標：Geist + `Hiragino Sans`, `Yu Gothic`
- `en` 大標：純 Geist

在 `globals.css` 用 `font-family` chain 處理。

---

## 7. CMS Architecture

### 7.1 Schema 概覽

完整 SQL 見 `greentech-image-site-cms-schema-v1.sql`。

主要表：

| Table | 用途 |
|---|---|
| `greentech.cms_locales` | 啟用的語言列表 |
| `greentech.cms_pages` | 每個頁面的 metadata（title, og）|
| `greentech.cms_sections` | 每個 page 下的 section content（JSONB）|
| `greentech.cms_products` | 三條產品線 |
| `greentech.cms_stats` | 首頁數據區三組數字 |
| `greentech.cms_marquee` | 跑馬燈項目 |
| `greentech.cms_news` | 新聞 / insights（optional）|
| `greentech.cms_site_settings` | 全站設定（footer info, social links）|
| `greentech.contact_submissions` | 聯絡表單收件 |

所有可譯欄位為 JSONB，格式 `{ "zh-Hant": "...", "en": "...", "zh-Hans": "...", "ja": "..." }`.

### 7.2 Section Schemas（admin form 配置）

`lib/section-schemas.ts` 定義每個 `section_key` 的可編輯欄位，admin UI 動態 render form：

```ts
export const SECTION_SCHEMAS = {
  hero: {
    label: 'Hero 區',
    fields: [
      { key: 'eyebrow', type: 'text', i18n: true, label: 'Eyebrow text' },
      { key: 'title_line_1', type: 'text', i18n: true, label: '標題第一行' },
      { key: 'title_line_2', type: 'rich-em', i18n: true, label: '標題第二行（可加 <em>）' },
      { key: 'subtitle', type: 'textarea', i18n: true },
      { key: 'cta_primary_label', type: 'text', i18n: true },
      { key: 'cta_primary_url', type: 'url' },
      { key: 'cta_secondary_label', type: 'text', i18n: true },
      { key: 'cta_secondary_url', type: 'url' },
      { key: 'meta_items', type: 'array', items: {
        label: { type: 'text' }, value: { type: 'text' }
      }},
    ],
  },
  marquee: { ... },
  tech_brief: { ... },
  // ...
};
```

### 7.3 Admin UI Flow

1. `/admin/login` → Supabase email/password
2. 登入後到 `/admin` dashboard：
   - 列出所有 pages
   - 列出所有 products
   - 列出 stats、marquee、site_settings 入口
3. 點 `/admin/pages/home` → 列出該頁所有 sections，每個可展開編輯 form
4. 編輯內容 → 「儲存」→ Supabase upsert → 觸發 deploy hook
5. 顯示 toast：「已儲存，1-2 分鐘後上線」

### 7.4 Auth & RLS

```sql
-- RLS policy 概念
-- public.read on cms_* （anon key SELECT only）
create policy "anon read cms" on greentech.cms_pages for select using (true);
-- write 限 service_role
create policy "service write cms" on greentech.cms_pages for all using (auth.role() = 'service_role');
-- contact_submissions: anon insert only
create policy "anon insert contact" on greentech.contact_submissions for insert with check (true);
```

Admin UI 用 service role key（僅放在 Cloudflare Pages env，前端用 server actions / route handler 中介）。

實際細節在 SQL 檔案內。

### 7.5 Build-time Fetch

`lib/cms.ts`:

```ts
export async function getHomeContent(locale: string) {
  const { data } = await supabaseServer
    .from('cms_sections')
    .select('section_key, content')
    .eq('page_id', HOME_PAGE_ID);
  return data?.reduce((acc, s) => ({
    ...acc,
    [s.section_key]: pickLocale(s.content, locale)
  }), {});
}
```

Pages 的 `generateStaticParams` + 直接 await CMS fetch。建置時讀一次，產出靜態 HTML。

### 7.6 Deploy Hook 觸發

Supabase 內 `cms_*` table 的 `AFTER INSERT/UPDATE/DELETE` trigger → call `pg_net.http_post` 到 Cloudflare deploy hook URL。

```sql
create or replace function trigger_cf_rebuild() returns trigger as $$
begin
  perform net.http_post(
    url := current_setting('app.cf_deploy_hook'),
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := '{"trigger": "cms_update"}'::jsonb
  );
  return new;
end;
$$ language plpgsql security definer;
```

Debounce：60 秒內多次編輯只觸發一次（用 `cms_site_settings.last_rebuild_at` 比較）。

---

## 8. Performance

### 8.1 Targets

| Metric | Target |
|---|---|
| LCP | < 2.0s |
| CLS | < 0.05 |
| INP | < 200ms |
| Lighthouse Performance | > 90（mobile） |
| Bundle JS（initial） | < 200KB gzipped |

### 8.2 策略

- **Hero canvas lazy init**：粒子 / mesh canvas 在 `requestIdleCallback` 後啟動，不阻塞 LCP
- **GSAP / Lenis 動態 import**：第一屏完成後才載入
- **Image strategy**：
  - 產品圖 → Supabase Storage（含 image transform）
  - 走 `next/image` 但 `output: 'export'` 模式下需 loader（用 Cloudflare Image Resizing 或 Supabase transform）
- **字體**：`geist` npm + `next/font/google` 自動 self-host + `font-display: swap`
- **Splash 假象**：第一次 loader 動畫掩蓋實際 hydration 時間，提升感知速度
- **3D Cell variant**：CSS 3D 而非 Three.js，省 ~150KB
- **Reduced motion**：`prefers-reduced-motion` 直接停所有大型動畫

---

## 9. SEO

### 9.1 Meta Tags

每頁 `app/[locale]/.../page.tsx` 用 `generateMetadata`：

```ts
export async function generateMetadata({ params }) {
  const { locale, slug } = params;
  const page = await getPageMeta(slug, locale);
  return {
    title: page.meta_title,
    description: page.meta_description,
    openGraph: { ... },
    alternates: {
      canonical: `https://greentech.tw${path}`,
      languages: {
        'zh-Hant': `https://greentech.tw${pathNoLocale}`,
        'en': `https://greentech.tw/en${pathNoLocale}`,
        // ...
      }
    }
  };
}
```

### 9.2 JSON-LD

- 全站：`Organization` + `WebSite`
- 產品頁：`Product` + `Offer`
- 聯絡頁：`ContactPage`
- About：`AboutPage` + `Organization` 完整

### 9.3 Sitemap & Robots

`app/sitemap.ts` 動態產出，包含所有 locale × page 組合 + `<xhtml:link rel="alternate" hreflang="...">`.

`app/robots.ts`：
- Allow `/`
- Disallow `/admin`

---

## 10. Deployment

### 10.1 Cloudflare Pages

| 設定 | 值 |
|---|---|
| Project name | `greentech-image-site` |
| Production branch | `main` |
| Build command | `npm run build` |
| Build output directory | `out` |
| Node version | 20 |
| Custom domain | TBD（待提供） |
| Deploy hook URL | 建立後存到 Supabase `app.cf_deploy_hook` |

### 10.2 Env Vars

```
# Public（前端可見）
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_SITE_URL=https://greentech.tw

# Server-only（Cloudflare Pages env）
SUPABASE_SERVICE_ROLE_KEY=
CF_DEPLOY_HOOK_URL=
CONTACT_NOTIFY_EMAIL=info@greentech.tw
RESEND_API_KEY=                # 如用 Resend 寄信
```

### 10.3 next.config.mjs 重點

```js
export default {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,           // static export 限制
    // 或用 custom loader 接 Cloudflare Image Resizing
  },
  experimental: {
    typedRoutes: true,
  },
};
```

### 10.4 Pages Functions

```
functions/
├── api/
│   ├── contact.ts             # POST /api/contact
│   └── trigger-rebuild.ts     # 從 Supabase 收 webhook
```

---

## 11. Roadmap（CC Steps）

### Step 1 — Scaffold + Homepage（hardcoded）
- Next.js 14 + Tailwind + TS scaffold
- 字體（`geist` npm + `next/font/google`）
- 全套 motion components（Cursor、Magnetic、SplitText、Marquee、RevealUp、Lenis）
- 三個 hero visual components（Particle / Mesh / 3D Cell）
- 三個 product card components（Wireframe / Isometric / DataSheet）
- 首頁全 section（內容寫死於 `lib/dummy-content.ts`）
- 部署到 CF Pages preview
- **Deliverable**：preview URL，完整視覺與動畫已可運作

### Step 2 — Product Pages
- `/products/[slug]/page.tsx` 模板
- 三個產品 hardcoded 資料
- recharts 圖表
- 部署 preview

### Step 3 — Technology / About / Contact
- 三靜態頁完成
- Contact form `functions/api/contact.ts`

### Step 4 — i18n 全站
- `[locale]` segment + `generateStaticParams`
- Dictionary JSON
- LocaleSwitcher
- 翻譯所有 hardcoded 內容

### Step 5 — Supabase Schema 部署
- 跑 `greentech-image-site-cms-schema-v1.sql`
- Seed 現有 hardcoded 內容到 DB
- RLS 驗證

### Step 6 — Build-time CMS Fetch
- `lib/cms.ts` + `lib/section-schemas.ts`
- 替換 dummy content 為 CMS fetch
- Supabase trigger → CF deploy hook

### Step 7 — Admin UI
- `/admin/login` + Supabase Auth
- Dashboard + form-based editors
- Image upload to Storage

### Step 8 — Polish & Launch
- Lighthouse 全綠
- SEO meta + JSON-LD + sitemap
- DNS 切換正式網域
- GSC 提交

---

## 12. Open Questions（後續確認）

| # | 問題 | 影響 |
|---|---|---|
| 1 | 正式網域是？ | DNS、canonical、sitemap |
| 2 | 公司實際聯絡資訊（地址、電話、email） | Footer / Contact 頁 |
| 3 | 三條產品線的真實規格數字？ | 目前 mockup 為估算值，正式版需真數據 |
| 4 | 投資人 / 合作夥伴 logo | About 頁 |
| 5 | 是否需要 Insights / 部落格區 | 影響是否做 §3.1 §8 |
| 6 | 表單通知收件人 / 收件方式 | Resend? SMTP? Slack? |
| 7 | 是否有現成 brand guidelines（字體、色彩限制）需要遵守 | 可能微調 token |
| 8 | 產品圖片來源 | 自有攝影 / AI 生成 / stock |

這些不阻擋 Step 1-3，可在 Step 4 前回答。

---

## Appendix A. 字體授權檢查

| Font | License | 檢查 |
|---|---|---|
| Geist Sans | SIL Open Font License | ✅ npm 套件可商用 |
| JetBrains Mono | OFL | ✅ |

兩者皆免費可商用。Geist 透過 `geist` npm 套件 build-time 整合；JetBrains Mono 透過 `next/font/google` build-time 下載並打包進 domain（非 runtime 連 Google CDN，避免歐盟 GDPR 議題）。

## Appendix B. 風險清單

| 風險 | 緩解 |
|---|---|
| 動畫過重影響 mobile 效能 | 三個 hero variant 在手機降階為純 SVG / 暗背景 |
| Static export + i18n + dynamic CMS 三者衝突 | 全部 build-time fetch，不走 runtime |
| Supabase trigger 暴露 service role | 走 Cloudflare Pages Function 中繼，不直接讓 DB 連 hook |
| 表單 spam | honeypot + Cloudflare Turnstile |
| 字體閃爍（FOIT/FOUT） | preload + `font-display: swap` + 中文字體 chain |
| 第一次進站 loader 過久 | 進度條最長 1.2s，超時強制 finish |

---

**End of SDD v1.**

下一步請執行：
1. 確認本文件決策
2. 跑 `greentech-image-site-cms-schema-v1.sql` 到 Supabase（先建 schema）
3. 把 `cc-instruction-greentech-step-1-scaffold.md` 餵給 Claude Code
