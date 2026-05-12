# CC Instruction — Step 7 Admin UI 修正

> **工作目錄**：`C:\projects\Green Energy Center`
> **目標**：修正 Admin UI 兩個問題

---

## Fix 1: Sidebar 固定在畫面左側

**問題**：Sidebar 隨頁面捲動消失。
**修正**：Sidebar 改為 `position: fixed`，主內容區加 `margin-left` 避開。

```css
/* AdminNav / sidebar 容器 */
.adm-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 220px;        /* 維持現有寬度 */
  overflow-y: auto;    /* sidebar 內容超長時自己捲 */
  z-index: 100;
}

/* 主內容區 */
.adm-main {
  margin-left: 220px;  /* 避開 fixed sidebar */
}
```

確認 sidebar 在任何頁面捲動時都固定不動。

---

## Fix 2: 編輯頁面改為可折疊手風琴（Accordion）

**問題**：所有 section 全部展開，頁面太長。
**修正**：每個 section 包在可折疊的 `<Collapsible>` 元件中，預設全部收合，點擊標題展開。

### 建立 `components/admin/Collapsible.tsx`

```typescript
'use client';

import { useState } from 'react';
import { ChevronRight } from 'lucide-react';

interface CollapsibleProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export function Collapsible({ title, defaultOpen = false, children }: CollapsibleProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="adm-collapsible">
      <button
        className="adm-collapsible-header"
        onClick={() => setOpen(!open)}
        type="button"
      >
        <ChevronRight
          size={16}
          className={`adm-collapsible-icon ${open ? 'adm-collapsible-icon--open' : ''}`}
        />
        <span>{title}</span>
      </button>
      {open && (
        <div className="adm-collapsible-body">
          {children}
        </div>
      )}
    </div>
  );
}
```

### CSS

```css
.adm-collapsible {
  border: 0.5px solid var(--admin-input-border, rgba(94, 234, 212, 0.15));
  border-radius: 8px;
  margin-bottom: 12px;
  overflow: hidden;
}

.adm-collapsible-header {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 14px 16px;
  background: var(--card, #10151e);
  border: none;
  color: var(--txt, #e8ecf0);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  letter-spacing: 0.02em;
}

.adm-collapsible-header:hover {
  background: var(--admin-input-bg, #1a2230);
}

.adm-collapsible-icon {
  transition: transform 0.2s;
  color: var(--accent, #5EEAD4);
  flex-shrink: 0;
}

.adm-collapsible-icon--open {
  transform: rotate(90deg);
}

.adm-collapsible-body {
  padding: 16px;
  border-top: 0.5px solid var(--admin-input-border, rgba(94, 234, 212, 0.15));
}
```

### 套用到各編輯頁面

將以下頁面的每個 section 都用 `<Collapsible>` 包起來：

**Site Settings** (`app/admin/site-settings/page.tsx`)：
- `<Collapsible title="Hero" defaultOpen={true}>` — 第一個預設展開
- `<Collapsible title="Vision">`
- `<Collapsible title="Stats">`
- `<Collapsible title="Footer">`
- `<Collapsible title="Contact Info">`
- `<Collapsible title="SEO Defaults">`

**Product Editor** (`components/admin/ProductEditor.tsx`)：
- `<Collapsible title="Basic Info" defaultOpen={true}>`
- `<Collapsible title="Key Specs">`
- `<Collapsible title="Specifications">`
- `<Collapsible title="Performance">`
- `<Collapsible title="Use Cases">`
- `<Collapsible title="Documents">`
- `<Collapsible title="SEO">`

**Technology** (`app/admin/technology/page.tsx`)：
- `<Collapsible title="Pillars" defaultOpen={true}>`
- `<Collapsible title="R&D Stats">`
- `<Collapsible title="Certifications">`
- `<Collapsible title="Roadmap">`

**About** (`app/admin/about/page.tsx`)：
- `<Collapsible title="Team Members" defaultOpen={true}>`
- `<Collapsible title="Milestones">`

每頁只有第一個 section `defaultOpen={true}`，其餘收合。

Save 按鈕保持在 Collapsible 外面的底部（不受折疊影響）。

---

## Build & Deploy

```powershell
Remove-Item -Recurse -Force out, .next -ErrorAction SilentlyContinue
npm run build
npx wrangler pages deploy out/ --project-name green-energy-center --branch main
```

## Commit

```bash
git add -A
git commit -m "fix: admin sidebar fixed position + collapsible sections"
git push origin main
```

## 驗證

| # | 項目 | 預期 |
|---|---|---|
| 1 | Sidebar 捲動 | 任何頁面捲動時 sidebar 固定不動 |
| 2 | Site Settings | 6 個 section 折疊，點標題展開 |
| 3 | Product Editor | 7 個 section 折疊 |
| 4 | Technology | 4 個 section 折疊 |
| 5 | About | 2 個 section 折疊 |
| 6 | 第一個 section 預設展開 | 每頁第一個 section 自動打開 |
| 7 | Save 按鈕 | 不受折疊影響，永遠可見 |
