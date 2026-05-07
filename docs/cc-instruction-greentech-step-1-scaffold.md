# CC Instruction · greentech-image-site · Step 1
## Scaffold + Homepage（hardcoded content）

> **執行前必讀**：
> - 主 SDD：`greentech-image-site-sdd-v1.md`（架構、IA、視覺系統定義）
> - 視覺參考：`greentech-hero-mockup-v2-tech.html`（所有特效的可運作版本）
> - 本指令範圍：**只做 Scaffold + 首頁**。產品頁、技術頁、i18n、CMS 都是後續 Step。
> - 如有任何架構不確定，**停下來問**，不要自行決定。

---

## 0. 任務範圍（Step 1 only）

✅ **要做**：
1. Next.js 14 App Router + TypeScript + Tailwind 專案建立
2. Geist Sans + JetBrains Mono 自託管
3. 全套 motion components（Cursor / Magnetic / SplitText / Marquee / RevealUp / LenisProvider）
4. 三個 hero visual：`ParticleField` / `MeshGrid` / `BatteryCell3D`
5. 三個產品卡：`ProductCardWireframe` / `ProductCardIsometric` / `ProductCardDataSheet`
6. 首頁 `/` 完整組裝，內容寫死於 `lib/dummy-content.ts`
7. Cloudflare Pages 部署到 preview branch
8. 提交 PR 到 `main`

❌ **不要做**：
- 不做產品頁 `/products/...`
- 不接 Supabase（這 step 全 hardcoded）
- 不做 i18n routing（先全繁中即可）
- 不做 admin
- 不做 SEO meta（Step 8 一起處理）

---

## 1. Pre-flight Checks

執行前確認：

```bash
node --version    # 應為 v20.x
npm --version     # 應為 v10+
git --version
```

確認當前目錄為 `C:\projects\Green Energy Center`（含空格，內應已有 `docs/` 子資料夾與四份文件）。

確認 Cloudflare 帳號設定（之前 SEO 站群的環境變數可重用）：
```bash
echo $env:CLOUDFLARE_API_TOKEN     # 不可為空
echo $env:CLOUDFLARE_ACCOUNT_ID    # e3193fd95e1cbec497aed80bcc07b191
```

---

## 2. Scaffold Next.js Project

工作目錄：`C:\projects\Green Energy Center\`（內已有 `docs/` 子資料夾，**不可刪除**）

由於 `create-next-app` 預設不接受非空資料夾，先 scaffold 到 temp 子資料夾，再把檔案搬到 root：

```powershell
cd "C:\projects\Green Energy Center"

# 0. 安全檢查：確認 docs/ 存在且四份文件齊全
if (-not (Test-Path docs)) { throw "docs/ folder missing — abort" }
$required = @(
  "docs\greentech-image-site-sdd-v1.md",
  "docs\greentech-image-site-cms-schema-v1.sql",
  "docs\cc-instruction-greentech-step-1-scaffold.md",
  "docs\greentech-hero-mockup-v2-tech.html"
)
foreach ($f in $required) {
  if (-not (Test-Path $f)) { throw "Missing required doc: $f" }
}

# 1. Scaffold 到 temp 子資料夾
npx create-next-app@14 _scaffold_tmp --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-npm

# 2. 把 temp 內所有檔案（包含 .gitignore 等隱藏檔）搬到當前目錄
Get-ChildItem _scaffold_tmp -Force | ForEach-Object {
  Move-Item $_.FullName . -Force
}
Remove-Item _scaffold_tmp -Force -ErrorAction SilentlyContinue

# 3. 初始化 git
git init
git add .
git commit -m "init: Next.js 14 scaffold"
```

**create-next-app 互動式問題的回答**（如果跳出來）：
- TypeScript: **Yes**
- ESLint: **Yes**
- Tailwind CSS: **Yes**
- `src/` directory: **No**
- App Router: **Yes**
- Customize default import alias: `@/*`

---

## 3. Install Dependencies

```bash
npm install gsap @studio-freight/lenis geist
npm install -D @types/node
```

確認 `package.json` 中：
- Next.js `^14.x`
- GSAP `^3.12`
- `geist`（Vercel 官方字體 npm 套件，免下載 woff2）

---

## 4. 配置 Tailwind + Tokens

### 4.1 替換 `tailwind.config.ts`

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-soft": "var(--bg-soft)",
        "bg-soft-2": "var(--bg-soft-2)",
        line: "var(--line)",
        "line-soft": "var(--line-soft)",
        text: "var(--text)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        "accent-glow": "var(--accent-glow)",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
```

### 4.2 替換 `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --bg: #0A0E14;
  --bg-soft: #11161E;
  --bg-soft-2: #161C26;
  --line: rgba(94, 234, 212, 0.14);
  --line-soft: rgba(229, 233, 240, 0.06);
  --text: #E5E9F0;
  --muted: #6B7689;
  --accent: #5EEAD4;
  --accent-soft: rgba(94, 234, 212, 0.15);
  --accent-glow: rgba(94, 234, 212, 0.4);
}

* { box-sizing: border-box; }

@media (min-width: 769px) {
  *, *::before, *::after { cursor: none !important; }
}

html, body {
  margin: 0; padding: 0;
  background: var(--bg);
  color: var(--text);
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
  font-feature-settings: "ss01", "cv11";
}

::selection { background: var(--accent); color: var(--bg); }

body::before {
  content: '';
  position: fixed; inset: 0;
  background-image:
    linear-gradient(var(--line-soft) 1px, transparent 1px),
    linear-gradient(90deg, var(--line-soft) 1px, transparent 1px);
  background-size: 80px 80px;
  pointer-events: none;
  z-index: 1;
  mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse at center, black 30%, transparent 80%);
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### 4.3 `next.config.mjs`

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  experimental: { typedRoutes: true },
};

export default nextConfig;
```

### 4.4 環境變數檔（重要）

CC 必須建立兩個檔案：

#### 4.4.1 `.env.local.example`（committed 到 git）

```bash
# =====================================================
# greentech-image-site environment variables
# 複製此檔為 .env.local 並填入實際值
# =====================================================

# --- Site ---
NEXT_PUBLIC_SITE_URL=https://greentech.tw

# --- Supabase ---
# 從 Supabase Dashboard > Project Settings > API 取得
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
# Service role key 僅在 server side 使用，絕對不可進前端 bundle
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# --- Cloudflare ---
# Pages > 專案 > Settings > Builds & deployments > Deploy hooks 建立後取得
CF_DEPLOY_HOOK_URL=https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/...
# Account ID 已在 SEO 站群環境設好，可重用
CLOUDFLARE_ACCOUNT_ID=e3193fd95e1cbec497aed80bcc07b191
CLOUDFLARE_API_TOKEN=

# --- Contact form ---
CONTACT_NOTIFY_EMAIL=info@greentech.tw
# Email 寄信服務（Step 7 才會用，先留空）
RESEND_API_KEY=

# --- Admin（Step 7 才會用）---
# 第一個 admin 帳號 email（建立時用）
INITIAL_ADMIN_EMAIL=

# --- Cloudflare Turnstile（Step 7 表單防 bot）---
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

#### 4.4.2 `.env.local`（gitignored，CC 建立空殼供 PM 填）

```bash
# 從 .env.local.example 複製而來
# PM 需填入實際值後重啟 dev server
NEXT_PUBLIC_SITE_URL=
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CF_DEPLOY_HOOK_URL=
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
CONTACT_NOTIFY_EMAIL=
RESEND_API_KEY=
INITIAL_ADMIN_EMAIL=
NEXT_PUBLIC_TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
```

#### 4.4.3 確認 `.gitignore`

`create-next-app` 已包含，但 CC 必須驗證以下這幾行存在：

```
.env*.local
.env.local
.env
!.env.local.example
```

如果不存在，加上去再 commit。

#### 4.4.4 Step 1 範圍內 PM 只需填這幾個

Step 1 是純 scaffold + hardcoded 首頁，**不需要** Supabase 也能跑。Step 1 內 PM 只需填：

```
NEXT_PUBLIC_SITE_URL=https://greentech.tw  （或 preview URL）
CLOUDFLARE_API_TOKEN=...                    （CC 部署用）
CLOUDFLARE_ACCOUNT_ID=e3193fd95e1cbec497aed80bcc07b191
```

其他變數留空即可，後續 Step 才會用到。

---

## 5. 字體設定（無需下載檔案）

### 5.1 Geist 走 npm 套件

`geist` 套件已在 §3 裝好，直接 import 即可。Vercel 官方維護，build 時自動 self-host，不走 runtime CDN。

### 5.2 JetBrains Mono 走 `next/font/google`

`next/font/google` 在 build 時下載字體檔並打包到自己的 domain，**不是** runtime 連 Google CDN（無 GDPR 風險、無第三方 cookie）。

### 5.3 在 `app/layout.tsx` 整合兩個字體

```tsx
import { GeistSans } from "geist/font/sans";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata = {
  title: "綠能科技 — 次世代儲能",
  description: "從鈉離子到全超電容，重新定義能量儲存。",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hant" className={`${GeistSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-sans">{children}</body>
    </html>
  );
}
```

### 5.4 Tailwind config 對應

§4.1 `tailwind.config.ts` 中 `fontFamily` 區塊已寫對：

```ts
fontFamily: {
  sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
  mono: ["var(--font-jetbrains)", "monospace"],
},
```

**注意**：Geist 套件的 CSS variable 是 `--font-geist-sans`（不是我之前寫的 `--font-geist`），CC 部署前請驗證 Tailwind config 與 layout.tsx 一致。

### 5.5 中文字體 fallback chain

`globals.css` 加入：

```css
body {
  font-family: var(--font-geist-sans), -apple-system, "PingFang TC", "Microsoft JhengHei",
               "Hiragino Sans", "Yu Gothic", system-ui, sans-serif;
}
```

中文字體不需另外載入，依賴使用者作業系統內建（macOS 蘋方、Windows 微軟正黑、iOS PingFang、日語系統 Hiragino/Yu Gothic）。

---

## 6. Motion Components

### 6.1 `components/motion/LenisProvider.tsx`

```tsx
"use client";
import { useEffect } from "react";
import Lenis from "@studio-freight/lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
    return () => { lenis.destroy(); };
  }, []);
  return <>{children}</>;
}
```

### 6.2 `components/motion/CustomCursor.tsx`

從 `greentech-hero-mockup-v2-tech.html` 將 cursor 邏輯改為 React。要點：
- `useEffect` 中註冊 mousemove
- 使用 `requestAnimationFrame` 做 ring 跟隨
- 對所有帶 `data-cursor-hover` 的元素加 mouseenter/leave listener
- `useEffect` cleanup 時解除事件
- mobile 時不渲染（用 `useState` 偵測）

### 6.3 `components/motion/MagneticButton.tsx`

```tsx
"use client";
import { useRef } from "react";
import gsap from "gsap";

export default function MagneticButton({
  children, className = "", href, ...props
}: { children: React.ReactNode; className?: string; href?: string }) {
  const btnRef = useRef<HTMLAnchorElement>(null);
  const innerRef = useRef<HTMLSpanElement>(null);

  const onMove = (e: React.MouseEvent) => {
    const btn = btnRef.current; if (!btn) return;
    const r = btn.getBoundingClientRect();
    const x = e.clientX - r.left - r.width / 2;
    const y = e.clientY - r.top - r.height / 2;
    gsap.to(btn, { x: x * 0.3, y: y * 0.3, duration: 0.4, ease: "power3.out" });
    if (innerRef.current) gsap.to(innerRef.current, { x: x * 0.15, y: y * 0.15, duration: 0.4, ease: "power3.out" });
  };
  const onLeave = () => {
    if (btnRef.current) gsap.to(btnRef.current, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
    if (innerRef.current) gsap.to(innerRef.current, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.4)" });
  };

  return (
    <a ref={btnRef} href={href} className={className} onMouseMove={onMove} onMouseLeave={onLeave} data-cursor-hover {...props}>
      <span ref={innerRef} className="inline-flex items-center gap-3">{children}</span>
    </a>
  );
}
```

### 6.4 其他 motion components

- `SplitText.tsx`：將內容文字按字符拆分，套 GSAP `from { y: '110%' }` stagger（參考 mockup `splitChars` 函數）
- `Marquee.tsx`：CSS animation `marquee` keyframes，雙 track 無縫銜接
- `RevealUp.tsx`：`useEffect` 中註冊 ScrollTrigger，`from { y: 50, opacity: 0 }` to `{ y: 0, opacity: 1 }`，start `top 88%`

**所有 motion 元件都要 `"use client"` directive。**

---

## 7. Hero Visual Variants（三個）

### 7.1 `components/visuals/ParticleField.tsx`
從 mockup 將 ion-canvas 邏輯改為 React component。要點：
- `useRef` 持有 canvas
- `useEffect` 啟動 animation loop，cleanup 取消
- 接收 `mousePos` 從父元件，或自己內部監聽
- 響應 resize

### 7.2 `components/visuals/MeshGrid.tsx`
從 mockup 將 mesh-canvas 邏輯改為 React component。要點同上。

### 7.3 `components/visuals/BatteryCell3D.tsx`
純 CSS 3D，不需 canvas。直接照 mockup 的 `.battery-cell-3d` 結構搬，加 Tailwind classes。
要做成接受 `cellLabel` prop（例如 "CELL 01.A"）以利之後產品頁差異化。

---

## 8. Product Card Variants（三個）

### 8.1 `components/visuals/ProductCardWireframe.tsx`
拷貝 mockup 中 `pc-variant-a` 的 SVG（六邊形晶格 + 動態離子），包成 component。

### 8.2 `components/visuals/ProductCardIsometric.tsx`
拷貝 `pc-variant-b` 的等角分解圖。

### 8.3 `components/visuals/ProductCardDataSheet.tsx`
拷貝 `pc-variant-c` 的規格表 + ASCII art。

每個 card 都接收 `product: { slug, name, tagline, description, specs }` props。

---

## 9. 首頁組裝 `app/page.tsx`

### 9.1 Dummy 內容檔 `lib/dummy-content.ts`

```ts
export const HOME_CONTENT = {
  hero: {
    eyebrow: "NEXT-GEN ENERGY STORAGE / EST. 2024 / TPE",
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
  },
  marquee: [
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
  ],
  products: [
    { slug: "sodium-ion", cardVariant: "A",
      name: "鈉離子電池", meta: "SODIUM-ION CELL",
      description: "原料豐沛、低溫穩定、循環次數突破 6,000 次。為儲能電廠與商用車隊提供可規模化的鋰電替代方案。",
      specs: [
        { label: "ENERGY DENSITY", value: "160 Wh/kg" },
        { label: "CYCLE LIFE", value: "6,000+" },
        { label: "OP. TEMP.", value: "-40°C ~ 80°C" },
        { label: "STATUS", value: "MASS PROD." },
      ]},
    { slug: "lithium-ion", cardVariant: "B",
      name: "高能量密度鋰電池", meta: "LITHIUM-ION HIGH-NICKEL",
      description: "340 Wh/kg 級高鎳體系，搭配自研複合電解質，能量密度與安全性雙重突破。為電動車、航太與消費電子而生。",
      specs: [
        { label: "ENERGY DENSITY", value: "340 Wh/kg" },
        { label: "CYCLE LIFE", value: "2,500+" },
        { label: "FAST CHARGE", value: "4C / 15min" },
        { label: "STATUS", value: "PILOT" },
      ]},
    { slug: "supercapacitor", cardVariant: "C",
      name: "全超電容", meta: "SUPERCAPACITOR",
      description: "秒級充放電、百萬次循環。搭配電池形成混合儲能系統，承擔尖峰功率輸出與煞車能量回收。",
      specs: [
        { label: "POWER DENSITY", value: "15,000 W/kg" },
        { label: "CYCLE LIFE", value: "1M+" },
        { label: "RESPONSE", value: "< 1ms" },
        { label: "STATUS", value: "SHIPPING" },
      ]},
  ],
  stats: [
    { value: 340, suffix: null, label: "Wh / kg", desc: "高鎳體系實測能量密度，較市售平均高 28%。" },
    { value: 6000, suffix: "+", label: "CYCLES", desc: "鈉電在 80% 容量保持率下的循環壽命實驗數據。" },
    { value: 98, suffix: "%", label: "EFFICIENCY", desc: "超電容混合系統的往返能源效率（round-trip）。" },
  ],
  vision: "當化石燃料退場、再生能源接軌的<em>百年之交</em>，儲能將是文明維持運轉的<em>關鍵節點</em>——我們以材料、製程與系統三層創新，讓<em>每一度電</em>都能被妥善保存。",
};
```

### 9.2 `app/page.tsx`

組裝 sections 順序：

```tsx
import LenisProvider from "@/components/motion/LenisProvider";
import CustomCursor from "@/components/motion/CustomCursor";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/sections/Hero";
import MarqueeSection from "@/components/sections/MarqueeSection";
import ProductMatrix from "@/components/sections/ProductMatrix";
import StatsSection from "@/components/sections/StatsSection";
import VisionSection from "@/components/sections/VisionSection";
import ContactCTA from "@/components/sections/ContactCTA";
import { HOME_CONTENT } from "@/lib/dummy-content";

export default function HomePage() {
  return (
    <LenisProvider>
      <CustomCursor />
      <Nav />
      <main>
        <Hero content={HOME_CONTENT.hero} variant="A" />
        <MarqueeSection items={HOME_CONTENT.marquee} />
        <ProductMatrix products={HOME_CONTENT.products} />
        <StatsSection stats={HOME_CONTENT.stats} />
        <VisionSection text={HOME_CONTENT.vision} />
        <ContactCTA />
      </main>
      <Footer />
    </LenisProvider>
  );
}
```

### 9.3 Section components

每個 `components/sections/*.tsx` 將 mockup 對應 section 的 HTML 移入，套上 props 化的 children。**重要**：所有用到 GSAP / 互動的 components 都要 `"use client"`。

---

## 10. Cloudflare Pages 部署

### 10.1 確認 build 通過

```powershell
Remove-Item -Recurse -Force out, .next -ErrorAction SilentlyContinue
npm run build
```

確認 `out/` 目錄產生 `index.html` + 靜態資產。

如有 TypeScript 錯誤、build error，**停下來修，不要硬上**。

### 10.2 GitHub repo

```bash
gh repo create lvslovism/greentech-image-site --public --source=. --remote=origin --push
```

或手動：建 GitHub repo `lvslovism/greentech-image-site`，加 origin，push `main`。

### 10.3 Cloudflare Pages 建立專案

```bash
wrangler pages project list  # 確認 project name 不衝突
wrangler pages project create greentech-image-site --production-branch main
```

### 10.4 首次部署（preview branch）

```bash
git checkout -b preview
git push -u origin preview

Remove-Item -Recurse -Force out, .next -ErrorAction SilentlyContinue
npm run build
wrangler pages deploy out --project-name greentech-image-site --branch preview
```

記下 preview URL，回報。

---

## 11. Verification Checklist

部署完後逐項確認：

- [ ] preview URL 開得起來，HTTP 200
- [ ] 首頁載入後第一屏完整出現（Loader → fade out → Hero）
- [ ] Hero 粒子互動：滑鼠靠近會被推開
- [ ] Hero 大標逐字進場
- [ ] Magnetic 按鈕 hover 會吸附
- [ ] 跑馬燈無接縫滾動
- [ ] 滾到產品區，三張卡風格不同（A 六邊形 / B 等角 / C 規格表）
- [ ] 產品卡 hover 有微微上移效果
- [ ] 數字區進入視窗時 0 → 340 / 6,000 / 98 跳數
- [ ] Vision 區大字進場
- [ ] Footer 「聯絡我們」按鈕也是 magnetic
- [ ] 桌機看不到原生游標，只看到自定義圓點 + 環
- [ ] 手機（DevTools mobile mode）看得到原生游標、自定義隱藏
- [ ] Console 無 error
- [ ] Lighthouse Performance > 80（這 step 接受 80，正式版要 >90）

任一項失敗 → 列在完成報告的 issues 區。

---

## 12. 完成報告格式

請以下列 markdown 格式回報：

```markdown
## CC Step 1 完成報告

### Preview URL
https://preview-xxx.pages.dev

### 完成項目
- [x] Scaffold
- [x] 字體自託管
- [x] 6 motion components
- [x] 3 hero variants
- [x] 3 product card variants
- [x] 首頁組裝
- [x] CF Pages 部署

### Verification Checklist 結果
（貼上 §11 清單，已通過打 ✅，未通過打 ❌ 並說明）

### File Tree
（貼 `tree -L 3 -I "node_modules|.next|out"` 結果）

### 發現的問題 / Issues
1. ...
2. ...

### 待確認問題（給 PM）
1. ...
```

---

## 13. 失敗處理

| 情境 | 處理 |
|---|---|
| `next build` 報 TS error | 停下來修，**不要** `// @ts-ignore` |
| `next build` 報 `output: 'export'` 不相容 dynamic routes | 確認沒有用到 `getServerSideProps`、API routes、middleware |
| 字體相關錯誤 | 確認 `geist` 套件已裝（`npm ls geist`）+ `next/font/google` import 語法正確；不可改用 Google Fonts CDN |
| GSAP / Lenis ESM 載入錯誤 | 確認元件有 `"use client"` directive |
| Wrangler deploy `Authentication error` | 確認 env var 是 `CLOUDFLARE_API_TOKEN`（不是 `CF_API_TOKEN`） |
| Cloudflare Pages project 名稱衝突 | 改用 `greentech-image-site-prod` 或加日期後綴 |
| 動畫在某瀏覽器不工作 | 不要強行 hack，記錄到 issues 等 PM 決策 |

**遇到任何不確定的情境，停下來問。** 不要：
- 自己決定加裝套件（除了本文件列的）
- 自己改 SDD 規格
- 自己改色票或字體
- 跳過 Verification checklist 直接回報完成

---

## 14. 不可做的事

❌ **不要**讀取或參考以下檔案：
- `seo-site-network` 任何相關檔案（這是獨立 repo，毫無關聯）
- 過去產生的 v1 mockup（`greentech-hero-mockup.html`，這是 v0 已棄用）
- 任何 `headless-seo-factory-*` 檔案

❌ **不要**：
- 動 Supabase（這 step 完全 hardcoded，不要引入 supabase-js）
- 加任何 i18n library
- 加 admin 頁面
- 加 `next-seo` 等 SEO library
- 把字體改成 Google Fonts CDN
- 把 `output: 'export'` 改掉
- 把任何 motion component 改成 Framer Motion

✅ **唯一可參考**：
- `greentech-image-site-sdd-v1.md`
- `greentech-hero-mockup-v2-tech.html`
- 本 instruction 檔

---

## 完成後請等待 PM 審查 preview URL，再執行 Step 2。

**End of Step 1 instruction.**
