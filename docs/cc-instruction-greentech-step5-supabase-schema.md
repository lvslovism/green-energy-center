# CC Instruction — Green Energy Center Step 5: Supabase Schema 部署

> **前置**：先讀 `CLAUDE.md`，確認 Step 4 已完成（commit `67d7830`）
> **工作目錄**：`C:\projects\Green Energy Center`
> **目標**：建立獨立 Supabase 專案 + 部署 schema + seed 全部現有內容
> **注意**：本步只做 DB，不改前端代碼（Step 6 才接）

---

## 0. 建立 Supabase 專案（手動）

PM 需在 Supabase Dashboard 手動操作：

1. 前往 https://supabase.com/dashboard → New Project
2. **Project name**：`green-energy-center`
3. **Organization**：選現有 org
4. **Region**：`Northeast Asia (Tokyo)` — 離台灣最近
5. **Database Password**：產生強密碼並保存
6. 建立完成後記錄：
   - **Project ID**（URL 裡的 `ref`）
   - **Project URL**：`https://<ref>.supabase.co`
   - **Anon key**
   - **Service role key**（⚠️ 不可外洩）

將這些資訊提供給 CC 以便後續步驟。

---

## 1. Schema SQL

在 Supabase SQL Editor 或透過 CC 的 Supabase MCP 執行以下 SQL。

### 1.1 Tables

```sql
-- ============================================
-- Green Energy Center CMS Schema
-- Supabase project: green-energy-center
-- Schema: public (dedicated project)
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. site_settings — 全站設定（單行）
-- ============================================
CREATE TABLE site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  -- Hero section
  hero JSONB NOT NULL DEFAULT '{}',
  -- Vision section
  vision JSONB NOT NULL DEFAULT '{}',
  -- Stats section
  stats JSONB NOT NULL DEFAULT '{}',
  -- Footer
  footer JSONB NOT NULL DEFAULT '{}',
  -- Contact page info (office address, email, phone, hours)
  contact_info JSONB NOT NULL DEFAULT '{}',
  -- SEO defaults
  seo JSONB NOT NULL DEFAULT '{}',
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE site_settings IS '全站設定，僅一行。Hero / Vision / Stats / Footer / Contact info。';

-- ============================================
-- 2. products — 產品目錄
-- ============================================
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT NOT NULL UNIQUE,
  sort_order INT NOT NULL DEFAULT 0,
  -- i18n fields (JSONB with {"zh": "...", "en": "..."})
  name JSONB NOT NULL,           -- {"zh": "鈉離子電池", "en": "Sodium-ion cell"}
  name_subtitle JSONB NOT NULL,  -- {"zh": "Sodium-ion cell", "en": "Sodium-ion cell"}
  tagline JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'PILOT',  -- MASS PRODUCTION / PILOT / SHIPPING
  grade TEXT NOT NULL DEFAULT '',         -- ESS GRADE / EV GRADE / INDUSTRIAL
  -- Structured data
  key_specs JSONB NOT NULL DEFAULT '[]',      -- [{value, label}] — 4 items
  specs JSONB NOT NULL DEFAULT '[]',          -- [{key, value}] — ~12 items
  performance JSONB NOT NULL DEFAULT '[]',    -- [{label, ours, oursLabel, market, marketLabel, maxValue, inverted?}]
  use_cases JSONB NOT NULL DEFAULT '[]',      -- [{icon, title: {zh,en}, description: {zh,en}}]
  documents JSONB NOT NULL DEFAULT '[]',      -- [{name: {zh,en}, type, size, version?, url?}]
  -- Hero visual type
  hero_visual TEXT NOT NULL DEFAULT 'wireframe',  -- wireframe / isometric / datasheet
  -- SEO
  seo JSONB NOT NULL DEFAULT '{}',
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_sort ON products(sort_order);

COMMENT ON TABLE products IS '產品目錄。specs / performance / use_cases / documents 存 JSONB 避免過度正規化。';

-- ============================================
-- 3. technology_pillars — 技術三柱
-- ============================================
CREATE TABLE technology_pillars (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sort_order INT NOT NULL DEFAULT 0,
  icon TEXT NOT NULL,           -- Lucide icon name: Atom / Cog / Cpu
  title JSONB NOT NULL,         -- {"zh": "材料科學", "en": "Materials science"}
  description JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE technology_pillars IS 'Technology 頁的三層技術架構卡片。';

-- ============================================
-- 4. rd_stats — 研發數據
-- ============================================
CREATE TABLE rd_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sort_order INT NOT NULL DEFAULT 0,
  value TEXT NOT NULL,         -- "127", "89", "18%", "3"
  label JSONB NOT NULL,        -- {"zh": "Patents", "en": "Patents"}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE rd_stats IS 'Technology 頁的研發實力數據（4 格）。';

-- ============================================
-- 5. certifications — 認證徽章
-- ============================================
CREATE TABLE certifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sort_order INT NOT NULL DEFAULT 0,
  name TEXT NOT NULL,          -- "ISO 9001", "UN38.3" etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE certifications IS '認證徽章列表。';

-- ============================================
-- 6. milestones — 時間軸（Technology + About 共用）
-- ============================================
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  page TEXT NOT NULL CHECK (page IN ('technology', 'about')),
  sort_order INT NOT NULL DEFAULT 0,
  year TEXT NOT NULL,          -- "2024 Q4" or "2021"
  content JSONB NOT NULL,      -- {"zh": "...", "en": "..."}
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_milestones_page ON milestones(page, sort_order);

COMMENT ON TABLE milestones IS '時間軸，page 欄區分 technology roadmap 與 about milestones。';

-- ============================================
-- 7. team_members — 核心團隊
-- ============================================
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sort_order INT NOT NULL DEFAULT 0,
  initials TEXT NOT NULL,      -- "CL"
  name TEXT NOT NULL,          -- "Chen Li"
  role JSONB NOT NULL,         -- {"zh": "CEO / Co-founder", "en": "CEO / Co-founder"}
  avatar_url TEXT,             -- 未來放照片 URL
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE team_members IS '核心團隊成員。';

-- ============================================
-- 8. contact_submissions — 表單提交記錄
-- ============================================
CREATE TABLE contact_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  product_interest TEXT,
  message TEXT NOT NULL,
  locale TEXT NOT NULL DEFAULT 'zh',
  -- Status tracking
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'read', 'replied', 'archived')),
  -- Email delivery
  email_sent BOOLEAN NOT NULL DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX idx_contact_submissions_created ON contact_submissions(created_at DESC);

COMMENT ON TABLE contact_submissions IS '聯絡表單提交記錄。Step 8 接 Resend 後 email_sent 會更新。';

-- ============================================
-- 9. updated_at trigger
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_site_settings_updated_at
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_technology_pillars_updated_at
  BEFORE UPDATE ON technology_pillars
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_rd_stats_updated_at
  BEFORE UPDATE ON rd_stats
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_milestones_updated_at
  BEFORE UPDATE ON milestones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_team_members_updated_at
  BEFORE UPDATE ON team_members
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### 1.2 RLS Policies

```sql
-- ============================================
-- RLS — 唯讀公開 + service_role 完整權限
-- ============================================

-- 啟用 RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE technology_pillars ENABLE ROW LEVEL SECURITY;
ALTER TABLE rd_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;

-- Public read for content tables (build-time fetch 用 anon key)
CREATE POLICY "public_read" ON site_settings FOR SELECT USING (true);
CREATE POLICY "public_read" ON products FOR SELECT USING (true);
CREATE POLICY "public_read" ON technology_pillars FOR SELECT USING (true);
CREATE POLICY "public_read" ON rd_stats FOR SELECT USING (true);
CREATE POLICY "public_read" ON certifications FOR SELECT USING (true);
CREATE POLICY "public_read" ON milestones FOR SELECT USING (true);
CREATE POLICY "public_read" ON team_members FOR SELECT USING (true);

-- Contact submissions: insert only for anon (form submit), no read
CREATE POLICY "anon_insert" ON contact_submissions
  FOR INSERT WITH CHECK (true);

-- No public read on contact_submissions (admin only via service_role)
-- service_role bypasses RLS by default
```

---

## 2. Seed Data

將 Step 4 dictionary 裡的所有內容搬進 DB。

### 2.1 site_settings

```sql
INSERT INTO site_settings (hero, vision, stats, footer, contact_info, seo) VALUES (
  -- hero
  '{
    "title_line_1": {"zh": "儲存能量的", "en": "Store every"},
    "title_line_2": {"zh": "每一種", "en": "possible form"},
    "title_accent": {"zh": "可能", "en": "of energy"},
    "subtitle": {"zh": "從鈉離子到全超電容，為下一代儲能系統而生。", "en": "From sodium-ion to supercapacitors — built for next-generation energy storage."}
  }'::JSONB,
  -- vision
  '{
    "label": "04 / VISION",
    "title": {"zh": "讓每一度電都能被妥善保存", "en": "Every watt-hour, stored with care"},
    "description": {"zh": "我們相信，下一代儲能技術不該只是鋰電池的改良——而是從材料根本出發的全新解法。", "en": "We believe the next generation of energy storage should not just improve lithium batteries — it should start from fundamentally new materials."}
  }'::JSONB,
  -- stats
  '{
    "label": "03 / DATA",
    "title": {"zh": "數據驗證，不靠口號。", "en": "Data-driven, not marketing-driven."},
    "items": [
      {"value": "160", "unit": "Wh/kg", "label": {"zh": "能量密度", "en": "Energy density"}},
      {"value": "6,000+", "unit": "cycles", "label": {"zh": "循環壽命", "en": "Cycle life"}},
      {"value": "98.5", "unit": "%", "label": {"zh": "能源效率", "en": "Efficiency"}},
      {"value": "<1", "unit": "ms", "label": {"zh": "響應速度", "en": "Response time"}}
    ]
  }'::JSONB,
  -- footer
  '{
    "tagline": {"zh": "一起重新定義能量。", "en": "Redefining energy, together."},
    "copyright": {"zh": "© 2025 綠能科技股份有限公司", "en": "© 2025 Green Energy Technology Co., Ltd."}
  }'::JSONB,
  -- contact_info
  '{
    "office": {"zh": "台北市信義區松仁路 100 號 15F", "en": "15F, No. 100, Songren Rd, Xinyi Dist, Taipei"},
    "email": "info@greentech.tw",
    "phone": "+886 2 2720-XXXX",
    "hours": {"zh": "Mon - Fri, 09:00 - 18:00 (GMT+8)", "en": "Mon - Fri, 09:00 - 18:00 (GMT+8)"}
  }'::JSONB,
  -- seo
  '{
    "title": {"zh": "綠能科技 — 儲存能量的每一種可能", "en": "Green Energy — Store every possible form of energy"},
    "description": {"zh": "鈉離子電池、高能量密度鋰電池、全超電容。從材料到系統的全方位儲能方案。", "en": "Sodium-ion cells, high-energy lithium-ion, supercapacitors. Full-stack energy storage from materials to systems."}
  }'::JSONB
);
```

### 2.2 products

```sql
-- Sodium-ion
INSERT INTO products (slug, sort_order, name, name_subtitle, tagline, status, grade, hero_visual, key_specs, specs, performance, use_cases, documents, seo) VALUES (
  'sodium-ion', 1,
  '{"zh": "鈉離子電池", "en": "Sodium-ion cell"}'::JSONB,
  '{"zh": "Sodium-ion cell", "en": "Sodium-ion cell"}'::JSONB,
  '{"zh": "原料豐沛、低溫穩定、循環次數突破 6,000 次。為儲能電廠與商用車隊提供可規模化的鋰電替代方案。", "en": "Abundant raw materials, low-temperature stability, and over 6,000 charge cycles. A scalable alternative to lithium for grid storage and commercial fleets."}'::JSONB,
  'MASS PRODUCTION', 'ESS GRADE', 'wireframe',
  '[{"value":"160","label":"Wh/kg"},{"value":"6,000+","label":"Cycles"},{"value":"-40~80","label":"Op. Temp (C)"},{"value":"4C","label":"Fast Charge"}]'::JSONB,
  '[{"key":"Cell type","value":"Prismatic"},{"key":"Nominal voltage","value":"3.1 V"},{"key":"Capacity","value":"210 Ah"},{"key":"Energy density","value":"160 Wh/kg"},{"key":"Cycle life (@80% DoD)","value":"6,000+"},{"key":"Calendar life","value":"15 years"},{"key":"Charge temp","value":"-20 ~ 55 °C"},{"key":"Discharge temp","value":"-40 ~ 80 °C"},{"key":"Fast charge rate","value":"4C (15 min)"},{"key":"Dimension","value":"174 × 72 × 208 mm"},{"key":"Weight","value":"4.1 kg"},{"key":"Certifications","value":"UN38.3 / IEC 62619"}]'::JSONB,
  '[{"label":"Energy density (Wh/kg)","ours":160,"oursLabel":"160","market":125,"marketLabel":"125 Market avg","maxValue":340},{"label":"Cycle life (x1000)","ours":6,"oursLabel":"6,000","market":3,"marketLabel":"3,000 Market avg","maxValue":10},{"label":"Low temp retention (-20°C)","ours":88,"oursLabel":"88%","market":65,"marketLabel":"65% LFP avg","maxValue":100},{"label":"Raw material cost index","ours":0.3,"oursLabel":"0.30","market":1,"marketLabel":"1.00 Li baseline","maxValue":1,"inverted":true}]'::JSONB,
  '[{"icon":"Zap","title":{"zh":"電網級儲能","en":"Grid-scale storage"},"description":{"zh":"MW 級儲能電站，削峰填谷、頻率調節。成本較鋰鐵磷低 30%。","en":"MW-class storage plants for peak shaving and frequency regulation. 30% lower cost than LFP."}},{"icon":"Truck","title":{"zh":"商用車隊","en":"Commercial fleets"},"description":{"zh":"城市配送車、公車電池模組。低溫啟動優勢適合寒帶市場。","en":"Urban delivery vehicles and buses. Cold-start advantage for arctic markets."}},{"icon":"Sun","title":{"zh":"離網太陽能","en":"Off-grid solar"},"description":{"zh":"搭配光伏的戶用/工業儲能。15 年免維護降低 TCO。","en":"Residential/industrial storage paired with PV. 15-year maintenance-free TCO."}},{"icon":"Radio","title":{"zh":"通訊基站","en":"Telecom towers"},"description":{"zh":"5G 基站 UPS。寬溫域運作，減少散熱成本。","en":"5G base station UPS. Wide temperature range reduces cooling costs."}}]'::JSONB,
  '[{"name":{"zh":"Product datasheet","en":"Product datasheet"},"type":"PDF","size":"2.4 MB","version":"v3.1"},{"name":{"zh":"UN38.3 test report","en":"UN38.3 test report"},"type":"PDF","size":"1.8 MB"},{"name":{"zh":"MSDS / SDS","en":"MSDS / SDS"},"type":"PDF","size":"680 KB"},{"name":{"zh":"3D CAD model (STEP)","en":"3D CAD model (STEP)"},"type":"STEP","size":"12 MB"}]'::JSONB,
  '{"title":{"zh":"鈉離子電池 | 綠能科技","en":"Sodium-ion cell | Green Energy"},"description":{"zh":"原料豐沛、低溫穩定、循環次數突破 6,000 次。","en":"Abundant raw materials, low-temperature stability, and over 6,000 charge cycles."}}'::JSONB
);

-- Lithium-ion
INSERT INTO products (slug, sort_order, name, name_subtitle, tagline, status, grade, hero_visual, key_specs, specs, performance, use_cases, documents, seo) VALUES (
  'lithium-ion', 2,
  '{"zh": "高能量密度鋰電池", "en": "High-energy lithium-ion"}'::JSONB,
  '{"zh": "Lithium-ion high-nickel", "en": "Lithium-ion high-nickel"}'::JSONB,
  '{"zh": "340 Wh/kg 級高鎳體系，搭配自研複合電解質，能量密度與安全性雙重突破。為電動車、航太與消費電子而生。", "en": "340 Wh/kg high-nickel system with proprietary composite electrolyte — a dual breakthrough in energy density and safety. Built for EVs, aerospace, and consumer electronics."}'::JSONB,
  'PILOT', 'EV GRADE', 'isometric',
  '[{"value":"340","label":"Wh/kg"},{"value":"2,500+","label":"Cycles"},{"value":"-20~60","label":"Op. Temp (C)"},{"value":"4C/15min","label":"Fast Charge"}]'::JSONB,
  '[{"key":"Cell type","value":"Pouch"},{"key":"Nominal voltage","value":"3.7 V"},{"key":"Capacity","value":"120 Ah"},{"key":"Energy density","value":"340 Wh/kg"},{"key":"Cycle life (@80% DoD)","value":"2,500+"},{"key":"Calendar life","value":"10 years"},{"key":"Charge temp","value":"0 ~ 45 °C"},{"key":"Discharge temp","value":"-20 ~ 60 °C"},{"key":"Fast charge rate","value":"4C (15 min)"},{"key":"Dimension","value":"325 × 100 × 12 mm"},{"key":"Weight","value":"1.3 kg"},{"key":"Certifications","value":"UN38.3 / IEC 62660"}]'::JSONB,
  '[{"label":"Energy density (Wh/kg)","ours":340,"oursLabel":"340","market":265,"marketLabel":"265 Market avg","maxValue":400},{"label":"Cycle life (x1000)","ours":2.5,"oursLabel":"2,500","market":1.5,"marketLabel":"1,500 Market avg","maxValue":10},{"label":"Volumetric density (Wh/L)","ours":750,"oursLabel":"750","market":600,"marketLabel":"600 Market avg","maxValue":800},{"label":"Thermal runaway temp (°C)","ours":240,"oursLabel":"240°C","market":180,"marketLabel":"180°C Market avg","maxValue":300}]'::JSONB,
  '[{"icon":"Car","title":{"zh":"電動車動力","en":"EV powertrains"},"description":{"zh":"乘用車與商用車動力電池。340 Wh/kg 延長續航，快充 15 分鐘達 80%。","en":"Passenger and commercial EV battery packs. 340 Wh/kg extends range; 15-min fast charge to 80%."}},{"icon":"Plane","title":{"zh":"航太電源","en":"Aerospace power"},"description":{"zh":"無人機、低軌衛星輔助電源。極致能量密度降低酬載負擔。","en":"Drones and LEO satellite auxiliary power. Maximum energy density reduces payload burden."}},{"icon":"Smartphone","title":{"zh":"消費電子","en":"Consumer electronics"},"description":{"zh":"筆電、穿戴裝置。輕量化設計讓設備更薄更持久。","en":"Laptops and wearables. Lightweight design for thinner, longer-lasting devices."}},{"icon":"HeartPulse","title":{"zh":"醫療設備","en":"Medical devices"},"description":{"zh":"攜帶式醫療器材。高安全性通過 IEC 62660 驗證。","en":"Portable medical equipment. High safety validated by IEC 62660 certification."}}]'::JSONB,
  '[{"name":{"zh":"Product datasheet","en":"Product datasheet"},"type":"PDF","size":"3.1 MB","version":"v2.0"},{"name":{"zh":"IEC 62660 report","en":"IEC 62660 report"},"type":"PDF","size":"2.2 MB"},{"name":{"zh":"MSDS / SDS","en":"MSDS / SDS"},"type":"PDF","size":"720 KB"},{"name":{"zh":"3D CAD model (STEP)","en":"3D CAD model (STEP)"},"type":"STEP","size":"8 MB"}]'::JSONB,
  '{"title":{"zh":"高能量密度鋰電池 | 綠能科技","en":"High-energy lithium-ion | Green Energy"},"description":{"zh":"340 Wh/kg 級高鎳體系，能量密度與安全性雙重突破。","en":"340 Wh/kg high-nickel system — breakthrough in energy density and safety."}}'::JSONB
);

-- Supercapacitor
INSERT INTO products (slug, sort_order, name, name_subtitle, tagline, status, grade, hero_visual, key_specs, specs, performance, use_cases, documents, seo) VALUES (
  'supercapacitor', 3,
  '{"zh": "全超電容", "en": "Supercapacitor"}'::JSONB,
  '{"zh": "Supercapacitor", "en": "Supercapacitor"}'::JSONB,
  '{"zh": "秒級充放電、百萬次循環。搭配電池形成混合儲能系統，承擔尖峰功率輸出與煞車能量回收。", "en": "Sub-second charge/discharge, one million+ cycles. Paired with batteries in hybrid storage systems for peak power and regenerative braking."}'::JSONB,
  'SHIPPING', 'INDUSTRIAL', 'datasheet',
  '[{"value":"15,000","label":"W/kg"},{"value":"1M+","label":"Cycles"},{"value":"< 1ms","label":"Response"},{"value":"2.7V","label":"Voltage"}]'::JSONB,
  '[{"key":"Type","value":"EDLC"},{"key":"Model","value":"SC-EDLC-3000"},{"key":"Capacitance","value":"3,000 F"},{"key":"Rated voltage","value":"2.7 V"},{"key":"ESR (DC)","value":"0.29 mΩ"},{"key":"Power density","value":"15,000 W/kg"},{"key":"Cycle life","value":"1,000,000+"},{"key":"Op. temp","value":"-40 ~ 70 °C"},{"key":"Response time","value":"< 1 ms"},{"key":"Dimension","value":"60 × 138 mm (cylindrical)"},{"key":"Weight","value":"0.52 kg"},{"key":"Certifications","value":"AEC-Q200 / IEC 62391"}]'::JSONB,
  '[{"label":"Power density (W/kg)","ours":15000,"oursLabel":"15,000","market":10000,"marketLabel":"10,000 Market avg","maxValue":20000},{"label":"Cycle life","ours":1000000,"oursLabel":"1M","market":500000,"marketLabel":"500K Market avg","maxValue":1000000},{"label":"Response time (ms)","ours":0.5,"oursLabel":"0.5 ms","market":5,"marketLabel":"5 ms Market avg","maxValue":10,"inverted":true},{"label":"Round-trip efficiency","ours":98,"oursLabel":"98%","market":92,"marketLabel":"92% Market avg","maxValue":100}]'::JSONB,
  '[{"icon":"RefreshCw","title":{"zh":"煞車能量回收","en":"Regenerative braking"},"description":{"zh":"軌道交通與電動巴士煞車能量即時回收再利用。","en":"Real-time energy recovery and reuse for rail transit and electric buses."}},{"icon":"Activity","title":{"zh":"電網頻率調節","en":"Grid frequency regulation"},"description":{"zh":"毫秒級響應，穩定電網頻率波動。","en":"Millisecond response to stabilize grid frequency fluctuations."}},{"icon":"ShieldCheck","title":{"zh":"UPS 不斷電","en":"UPS backup"},"description":{"zh":"資料中心與關鍵設施瞬時備援。百萬次循環無需更換。","en":"Instant backup for data centers and critical facilities. 1M+ cycles, no replacement."}},{"icon":"Anchor","title":{"zh":"港口起重機","en":"Port cranes"},"description":{"zh":"橋式起重機下降動能回收。降低柴油消耗 40%。","en":"Gantry crane lowering energy recovery. Reduces diesel consumption by 40%."}}]'::JSONB,
  '[{"name":{"zh":"Product datasheet","en":"Product datasheet"},"type":"PDF","size":"1.9 MB","version":"v4.2"},{"name":{"zh":"AEC-Q200 report","en":"AEC-Q200 report"},"type":"PDF","size":"1.4 MB"},{"name":{"zh":"MSDS / SDS","en":"MSDS / SDS"},"type":"PDF","size":"550 KB"},{"name":{"zh":"Application note","en":"Application note"},"type":"PDF","size":"3.2 MB"}]'::JSONB,
  '{"title":{"zh":"全超電容 | 綠能科技","en":"Supercapacitor | Green Energy"},"description":{"zh":"秒級充放電、百萬次循環。","en":"Sub-second charge/discharge, one million+ cycles."}}'::JSONB
);
```

### 2.3 technology_pillars

```sql
INSERT INTO technology_pillars (sort_order, icon, title, description) VALUES
(1, 'Atom',
  '{"zh": "材料科學", "en": "Materials science"}'::JSONB,
  '{"zh": "自研正極材料與電解質配方。鈉電正極採用層狀氧化物體系，高鎳鋰電搭配複合固態電解質。", "en": "Proprietary cathode materials and electrolyte formulations. Sodium-ion uses layered oxide cathode; high-nickel Li-ion pairs with composite solid electrolyte."}'::JSONB),
(2, 'Cog',
  '{"zh": "製程工程", "en": "Process engineering"}'::JSONB,
  '{"zh": "乾法電極塗佈技術，良率 98.5%。單線日產能 2 GWh，製程耗水量較傳統降低 70%。", "en": "Dry electrode coating technology with 98.5% yield. Single-line daily capacity of 2 GWh; 70% reduction in water usage vs. conventional."}'::JSONB),
(3, 'Cpu',
  '{"zh": "系統整合", "en": "Systems integration"}'::JSONB,
  '{"zh": "自研 BMS 晶片 + 雲端能源管理平台。支援鈉電 / 鋰電 / 超電容混合架構，AI 預測性維護。", "en": "Proprietary BMS chip + cloud energy management platform. Supports Na-ion / Li-ion / supercap hybrid architecture with AI predictive maintenance."}'::JSONB);
```

### 2.4 rd_stats

```sql
INSERT INTO rd_stats (sort_order, value, label) VALUES
(1, '127', '{"zh": "Patents", "en": "Patents"}'::JSONB),
(2, '89', '{"zh": "R&D Engineers", "en": "R&D Engineers"}'::JSONB),
(3, '18%', '{"zh": "Revenue to R&D", "en": "Revenue to R&D"}'::JSONB),
(4, '3', '{"zh": "Research Labs", "en": "Research Labs"}'::JSONB);
```

### 2.5 certifications

```sql
INSERT INTO certifications (sort_order, name) VALUES
(1, 'ISO 9001'),
(2, 'ISO 14001'),
(3, 'IATF 16949'),
(4, 'UL 1973'),
(5, 'IEC 62619'),
(6, 'UN38.3');
```

### 2.6 milestones

```sql
-- Technology roadmap
INSERT INTO milestones (page, sort_order, year, content) VALUES
('technology', 1, '2024 Q4', '{"zh": "鈉離子電池量產線投產（Phase 1: 2 GWh）", "en": "Sodium-ion mass production line commissioned (Phase 1: 2 GWh)"}'::JSONB),
('technology', 2, '2025 Q2', '{"zh": "高鎳鋰電池 340 Wh/kg pilot line 驗證完成", "en": "High-nickel Li-ion 340 Wh/kg pilot line validation completed"}'::JSONB),
('technology', 3, '2025 Q4', '{"zh": "超電容模組通過車規 AEC-Q200 認證", "en": "Supercapacitor module passes automotive AEC-Q200 certification"}'::JSONB),
('technology', 4, '2026 Q2', '{"zh": "混合儲能系統（鈉電 + 超電容）首個 MW 級案場交付", "en": "Hybrid storage system (Na-ion + supercap) first MW-scale site delivered"}'::JSONB);

-- About milestones
INSERT INTO milestones (page, sort_order, year, content) VALUES
('about', 1, '2021', '{"zh": "台北實驗室成立，完成首顆鈉離子原型電芯", "en": "Taipei lab established; first sodium-ion prototype cell completed"}'::JSONB),
('about', 2, '2022', '{"zh": "Pre-A 輪融資完成，啟動中試線建設", "en": "Pre-Series A funding closed; pilot production line construction began"}'::JSONB),
('about', 3, '2023', '{"zh": "超電容產品線量產出貨，首批客戶交付", "en": "Supercapacitor line enters mass production; first customer deliveries"}'::JSONB),
('about', 4, '2024', '{"zh": "鈉電量產線投產（2 GWh），取得 ISO 9001 / 14001", "en": "Na-ion production line commissioned (2 GWh); ISO 9001/14001 certified"}'::JSONB),
('about', 5, '2025', '{"zh": "高鎳鋰電池進入 pilot 階段，團隊擴展至 200+ 人", "en": "High-nickel Li-ion enters pilot phase; team grows to 200+"}'::JSONB);
```

### 2.7 team_members

```sql
INSERT INTO team_members (sort_order, initials, name, role) VALUES
(1, 'CL', 'Chen Li', '{"zh": "CEO / Co-founder", "en": "CEO / Co-founder"}'::JSONB),
(2, 'WH', 'Wang Hao', '{"zh": "CTO", "en": "CTO"}'::JSONB),
(3, 'LY', 'Lin Yu', '{"zh": "VP Materials", "en": "VP Materials"}'::JSONB),
(4, 'ZW', 'Zhang Wei', '{"zh": "VP Engineering", "en": "VP Engineering"}'::JSONB);
```

---

## 3. 環境變數設定

在專案根目錄建立 `.env.local`（⚠️ 已在 `.gitignore`）：

```env
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

安裝 Supabase client：

```bash
npm install @supabase/supabase-js
```

建立 `lib/supabase.ts`：

```typescript
import { createClient } from '@supabase/supabase-js';

// Build-time client (server-only, uses anon key for public read)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
```

⚠️ **不要在前端代碼中使用 service_role key。** Service role 僅用於 CF Pages Function（Step 8 的 contact submission 寫入）。

---

## 4. 驗證 Queries

執行以下 SQL 確認資料完整性：

```sql
-- 驗證各表筆數
SELECT 'site_settings' AS tbl, COUNT(*) FROM site_settings
UNION ALL SELECT 'products', COUNT(*) FROM products
UNION ALL SELECT 'technology_pillars', COUNT(*) FROM technology_pillars
UNION ALL SELECT 'rd_stats', COUNT(*) FROM rd_stats
UNION ALL SELECT 'certifications', COUNT(*) FROM certifications
UNION ALL SELECT 'milestones', COUNT(*) FROM milestones
UNION ALL SELECT 'team_members', COUNT(*) FROM team_members
UNION ALL SELECT 'contact_submissions', COUNT(*) FROM contact_submissions;
```

預期結果：

| Table | Count |
|---|---|
| site_settings | 1 |
| products | 3 |
| technology_pillars | 3 |
| rd_stats | 4 |
| certifications | 6 |
| milestones | 9 |
| team_members | 4 |
| contact_submissions | 0 |

```sql
-- 驗證 i18n JSONB 結構完整
SELECT slug,
  name->>'zh' AS name_zh,
  name->>'en' AS name_en,
  tagline->>'zh' IS NOT NULL AS has_zh_tagline,
  tagline->>'en' IS NOT NULL AS has_en_tagline
FROM products ORDER BY sort_order;

-- 驗證 milestones 分頁
SELECT page, COUNT(*) FROM milestones GROUP BY page;
-- 預期: technology=4, about=5

-- 驗證 RLS: anon 可讀 products
-- (在 Supabase SQL Editor 用 "Run as anon" 模式)
SELECT slug, name->>'en' FROM products;
```

---

## 5. Commit

```bash
git add -A
git commit -m "feat: Step 5 — Supabase schema + seed data + client setup

- New Supabase project: green-energy-center
- 8 tables: site_settings, products, technology_pillars, rd_stats, certifications, milestones, team_members, contact_submissions
- RLS: public read for content tables, insert-only for contact submissions
- JSONB i18n pattern: {zh, en} on all translatable fields
- Full seed data matching Step 4 dictionary content
- Supabase client lib/supabase.ts (anon key, build-time read)
- .env.local with project credentials (gitignored)"

git push origin main
```

---

## 6. 驗證 Checklist

| # | 驗證項目 | 預期 |
|---|---|---|
| 1 | Supabase project 建立 | Dashboard 可見，status Active |
| 2 | Schema SQL 執行無錯 | 8 tables + 6 triggers + RLS policies |
| 3 | Seed data 筆數正確 | 見 §4 預期表 |
| 4 | products 3 筆 JSONB 完整 | zh + en 雙語、specs/performance/usecases/documents 非空 |
| 5 | milestones 分頁正確 | technology=4, about=5 |
| 6 | RLS anon read 可行 | `SELECT * FROM products` 用 anon 執行成功 |
| 7 | RLS contact_submissions insert | anon 可 INSERT，不可 SELECT |
| 8 | `.env.local` 存在 + gitignored | `git status` 不顯示 .env.local |
| 9 | `@supabase/supabase-js` 安裝 | `package.json` 有 dependency |
| 10 | `lib/supabase.ts` 存在 | import 不報錯 |
| 11 | `npm run build` 仍通過 | 現有靜態頁不受影響（尚未接 DB） |

---

## 7. 失敗處理

| 狀況 | 處理 |
|---|---|
| JSONB 語法錯誤 | 檢查 JSON 內的引號是否用雙引號、逗號是否完整 |
| RLS policy 報 duplicate | `DROP POLICY IF EXISTS "public_read" ON <table>` 後重建 |
| uuid-ossp 不存在 | `CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;` |
| .env.local 未被 gitignore | 確認 `.gitignore` 有 `.env.local` 行 |
| Seed 執行成功但查詢 0 筆 | 確認沒有在 transaction 中 ROLLBACK |
