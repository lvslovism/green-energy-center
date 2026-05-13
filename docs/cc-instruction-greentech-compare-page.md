# CC Instruction — Green Energy Center: Product Comparison Page

> **前置**：先讀 `CLAUDE.md`，確認最新 commit `8ac96c8`
> **工作目錄**：`C:\projects\Green Energy Center`
> **目標**：新增 `/compare` 產品比較頁
> **部署**：完成後 deploy 到 CF Pages production

---

## 1. 路由

```
app/[locale]/compare/page.tsx
```

需加入 `generateStaticParams`（zh + en）。

---

## 2. 設計規格

### 2.1 配色

每個產品一個專屬色，全頁一致：

| 產品 | CSS Variable | Hex |
|---|---|---|
| 鈉離子電池 | `--color-na` | `#f97316` (orange) |
| 高能量密度鋰電池 | `--color-li` | `#a78bfa` (purple) |
| 全超電容 | `--color-sc` | `#22d3ee` (cyan) |

在 `globals.css` 新增這三個 CSS variable。

### 2.2 頁面結構（長捲軸 4 sections）

---

### Section: Header

- `lab`：PRODUCT COMPARISON
- `h1`：
  - zh：產品比較
  - en：Product comparison
- `subtitle`：
  - zh：三條產品線各有專精。依應用場景、效能需求與成本結構，找到最適合的儲能方案。
  - en：Three product lines, each with its own strengths. Find the best energy storage solution based on your use case, performance needs, and cost structure.

三張產品識別卡並排（3 欄 grid）：
- 每張卡頂部有 2px 產品色 border-top
- 產品中文名（14px bold）
- 產品英文名 / subtitle（10px sub）
- Grade pill（產品色半透明底 + 產品色文字）

RWD `<768px`：三卡改單欄堆疊。

---

### Section 01: Key Specs 比較表

- `lab`：01 / KEY SPECS
- `h2`：
  - zh：關鍵規格比較
  - en：Key specs comparison

HTML `<table>` 四欄（spec name + 3 products），每個產品欄頂部有 2px 產品色 border。

8 個比較維度（hardcoded 比較資料，不從單一產品 DB 取，因為需要統一比較邏輯）：

| Spec | 鈉離子 | 鋰電池 | 超電容 | Best |
|---|---|---|---|---|
| Energy density | 160 Wh/kg | **340 Wh/kg** | — | Li |
| Power density | — | — | **15,000 W/kg** | SC |
| Cycle life | **6,000+** | 2,500+ | **1,000,000+** | SC |
| Operating temp | **-40 ~ 80 °C** | -20 ~ 60 °C | -40 ~ 70 °C | Na |
| Response time | Seconds | Seconds | **< 1 ms** | SC |
| Fast charge | 4C (15 min) | 4C (15 min) | **Full in sec** | SC |
| Calendar life | **15 years** | 10 years | **15+ years** | Na/SC |
| Cost index | **0.30** | 1.00 | 0.80 | Na |

**Best 值**用 `--accent` (#5EEAD4) 色 + `font-weight: 700` 標記。
表格下方小字：`■ = 該維度最佳` / `■ = Best in category`

---

### Section 02: Performance 合併圖

- `lab`：02 / PERFORMANCE
- `h2`：
  - zh：效能對比
  - en：Performance comparison

**Grouped horizontal bar chart**——每個維度三條 bar（Na / Li / SC），用各自產品色。

用 **recharts** `BarChart`（horizontal layout），或 CSS bar（如 recharts 排版困難）。

4 個維度：

| Metric | Na-ion | Li-ion | Supercap | Max | Note |
|---|---|---|---|---|---|
| Energy density (Wh/kg) | 160 | 340 | 10 | 340 | Li best |
| Cycle life (K) | 6 | 2.5 | 1000 | 1000 | SC best |
| Temp range (°C span) | 120 | 80 | 110 | 120 | Na best |
| Cost index (lower=better) | 0.30 | 1.00 | 0.80 | 1.00 | Na best (inverted) |

每條 bar 右側顯示數值。最佳值加 `★` 標記。

底部 legend：三色圓點 + 產品名 + ★ = Best。

**實作選項**：
- **Option A（推薦）**：CSS bar（同 mockup 風格），不需額外 recharts component
- **Option B**：recharts `BarChart` with `layout="vertical"` + 3 個 `<Bar>`

選 Option A 除非你認為 recharts 更合適。重點是三條 bar 要在同一個圖裡並排。

---

### Section 03: Use Case Fit 矩陣

- `lab`：03 / USE CASE FIT
- `h2`：
  - zh：應用場景推薦
  - en：Use case recommendations

Grid 表格（4 欄：場景名 + 3 產品）。

8 個場景：

| 場景 (zh) | 場景 (en) | Na-ion | Li-ion | Supercap |
|---|---|---|---|---|
| 電網級儲能 | Grid-scale storage | ★ 最佳 / ★ Best | 可用 / Suitable | 混搭 / Hybrid |
| 電動車動力 | EV powertrains | 城市短程 / Urban short-range | ★ 最佳 / ★ Best | 不適用 / N/A |
| 商用車隊 | Commercial fleets | ★ 最佳 / ★ Best | 可用 / Suitable | 不適用 / N/A |
| 煞車能量回收 | Regenerative braking | 不適用 / N/A | 不適用 / N/A | ★ 最佳 / ★ Best |
| UPS 不斷電 | UPS backup | 可用 / Suitable | 可用 / Suitable | ★ 最佳 / ★ Best |
| 消費電子 | Consumer electronics | 不適用 / N/A | ★ 最佳 / ★ Best | 不適用 / N/A |
| 離網太陽能 | Off-grid solar | ★ 最佳 / ★ Best | 可用 / Suitable | 混搭 / Hybrid |
| 港口起重機 | Port cranes | 不適用 / N/A | 不適用 / N/A | ★ 最佳 / ★ Best |

Cell 樣式：
- `★ 最佳 / ★ Best`：`--accent` 底色半透明 + `--accent` 文字 + bold
- `可用 / Suitable`：normal `--txt` 色
- `混搭 / Hybrid`：normal `--txt` 色
- `不適用 / N/A`：`--sub` 色 + italic

---

### Section 04: CTA

- `h2`：
  - zh：找到您的方案了嗎？
  - en：Found your solution?
- `subtitle`：
  - zh：點擊下方查看完整產品規格，或直接聯繫我們的儲能方案團隊。
  - en：Click below for full product specs, or contact our energy solutions team directly.

三個產品連結按鈕並排，每個按鈕用對應產品色 border：
- `/${locale}/products/sodium-ion/` — 鈉離子電池 → / Sodium-ion →
- `/${locale}/products/lithium-ion/` — 鋰電池 → / Lithium-ion →
- `/${locale}/products/supercapacitor/` — 超電容 → / Supercapacitor →

下方居中一個「聯繫我們 →」/ 「Contact us →」連結指向 `/${locale}/contact/`。

---

## 3. 資料來源

這頁的比較資料 **hardcoded** 在一個新檔案 `lib/compare-data.ts`，不從 DB 取。原因：

1. 比較邏輯（哪個最佳、場景推薦）需要跨產品判斷，DB 裡沒有這層資料
2. 比較維度和場景矩陣是 PM 策劃的，不需要頻繁更新
3. Step 6 的 CMS fetch 不涉及此頁

`lib/compare-data.ts` export：
- `COMPARISON_SPECS`：8 項 spec 比較
- `PERFORMANCE_METRICS`：4 項效能指標
- `USE_CASE_MATRIX`：8 場景推薦
- 所有可翻譯文字用 `{zh, en}` 物件

---

## 4. i18n

在 `dictionaries/zh.json` 和 `en.json` 各加 `compare` section：

```json
"compare": {
  "label": "PRODUCT COMPARISON",
  "title": "產品比較",
  "subtitle": "三條產品線各有專精。依應用場景、效能需求與成本結構，找到最適合的儲能方案。",
  "specs_label": "01 / KEY SPECS",
  "specs_title": "關鍵規格比較",
  "specs_best_note": "■ = 該維度最佳",
  "perf_label": "02 / PERFORMANCE",
  "perf_title": "效能對比",
  "usecase_label": "03 / USE CASE FIT",
  "usecase_title": "應用場景推薦",
  "cta_title": "找到您的方案了嗎？",
  "cta_subtitle": "點擊下方查看完整產品規格，或直接聯繫我們的儲能方案團隊。",
  "cta_contact": "聯繫我們 →",
  "best": "★ 最佳",
  "suitable": "可用",
  "hybrid": "混搭",
  "na": "不適用"
}
```

English version：
```json
"compare": {
  "label": "PRODUCT COMPARISON",
  "title": "Product comparison",
  "subtitle": "Three product lines, each with its own strengths. Find the best energy storage solution based on your use case, performance needs, and cost structure.",
  "specs_label": "01 / KEY SPECS",
  "specs_title": "Key specs comparison",
  "specs_best_note": "■ = Best in category",
  "perf_label": "02 / PERFORMANCE",
  "perf_title": "Performance comparison",
  "usecase_label": "03 / USE CASE FIT",
  "usecase_title": "Use case recommendations",
  "cta_title": "Found your solution?",
  "cta_subtitle": "Click below for full product specs, or contact our energy solutions team directly.",
  "cta_contact": "Contact us →",
  "best": "★ Best",
  "suitable": "Suitable",
  "hybrid": "Hybrid",
  "na": "N/A"
}
```

---

## 5. Nav 更新

在 Nav 加入「比較」/ 「Compare」連結，位置在「產品」和「技術」之間：

| Nav Item | zh | en | href |
|---|---|---|---|
| 產品 | 產品 | Products | 首頁 scroll / `/${locale}/` |
| **比較** | **比較** | **Compare** | **`/${locale}/compare/`** |
| 技術 | 技術 | Technology | `/${locale}/technology/` |
| 關於 | 關於 | About | `/${locale}/about/` |
| 聯絡 | 聯絡 | Contact | `/${locale}/contact/` |

在 `dictionaries/zh.json` 和 `en.json` 的 `common.nav` 加：
```json
"compare": "比較"
```
```json
"compare": "Compare"
```

---

## 6. SEO Metadata

```typescript
// zh
{ title: '產品比較 | 綠能科技', description: '鈉離子電池、鋰電池、超電容三大產品線規格與效能比較。' }
// en
{ title: 'Product comparison | Green Energy', description: 'Compare specs and performance across sodium-ion, lithium-ion, and supercapacitor product lines.' }
```

---

## 7. Build & Deploy

```powershell
Remove-Item -Recurse -Force out, .next -ErrorAction SilentlyContinue
npm run build

# 確認新增頁面
# out/zh/compare/index.html
# out/en/compare/index.html
# total pages: 30 (28 + 2)

npx wrangler pages deploy out/ --project-name green-energy-center --branch main
```

---

## 8. Commit

```bash
git add -A
git commit -m "feat: add product comparison page /compare

- /[locale]/compare: side-by-side comparison of 3 product lines
- Key specs table with best-value highlighting
- Grouped performance chart (CSS bars, 3 products × 4 metrics)
- Use case fit matrix (8 scenarios × 3 products)
- Product-specific color coding (Na=orange, Li=purple, SC=cyan)
- Nav updated with Compare link
- i18n: zh + en dictionary entries
- Hardcoded comparison data in lib/compare-data.ts"

git push origin main
```

---

## 9. 驗證 Checklist

| # | 驗證項目 | 預期 |
|---|---|---|
| 1 | `/zh/compare/` 頁面載入 | 200 OK，中文內容 |
| 2 | `/en/compare/` 頁面載入 | 200 OK，英文內容 |
| 3 | Specs 比較表 | 8 行 × 4 欄，best 值 accent 高亮 |
| 4 | Performance chart | 4 metrics × 3 products，顏色正確 |
| 5 | Use case matrix | 8 scenarios，★/可用/混搭/不適用 顯示正確 |
| 6 | CTA 按鈕 | 三按鈕各連到正確產品頁（含 locale） |
| 7 | Nav 比較連結 | 出現在 產品 和 技術 之間，點擊跳轉 |
| 8 | RWD `<768px` | 表格可橫向滾動或堆疊，不破版 |
| 9 | `npm run build` | 30 pages，exit 0 |
