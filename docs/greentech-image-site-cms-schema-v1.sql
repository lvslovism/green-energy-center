-- =============================================================================
-- 綠能科技 形象站 CMS Schema v1
-- Target: Supabase PostgreSQL
-- Schema: greentech (不可動 public)
-- 執行前請先備份既有 DB
-- =============================================================================

-- =====================
-- 0. Schema & Extensions
-- =====================
create schema if not exists greentech;

create extension if not exists "pgcrypto";       -- gen_random_uuid()
create extension if not exists pg_net;           -- HTTP for deploy hook trigger

-- 設定本地環境變數（部署後改為實際 deploy hook URL）
-- 執行：alter database postgres set "app.cf_deploy_hook" = 'https://api.cloudflare.com/client/v4/pages/...';

set search_path to greentech, public;

-- =====================
-- 1. Locales 啟用語系
-- =====================
create table greentech.cms_locales (
  code              text primary key,
  label             text not null,
  is_default        boolean not null default false,
  enabled           boolean not null default true,
  display_order     int not null default 0,
  created_at        timestamptz not null default now()
);

comment on table greentech.cms_locales is '可用語系列表，is_default 該為 true 者代表 URL 不加前綴';

-- 確保僅一個 default
create unique index uniq_one_default_locale
  on greentech.cms_locales (is_default) where is_default = true;

-- =====================
-- 2. Pages 頁面 metadata
-- =====================
create table greentech.cms_pages (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             jsonb not null default '{}'::jsonb,
  meta_title        jsonb not null default '{}'::jsonb,
  meta_description  jsonb not null default '{}'::jsonb,
  og_image          text,
  published         boolean not null default true,
  display_order     int not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint cms_pages_slug_format check (slug ~ '^[a-z0-9_/-]+$')
);

comment on column greentech.cms_pages.slug is 'home / products/sodium-ion / technology / about / contact';
comment on column greentech.cms_pages.title is '{ "zh-Hant": "...", "en": "..." }';

-- =====================
-- 3. Sections 每頁的區塊內容
-- =====================
create table greentech.cms_sections (
  id                uuid primary key default gen_random_uuid(),
  page_id           uuid not null references greentech.cms_pages(id) on delete cascade,
  section_key       text not null,
  display_order     int not null default 0,
  enabled           boolean not null default true,
  content           jsonb not null default '{}'::jsonb,
  updated_at        timestamptz not null default now(),

  constraint cms_sections_page_section_unique unique (page_id, section_key),
  constraint cms_sections_key_format check (section_key ~ '^[a-z0-9_]+$')
);

comment on table greentech.cms_sections is '每個頁面下的 section content（JSONB 含多語）';
comment on column greentech.cms_sections.section_key is 'hero / marquee / tech_brief / product_matrix / stats / vision / contact_cta';
comment on column greentech.cms_sections.content is '可譯欄位用 { "zh-Hant": "...", "en": "..." } 格式；非譯欄位直接 string/array';

create index idx_cms_sections_page on greentech.cms_sections(page_id);

-- =====================
-- 4. Products 三條產品線
-- =====================
create table greentech.cms_products (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  display_order     int not null default 0,

  -- 視覺設定（決定產品頁與產品卡用哪種變體）
  hero_visual       text not null default '3d_cell',
  card_variant      text not null default 'A',

  -- 多語內容
  name              jsonb not null default '{}'::jsonb,
  tagline           jsonb not null default '{}'::jsonb,
  description       jsonb not null default '{}'::jsonb,
  short_description jsonb not null default '{}'::jsonb,

  -- 規格（技術數據，非譯）
  specs             jsonb not null default '[]'::jsonb,
  -- example: [{ "key": "energy_density", "label": "Energy Density", "value": "340 Wh/kg" }]

  -- 應用場景
  use_cases         jsonb not null default '[]'::jsonb,

  -- 資產
  cover_image       text,
  hero_image        text,

  -- 狀態
  status            text not null default 'active',

  published         boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint cms_products_hero_visual check (hero_visual in ('particle', 'mesh', '3d_cell')),
  constraint cms_products_card_variant check (card_variant in ('A', 'B', 'C')),
  constraint cms_products_status check (status in ('rd', 'pilot', 'mass_prod', 'shipping', 'active', 'discontinued'))
);

comment on column greentech.cms_products.slug is 'sodium-ion / lithium-ion / supercapacitor';

-- =====================
-- 5. Stats 首頁數據區
-- =====================
create table greentech.cms_stats (
  id                uuid primary key default gen_random_uuid(),
  display_order     int not null default 0,
  number_value      int not null,
  suffix            text,
  unit_label        text,
  label             jsonb not null default '{}'::jsonb,
  description       jsonb not null default '{}'::jsonb,
  enabled           boolean not null default true,
  updated_at        timestamptz not null default now()
);

comment on column greentech.cms_stats.suffix is '+, %, K, M 等顯示在數字後的小符號';
comment on column greentech.cms_stats.unit_label is 'Wh/kg, CYCLES, % 等放在數字下方的單位';

-- =====================
-- 6. Marquee 跑馬燈
-- =====================
create table greentech.cms_marquee (
  id                uuid primary key default gen_random_uuid(),
  display_order     int not null default 0,
  text              jsonb not null default '{}'::jsonb,
  is_divider        boolean not null default false,
  divider_char      text,
  muted             boolean not null default false,
  enabled           boolean not null default true,
  updated_at        timestamptz not null default now()
);

comment on column greentech.cms_marquee.is_divider is 'true 時 text 不顯示，僅顯示 divider_char (e.g. ◆ / [ Na+ ])';

-- =====================
-- 7. News / Insights（optional）
-- =====================
create table greentech.cms_news (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  title             jsonb not null default '{}'::jsonb,
  excerpt           jsonb not null default '{}'::jsonb,
  body              jsonb not null default '{}'::jsonb,
  cover_image       text,
  category          text,
  published         boolean not null default false,
  published_at      timestamptz,
  updated_at        timestamptz not null default now()
);

create index idx_cms_news_published on greentech.cms_news(published, published_at desc);

-- =====================
-- 8. Site Settings 全站設定
-- =====================
create table greentech.cms_site_settings (
  key               text primary key,
  value             jsonb not null default '{}'::jsonb,
  description       text,
  updated_at        timestamptz not null default now()
);

comment on column greentech.cms_site_settings.key is 'footer_contact / social_links / company_address / last_rebuild_at 等';

-- =====================
-- 9. Contact Submissions 聯絡表單
-- =====================
create table greentech.contact_submissions (
  id                uuid primary key default gen_random_uuid(),
  name              text not null,
  email             text not null,
  company           text,
  phone             text,
  subject           text,
  message           text not null,
  source_locale     text,
  source_page       text,
  ip_hash           text,
  user_agent        text,
  responded         boolean not null default false,
  responded_at      timestamptz,
  responded_by      uuid,
  created_at        timestamptz not null default now(),

  constraint contact_email_format check (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  constraint contact_message_length check (char_length(message) between 1 and 5000)
);

create index idx_contact_created on greentech.contact_submissions(created_at desc);
create index idx_contact_responded on greentech.contact_submissions(responded, created_at desc);

-- =====================
-- 10. Updated_at trigger
-- =====================
create or replace function greentech.touch_updated_at() returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

do $$
declare t text;
begin
  for t in
    select unnest(array[
      'cms_pages', 'cms_sections', 'cms_products', 'cms_stats',
      'cms_marquee', 'cms_news', 'cms_site_settings'
    ])
  loop
    execute format('
      create trigger trg_%s_touch
      before update on greentech.%s
      for each row execute function greentech.touch_updated_at();
    ', t, t);
  end loop;
end$$;

-- =====================
-- 11. Deploy Hook Trigger
-- =====================
-- CMS 變更 → 觸發 Cloudflare Pages 重建
-- 需在執行前設好 app.cf_deploy_hook
create or replace function greentech.trigger_cf_rebuild() returns trigger as $$
declare
  hook_url text;
  last_rebuild timestamptz;
begin
  -- 取得 deploy hook URL
  begin
    hook_url := current_setting('app.cf_deploy_hook', true);
  exception when others then
    hook_url := null;
  end;

  if hook_url is null or hook_url = '' then
    return coalesce(new, old);
  end if;

  -- Debounce: 60 秒內已觸發過就跳過
  select (value->>'value')::timestamptz into last_rebuild
  from greentech.cms_site_settings
  where key = 'last_rebuild_triggered_at';

  if last_rebuild is not null and now() - last_rebuild < interval '60 seconds' then
    return coalesce(new, old);
  end if;

  -- 發送 POST 到 Cloudflare deploy hook
  perform net.http_post(
    url := hook_url,
    headers := '{"Content-Type": "application/json"}'::jsonb,
    body := jsonb_build_object('trigger', 'cms_update', 'table', tg_table_name, 'op', tg_op)
  );

  -- 記錄觸發時間
  insert into greentech.cms_site_settings(key, value, description)
  values ('last_rebuild_triggered_at', jsonb_build_object('value', now()::text), 'Last CF deploy hook trigger time')
  on conflict (key) do update
  set value = jsonb_build_object('value', now()::text), updated_at = now();

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

-- 在所有 cms_* 表都掛上 trigger
do $$
declare t text;
begin
  for t in
    select unnest(array[
      'cms_pages', 'cms_sections', 'cms_products', 'cms_stats',
      'cms_marquee', 'cms_news', 'cms_site_settings'
    ])
  loop
    execute format('
      create trigger trg_%s_rebuild
      after insert or update or delete on greentech.%s
      for each row execute function greentech.trigger_cf_rebuild();
    ', t, t);
  end loop;
end$$;

-- =====================
-- 12. Row Level Security
-- =====================

-- 啟用 RLS
alter table greentech.cms_locales         enable row level security;
alter table greentech.cms_pages           enable row level security;
alter table greentech.cms_sections        enable row level security;
alter table greentech.cms_products        enable row level security;
alter table greentech.cms_stats           enable row level security;
alter table greentech.cms_marquee         enable row level security;
alter table greentech.cms_news            enable row level security;
alter table greentech.cms_site_settings   enable row level security;
alter table greentech.contact_submissions enable row level security;

-- 公開讀（anon key 可 SELECT 啟用內容）
create policy "anon read locales"      on greentech.cms_locales       for select using (enabled = true);
create policy "anon read pages"        on greentech.cms_pages         for select using (published = true);
create policy "anon read sections"     on greentech.cms_sections      for select using (enabled = true);
create policy "anon read products"     on greentech.cms_products      for select using (published = true);
create policy "anon read stats"        on greentech.cms_stats         for select using (enabled = true);
create policy "anon read marquee"      on greentech.cms_marquee       for select using (enabled = true);
create policy "anon read news"         on greentech.cms_news          for select using (published = true);
create policy "anon read settings"     on greentech.cms_site_settings for select using (true);

-- 寫入限 service_role（admin UI 走 server side service key）
create policy "service write locales"   on greentech.cms_locales       for all using (auth.role() = 'service_role');
create policy "service write pages"     on greentech.cms_pages         for all using (auth.role() = 'service_role');
create policy "service write sections"  on greentech.cms_sections      for all using (auth.role() = 'service_role');
create policy "service write products"  on greentech.cms_products      for all using (auth.role() = 'service_role');
create policy "service write stats"     on greentech.cms_stats         for all using (auth.role() = 'service_role');
create policy "service write marquee"   on greentech.cms_marquee       for all using (auth.role() = 'service_role');
create policy "service write news"      on greentech.cms_news          for all using (auth.role() = 'service_role');
create policy "service write settings"  on greentech.cms_site_settings for all using (auth.role() = 'service_role');

-- contact_submissions：anon 可 INSERT，僅 service_role 可 SELECT/UPDATE
create policy "anon insert contact"     on greentech.contact_submissions for insert with check (true);
create policy "service read contact"    on greentech.contact_submissions for select using (auth.role() = 'service_role');
create policy "service update contact"  on greentech.contact_submissions for update using (auth.role() = 'service_role');

-- =====================
-- 13. Helper view: 把 cms_sections grouped by page
-- =====================
create or replace view greentech.v_page_sections as
select
  p.slug as page_slug,
  p.title as page_title,
  p.meta_title,
  p.meta_description,
  p.og_image,
  jsonb_object_agg(s.section_key, s.content order by s.display_order)
    filter (where s.enabled = true) as sections
from greentech.cms_pages p
left join greentech.cms_sections s on s.page_id = p.id
where p.published = true
group by p.id, p.slug, p.title, p.meta_title, p.meta_description, p.og_image;

grant select on greentech.v_page_sections to anon, authenticated;

-- =====================
-- 14. Seed Data（initial content）
-- =====================

-- Locales
insert into greentech.cms_locales(code, label, is_default, enabled, display_order) values
  ('zh-Hant', '繁體中文', true,  true, 1),
  ('en',      'English',  false, true, 2),
  ('zh-Hans', '简体中文', false, true, 3),
  ('ja',      '日本語',   false, true, 4)
on conflict (code) do nothing;

-- Pages
insert into greentech.cms_pages(slug, title, meta_title, meta_description, display_order) values
  ('home', '{"zh-Hant":"首頁","en":"Home"}', '{"zh-Hant":"綠能科技","en":"Green Energy Tech"}',
   '{"zh-Hant":"次世代儲能 — 鈉離子、鋰電與全超電容。","en":"Next-gen energy storage — sodium-ion, lithium-ion, and supercapacitor."}', 1),
  ('products/sodium-ion', '{"zh-Hant":"鈉離子電池","en":"Sodium-Ion Battery"}',
   '{"zh-Hant":"鈉離子電池 | 綠能科技","en":"Sodium-Ion Battery | Green Energy Tech"}',
   '{"zh-Hant":"原料豐沛、低溫穩定、6,000 次循環。","en":"Abundant raw material, low-temp stable, 6,000+ cycles."}', 2),
  ('products/lithium-ion', '{"zh-Hant":"高密度鋰電","en":"High-Density Lithium-Ion"}',
   '{"zh-Hant":"高能量密度鋰電 | 綠能科技","en":"High-Density Lithium-Ion | Green Energy Tech"}',
   '{"zh-Hant":"340 Wh/kg 高鎳體系，能量密度與安全雙突破。","en":"340 Wh/kg high-nickel cells with breakthrough density and safety."}', 3),
  ('products/supercapacitor', '{"zh-Hant":"全超電容","en":"Supercapacitor"}',
   '{"zh-Hant":"全超電容 | 綠能科技","en":"Supercapacitor | Green Energy Tech"}',
   '{"zh-Hant":"秒級充放電、百萬次循環。","en":"Second-level charge/discharge, million-cycle life."}', 4),
  ('technology', '{"zh-Hant":"技術原理","en":"Technology"}',
   '{"zh-Hant":"技術原理 | 綠能科技","en":"Technology | Green Energy Tech"}',
   '{"zh-Hant":"材料、製程、系統三層創新。","en":"Innovation across materials, process, and system layers."}', 5),
  ('about', '{"zh-Hant":"關於我們","en":"About"}',
   '{"zh-Hant":"關於 | 綠能科技","en":"About | Green Energy Tech"}', '{"zh-Hant":"","en":""}', 6),
  ('contact', '{"zh-Hant":"聯絡","en":"Contact"}',
   '{"zh-Hant":"聯絡 | 綠能科技","en":"Contact | Green Energy Tech"}', '{"zh-Hant":"","en":""}', 7)
on conflict (slug) do nothing;

-- Home Hero section
insert into greentech.cms_sections(page_id, section_key, content, display_order)
select
  (select id from greentech.cms_pages where slug = 'home'),
  'hero',
  jsonb_build_object(
    'eyebrow',                jsonb_build_object('zh-Hant', 'NEXT-GEN ENERGY STORAGE / EST. 2024 / TPE', 'en', 'NEXT-GEN ENERGY STORAGE / EST. 2024 / TPE'),
    'title_line_1',           jsonb_build_object('zh-Hant', '儲存能量的', 'en', 'Storing every'),
    'title_line_2',           jsonb_build_object('zh-Hant', '每一種<em>可能</em>。', 'en', '<em>possibility</em> of energy.'),
    'subtitle',               jsonb_build_object('zh-Hant', '從鈉離子到全超電容，我們以材料工程重新定義電池的能量密度、壽命與安全邊界。', 'en', 'From sodium-ion to supercapacitor — redefining the limits of energy density, lifetime and safety.'),
    'cta_primary_label',      jsonb_build_object('zh-Hant', '探索技術', 'en', 'Explore Tech'),
    'cta_primary_url',        '/technology',
    'cta_secondary_label',    jsonb_build_object('zh-Hant', '觀看簡介', 'en', 'Watch Intro'),
    'cta_secondary_url',      '#intro',
    'meta_items',             jsonb_build_array(
      jsonb_build_object('label', 'PRODUCT_LINES', 'value', '03'),
      jsonb_build_object('label', 'PATENTS',       'value', '14'),
      jsonb_build_object('label', 'PARTNERS',      'value', '27')
    )
  ),
  1
on conflict (page_id, section_key) do nothing;

-- Products
insert into greentech.cms_products(slug, display_order, hero_visual, card_variant, name, tagline, short_description, specs, status) values
  ('sodium-ion', 1, '3d_cell', 'A',
   '{"zh-Hant":"鈉離子電池","en":"Sodium-Ion Battery"}',
   '{"zh-Hant":"原料豐沛 · 低溫穩定 · 6,000+ 次循環","en":"Abundant · Cold-Stable · 6,000+ Cycles"}',
   '{"zh-Hant":"原料豐沛、低溫穩定、循環次數突破 6,000 次。為儲能電廠與商用車隊提供可規模化的鋰電替代方案。","en":"Abundant raw material, cold-temperature stable, with 6,000+ cycles. A scalable alternative to lithium for grid storage and commercial fleets."}',
   '[
      {"key":"energy_density","label":"Energy Density","value":"160 Wh/kg"},
      {"key":"cycle_life","label":"Cycle Life","value":"6,000+"},
      {"key":"op_temp","label":"Op. Temperature","value":"-40°C ~ 80°C"},
      {"key":"status","label":"Status","value":"Mass Production"}
    ]', 'mass_prod'),

  ('lithium-ion', 2, '3d_cell', 'B',
   '{"zh-Hant":"高能量密度鋰電池","en":"High-Density Lithium-Ion"}',
   '{"zh-Hant":"340 Wh/kg · 高鎳體系 · 4C 快充","en":"340 Wh/kg · High-Nickel · 4C Fast Charge"}',
   '{"zh-Hant":"340 Wh/kg 級高鎳體系，搭配自研複合電解質，能量密度與安全性雙重突破。為電動車、航太與消費電子而生。","en":"340 Wh/kg-class high-nickel chemistry with proprietary composite electrolyte. Built for EVs, aerospace, and consumer electronics."}',
   '[
      {"key":"energy_density","label":"Energy Density","value":"340 Wh/kg"},
      {"key":"cycle_life","label":"Cycle Life","value":"2,500+"},
      {"key":"fast_charge","label":"Fast Charge","value":"4C / 15min"},
      {"key":"status","label":"Status","value":"Pilot"}
    ]', 'pilot'),

  ('supercapacitor', 3, '3d_cell', 'C',
   '{"zh-Hant":"全超電容","en":"Supercapacitor"}',
   '{"zh-Hant":"百萬次循環 · 毫秒響應 · 15,000 W/kg","en":"Million Cycles · ms Response · 15,000 W/kg"}',
   '{"zh-Hant":"秒級充放電、百萬次循環。搭配電池形成混合儲能系統，承擔尖峰功率輸出與煞車能量回收。","en":"Second-level charge/discharge with million-cycle life. Pairs with batteries in hybrid storage systems for peak power and regenerative braking."}',
   '[
      {"key":"power_density","label":"Power Density","value":"15,000 W/kg"},
      {"key":"cycle_life","label":"Cycle Life","value":"1,000,000+"},
      {"key":"response","label":"Response","value":"< 1ms"},
      {"key":"status","label":"Status","value":"Shipping"}
    ]', 'shipping')
on conflict (slug) do nothing;

-- Stats
insert into greentech.cms_stats(display_order, number_value, suffix, unit_label, label, description) values
  (1, 340, null, 'Wh/kg',
   '{"zh-Hant":"能量密度","en":"Energy Density"}',
   '{"zh-Hant":"高鎳體系實測能量密度，較市售平均高 28%。","en":"Measured energy density of high-nickel cells, 28% above market average."}'),
  (2, 6000, '+', 'CYCLES',
   '{"zh-Hant":"循環壽命","en":"Cycle Life"}',
   '{"zh-Hant":"鈉電在 80% 容量保持率下的循環壽命。","en":"Sodium-ion cycle life at 80% capacity retention."}'),
  (3, 98, '%', 'EFFICIENCY',
   '{"zh-Hant":"能源效率","en":"Energy Efficiency"}',
   '{"zh-Hant":"超電容混合系統的往返能源效率。","en":"Round-trip efficiency of supercapacitor hybrid system."}')
on conflict do nothing;

-- Marquee items
insert into greentech.cms_marquee(display_order, text, is_divider, divider_char, muted) values
  (1, '{"zh-Hant":"SODIUM-ION","en":"SODIUM-ION"}', false, null, false),
  (2, '{}', true, '[ Na+ ]', false),
  (3, '{"zh-Hant":"鈉離子電池","en":"Sodium-Ion"}', false, null, true),
  (4, '{}', true, '◆', false),
  (5, '{"zh-Hant":"LITHIUM-ION","en":"LITHIUM-ION"}', false, null, false),
  (6, '{}', true, '[ Li+ ]', false),
  (7, '{"zh-Hant":"高密度鋰電","en":"High-Density Li-Ion"}', false, null, true),
  (8, '{}', true, '◆', false),
  (9, '{"zh-Hant":"SUPERCAPACITOR","en":"SUPERCAPACITOR"}', false, null, false),
  (10, '{}', true, '[ F/g ]', false),
  (11, '{"zh-Hant":"全超電容","en":"Supercapacitor"}', false, null, true),
  (12, '{}', true, '◆', false)
on conflict do nothing;

-- Site settings
insert into greentech.cms_site_settings(key, value, description) values
  ('company_name',
   '{"zh-Hant":"綠能科技","en":"Green Energy Tech","zh-Hans":"绿能科技","ja":"グリーンエナジーテック"}',
   '公司名稱（多語）'),
  ('footer_address',
   '{"zh-Hant":"台北市","en":"Taipei, Taiwan","zh-Hans":"台北市","ja":"台北市"}',
   '公司地址'),
  ('contact_email',
   '{"value":"info@greentech.tw"}',
   '公開聯絡 email'),
  ('social_links',
   '{"linkedin":"","twitter":"","github":""}',
   '社群連結')
on conflict (key) do nothing;

-- =====================
-- 15. Verification queries
-- =====================
-- 跑完後請執行以下檢查
-- select count(*) from greentech.cms_locales;       -- 預期 4
-- select count(*) from greentech.cms_pages;         -- 預期 7
-- select count(*) from greentech.cms_products;      -- 預期 3
-- select count(*) from greentech.cms_stats;         -- 預期 3
-- select count(*) from greentech.cms_marquee;       -- 預期 12
-- select * from greentech.v_page_sections where page_slug = 'home';

-- =============================================================================
-- End of greentech-image-site-cms-schema-v1.sql
-- 提醒：
--   1. 執行前備份既有 DB
--   2. 執行後設定 app.cf_deploy_hook（見頂部說明）
--   3. 提交此檔案到版控（GitHub）
--   4. 後續變更請建立 v2 / v3 版本檔，不要直接修改本檔
-- =============================================================================
