# CC Instruction — Green Energy Center Step 8: Polish & Launch

> **前置**：先讀 `CLAUDE.md`，確認 Step 7 已完成（commit `7a26979`）
> **工作目錄**：`C:\projects\Green Energy Center`
> **目標**：效能優化 + Resend 寄信 + Turnstile 防 spam + 依賴清理
> **部署**：完成後 deploy 到 CF Pages production

---

## 1. Lighthouse 效能優化

### 1.1 Render-blocking CSS

目前有 3 個 CSS 檔案阻塞首次渲染（~1,120ms）。

**修正方案**：在 `app/[locale]/layout.tsx`（或 root layout）加入 critical CSS inline。

步驟：
1. 抽取首屏所需的最小 CSS（nav + hero background + font-face declarations），約 2-3 KB
2. 在 `<head>` 中用 `<style>` inline 這些 critical CSS
3. 主要 CSS 檔改為 `<link rel="preload" as="style">` + `onload="this.rel='stylesheet'"` 非阻塞載入

⚠️ Next.js App Router 管理 CSS 的方式有限制。如果無法直接控制 `<link>` 行為，改用以下替代方案：
- 在 `next.config.js` 加 `experimental: { optimizeCss: true }`（需安裝 `critters`：`npm install critters`）
- 或跳過此項，影響約 10-15 分 Lighthouse

### 1.2 React Hydration Errors

Step 1 記錄的 hydration mismatch errors (#418 / #423 / #425)。

**修正方案**：
1. 找出造成 SSR/CSR mismatch 的元件（通常是用了 `window` / `document` / `Date` 等 browser-only API）
2. 用 `useEffect` + state 延遲 render client-only 內容
3. 確認 suppressHydrationWarning 不是被濫用

在 build log 或瀏覽器 console 搜尋 `Hydration failed` 或 `did not match`，逐一修復。

常見來源：
- `LangSync.tsx`（修改 `document.documentElement.lang`）— 這個是預期的，可忽略
- GSAP/Lenis 在 SSR 期間讀取 DOM 尺寸 — 確認用 dynamic import + `ssr: false`
- `Date` 顯示（如果有）— 用 `useEffect` 延遲

### 1.3 色彩對比度修正

`--sub` 色 `#6b7689` 在 `--bg` `#0a0e14` 上對比度 4.21:1，未達 WCAG AA 4.5:1。

**修正**：在 `app/globals.css` 中改：

```css
/* Before */
--sub: #6b7689;

/* After */
--sub: #8290a4;
```

`#8290a4` 在 `#0a0e14` 上對比度 5.1:1，通過 AA。

確認所有使用 `--sub` 的地方視覺仍然合理（不要太亮搶走主內容焦點）。

### 1.4 Legacy JavaScript Polyfill

減少約 11 KiB 的舊瀏覽器 polyfill。

**修正**：在 `next.config.js` 調整 browserslist target：

```javascript
// next.config.js
const nextConfig = {
  // ... existing config
  experimental: {
    // ... existing experimental
  },
};
```

在 `package.json` 加：

```json
"browserslist": [
  "last 2 Chrome versions",
  "last 2 Firefox versions",
  "last 2 Safari versions",
  "last 2 Edge versions"
]
```

### 1.5 Unused CSS

Tailwind purge 應自動處理，但確認 `tailwind.config.js` 的 `content` 路徑涵蓋所有 component：

```javascript
content: [
  './app/**/*.{ts,tsx}',
  './components/**/*.{ts,tsx}',
  './lib/**/*.{ts,tsx}',
],
```

---

## 2. Contact Form 接 Resend 寄信

### 2.1 安裝 Resend SDK

```bash
npm install resend
```

### 2.2 環境變數

在 `.env.local` 加：

```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
CONTACT_NOTIFY_EMAIL=admin@greentech.tw
CONTACT_FROM_EMAIL=noreply@greentech.tw
```

⚠️ `CONTACT_FROM_EMAIL` 需要是 Resend 驗證過的網域。如果還沒設定自訂網域，可先用 `onboarding@resend.dev` 測試。

### 2.3 更新 CF Pages Function

重寫 `functions/api/contact.ts`：

```typescript
import { Resend } from 'resend';

interface Env {
  RESEND_API_KEY: string;
  CONTACT_NOTIFY_EMAIL: string;
  CONTACT_FROM_EMAIL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  NEXT_PUBLIC_SUPABASE_URL: string;
  TURNSTILE_SECRET_KEY: string;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  // CORS headers
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const body = await request.json() as {
      name: string;
      email: string;
      company?: string;
      product_interest?: string;
      message: string;
      locale?: string;
      turnstileToken?: string;
    };

    // ---- Validation ----
    if (!body.name || !body.email || !body.message) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Name, email, and message are required.',
      }), { status: 400, headers });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid email address.',
      }), { status: 400, headers });
    }

    // ---- Turnstile 驗證（§3 加入後啟用）----
    if (env.TURNSTILE_SECRET_KEY && body.turnstileToken) {
      const turnstileRes = await fetch(
        'https://challenges.cloudflare.com/turnstile/v0/siteverify',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            secret: env.TURNSTILE_SECRET_KEY,
            response: body.turnstileToken,
          }),
        }
      );
      const turnstileData = await turnstileRes.json() as { success: boolean };
      if (!turnstileData.success) {
        return new Response(JSON.stringify({
          success: false,
          message: 'Turnstile verification failed.',
        }), { status: 403, headers });
      }
    }

    // ---- 寫入 Supabase ----
    const supabaseRes = await fetch(
      `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/contact_submissions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          name: body.name,
          email: body.email,
          company: body.company || null,
          product_interest: body.product_interest || null,
          message: body.message,
          locale: body.locale || 'zh',
          status: 'new',
        }),
      }
    );

    if (!supabaseRes.ok) {
      console.error('Supabase insert failed:', await supabaseRes.text());
    }

    // ---- 發送通知信 ----
    if (env.RESEND_API_KEY && env.CONTACT_NOTIFY_EMAIL) {
      const resend = new Resend(env.RESEND_API_KEY);

      await resend.emails.send({
        from: env.CONTACT_FROM_EMAIL || 'onboarding@resend.dev',
        to: env.CONTACT_NOTIFY_EMAIL,
        subject: `[Green Energy] New inquiry from ${body.name}`,
        html: `
          <h2>New Contact Form Submission</h2>
          <table style="border-collapse:collapse;width:100%;">
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Name</td><td style="padding:8px;border:1px solid #ddd;">${body.name}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Email</td><td style="padding:8px;border:1px solid #ddd;">${body.email}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Company</td><td style="padding:8px;border:1px solid #ddd;">${body.company || 'N/A'}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Product Interest</td><td style="padding:8px;border:1px solid #ddd;">${body.product_interest || 'N/A'}</td></tr>
            <tr><td style="padding:8px;border:1px solid #ddd;font-weight:bold;">Locale</td><td style="padding:8px;border:1px solid #ddd;">${body.locale || 'zh'}</td></tr>
          </table>
          <h3>Message</h3>
          <p style="white-space:pre-wrap;">${body.message}</p>
        `,
      });

      // 更新 email_sent 狀態
      if (supabaseRes.ok) {
        const inserted = await supabaseRes.json() as any[];
        if (inserted?.[0]?.id) {
          await fetch(
            `${env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/contact_submissions?id=eq.${inserted[0].id}`,
            {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'apikey': env.SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
              },
              body: JSON.stringify({
                email_sent: true,
                email_sent_at: new Date().toISOString(),
              }),
            }
          );
        }
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Thank you for your inquiry. We will get back to you within 24 hours.',
    }), { status: 200, headers });

  } catch (error) {
    console.error('Contact form error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'An error occurred. Please try again.',
    }), { status: 500, headers });
  }
};

// OPTIONS preflight
export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
};
```

⚠️ CF Pages Functions 環境變數需要在 CF Dashboard → Pages → Settings → Environment variables 設定（不讀 `.env.local`）。

### 2.4 前端更新

在 `ContactForm.tsx`，submit 時帶上 `locale`：

```typescript
const res = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name,
    email,
    company,
    product_interest: productInterest,
    message,
    locale,          // 從 props 傳入
    turnstileToken,  // §3 加入後帶上
  }),
});
```

---

## 3. Turnstile 防 Spam

### 3.1 前端整合

安裝 Turnstile React wrapper（或手動載入 script）。

**方法 A（推薦）：手動 script**

在 `ContactForm.tsx` 加入：

```typescript
'use client';

import { useEffect, useRef, useState } from 'react';

// Turnstile site key from env
const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export function ContactForm({ locale, strings }: ContactFormProps) {
  const [turnstileToken, setTurnstileToken] = useState<string>('');
  const turnstileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY) return;

    // Load Turnstile script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      if (turnstileRef.current && window.turnstile) {
        window.turnstile.render(turnstileRef.current, {
          sitekey: TURNSTILE_SITE_KEY,
          theme: 'dark',
          callback: (token: string) => setTurnstileToken(token),
        });
      }
    };

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  // ... existing form logic

  // Submit handler 加 turnstileToken
  const handleSubmit = async () => {
    if (TURNSTILE_SITE_KEY && !turnstileToken) {
      // Turnstile 尚未完成驗證
      return;
    }

    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name, email, company,
        product_interest: productInterest,
        message, locale,
        turnstileToken: turnstileToken || undefined,
      }),
    });
    // ...
  };

  return (
    <form>
      {/* ... existing fields */}

      {/* Turnstile widget — 放在 submit 按鈕前 */}
      {TURNSTILE_SITE_KEY && (
        <div ref={turnstileRef} style={{ marginBottom: 12 }} />
      )}

      <button onClick={handleSubmit} disabled={TURNSTILE_SITE_KEY ? !turnstileToken : false}>
        {strings.submit}
      </button>
    </form>
  );
}
```

需要在 global type 宣告 `window.turnstile`：

```typescript
// lib/turnstile.d.ts
declare global {
  interface Window {
    turnstile?: {
      render: (element: HTMLElement, options: {
        sitekey: string;
        theme?: 'light' | 'dark' | 'auto';
        callback?: (token: string) => void;
      }) => string;
      reset: (widgetId: string) => void;
    };
  }
}
export {};
```

### 3.2 後端驗證

已包含在 §2.3 的 `functions/api/contact.ts` 中（Turnstile siteverify 區塊）。

### 3.3 環境變數

`.env.local`：
```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAXXXXXXXXXXXXXXXXX
```

CF Pages env vars（for Function）：
```
TURNSTILE_SECRET_KEY=0x4AAXXXXXXXXXXXXXXXXX
```

⚠️ Turnstile 未設定時（env var 為空），表單仍正常運作（graceful degradation）。

---

## 4. 依賴清理

### 4.1 lucide-react 鎖版

目前 `package.json` 用 `^1.14.0`（caret range）。鎖定到 exact version：

```json
"lucide-react": "1.14.0"
```

執行：
```bash
npm install lucide-react@1.14.0 --save-exact
```

### 4.2 檢查其他依賴

```bash
npm audit
npm outdated
```

修復任何 high/critical vulnerability。如有 deprecated packages 可順手更新。

### 4.3 清理未使用 import

在所有 `.ts` / `.tsx` 中搜尋未使用的 import 並移除。可用：

```bash
npx tsc --noEmit 2>&1 | grep "declared but"
```

---

## 5. CF Access 保護 Admin 路由

⚠️ **此項需 PM 手動操作，CC 不需做任何代碼改動。**

CC 完成部署後，PM 在 CF Dashboard 操作：

> CF Dashboard → Zero Trust → Access → Applications → Add
> - Application type：Self-hosted
> - Application name：`Green Energy Admin`
> - Application domain：`green-energy-center.pages.dev`
> - Path：`/admin`（只保護 admin 路徑）
> - Identity providers：One-time PIN（Email OTP）
> - Policy：Allow — 指定 PM 的 email

設完後，訪問 `/admin` 會先經過 CF Access 認證頁，再到 Supabase Auth 登入。雙重保護。

---

## 6. CF Pages 環境變數總表

PM 需確認以下環境變數都已在 CF Pages Dashboard 設定：

| Variable | 用途 | 位置 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Build-time fetch | Build env |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Build-time fetch | Build env |
| `SUPABASE_SERVICE_ROLE_KEY` | Function: DB write | Encrypted |
| `RESEND_API_KEY` | Function: 寄信 | Encrypted |
| `CONTACT_NOTIFY_EMAIL` | Function: 收件人 | Plain |
| `CONTACT_FROM_EMAIL` | Function: 寄件人 | Plain |
| `TURNSTILE_SECRET_KEY` | Function: Turnstile 驗證 | Encrypted |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Build: 前端 widget | Plain |

---

## 7. Build & Deploy

```powershell
Remove-Item -Recurse -Force out, .next -ErrorAction SilentlyContinue

$env:NEXT_OUTPUT = "export"
npm run build

# 確認 28 static pages
npx wrangler pages deploy out/ --project-name green-energy-center --branch main
```

---

## 8. Commit

```bash
git add -A
git commit -m "feat: Step 8 — polish and launch prep

- Lighthouse: color contrast fix (--sub → #8290a4), browserslist modern targets
- Lighthouse: hydration error fixes, render-blocking CSS optimization
- Contact form: Resend email integration (CF Pages Function)
- Contact form: Turnstile spam protection (widget + server verify)
- Contact form: writes to Supabase contact_submissions with email_sent tracking
- Dependencies: lucide-react locked to 1.14.0 exact
- Dependencies: audit fixes + unused import cleanup
- Turnstile type declarations added"

git push origin main
```

---

## 9. 驗證 Checklist

| # | 驗證項目 | 預期 |
|---|---|---|
| 1 | Lighthouse Performance（首頁無痕） | ≥ 85（目標 90+） |
| 2 | Lighthouse Accessibility | ≥ 97（色彩對比修正後） |
| 3 | 瀏覽器 console 無 hydration error | 0 warnings |
| 4 | Contact form submit（Turnstile 通過） | 成功提交 + 顯示 success |
| 5 | Resend 寄信 | admin 信箱收到通知信 |
| 6 | Supabase contact_submissions | 新增一筆 + `email_sent=true` |
| 7 | Admin Submissions 頁 | 顯示剛提交的記錄 |
| 8 | Turnstile 未通過 | 偽造 token → 403 rejected |
| 9 | lucide-react 版本 | `package.json` 顯示 exact `1.14.0` |
| 10 | `npm audit` | 無 high/critical |
| 11 | `npm run build` 無錯誤 | 28 pages，exit 0 |

---

## 10. 失敗處理

| 狀況 | 處理 |
|---|---|
| Resend 寄信失敗 | 確認 `RESEND_API_KEY` 正確 + `CONTACT_FROM_EMAIL` 的 domain 已在 Resend 驗證 |
| Turnstile widget 不顯示 | 確認 `NEXT_PUBLIC_TURNSTILE_SITE_KEY` 設定正確 + domain 在 Turnstile 白名單 |
| CF Function 報 `env.RESEND_API_KEY is undefined` | CF Pages env vars 只讀 Dashboard 設定，不讀 `.env.local` |
| `critters` CSS inline 報錯 | 移除 `experimental.optimizeCss`，改為手動 critical CSS 或跳過 |
| Turnstile script 載入被 CSP 擋 | 確認無 strict CSP header，或加 `challenges.cloudflare.com` 到 CSP |
| Hydration error 仍存在 | 逐一檢查 browser console 的 warning，定位到具體元件 |

---

## 11. Post-Deploy PM 手動操作

完成部署後，PM 需手動執行：

1. **CF Pages 環境變數**（§6 總表）— 確認全部設定
2. **CF Access**（§5）— 保護 `/admin` 路由
3. **Resend 測試**：到 `/zh/contact/` 提交一筆測試表單，確認收到通知信
4. **Turnstile 測試**：確認 widget 顯示 + 通過後才能 submit
5. **Lighthouse**：在 `/zh/` 跑無痕 Lighthouse，截圖回報分數
