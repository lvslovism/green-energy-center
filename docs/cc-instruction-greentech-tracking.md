# CC Instruction — Green Energy Center: Tracking & Integrations

> **前置**：先讀 `CLAUDE.md`，確認最新 commit `7d9fcdd`
> **工作目錄**：`C:\projects\Green Energy Center`
> **目標**：Site Settings 新增 Tracking section，前端自動注入追蹤碼 + LINE 浮動按鈕
> **部署**：完成後 deploy 到 CF Pages production

---

## 1. DB Schema 更新

在 `site_settings` 表新增 `tracking` JSONB 欄位：

```sql
ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS tracking JSONB NOT NULL DEFAULT '{}';

-- Seed 預設空值結構
UPDATE site_settings SET tracking = '{
  "ga4_id": "",
  "gtm_id": "",
  "line_oa_url": "",
  "meta_pixel_id": "",
  "linkedin_partner_id": "",
  "clarity_project_id": ""
}'::JSONB;
```

透過 Supabase MCP `execute_sql` 執行，或在 SQL Editor 跑。

---

## 2. 更新 TypeScript Types

重新產生 types（如有 Supabase CLI access）：

```bash
npx supabase gen types typescript --project-id qilsggczoplnzkugzrmg > lib/database.types.ts
```

如無 CLI，手動在 `lib/database.types.ts` 的 `site_settings` Row/Insert/Update type 加：

```typescript
tracking: {
  ga4_id?: string;
  gtm_id?: string;
  line_oa_url?: string;
  meta_pixel_id?: string;
  linkedin_partner_id?: string;
  clarity_project_id?: string;
};
```

---

## 3. CMS Fetch 更新

### 3.1 `lib/cms.ts`

`fetchSiteSettings()` 已經 `select('*')`，新欄位自動帶出，不需改。

### 3.2 `lib/cms-helpers.ts`

新增 helper：

```typescript
export interface TrackingConfig {
  ga4Id: string;
  gtmId: string;
  lineOaUrl: string;
  metaPixelId: string;
  linkedinPartnerId: string;
  clarityProjectId: string;
}

export function getTrackingConfig(settings: any): TrackingConfig {
  const t = settings?.tracking || {};
  return {
    ga4Id: t.ga4_id || '',
    gtmId: t.gtm_id || '',
    lineOaUrl: t.line_oa_url || '',
    metaPixelId: t.meta_pixel_id || '',
    linkedinPartnerId: t.linkedin_partner_id || '',
    clarityProjectId: t.clarity_project_id || '',
  };
}
```

---

## 4. 前端追蹤碼注入

### 4.1 `components/tracking/TrackingScripts.tsx`

新建 Client Component，根據 tracking config 注入各追蹤碼：

```typescript
'use client';

import { useEffect } from 'react';

interface TrackingScriptsProps {
  ga4Id: string;
  gtmId: string;
  metaPixelId: string;
  linkedinPartnerId: string;
  clarityProjectId: string;
}

export function TrackingScripts({
  ga4Id,
  gtmId,
  metaPixelId,
  linkedinPartnerId,
  clarityProjectId,
}: TrackingScriptsProps) {
  useEffect(() => {
    // GA4（僅在沒有 GTM 時獨立載入，GTM 可以管理 GA4）
    if (ga4Id && !gtmId) {
      const s1 = document.createElement('script');
      s1.async = true;
      s1.src = `https://www.googletagmanager.com/gtag/js?id=${ga4Id}`;
      document.head.appendChild(s1);

      const s2 = document.createElement('script');
      s2.textContent = `
        window.dataLayer=window.dataLayer||[];
        function gtag(){dataLayer.push(arguments);}
        gtag('js',new Date());
        gtag('config','${ga4Id}');
      `;
      document.head.appendChild(s2);
    }

    // GTM
    if (gtmId) {
      const s = document.createElement('script');
      s.textContent = `
        (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
        new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
        j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
        'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
        })(window,document,'script','dataLayer','${gtmId}');
      `;
      document.head.appendChild(s);
    }

    // Meta Pixel
    if (metaPixelId) {
      const s = document.createElement('script');
      s.textContent = `
        !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
        n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
        document,'script','https://connect.facebook.net/en_US/fbevents.js');
        fbq('init','${metaPixelId}');fbq('track','PageView');
      `;
      document.head.appendChild(s);
    }

    // LinkedIn Insight Tag
    if (linkedinPartnerId) {
      const s = document.createElement('script');
      s.textContent = `
        _linkedin_partner_id="${linkedinPartnerId}";
        window._linkedin_data_partner_ids=window._linkedin_data_partner_ids||[];
        window._linkedin_data_partner_ids.push(_linkedin_partner_id);
        (function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};
        window.lintrk.q=[]}var s=document.getElementsByTagName("script")[0];
        var b=document.createElement("script");b.type="text/javascript";b.async=true;
        b.src="https://snap.licdn.com/li.lms-analytics/insight.min.js";
        s.parentNode.insertBefore(b,s);})(window.lintrk);
      `;
      document.head.appendChild(s);
    }

    // Microsoft Clarity
    if (clarityProjectId) {
      const s = document.createElement('script');
      s.textContent = `
        (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
        })(window,document,"clarity","script","${clarityProjectId}");
      `;
      document.head.appendChild(s);
    }
  }, [ga4Id, gtmId, metaPixelId, linkedinPartnerId, clarityProjectId]);

  return null;
}
```

### 4.2 `components/tracking/LineFloatingButton.tsx`

LINE 官方帳號浮動按鈕：

```typescript
'use client';

interface LineFloatingButtonProps {
  url: string;
}

export function LineFloatingButton({ url }: LineFloatingButtonProps) {
  if (!url) return null;

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="line-float-btn"
      aria-label="LINE official account"
    >
      {/* LINE icon SVG */}
      <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
        <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63h2.386c.349 0 .63.285.63.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.627-.63.349 0 .631.285.631.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
      </svg>
    </a>
  );
}
```

CSS（加到 `globals.css`）：

```css
.line-float-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #06C755;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  z-index: 999;
  transition: transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.line-float-btn:hover {
  transform: scale(1.1);
  box-shadow: 0 4px 16px rgba(6, 199, 85, 0.4);
}

/* Admin 頁面不顯示 */
body[data-admin="1"] .line-float-btn {
  display: none;
}

/* 手機版稍微縮小 + 避開底部空間 */
@media (max-width: 768px) {
  .line-float-btn {
    width: 48px;
    height: 48px;
    bottom: 16px;
    right: 16px;
  }
  .line-float-btn svg {
    width: 24px;
    height: 24px;
  }
}
```

### 4.3 注入到 Layout

在 `app/[locale]/layout.tsx` 中：

```typescript
import { fetchSiteSettings } from '@/lib/cms';
import { getTrackingConfig } from '@/lib/cms-helpers';
import { TrackingScripts } from '@/components/tracking/TrackingScripts';
import { LineFloatingButton } from '@/components/tracking/LineFloatingButton';

export default async function LocaleLayout({ children, params }) {
  const settings = await fetchSiteSettings();
  const tracking = getTrackingConfig(settings);

  return (
    <>
      {children}
      <TrackingScripts
        ga4Id={tracking.ga4Id}
        gtmId={tracking.gtmId}
        metaPixelId={tracking.metaPixelId}
        linkedinPartnerId={tracking.linkedinPartnerId}
        clarityProjectId={tracking.clarityProjectId}
      />
      {tracking.lineOaUrl && <LineFloatingButton url={tracking.lineOaUrl} />}
    </>
  );
}
```

⚠️ **不要在 Admin layout 注入追蹤碼和 LINE 按鈕。** `app/admin/layout.tsx` 保持原樣。

---

## 5. Admin UI — Tracking Section

### 5.1 Site Settings 頁面新增 Section

在 `app/admin/site-settings/page.tsx` 加入第 7 個 Collapsible section：

```typescript
<Collapsible title="Tracking & Integrations">
  {/* GA4 */}
  <div className="adm-field">
    <label>GA4 Measurement ID</label>
    <input
      placeholder="G-XXXXXXXXXX"
      value={tracking.ga4_id}
      onChange={...}
    />
    <small>Google Analytics 4。如使用 GTM 管理 GA4，可留空此欄。</small>
  </div>

  {/* GTM */}
  <div className="adm-field">
    <label>GTM Container ID</label>
    <input
      placeholder="GTM-XXXXXXX"
      value={tracking.gtm_id}
      onChange={...}
    />
    <small>Google Tag Manager。設此欄後可在 GTM 內管理 GA4、Meta Pixel 等所有 tag。</small>
  </div>

  {/* LINE OA */}
  <div className="adm-field">
    <label>LINE Official Account URL</label>
    <input
      placeholder="https://lin.ee/xxxxx"
      value={tracking.line_oa_url}
      onChange={...}
    />
    <small>設定後會在頁面右下角顯示 LINE 浮動按鈕。留空則不顯示。</small>
  </div>

  {/* Meta Pixel */}
  <div className="adm-field">
    <label>Meta Pixel ID</label>
    <input
      placeholder="1234567890"
      value={tracking.meta_pixel_id}
      onChange={...}
    />
    <small>Facebook / Instagram 廣告追蹤。選填。</small>
  </div>

  {/* LinkedIn */}
  <div className="adm-field">
    <label>LinkedIn Insight Tag Partner ID</label>
    <input
      placeholder="123456"
      value={tracking.linkedin_partner_id}
      onChange={...}
    />
    <small>LinkedIn 廣告受眾追蹤。B2B 推薦。選填。</small>
  </div>

  {/* Clarity */}
  <div className="adm-field">
    <label>Microsoft Clarity Project ID</label>
    <input
      placeholder="abcdefghij"
      value={tracking.clarity_project_id}
      onChange={...}
    />
    <small>免費使用者行為分析（熱區圖、錄影）。選填。</small>
  </div>
</Collapsible>
```

每個欄位下方的 `<small>` 提供用途說明，讓非技術 PM 也看得懂。

### 5.2 Save 邏輯

現有 Site Settings Save 已做 `UPDATE site_settings SET ... WHERE id = ...`。確認 `tracking` JSONB 欄位也包含在 update payload 中。

Save 時組裝：

```typescript
const payload = {
  hero: { ... },
  vision: { ... },
  // ... existing fields
  tracking: {
    ga4_id: trackingState.ga4_id || '',
    gtm_id: trackingState.gtm_id || '',
    line_oa_url: trackingState.line_oa_url || '',
    meta_pixel_id: trackingState.meta_pixel_id || '',
    linkedin_partner_id: trackingState.linkedin_partner_id || '',
    clarity_project_id: trackingState.clarity_project_id || '',
  },
};
```

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
git commit -m "feat: tracking & integrations — GA4, GTM, LINE, Meta Pixel, LinkedIn, Clarity

- site_settings.tracking JSONB column for all tracking IDs
- TrackingScripts client component: dynamic script injection
- LineFloatingButton: fixed-position LINE OA button (green circle)
- Admin Site Settings: new Tracking & Integrations collapsible section
- All tracking IDs optional (graceful degradation)
- GA4 skipped when GTM is set (GTM manages GA4)
- LINE button hidden on admin pages
- Build-time: tracking config baked into static HTML from DB"

git push origin main
```

---

## 8. 驗證 Checklist

| # | 驗證項目 | 預期 |
|---|---|---|
| 1 | Admin → Site Settings → Tracking section | 6 個欄位顯示 + 可編輯 |
| 2 | Save tracking IDs | Save 成功，重整後保留 |
| 3 | 全部留空 → 前端 | 無追蹤碼注入，無 LINE 按鈕，無 console error |
| 4 | 填 LINE OA URL → rebuild | 右下角出現綠色 LINE 浮動按鈕 |
| 5 | 填 GA4 ID → rebuild | `document.head` 有 gtag.js script |
| 6 | 填 GTM ID → rebuild | GTM script 注入，GA4 script 不重複注入 |
| 7 | Admin 頁面 | LINE 按鈕不顯示（`body[data-admin]` 隱藏） |
| 8 | LINE 按鈕 hover | 放大 + 綠色光暈 |
| 9 | 手機版 LINE 按鈕 | 48px 縮小版，不擋內容 |
| 10 | `npm run build` | 30 pages，exit 0 |

---

## 9. 失敗處理

| 狀況 | 處理 |
|---|---|
| `tracking` column 不存在 | 確認 ALTER TABLE 已執行 |
| Admin Save 後 tracking 被清空 | 確認 update payload 包含 tracking JSONB |
| 追蹤碼在 production 不生效 | 因為是 build-time 注入，填完 ID 後需 rebuild + redeploy |
| LINE 按鈕蓋住 footer | z-index 999 + fixed positioning，不影響 footer scroll |
| GTM + GA4 重複計數 | 邏輯已處理：有 GTM 時跳過獨立 GA4 injection |
| Clarity script 被 ad blocker 擋 | 正常現象，不影響網站功能 |
