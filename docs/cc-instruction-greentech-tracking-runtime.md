# CC Instruction — Tracking 改為 Runtime 即時生效

> **工作目錄**：`C:\projects\Green Energy Center`
> **目標**：LINE 按鈕 + 追蹤碼改為 runtime 從 Supabase 即時讀取，CMS 改完秒生效不需 rebuild

---

## 1. 概念

**Before**：`app/[locale]/layout.tsx` 在 build-time `fetchSiteSettings()` → 把 tracking config 作為 props 傳給 `<TrackingScripts>` + `<LineFloatingButton>` → 嵌入 static HTML。

**After**：新建一個 `<RuntimeTracking>` client component，在瀏覽器端用 Supabase anon client 即時 fetch `site_settings.tracking`，拿到結果後動態注入 script + 渲染 LINE 按鈕。

---

## 2. 新建 `components/tracking/RuntimeTracking.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@supabase/supabase-js';

interface TrackingData {
  ga4_id: string;
  gtm_id: string;
  line_oa_url: string;
  meta_pixel_id: string;
  linkedin_partner_id: string;
  clarity_project_id: string;
}

const EMPTY: TrackingData = {
  ga4_id: '',
  gtm_id: '',
  line_oa_url: '',
  meta_pixel_id: '',
  linkedin_partner_id: '',
  clarity_project_id: '',
};

// 用 NEXT_PUBLIC 環境變數建立 client-side readonly client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Module-level cache：同一個 session 只 fetch 一次
let cachedTracking: TrackingData | null = null;

export function RuntimeTracking() {
  const [tracking, setTracking] = useState<TrackingData | null>(cachedTracking);
  const [scriptsInjected, setScriptsInjected] = useState(false);

  useEffect(() => {
    if (cachedTracking) {
      setTracking(cachedTracking);
      return;
    }

    if (!supabaseUrl || !supabaseAnonKey) return;

    const client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false },
    });

    client
      .from('site_settings')
      .select('tracking')
      .limit(1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) {
          console.error('[RuntimeTracking] fetch error:', error.message);
          return;
        }
        const t = (data?.tracking as Record<string, string>) || {};
        const result: TrackingData = {
          ga4_id: t.ga4_id || '',
          gtm_id: t.gtm_id || '',
          line_oa_url: t.line_oa_url || '',
          meta_pixel_id: t.meta_pixel_id || '',
          linkedin_partner_id: t.linkedin_partner_id || '',
          clarity_project_id: t.clarity_project_id || '',
        };
        cachedTracking = result;
        setTracking(result);
      });
  }, []);

  // 注入追蹤 script（只執行一次）
  useEffect(() => {
    if (!tracking || scriptsInjected) return;

    const { ga4_id, gtm_id, meta_pixel_id, linkedin_partner_id, clarity_project_id } = tracking;

    // Helper: 避免重複注入
    function injectScript(id: string, src?: string, inline?: string) {
      if (document.getElementById(id)) return;
      const s = document.createElement('script');
      s.id = id;
      if (src) { s.async = true; s.src = src; }
      if (inline) { s.textContent = inline; }
      document.head.appendChild(s);
    }

    // GA4（僅在沒有 GTM 時獨立載入）
    if (ga4_id && !gtm_id) {
      injectScript('trk-ga4-loader', `https://www.googletagmanager.com/gtag/js?id=${ga4_id}`);
      injectScript('trk-ga4-init', undefined, `
        window.dataLayer=window.dataLayer||[];
        function gtag(){dataLayer.push(arguments);}
        gtag('js',new Date());
        gtag('config','${ga4_id}');
      `);
    }

    // GTM
    if (gtm_id) {
      injectScript('trk-gtm', undefined, `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtm_id}');
      `);
    }

    // Meta Pixel
    if (meta_pixel_id) {
      injectScript('trk-meta-pixel', undefined, `
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
        document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init','${meta_pixel_id}');fbq('track','PageView');
      `);
    }

    // LinkedIn Insight Tag
    if (linkedin_partner_id) {
      injectScript('trk-linkedin', undefined, `
        _linkedin_partner_id="${linkedin_partner_id}";
        window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];
        window._linkedin_data_partner_ids.push(_linkedin_partner_id);
        (function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};
        window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];
        var b=document.createElement("script");b.type="text/javascript";b.async=true;
        b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";
        s.parentNode.insertBefore(b,s);})(window.lintrk);
      `);
    }

    // Microsoft Clarity
    if (clarity_project_id) {
      injectScript('trk-clarity', undefined, `
        (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window,document,"clarity","script","${clarity_project_id}");
      `);
    }

    setScriptsInjected(true);
  }, [tracking, scriptsInjected]);

  // LINE 浮動按鈕
  if (!tracking?.line_oa_url) return null;

  return (
    <a
      href={tracking.line_oa_url}
      target="_blank"
      rel="noopener noreferrer"
      className="line-float-btn"
      aria-label="LINE official account"
    >
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
      </svg>
    </a>
  );
}
```

---

## 3. 更新 `app/[locale]/layout.tsx`

**移除** build-time tracking 注入：

1. 移除 `getTrackingConfig()` 呼叫
2. 移除 `<TrackingScripts ... />` component
3. 移除 `<LineFloatingButton ... />` component
4. 改為放置 `<RuntimeTracking />`

```typescript
import { RuntimeTracking } from '@/components/tracking/RuntimeTracking';

export default async function LocaleLayout({ children, params }) {
  // ... existing code (settings fetch for footer etc.)

  return (
    <>
      {/* Nav + children + Footer — 維持原樣 */}
      {children}

      {/* Runtime tracking — client-side fetch from Supabase */}
      <RuntimeTracking />
    </>
  );
}
```

---

## 4. 清理

可以保留或刪除，建議保留備用：

| 檔案 | 動作 |
|---|---|
| `components/tracking/TrackingScripts.tsx` | 可刪除（被 RuntimeTracking 取代） |
| `components/tracking/LineFloatingButton.tsx` | 可刪除（合併進 RuntimeTracking） |
| `lib/cms-helpers.ts` 的 `getTrackingConfig` | 保留（Admin 頁面可能用到） |

---

## 5. 效能考量

- **單次 API call**：module-level `cachedTracking` 確保同一個 session 只 fetch 一次，SPA 導航不重複打
- **資料量極小**：只取 `site_settings.tracking` 一個 JSONB 欄位（~200 bytes）
- **非阻塞**：tracking script 注入是 async，不影響 FCP/LCP
- **LINE 按鈕延遲極短**：fetch 完成後才 render，用戶感知約 100-300ms（Supabase CDN 在東京 region）

---

## 6. Build & Deploy

```powershell
Remove-Item -Recurse -Force out, .next -ErrorAction SilentlyContinue
npm run build
npx wrangler pages deploy out/ --project-name green-energy-center --branch main
```

---

## 7. Commit

```bash
git add -A
git commit -m "feat: tracking runtime fetch — CMS changes take effect without rebuild

- RuntimeTracking client component: fetches site_settings.tracking from Supabase at runtime
- Module-level cache: single fetch per session, no repeated API calls
- LINE button + all tracking scripts now render dynamically
- Removed build-time TrackingScripts + LineFloatingButton injection
- Admin changes to tracking IDs take effect immediately on next page load"

git push origin main
```

---

## 8. 驗證 Checklist

| # | 項目 | 預期 |
|---|---|---|
| 1 | Admin 填 LINE URL → Save → **不 rebuild** | 直接刷新前端 → LINE 按鈕出現 |
| 2 | Admin 清空 LINE URL → Save | 刷新前端 → LINE 按鈕消失 |
| 3 | Admin 填 GA4 ID → Save | 刷新前端 → DevTools 可見 gtag.js |
| 4 | 填 GTM + GA4 同時存在 | 只注入 GTM，不重複注入 GA4 |
| 5 | 全部清空 | 無 script 注入，無 LINE 按鈕，無 console error |
| 6 | Network tab | 只有一個 Supabase REST call（`/rest/v1/site_settings?select=tracking`） |
| 7 | SPA 導航（換頁） | 不重複 fetch（module cache） |
| 8 | Admin 頁面 | LINE 按鈕不顯示 |
| 9 | `npm run build` | 30 pages，exit 0 |
