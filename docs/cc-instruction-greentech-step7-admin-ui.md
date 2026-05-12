# CC Instruction — Green Energy Center Step 7: Admin UI

> **前置**：先讀 `CLAUDE.md`，確認 Step 6 已完成（commit `fec0aa7`）
> **工作目錄**：`C:\projects\Green Energy Center`
> **目標**：建立 `/admin` 後台管理介面（client-side SPA + Supabase Auth）
> **部署**：完成後 deploy 到 CF Pages production

---

## 1. 架構概述

### 1.1 技術方案

- **位置**：同 repo，`app/admin/` 路由
- **渲染**：全部 `'use client'` — static export 產出空殼 HTML，runtime client-side fetch
- **認證**：Supabase Auth（email/password），一個 admin 帳號
- **CRUD**：Supabase client 用 auth session token，RLS 確保只有 authenticated user 可寫入
- **Design**：沿用 `--bg` / `--card` / `--accent` 暗色 token，左側 sidebar + 右側內容
- **Deploy 觸發**：Admin 頁面放「Deploy to Production」按鈕，POST CF Pages Deploy Hook

### 1.2 頁面結構

```
/admin                     → Login（未登入）/ Dashboard（已登入）
/admin/site-settings       → Hero / Vision / Stats / Footer / Contact info 編輯
/admin/products            → 三產品列表
/admin/products/[slug]     → 單一產品編輯（specs / performance / use cases / documents）
/admin/technology          → Pillars / R&D stats / Certifications / Roadmap 編輯
/admin/about               → Team members / Milestones 編輯
/admin/submissions         → 聯絡表單提交記錄（唯讀 + 狀態管理）
```

---

## 2. Supabase Auth 設定

### 2.1 建立 Admin 帳號

在 Supabase Dashboard → Authentication → Users → Add User：

- Email：PM 提供的 admin email
- Password：強密碼
- Auto Confirm：✅

或透過 SQL：

```sql
-- 在 Supabase SQL Editor 執行（需 service_role 權限）
-- 注意：這只是 helper，實際建議在 Dashboard 操作
SELECT supabase_auth_admin_create_user(
  '{"email": "admin@greentech.tw", "password": "CHANGE_ME", "email_confirm": true}'
);
```

⚠️ **PM 需手動在 Supabase Dashboard 建立此帳號**，然後告知 CC email 地址。CC 不需知道密碼。

### 2.2 RLS Policy 更新

新增 authenticated 用戶的 CRUD 權限：

```sql
-- ============================================
-- Admin CRUD policies for authenticated users
-- ============================================

-- site_settings: full CRUD for authenticated
CREATE POLICY "auth_all" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- products: full CRUD for authenticated
CREATE POLICY "auth_all" ON products
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- technology_pillars: full CRUD for authenticated
CREATE POLICY "auth_all" ON technology_pillars
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- rd_stats: full CRUD for authenticated
CREATE POLICY "auth_all" ON rd_stats
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- certifications: full CRUD for authenticated
CREATE POLICY "auth_all" ON certifications
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- milestones: full CRUD for authenticated
CREATE POLICY "auth_all" ON milestones
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- team_members: full CRUD for authenticated
CREATE POLICY "auth_all" ON team_members
  FOR ALL USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- contact_submissions: read + update for authenticated (管理狀態)
CREATE POLICY "auth_read" ON contact_submissions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "auth_update" ON contact_submissions
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
```

---

## 3. Admin Supabase Client

新建 `lib/supabase-admin.ts`：

```typescript
'use client';

import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Client-side admin client — uses auth session
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,    // admin 需要 persist
      autoRefreshToken: true,
    },
  }
);
```

注意：這個 client 用 **anon key**（不是 service_role），CRUD 靠 RLS + auth session 控制。

---

## 4. Admin Layout

### 4.1 `app/admin/layout.tsx`

```typescript
'use client';
```

包含：
- **AuthGuard**：檢查 session，未登入導向 login form
- **Sidebar**（左側 220px）：
  - Logo / brand（「綠能科技 Admin」）
  - Nav items（Dashboard / Site Settings / Products / Technology / About / Submissions）
  - 當前頁高亮
  - 底部：Deploy 按鈕 + Logout 按鈕
- **Main content**（右側 flex-1，`padding: 24px`）

### 4.2 Sidebar Nav Items

| Icon (Lucide) | Label | Route |
|---|---|---|
| `LayoutDashboard` | Dashboard | `/admin` |
| `Settings` | Site Settings | `/admin/site-settings` |
| `Package` | Products | `/admin/products` |
| `Cpu` | Technology | `/admin/technology` |
| `Users` | About | `/admin/about` |
| `MessageSquare` | Submissions | `/admin/submissions` |

### 4.3 Design Token

沿用主站 token，Admin 額外加：

```css
--admin-sidebar: #0c1018;
--admin-input-bg: #1a2230;
--admin-input-border: rgba(94, 234, 212, 0.15);
--admin-input-focus: rgba(94, 234, 212, 0.4);
--admin-success: #22c55e;
--admin-error: #ef4444;
--admin-warning: #f59e0b;
```

---

## 5. 頁面詳細規格

### 5.1 Login（未登入時顯示）

- 置中卡片（`max-width: 400px`）
- Brand：「綠能科技」+ 副標「Content Management」
- Email input + Password input + Login 按鈕
- Error state：帳密錯誤顯示紅色提示
- `supabaseAdmin.auth.signInWithPassword({ email, password })`

### 5.2 Dashboard `/admin`

登入後的首頁，顯示 overview：

- 歡迎訊息 + 當前 admin email
- 快速統計卡片（grid 3 欄）：
  - Products：3（連結到 /admin/products）
  - Submissions：`COUNT(*) WHERE status = 'new'`（未讀數量）
  - Last deploy：顯示最近一次 build 時間（可從 CF API 取或顯示 "N/A"）
- 「Deploy to Production」按鈕（顯眼位置）

### 5.3 Site Settings `/admin/site-settings`

單頁表單，分 section 編輯 `site_settings` 唯一那行。

**Section 1: Hero**
- `title_line_1` — 雙語並排（zh input / en input）
- `title_line_2` — 雙語並排
- `title_accent` — 雙語並排
- `subtitle` — 雙語並排（textarea）

**Section 2: Vision**
- `label` — 單一 input
- `title` — 雙語並排
- `description` — 雙語並排（textarea）

**Section 3: Stats**
- `label` — 單一 input
- `title` — 雙語並排
- `items` — 動態列表（每項：value + unit + label zh/en），可新增/刪除/排序

**Section 4: Footer**
- `tagline` — 雙語並排
- `copyright` — 雙語並排

**Section 5: Contact Info**
- `office` — 雙語並排
- `email` — 單一 input
- `phone` — 單一 input
- `hours` — 雙語並排

**Section 6: SEO Defaults**
- `title` — 雙語並排
- `description` — 雙語並排（textarea）

底部：「Save Changes」按鈕。成功顯示綠色 toast。

**i18n 雙語輸入 UX pattern**：每個 i18n 欄位顯示為兩個 input 並排：
```
┌─ ZH ─────────────┐ ┌─ EN ─────────────┐
│ 儲存能量的         │ │ Store every       │
└───────────────────┘ └───────────────────┘
```
Label 上方標示 `ZH` / `EN` 小標籤。

### 5.4 Products List `/admin/products`

- 表格列出 3 個產品：slug / name(zh) / status / grade / sort_order
- 每行一個「Edit」按鈕連到 `/admin/products/[slug]`
- 不需新增/刪除功能（產品固定 3 個）

### 5.5 Product Edit `/admin/products/[slug]`

單一產品的完整編輯表單，分 tab 或 section：

**Section 1: Basic Info**
- `name` — 雙語
- `name_subtitle` — 雙語
- `tagline` — 雙語（textarea）
- `status` — select（MASS PRODUCTION / PILOT / SHIPPING）
- `grade` — input
- `hero_visual` — select（wireframe / isometric / datasheet）
- `sort_order` — number

**Section 2: Key Specs**（4 項陣列）
- 每項：value input + label input
- 固定 4 項（不可新增/刪除）

**Section 3: Specifications**（~12 項陣列）
- 每項：key input + value input
- 可新增/刪除/上下排序

**Section 4: Performance**（~4 項陣列）
- 每項：label / ours / oursLabel / market / marketLabel / maxValue / inverted checkbox
- 可新增/刪除

**Section 5: Use Cases**（~4 項陣列）
- 每項：icon（select from Lucide icon list）/ title 雙語 / description 雙語
- 可新增/刪除

**Section 6: Documents**（~4 項陣列）
- 每項：name 雙語 / type / size / version / url
- 可新增/刪除

**Section 7: SEO**
- title 雙語
- description 雙語（textarea）

底部：「Save Changes」按鈕。

### 5.6 Technology `/admin/technology`

**Section 1: Pillars**（3 項）
- 每項卡片：icon（select）/ title 雙語 / description 雙語（textarea）
- sort_order drag-and-drop 或 up/down 按鈕
- 可新增/刪除

**Section 2: R&D Stats**（4 項）
- 每項：value input / label 雙語
- sort_order

**Section 3: Certifications**（6 項）
- 每項：name input
- 可新增/刪除

**Section 4: Roadmap Milestones**（4 項，`page='technology'`）
- 每項：year input / content 雙語
- 可新增/刪除/排序

每個 section 各自有 Save 按鈕（或全頁一個 Save）。

### 5.7 About `/admin/about`

**Section 1: Team Members**（4 項）
- 每項卡片：initials / name / role 雙語 / avatar_url（optional）
- 可新增/刪除/排序

**Section 2: Milestones**（5 項，`page='about'`）
- 每項：year input / content 雙語
- 可新增/刪除/排序

### 5.8 Submissions `/admin/submissions`

- 表格：name / email / company / product_interest / created_at / status
- 預設按 `created_at DESC` 排序
- 點擊展開查看完整 message
- Status 可切換：`new` → `read` → `replied` → `archived`
- Badge 顏色：new=accent, read=sub, replied=success, archived=dim
- 篩選：All / New / Read / Replied / Archived

---

## 6. Deploy 按鈕

### 6.1 PM 需手動建立 CF Pages Deploy Hook

在 CF Dashboard → Pages → `green-energy-center` → Settings → Builds & deployments → Deploy hooks：

- **Hook name**：`admin-trigger`
- **Branch**：`main`
- 複製產生的 webhook URL

然後在 `.env.local` 加：

```env
NEXT_PUBLIC_CF_DEPLOY_HOOK_URL=https://api.cloudflare.com/client/v4/pages/webhooks/deploy_hooks/xxxx
```

### 6.2 Deploy Button 元件

```typescript
'use client';

async function triggerDeploy() {
  const url = process.env.NEXT_PUBLIC_CF_DEPLOY_HOOK_URL;
  if (!url) return;
  const res = await fetch(url, { method: 'POST' });
  // 顯示 success / error toast
}
```

按鈕樣式：
- 主色 `--accent` 背景
- 文字：「🚀 Deploy to Production」
- 點擊後變 loading 狀態（spinner + 「Deploying...」）
- 成功後顯示 toast：「Deploy triggered! Changes will be live in ~2 minutes.」

⚠️ Deploy hook 會讓 CF Pages 從 GitHub pull 最新 code 並 build。**但 CF Pages build 環境需要有 Supabase env vars**（PM 在 Step 5 回報中已被提醒要設）。確認以下 env vars 已在 CF Pages Settings 設定：

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

如果 PM 尚未設定，Deploy hook 觸發的 build 會失敗。

---

## 7. 共用元件

### 7.1 `components/admin/BilingualInput.tsx`

雙語輸入元件，接受 `value: {zh: string, en: string}` + `onChange`：

```
Label
┌─ ZH ─────────────┐ ┌─ EN ─────────────┐
│                   │ │                   │
└───────────────────┘ └───────────────────┘
```

Props：`label`, `value`, `onChange`, `multiline?`（textarea vs input）

### 7.2 `components/admin/ArrayEditor.tsx`

動態陣列編輯器。每個 item 是一張卡片，底部有「+ Add Item」按鈕。每張卡片有上移/下移/刪除按鈕。

### 7.3 `components/admin/Toast.tsx`

頂部右側彈出的 toast notification，3 秒後自動消失。success / error / info 三種。

### 7.4 `components/admin/AdminNav.tsx`

左側 sidebar navigation 元件。

### 7.5 `components/admin/AuthGuard.tsx`

檢查 Supabase auth session，未登入顯示 Login form，已登入顯示 children。

---

## 8. 路由結構

```
app/
  admin/
    layout.tsx            ← 'use client', AuthGuard + AdminNav + content area
    page.tsx              ← Dashboard
    site-settings/
      page.tsx            ← Site Settings 編輯
    products/
      page.tsx            ← 產品列表
      [slug]/
        page.tsx          ← 單一產品編輯
    technology/
      page.tsx            ← Technology 內容編輯
    about/
      page.tsx            ← About 內容編輯
    submissions/
      page.tsx            ← 聯絡表單記錄
  components/
    admin/
      AuthGuard.tsx
      AdminNav.tsx
      BilingualInput.tsx
      ArrayEditor.tsx
      Toast.tsx
      DeployButton.tsx
```

---

## 9. Static Export 注意事項

`output: 'export'` 下所有 page 都會被 SSG。Admin 頁面也會被 SSG 成空殼 HTML（因為 `'use client'` 的 server render 只產出 shell）。

⚠️ `app/admin/products/[slug]/page.tsx` 需要 `generateStaticParams`：

```typescript
export function generateStaticParams() {
  return [
    { slug: 'sodium-ion' },
    { slug: 'lithium-ion' },
    { slug: 'supercapacitor' },
  ];
}
```

---

## 10. Build & Deploy

```powershell
Remove-Item -Recurse -Force out, .next -ErrorAction SilentlyContinue

$env:NEXT_OUTPUT = "export"
npm run build

# 確認 admin 頁面也產出
# out/admin/index.html
# out/admin/site-settings/index.html
# out/admin/products/index.html
# out/admin/products/sodium-ion/index.html
# out/admin/products/lithium-ion/index.html
# out/admin/products/supercapacitor/index.html
# out/admin/technology/index.html
# out/admin/about/index.html
# out/admin/submissions/index.html

npx wrangler pages deploy out/ --project-name green-energy-center --branch main
```

---

## 11. Commit

```bash
git add -A
git commit -m "feat: Step 7 — Admin UI with Supabase Auth

- /admin route: client-side SPA for CMS management
- Supabase Auth login (email/password)
- RLS policies updated: authenticated users get full CRUD
- Site Settings editor: hero/vision/stats/footer/contact/seo
- Products editor: full product detail editing with i18n
- Technology editor: pillars/R&D stats/certifications/roadmap
- About editor: team members/milestones
- Submissions viewer: contact form entries with status management
- Deploy button: triggers CF Pages rebuild via deploy hook
- Bilingual input component for all i18n JSONB fields
- Array editor for dynamic list management (specs/usecases/docs)"

git push origin main
```

---

## 12. 驗證 Checklist

| # | 驗證項目 | 預期 |
|---|---|---|
| 1 | `/admin` 未登入 | 顯示 login form |
| 2 | `/admin` 登入 | 輸入 admin email/password → 進入 Dashboard |
| 3 | Dashboard 統計 | Products=3, new submissions count 正確 |
| 4 | Site Settings 載入 | 所有欄位從 DB 載入並顯示 |
| 5 | Site Settings 儲存 | 改一欄位 → Save → 重整頁面 → 確認保留 |
| 6 | Products 列表 | 3 個產品顯示正確 |
| 7 | Product 編輯 | 改 tagline → Save → 重整 → 確認 |
| 8 | Technology 編輯 | 新增一個 certification → Save → 確認 |
| 9 | About 編輯 | 改 team member role → Save → 確認 |
| 10 | Submissions 列表 | 顯示 contact_submissions 記錄 |
| 11 | Submission 狀態切換 | new → read → replied |
| 12 | Deploy 按鈕 | 點擊 → POST deploy hook → 顯示 success toast |
| 13 | Logout | 點擊 → 回到 login form |
| 14 | RLS 驗證 | 未登入用 anon key 嘗試 UPDATE → 被拒 |
| 15 | `npm run build` 無錯誤 | 新增 ~9 admin 頁面，total ~28 pages |

---

## 13. 失敗處理

| 狀況 | 處理 |
|---|---|
| Login 失敗 | 確認 Supabase Auth user 已建立 + email_confirmed |
| CRUD 被 RLS 擋 | 確認 §2.2 的 `auth_all` policy 已執行 |
| Static export 報錯 dynamic route | 確認 admin/products/[slug] 有 `generateStaticParams` |
| Deploy hook 403 | 確認 webhook URL 正確 + CF Pages 設定允許 |
| Admin 頁面在 production 被公開存取 | Admin 有 AuthGuard，未登入只看到 login form。內容安全靠 Supabase Auth + RLS。如需額外保護可在 Step 8 加 CF Access |
| `persistSession` localStorage 問題 | Supabase Auth 預設用 localStorage，在 CF Pages static hosting 下正常運作 |
