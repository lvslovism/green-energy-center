"use client";
import { useEffect, useState } from "react";
import { Save, Plus, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import BilingualInput from "@/components/admin/BilingualInput";
import Collapsible from "@/components/admin/Collapsible";
import { useToast, DEPLOY_HINT } from "@/components/admin/Toast";

type Bi = { zh: string; en: string };

type StatItem = { value: string; unit: string; label: Bi };

type HeroData = {
  title_line_1: Bi;
  title_line_2: Bi;
  title_accent: Bi;
  subtitle: Bi;
};
type VisionData = {
  label: string;
  title: Bi;
  description: Bi;
};
type StatsData = {
  label: string;
  title: Bi;
  items: StatItem[];
};
type FooterData = {
  tagline: Bi;
  copyright: Bi;
};
type ContactInfoData = {
  office: Bi;
  email: string;
  phone: string;
  hours: Bi;
};
type SeoData = { title: Bi; description: Bi };

type FullData = {
  id?: string;
  hero: HeroData;
  vision: VisionData;
  stats: StatsData;
  footer: FooterData;
  contact_info: ContactInfoData;
  seo: SeoData;
};

const EMPTY_BI: Bi = { zh: "", en: "" };

const DEFAULTS: FullData = {
  hero: {
    title_line_1: EMPTY_BI,
    title_line_2: EMPTY_BI,
    title_accent: EMPTY_BI,
    subtitle: EMPTY_BI,
  },
  vision: { label: "", title: EMPTY_BI, description: EMPTY_BI },
  stats: { label: "", title: EMPTY_BI, items: [] },
  footer: { tagline: EMPTY_BI, copyright: EMPTY_BI },
  contact_info: { office: EMPTY_BI, email: "", phone: "", hours: EMPTY_BI },
  seo: { title: EMPTY_BI, description: EMPTY_BI },
};

export default function SiteSettingsPage() {
  const { push } = useToast();
  const [data, setData] = useState<FullData | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: row, error } = await supabaseAdmin
        .from("site_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) {
        push({ kind: "error", title: "Load failed", body: error.message });
        setData(DEFAULTS);
        return;
      }
      if (!row) {
        setData(DEFAULTS);
        return;
      }
      setData({
        id: row.id,
        hero: { ...DEFAULTS.hero, ...((row.hero as object) ?? {}) } as HeroData,
        vision: { ...DEFAULTS.vision, ...((row.vision as object) ?? {}) } as VisionData,
        stats: { ...DEFAULTS.stats, ...((row.stats as object) ?? {}) } as StatsData,
        footer: { ...DEFAULTS.footer, ...((row.footer as object) ?? {}) } as FooterData,
        contact_info: {
          ...DEFAULTS.contact_info,
          ...((row.contact_info as object) ?? {}),
        } as ContactInfoData,
        seo: { ...DEFAULTS.seo, ...((row.seo as object) ?? {}) } as SeoData,
      });
    })();
  }, [push]);

  if (!data) {
    return <div className="adm-loading">Loading…</div>;
  }

  const save = async () => {
    setBusy(true);
    const payload = {
      hero: data.hero,
      vision: data.vision,
      stats: data.stats,
      footer: data.footer,
      contact_info: data.contact_info,
      seo: data.seo,
    };
    const q = data.id
      ? supabaseAdmin.from("site_settings").update(payload).eq("id", data.id)
      : supabaseAdmin.from("site_settings").insert(payload);
    const { error } = await q;
    setBusy(false);
    if (error) {
      push({ kind: "error", title: "Save failed", body: error.message });
      return;
    }
    push({ kind: "success", title: "Saved", body: DEPLOY_HINT });
  };

  return (
    <>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Site Settings</h1>
          <p className="adm-page-sub">Hero / Vision / Stats / Footer / Contact / SEO defaults</p>
        </div>
        <button type="button" className="adm-btn adm-btn-primary" onClick={save} disabled={busy}>
          <Save size={14} /> {busy ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Hero */}
      <Collapsible title="Hero" defaultOpen>
        <BilingualInput
          label="Title line 1"
          value={data.hero.title_line_1}
          onChange={(v) => setData({ ...data, hero: { ...data.hero, title_line_1: v } })}
        />
        <BilingualInput
          label="Title line 2"
          value={data.hero.title_line_2}
          onChange={(v) => setData({ ...data, hero: { ...data.hero, title_line_2: v } })}
        />
        <BilingualInput
          label="Title accent (em portion)"
          value={data.hero.title_accent}
          onChange={(v) => setData({ ...data, hero: { ...data.hero, title_accent: v } })}
        />
        <BilingualInput
          label="Subtitle"
          value={data.hero.subtitle}
          onChange={(v) => setData({ ...data, hero: { ...data.hero, subtitle: v } })}
          multiline
        />
      </Collapsible>

      {/* Vision */}
      <Collapsible title="Vision">
        <div className="adm-field">
          <label className="adm-field-label">Label</label>
          <input
            className="adm-input"
            value={data.vision.label}
            onChange={(e) => setData({ ...data, vision: { ...data.vision, label: e.target.value } })}
          />
        </div>
        <BilingualInput
          label="Title"
          value={data.vision.title}
          onChange={(v) => setData({ ...data, vision: { ...data.vision, title: v } })}
        />
        <BilingualInput
          label="Description"
          value={data.vision.description}
          onChange={(v) => setData({ ...data, vision: { ...data.vision, description: v } })}
          multiline
        />
      </Collapsible>

      {/* Stats */}
      <Collapsible title="Stats">
        <div className="adm-field">
          <label className="adm-field-label">Label</label>
          <input
            className="adm-input"
            value={data.stats.label}
            onChange={(e) => setData({ ...data, stats: { ...data.stats, label: e.target.value } })}
          />
        </div>
        <BilingualInput
          label="Title"
          value={data.stats.title}
          onChange={(v) => setData({ ...data, stats: { ...data.stats, title: v } })}
        />
        <div className="adm-field">
          <label className="adm-field-label">Items</label>
          <div className="adm-array">
            {data.stats.items.map((it, i) => {
              const updateItem = (patch: Partial<StatItem>) => {
                const next = data.stats.items.slice();
                next[i] = { ...next[i], ...patch };
                setData({ ...data, stats: { ...data.stats, items: next } });
              };
              const remove = () => {
                setData({
                  ...data,
                  stats: { ...data.stats, items: data.stats.items.filter((_, x) => x !== i) },
                });
              };
              const move = (dir: -1 | 1) => {
                const j = i + dir;
                if (j < 0 || j >= data.stats.items.length) return;
                const next = data.stats.items.slice();
                [next[i], next[j]] = [next[j], next[i]];
                setData({ ...data, stats: { ...data.stats, items: next } });
              };
              return (
                <div key={i} className="adm-array-item">
                  <div className="adm-array-item-header">
                    <span>Item #{i + 1}</span>
                    <div className="adm-array-controls">
                      <button
                        type="button"
                        className="adm-icon-btn"
                        onClick={() => move(-1)}
                        disabled={i === 0}
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        type="button"
                        className="adm-icon-btn"
                        onClick={() => move(1)}
                        disabled={i === data.stats.items.length - 1}
                      >
                        <ChevronDown size={14} />
                      </button>
                      <button
                        type="button"
                        className="adm-icon-btn adm-icon-btn-danger"
                        onClick={remove}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="adm-grid-2">
                    <div className="adm-field">
                      <label className="adm-field-label">Value</label>
                      <input
                        className="adm-input"
                        value={it.value}
                        onChange={(e) => updateItem({ value: e.target.value })}
                      />
                    </div>
                    <div className="adm-field">
                      <label className="adm-field-label">Unit</label>
                      <input
                        className="adm-input"
                        value={it.unit}
                        onChange={(e) => updateItem({ unit: e.target.value })}
                      />
                    </div>
                  </div>
                  <BilingualInput
                    label="Label"
                    value={it.label ?? EMPTY_BI}
                    onChange={(v) => updateItem({ label: v })}
                  />
                </div>
              );
            })}
            <button
              type="button"
              className="adm-add-btn"
              onClick={() =>
                setData({
                  ...data,
                  stats: {
                    ...data.stats,
                    items: [...data.stats.items, { value: "", unit: "", label: EMPTY_BI }],
                  },
                })
              }
            >
              <Plus size={14} /> Add stat
            </button>
          </div>
        </div>
      </Collapsible>

      {/* Footer */}
      <Collapsible title="Footer">
        <BilingualInput
          label="Tagline"
          value={data.footer.tagline}
          onChange={(v) => setData({ ...data, footer: { ...data.footer, tagline: v } })}
        />
        <BilingualInput
          label="Copyright"
          value={data.footer.copyright}
          onChange={(v) => setData({ ...data, footer: { ...data.footer, copyright: v } })}
        />
      </Collapsible>

      {/* Contact info */}
      <Collapsible title="Contact Info">
        <BilingualInput
          label="Office address"
          value={data.contact_info.office}
          onChange={(v) =>
            setData({ ...data, contact_info: { ...data.contact_info, office: v } })
          }
        />
        <div className="adm-grid-2">
          <div className="adm-field">
            <label className="adm-field-label">Email</label>
            <input
              className="adm-input"
              type="email"
              value={data.contact_info.email}
              onChange={(e) =>
                setData({
                  ...data,
                  contact_info: { ...data.contact_info, email: e.target.value },
                })
              }
            />
          </div>
          <div className="adm-field">
            <label className="adm-field-label">Phone</label>
            <input
              className="adm-input"
              value={data.contact_info.phone}
              onChange={(e) =>
                setData({
                  ...data,
                  contact_info: { ...data.contact_info, phone: e.target.value },
                })
              }
            />
          </div>
        </div>
        <BilingualInput
          label="Hours"
          value={data.contact_info.hours}
          onChange={(v) =>
            setData({ ...data, contact_info: { ...data.contact_info, hours: v } })
          }
        />
      </Collapsible>

      {/* SEO */}
      <Collapsible title="SEO Defaults">
        <BilingualInput
          label="Title"
          value={data.seo.title}
          onChange={(v) => setData({ ...data, seo: { ...data.seo, title: v } })}
        />
        <BilingualInput
          label="Description"
          value={data.seo.description}
          onChange={(v) => setData({ ...data, seo: { ...data.seo, description: v } })}
          multiline
        />
      </Collapsible>

      <div className="adm-action-bar">
        <button type="button" className="adm-btn adm-btn-primary" onClick={save} disabled={busy}>
          <Save size={14} /> {busy ? "Saving…" : "Save Changes"}
        </button>
      </div>
    </>
  );
}
