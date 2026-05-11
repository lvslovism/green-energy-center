# CC Instruction — Green Energy Center Step 4: i18n 全站雙語

> **前置**：先讀 `CLAUDE.md`，確認 Step 3 已完成（commit `facacca`）
> **工作目錄**：`C:\projects\Green Energy Center`
> **目標**：全站中英雙語（zh / en），所有 hardcoded 文字抽到 dictionary
> **部署**：完成後 deploy 到 CF Pages production

---

## 1. 架構設計

### 1.1 URL 結構

```
/zh/                         → 中文首頁（default）
/en/                         → English homepage
/zh/products/sodium-ion/     → 中文產品頁
/en/products/sodium-ion/     → English product page
/zh/technology/              → 中文技術頁
/en/technology/              → English technology page
/zh/about/                   → 中文關於頁
/en/about/                   → English about page
/zh/contact/                 → 中文聯絡頁
/en/contact/                 → English contact page
/                            → 301 redirect to /zh/
```

### 1.2 路由重構

將所有現有頁面移入 `app/[locale]/` segment：

```
app/
  [locale]/
    layout.tsx              ← 根 layout，設定 <html lang={locale}>
    page.tsx                ← 首頁
    products/
      [slug]/
        page.tsx
    technology/
      page.tsx
    about/
      page.tsx
    contact/
      page.tsx
```

原本 `app/page.tsx`、`app/technology/page.tsx` 等全部移進 `app/[locale]/` 下。

`app/layout.tsx`（最外層）保留但精簡為只包 `{children}`，不設 `<html>` tag。`<html lang>` 移到 `app/[locale]/layout.tsx`。

### 1.3 Static Params

`app/[locale]/layout.tsx`：

```typescript
export function generateStaticParams() {
  return [{ locale: 'zh' }, { locale: 'en' }];
}
```

`app/[locale]/products/[slug]/page.tsx`：

```typescript
export function generateStaticParams() {
  return [
    { locale: 'zh', slug: 'sodium-ion' },
    { locale: 'zh', slug: 'lithium-ion' },
    { locale: 'zh', slug: 'supercapacitor' },
    { locale: 'en', slug: 'sodium-ion' },
    { locale: 'en', slug: 'lithium-ion' },
    { locale: 'en', slug: 'supercapacitor' },
  ];
}
```

### 1.4 Dictionary 系統

```
lib/
  i18n/
    index.ts               ← getDictionary(locale) helper
    locales.ts             ← LOCALES constant + type
dictionaries/
  zh.json                  ← 全站中文內容
  en.json                  ← 全站英文內容
```

`lib/i18n/locales.ts`：

```typescript
export const LOCALES = ['zh', 'en'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'zh';
```

`lib/i18n/index.ts`：

```typescript
import type { Locale } from './locales';

const dictionaries = {
  zh: () => import('@/dictionaries/zh.json').then(m => m.default),
  en: () => import('@/dictionaries/en.json').then(m => m.default),
};

export async function getDictionary(locale: Locale) {
  return dictionaries[locale]();
}
```

### 1.5 根路徑 Redirect

在 `public/_worker.js`（如已存在則修改，否則新建）加入：

```javascript
export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Root redirect to default locale
    if (url.pathname === '/' || url.pathname === '') {
      return Response.redirect(new URL('/zh/', url.origin), 301);
    }

    return env.ASSETS.fetch(request);
  },
};
```

⚠️ 如果 `_worker.js` 與 CF Pages Functions（`functions/`）衝突，需要測試。CF Pages 的 `functions/` 優先於 `_worker.js`。如衝突，改用 `app/page.tsx`（root）做 client-side redirect：

```typescript
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
export default function RootRedirect() {
  const router = useRouter();
  useEffect(() => { router.replace('/zh/'); }, [router]);
  return null;
}
```

### 1.6 LocaleSwitcher

替換 Nav 裡目前 disabled 的「EN」按鈕為可運作的 locale switcher。

行為：
- 顯示非當前語言（在中文頁顯示 `EN`，在英文頁顯示 `中`）
- 點擊切換到同頁面的另一語言版本
- 用 `usePathname()` 取得當前路由，替換 locale segment

```typescript
// 範例邏輯
const pathname = usePathname(); // e.g. "/zh/products/sodium-ion"
const targetLocale = currentLocale === 'zh' ? 'en' : 'zh';
const targetPath = pathname.replace(`/${currentLocale}`, `/${targetLocale}`);
// → "/en/products/sodium-ion"
```

---

## 2. Dictionary 內容

### 2.1 JSON 結構

```json
{
  "common": { "nav": {}, "footer": {}, "cta": {} },
  "home": { "hero": {}, "products": {}, "stats": {}, "vision": {} },
  "products": { "sodium-ion": {}, "lithium-ion": {}, "supercapacitor": {}, "shared": {} },
  "technology": {},
  "about": {},
  "contact": {}
}
```

### 2.2 Common（Nav / Footer / CTA）

| Key path | 中文 | English |
|---|---|---|
| `common.nav.products` | 產品 | Products |
| `common.nav.technology` | 技術 | Technology |
| `common.nav.about` | 關於 | About |
| `common.nav.contact` | 聯絡 | Contact |
| `common.nav.brand` | 綠能科技 | Green Energy |
| `common.footer.tagline` | 一起重新定義能量。 | Redefining energy, together. |
| `common.footer.copyright` | © 2025 綠能科技股份有限公司 | © 2025 Green Energy Technology Co., Ltd. |
| `common.cta.contact_us` | 聯繫我們 → | Contact us → |
| `common.cta.view_specs` | VIEW SPECS → | VIEW SPECS → |
| `common.cta.inquiry_title` | 需要技術規格書或報價？ | Need a datasheet or quote? |
| `common.cta.inquiry_desc` | 儲能方案團隊 24 小時內回覆。 | Our energy solutions team will respond within 24 hours. |

### 2.3 Homepage

| Key path | 中文 | English |
|---|---|---|
| `home.hero.title_1` | 儲存能量的 | Store every |
| `home.hero.title_2` | 每一種 | possible form |
| `home.hero.title_accent` | 可能 | of energy |
| `home.hero.subtitle` | 從鈉離子到全超電容，為下一代儲能系統而生。 | From sodium-ion to supercapacitors — built for next-generation energy storage. |
| `home.hero.switcher.a` | A PARTICLES | A PARTICLES |
| `home.hero.switcher.b` | B MESH GRID | B MESH GRID |
| `home.hero.switcher.c` | C 3D CELL | C 3D CELL |
| `home.products.label` | 02 / PRODUCTS | 02 / PRODUCTS |
| `home.products.title` | 三條產品線，一個能量未來。 | Three product lines. One energy future. |
| `home.products.sodium.name` | 鈉離子電池 | Sodium-ion cell |
| `home.products.sodium.desc` | 原料豐沛、低溫穩定、循環次數突破 6,000 次。 | Abundant raw materials, low-temp stability, 6,000+ cycle life. |
| `home.products.lithium.name` | 高能量密度鋰電池 | High-energy lithium-ion |
| `home.products.lithium.desc` | 340 Wh/kg 級高鎳體系，能量密度與安全性雙重突破。 | 340 Wh/kg high-nickel system — breakthrough in energy density and safety. |
| `home.products.supercap.name` | 全超電容 | Supercapacitor |
| `home.products.supercap.desc` | 秒級充放電、百萬次循環，承擔尖峰功率與能量回收。 | Sub-second charge/discharge, 1M+ cycles — peak power and energy recovery. |
| `home.stats.label` | 03 / DATA | 03 / DATA |
| `home.stats.title` | 數據驗證，不靠口號。 | Data-driven, not marketing-driven. |
| `home.stats.energy_density` | 能量密度 | Energy density |
| `home.stats.cycle_life` | 循環壽命 | Cycle life |
| `home.stats.efficiency` | 能源效率 | Efficiency |
| `home.stats.response` | 響應速度 | Response time |
| `home.vision.label` | 04 / VISION | 04 / VISION |
| `home.vision.title` | 讓每一度電都能被妥善保存 | Every watt-hour, stored with care |
| `home.vision.desc` | 我們相信，下一代儲能技術不該只是鋰電池的改良——而是從材料根本出發的全新解法。 | We believe the next generation of energy storage shouldn't just improve lithium batteries — it should start from fundamentally new materials. |

### 2.4 Product Pages

每個產品的翻譯分兩部分：(A) 固定結構文字 (B) 產品資料。

**(A) 共用結構文字**（`products.shared`）：

| Key | 中文 | English |
|---|---|---|
| `breadcrumb.home` | 首頁 | HOME |
| `breadcrumb.products` | 產品 | PRODUCTS |
| `tabs.specs` | 規格 | Specs |
| `tabs.performance` | 效能對比 | Performance |
| `tabs.applications` | 應用場景 | Use cases |
| `tabs.documents` | 文件下載 | Documents |
| `specs_title` | 詳細規格 | Specifications |
| `performance_title` | 效能對比 | Performance comparison |
| `applications_title` | 應用場景 | Use cases |
| `documents_title` | 文件下載 | Documents |
| `download` | 下載 | DOWNLOAD |
| `ours_label` | OURS | OURS |
| `market_label` | Market avg | Market avg |
| `lower_better` | (LOWER = BETTER) | (LOWER = BETTER) |

**(B) 鈉離子電池**（`products.sodium-ion`）：

| Key | 中文 | English |
|---|---|---|
| `name` | 鈉離子電池 | Sodium-ion cell |
| `name_en` | Sodium-ion cell | Sodium-ion cell |
| `tagline` | 原料豐沛、低溫穩定、循環次數突破 6,000 次。為儲能電廠與商用車隊提供可規模化的鋰電替代方案。 | Abundant raw materials, low-temperature stability, and over 6,000 charge cycles. A scalable alternative to lithium for grid storage and commercial fleets. |
| `status` | MASS PRODUCTION | MASS PRODUCTION |
| `grade` | ESS GRADE | ESS GRADE |
| `usecases[0].title` | 電網級儲能 | Grid-scale storage |
| `usecases[0].desc` | MW 級儲能電站，削峰填谷、頻率調節。成本較鋰鐵磷低 30%。 | MW-class storage plants for peak shaving and frequency regulation. 30% lower cost than LFP. |
| `usecases[1].title` | 商用車隊 | Commercial fleets |
| `usecases[1].desc` | 城市配送車、公車電池模組。低溫啟動優勢適合寒帶市場。 | Urban delivery vehicles and buses. Cold-start advantage for arctic markets. |
| `usecases[2].title` | 離網太陽能 | Off-grid solar |
| `usecases[2].desc` | 搭配光伏的戶用/工業儲能。15 年免維護降低 TCO。 | Residential/industrial storage paired with PV. 15-year maintenance-free TCO. |
| `usecases[3].title` | 通訊基站 | Telecom towers |
| `usecases[3].desc` | 5G 基站 UPS。寬溫域運作，減少散熱成本。 | 5G base station UPS. Wide temperature range reduces cooling costs. |
| `documents[0].name` | Product datasheet | Product datasheet |
| `documents[1].name` | UN38.3 test report | UN38.3 test report |
| `documents[2].name` | MSDS / SDS | MSDS / SDS |
| `documents[3].name` | 3D CAD model (STEP) | 3D CAD model (STEP) |

**(B) 高能量密度鋰電池**（`products.lithium-ion`）：

| Key | 中文 | English |
|---|---|---|
| `name` | 高能量密度鋰電池 | High-energy lithium-ion |
| `name_en` | Lithium-ion high-nickel | Lithium-ion high-nickel |
| `tagline` | 340 Wh/kg 級高鎳體系，搭配自研複合電解質，能量密度與安全性雙重突破。為電動車、航太與消費電子而生。 | 340 Wh/kg high-nickel system with proprietary composite electrolyte — a dual breakthrough in energy density and safety. Built for EVs, aerospace, and consumer electronics. |
| `status` | PILOT | PILOT |
| `grade` | EV GRADE | EV GRADE |
| `usecases[0].title` | 電動車動力 | EV powertrains |
| `usecases[0].desc` | 乘用車與商用車動力電池。340 Wh/kg 延長續航，快充 15 分鐘達 80%。 | Passenger and commercial EV battery packs. 340 Wh/kg extends range; 15-min fast charge to 80%. |
| `usecases[1].title` | 航太電源 | Aerospace power |
| `usecases[1].desc` | 無人機、低軌衛星輔助電源。極致能量密度降低酬載負擔。 | Drones and LEO satellite auxiliary power. Maximum energy density reduces payload burden. |
| `usecases[2].title` | 消費電子 | Consumer electronics |
| `usecases[2].desc` | 筆電、穿戴裝置。輕量化設計讓設備更薄更持久。 | Laptops and wearables. Lightweight design for thinner, longer-lasting devices. |
| `usecases[3].title` | 醫療設備 | Medical devices |
| `usecases[3].desc` | 攜帶式醫療器材。高安全性通過 IEC 62660 驗證。 | Portable medical equipment. High safety validated by IEC 62660 certification. |
| `documents[0].name` | Product datasheet | Product datasheet |
| `documents[1].name` | IEC 62660 report | IEC 62660 report |
| `documents[2].name` | MSDS / SDS | MSDS / SDS |
| `documents[3].name` | 3D CAD model (STEP) | 3D CAD model (STEP) |

**(B) 全超電容**（`products.supercapacitor`）：

| Key | 中文 | English |
|---|---|---|
| `name` | 全超電容 | Supercapacitor |
| `name_en` | Supercapacitor | Supercapacitor |
| `tagline` | 秒級充放電、百萬次循環。搭配電池形成混合儲能系統，承擔尖峰功率輸出與煞車能量回收。 | Sub-second charge/discharge, one million+ cycles. Paired with batteries in hybrid storage systems for peak power and regenerative braking. |
| `status` | SHIPPING | SHIPPING |
| `grade` | INDUSTRIAL | INDUSTRIAL |
| `usecases[0].title` | 煞車能量回收 | Regenerative braking |
| `usecases[0].desc` | 軌道交通與電動巴士煞車能量即時回收再利用。 | Real-time energy recovery and reuse for rail transit and electric buses. |
| `usecases[1].title` | 電網頻率調節 | Grid frequency regulation |
| `usecases[1].desc` | 毫秒級響應，穩定電網頻率波動。 | Millisecond response to stabilize grid frequency fluctuations. |
| `usecases[2].title` | UPS 不斷電 | UPS backup |
| `usecases[2].desc` | 資料中心與關鍵設施瞬時備援。百萬次循環無需更換。 | Instant backup for data centers and critical facilities. 1M+ cycles, no replacement. |
| `usecases[3].title` | 港口起重機 | Port cranes |
| `usecases[3].desc` | 橋式起重機下降動能回收。降低柴油消耗 40%。 | Gantry crane lowering energy recovery. Reduces diesel consumption by 40%. |
| `documents[0].name` | Product datasheet | Product datasheet |
| `documents[1].name` | AEC-Q200 report | AEC-Q200 report |
| `documents[2].name` | MSDS / SDS | MSDS / SDS |
| `documents[3].name` | Application note | Application note |

### 2.5 Technology Page

| Key | 中文 | English |
|---|---|---|
| `pillars.label` | 01 / CORE TECHNOLOGY | 01 / CORE TECHNOLOGY |
| `pillars.title` | 三層技術架構 | Three-layer technology architecture |
| `pillars.subtitle` | 從材料分子設計到系統級能源管理，每一層都是自主研發。 | From molecular material design to system-level energy management — every layer is self-developed. |
| `pillars.materials.title` | 材料科學 | Materials science |
| `pillars.materials.desc` | 自研正極材料與電解質配方。鈉電正極採用層狀氧化物體系，高鎳鋰電搭配複合固態電解質。 | Proprietary cathode materials and electrolyte formulations. Sodium-ion uses layered oxide cathode; high-nickel Li-ion pairs with composite solid electrolyte. |
| `pillars.process.title` | 製程工程 | Process engineering |
| `pillars.process.desc` | 乾法電極塗佈技術，良率 98.5%。單線日產能 2 GWh，製程耗水量較傳統降低 70%。 | Dry electrode coating technology with 98.5% yield. Single-line daily capacity of 2 GWh; 70% reduction in water usage vs. conventional. |
| `pillars.systems.title` | 系統整合 | Systems integration |
| `pillars.systems.desc` | 自研 BMS 晶片 + 雲端能源管理平台。支援鈉電 / 鋰電 / 超電容混合架構，AI 預測性維護。 | Proprietary BMS chip + cloud energy management platform. Supports Na-ion / Li-ion / supercap hybrid architecture with AI predictive maintenance. |
| `rd.label` | 02 / R&D | 02 / R&D |
| `rd.title` | 研發實力 | R&D capabilities |
| `rd.patents` | Patents | Patents |
| `rd.engineers` | R&D Engineers | R&D Engineers |
| `rd.revenue` | Revenue to R&D | Revenue to R&D |
| `rd.labs` | Research Labs | Research Labs |
| `roadmap.label` | 03 / ROADMAP | 03 / ROADMAP |
| `roadmap.title` | 技術里程碑 | Technology roadmap |
| `roadmap.items[0].year` | 2024 Q4 | 2024 Q4 |
| `roadmap.items[0].text` | 鈉離子電池量產線投產（Phase 1: 2 GWh） | Sodium-ion mass production line commissioned (Phase 1: 2 GWh) |
| `roadmap.items[1].year` | 2025 Q2 | 2025 Q2 |
| `roadmap.items[1].text` | 高鎳鋰電池 340 Wh/kg pilot line 驗證完成 | High-nickel Li-ion 340 Wh/kg pilot line validation completed |
| `roadmap.items[2].year` | 2025 Q4 | 2025 Q4 |
| `roadmap.items[2].text` | 超電容模組通過車規 AEC-Q200 認證 | Supercapacitor module passes automotive AEC-Q200 certification |
| `roadmap.items[3].year` | 2026 Q2 | 2026 Q2 |
| `roadmap.items[3].text` | 混合儲能系統（鈉電 + 超電容）首個 MW 級案場交付 | Hybrid storage system (Na-ion + supercap) first MW-scale site delivered |

### 2.6 About Page

| Key | 中文 | English |
|---|---|---|
| `story.label` | 01 / OUR STORY | 01 / OUR STORY |
| `story.title` | 重新定義儲能的可能 | Redefining what energy storage can be |
| `story.p1` | 綠能科技成立於 2021 年，由一群來自電化學、材料科學與能源系統的研究者創辦。我們相信，下一代儲能技術不該只是鋰電池的改良，而是從材料根本出發的全新解法。 | Green Energy Technology was founded in 2021 by a team of researchers in electrochemistry, materials science, and energy systems. We believe the next generation of energy storage shouldn't just improve lithium batteries — it should start from fundamentally new materials. |
| `story.p2_before` | 從台北實驗室的第一顆鈉離子原型電芯，到今天三條產品線、兩座量產基地，我們始終聚焦一件事： | From the first sodium-ion prototype cell in our Taipei lab to three product lines and two production facilities, we've stayed focused on one thing: |
| `story.p2_accent` | 讓每一度電都能被妥善保存。 | storing every watt-hour with care. |
| `mission.label` | 02 / MISSION | 02 / MISSION |
| `mission.title` | 使命與願景 | Mission & vision |
| `mission.mission_label` | MISSION | MISSION |
| `mission.mission_text` | 以材料創新驅動儲能成本持續下降，加速全球能源轉型。 | Drive down energy storage costs through materials innovation, accelerating the global energy transition. |
| `mission.vision_label` | VISION | VISION |
| `mission.vision_text` | 2030 年前成為亞太區鈉離子儲能系統市佔率第一的技術供應商。 | Become the #1 sodium-ion energy storage technology provider in Asia-Pacific by 2030. |
| `team.label` | 03 / TEAM | 03 / TEAM |
| `team.title` | 核心團隊 | Core team |
| `team.note` | 團隊成員照片與完整介紹將於正式上線前更新 | Team member photos and full bios will be updated before launch |
| `team.members[0].name` | Chen Li | Chen Li |
| `team.members[0].role` | CEO / Co-founder | CEO / Co-founder |
| `team.members[1].name` | Wang Hao | Wang Hao |
| `team.members[1].role` | CTO | CTO |
| `team.members[2].name` | Lin Yu | Lin Yu |
| `team.members[2].role` | VP Materials | VP Materials |
| `team.members[3].name` | Zhang Wei | Zhang Wei |
| `team.members[3].role` | VP Engineering | VP Engineering |
| `milestones.label` | 04 / MILESTONES | 04 / MILESTONES |
| `milestones.title` | 發展歷程 | Milestones |
| `milestones.items[0].year` | 2021 | 2021 |
| `milestones.items[0].text` | 台北實驗室成立，完成首顆鈉離子原型電芯 | Taipei lab established; first sodium-ion prototype cell completed |
| `milestones.items[1].year` | 2022 | 2022 |
| `milestones.items[1].text` | Pre-A 輪融資完成，啟動中試線建設 | Pre-Series A funding closed; pilot production line construction began |
| `milestones.items[2].year` | 2023 | 2023 |
| `milestones.items[2].text` | 超電容產品線量產出貨，首批客戶交付 | Supercapacitor line enters mass production; first customer deliveries |
| `milestones.items[3].year` | 2024 | 2024 |
| `milestones.items[3].text` | 鈉電量產線投產（2 GWh），取得 ISO 9001 / 14001 | Na-ion production line commissioned (2 GWh); ISO 9001/14001 certified |
| `milestones.items[4].year` | 2025 | 2025 |
| `milestones.items[4].text` | 高鎳鋰電池進入 pilot 階段，團隊擴展至 200+ 人 | High-nickel Li-ion enters pilot phase; team grows to 200+ |

### 2.7 Contact Page

| Key | 中文 | English |
|---|---|---|
| `label` | 01 / GET IN TOUCH | 01 / GET IN TOUCH |
| `title` | 聯繫我們 | Contact us |
| `subtitle` | 產品諮詢、合作洽談或技術支援，我們的團隊將在 24 小時內回覆。 | Product inquiries, partnerships, or technical support — our team will respond within 24 hours. |
| `form.name_label` | 姓名 * | Name * |
| `form.name_placeholder` | Your name | Your name |
| `form.email_label` | Email * | Email * |
| `form.email_placeholder` | email@company.com | email@company.com |
| `form.company_label` | 公司名稱 | Company |
| `form.company_placeholder` | Company name | Company name |
| `form.product_label` | 感興趣的產品 | Product interest |
| `form.product_default` | 請選擇產品線 | Select a product line |
| `form.product_options[0]` | 鈉離子電池 | Sodium-ion cell |
| `form.product_options[1]` | 高能量密度鋰電池 | High-energy lithium-ion |
| `form.product_options[2]` | 全超電容 | Supercapacitor |
| `form.product_options[3]` | 混合儲能系統 | Hybrid storage system |
| `form.product_options[4]` | 其他 | Other |
| `form.message_label` | 訊息 * | Message * |
| `form.message_placeholder` | Tell us about your project or requirements... | Tell us about your project or requirements... |
| `form.submit` | 送出詢問 → | Submit inquiry → |
| `form.submitting` | 送出中… | Submitting… |
| `form.success_title` | 感謝您的詢問 | Thank you for your inquiry |
| `form.success_desc` | 我們將在 24 小時內回覆。 | We will get back to you within 24 hours. |
| `form.success_reset` | 再送一筆 | Send another |
| `form.error` | 送出失敗，請稍後再試。 | Submission failed. Please try again. |
| `info.office_label` | OFFICE | OFFICE |
| `info.office_value` | 台北市信義區松仁路 100 號 15F | 15F, No. 100, Songren Rd, Xinyi Dist, Taipei |
| `info.email_label` | EMAIL | EMAIL |
| `info.email_value` | info@greentech.tw | info@greentech.tw |
| `info.phone_label` | PHONE | PHONE |
| `info.phone_value` | +886 2 2720-XXXX | +886 2 2720-XXXX |
| `info.hours_label` | HOURS | HOURS |
| `info.hours_value` | Mon - Fri, 09:00 - 18:00 (GMT+8) | Mon - Fri, 09:00 - 18:00 (GMT+8) |

### 2.8 SEO Metadata

| Page | 中文 title | English title | 中文 description | English description |
|---|---|---|---|---|
| Home | 綠能科技 — 儲存能量的每一種可能 | Green Energy — Store every possible form of energy | 鈉離子電池、高能量密度鋰電池、全超電容。從材料到系統的全方位儲能方案。 | Sodium-ion cells, high-energy lithium-ion, supercapacitors. Full-stack energy storage from materials to systems. |
| Product (per product) | {productName} \| 綠能科技 | {productName} \| Green Energy | {tagline} | {tagline} |
| Technology | 技術實力 \| 綠能科技 | Technology \| Green Energy | 從材料科學到系統整合，綠能科技的三層自主研發技術架構。 | From materials science to systems integration — our three-layer self-developed technology architecture. |
| About | 關於我們 \| 綠能科技 | About us \| Green Energy | 綠能科技的故事、使命與核心團隊。 | The story, mission, and core team behind Green Energy Technology. |
| Contact | 聯繫我們 \| 綠能科技 | Contact us \| Green Energy | 聯繫綠能科技團隊，諮詢儲能方案。 | Contact our team for energy storage solutions. |

---

## 3. 元件改造要點

所有元件需接受 `dictionary` 或其子集作為 props。大致流程：

1. Page `page.tsx` 呼叫 `getDictionary(locale)` 取得完整 dict
2. 將對應 section 的 dict 片段傳入各 component
3. Component 內用 `dict.xxx` 取代 hardcoded 文字

Client Components（Nav、ProductTabs、ContactForm）需要從 Server 傳入翻譯文字作為 props，不可在 client 端 import dictionary（會破壞 tree-shaking）。

---

## 4. Build & Deploy

```powershell
Remove-Item -Recurse -Force out, .next -ErrorAction SilentlyContinue

$env:NEXT_OUTPUT = "export"
npm run build

# 確認產出（頁數應從 11 增至 22+）
# out/zh/index.html
# out/en/index.html
# out/zh/products/sodium-ion/index.html
# out/en/products/sodium-ion/index.html
# ... etc

npx wrangler pages deploy out/ --project-name green-energy-center --branch main
```

---

## 5. Commit

```bash
git add -A
git commit -m "feat: Step 4 — i18n full site zh/en

- Route restructure: all pages under [locale]/ segment
- Dictionary system: dictionaries/zh.json + dictionaries/en.json
- getDictionary(locale) async loader with tree-shaking
- LocaleSwitcher replaces disabled EN button in Nav
- Root / redirects to /zh/ via _worker.js or client redirect
- All 7 pages fully translated (homepage, 3 products, technology, about, contact)
- SEO metadata per locale
- Static pages: 11 → 22 (zh + en)"

git push origin main
```

---

## 6. 驗證 Checklist

| # | 驗證項目 | 預期 |
|---|---|---|
| 1 | `/zh/` 首頁中文 | 200 OK，所有文字中文 |
| 2 | `/en/` 首頁英文 | 200 OK，所有文字英文 |
| 3 | `/` root redirect | 301 → `/zh/` |
| 4 | `/zh/products/sodium-ion/` | 200，中文 Tab 內容 |
| 5 | `/en/products/sodium-ion/` | 200，English Tab 內容 |
| 6 | `/zh/technology/` + `/en/technology/` | 200，內容語言正確 |
| 7 | `/zh/about/` + `/en/about/` | 200，內容語言正確 |
| 8 | `/zh/contact/` + `/en/contact/` | 200，表單 label 語言正確 |
| 9 | LocaleSwitcher | 點擊切換語言，URL 切換到同頁不同 locale |
| 10 | `<html lang="zh">` / `<html lang="en">` | 檢查 page source，lang 屬性正確 |
| 11 | Contact form POST | 兩個語言版本都能 submit + 顯示 success |
| 12 | `npm run build` 無錯誤 | exit code 0，22+ static pages |

---

## 7. 失敗處理

| 狀況 | 處理 |
|---|---|
| `_worker.js` 與 `functions/` 衝突 | 改用 `app/page.tsx` client-side redirect（見 §1.5） |
| generateStaticParams 報錯 | 確認 `[locale]/products/[slug]/page.tsx` 的 params 包含 locale + slug |
| Dictionary import 報錯 | 確認 `dictionaries/` 在專案根目錄，tsconfig paths 含 `@/dictionaries/*` |
| Build 後頁數不對 | `ls out/zh/ out/en/` 確認兩邊結構對稱 |
| LocaleSwitcher 跳到 404 | 確認 pathname replace 邏輯正確處理 trailing slash |
| typedRoutes 與動態 locale 衝突 | 所有 `<Link href>` 使用 `as Route` cast |
