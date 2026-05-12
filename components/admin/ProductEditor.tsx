"use client";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import BilingualInput from "@/components/admin/BilingualInput";
import ArrayEditor from "@/components/admin/ArrayEditor";
import Collapsible from "@/components/admin/Collapsible";
import { useToast, DEPLOY_HINT } from "@/components/admin/Toast";

type Bi = { zh: string; en: string };
type KeySpec = { value: string; label: string };
type Spec = { key: string; value: string };
type Perf = {
  label: string;
  ours: number;
  oursLabel: string;
  market: number;
  marketLabel: string;
  maxValue: number;
  inverted?: boolean;
};
type UseCase = { icon: string; title: Bi; description: Bi };
type DocItem = { name: Bi; type: string; size: string; version?: string; url?: string };

type ProductData = {
  id: string;
  slug: string;
  sort_order: number;
  status: string;
  grade: string;
  hero_visual: string;
  name: Bi;
  name_subtitle: Bi;
  tagline: Bi;
  key_specs: KeySpec[];
  specs: Spec[];
  performance: Perf[];
  use_cases: UseCase[];
  documents: DocItem[];
  seo: { title: Bi; description: Bi };
};

const EMPTY_BI: Bi = { zh: "", en: "" };

const STATUS_OPTIONS = ["MASS PRODUCTION", "PILOT", "SHIPPING"];
const HERO_VISUAL_OPTIONS = ["wireframe", "isometric", "datasheet"];
const ICON_OPTIONS = [
  "Zap", "Truck", "Sun", "Radio", "Car", "Plane", "Smartphone",
  "HeartPulse", "RefreshCw", "Activity", "ShieldCheck", "Anchor",
];

function bi(v: unknown): Bi {
  if (v && typeof v === "object") {
    const obj = v as Record<string, unknown>;
    return { zh: String(obj.zh ?? ""), en: String(obj.en ?? "") };
  }
  return EMPTY_BI;
}

export default function ProductEditor({ slug }: { slug: string }) {
  const { push } = useToast();
  const [data, setData] = useState<ProductData | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: row, error } = await supabaseAdmin
        .from("products")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) {
        setErr(error.message);
        return;
      }
      if (!row) {
        setErr("Product not found");
        return;
      }
      setData({
        id: row.id,
        slug: row.slug,
        sort_order: row.sort_order,
        status: row.status,
        grade: row.grade,
        hero_visual: row.hero_visual,
        name: bi(row.name),
        name_subtitle: bi(row.name_subtitle),
        tagline: bi(row.tagline),
        key_specs: (row.key_specs as KeySpec[]) ?? [],
        specs: (row.specs as Spec[]) ?? [],
        performance: (row.performance as Perf[]) ?? [],
        use_cases: ((row.use_cases as unknown[]) ?? []).map((u) => {
          const o = u as Record<string, unknown>;
          return {
            icon: String(o.icon ?? ""),
            title: bi(o.title),
            description: bi(o.description),
          };
        }),
        documents: ((row.documents as unknown[]) ?? []).map((d) => {
          const o = d as Record<string, unknown>;
          return {
            name: bi(o.name),
            type: String(o.type ?? ""),
            size: String(o.size ?? ""),
            version: o.version ? String(o.version) : undefined,
            url: o.url ? String(o.url) : undefined,
          };
        }),
        seo: {
          title: bi((row.seo as Record<string, unknown>)?.title),
          description: bi((row.seo as Record<string, unknown>)?.description),
        },
      });
    })();
  }, [slug]);

  if (err) {
    return <div className="adm-loading">{err}</div>;
  }
  if (!data) {
    return <div className="adm-loading">Loading…</div>;
  }

  const save = async () => {
    setBusy(true);
    const payload = {
      sort_order: data.sort_order,
      status: data.status,
      grade: data.grade,
      hero_visual: data.hero_visual,
      name: data.name,
      name_subtitle: data.name_subtitle,
      tagline: data.tagline,
      key_specs: data.key_specs,
      specs: data.specs,
      performance: data.performance,
      use_cases: data.use_cases,
      documents: data.documents,
      seo: data.seo,
    };
    const { error } = await supabaseAdmin
      .from("products")
      .update(payload)
      .eq("id", data.id);
    setBusy(false);
    if (error) {
      push({ kind: "error", title: "Save failed", body: error.message });
      return;
    }
    push({ kind: "success", title: "Saved", body: DEPLOY_HINT });
  };

  const set = (patch: Partial<ProductData>) => setData({ ...data, ...patch });

  return (
    <>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">{data.name.zh || data.slug}</h1>
          <p className="adm-page-sub">slug: {data.slug}</p>
        </div>
        <button type="button" className="adm-btn adm-btn-primary" onClick={save} disabled={busy}>
          <Save size={14} /> {busy ? "Saving…" : "Save"}
        </button>
      </div>

      {/* Basic */}
      <Collapsible title="Basic Info" defaultOpen>
        <BilingualInput label="Name" value={data.name} onChange={(v) => set({ name: v })} />
        <BilingualInput
          label="Name subtitle"
          value={data.name_subtitle}
          onChange={(v) => set({ name_subtitle: v })}
        />
        <BilingualInput
          label="Tagline"
          value={data.tagline}
          onChange={(v) => set({ tagline: v })}
          multiline
        />
        <div className="adm-grid-2">
          <div className="adm-field">
            <label className="adm-field-label">Status</label>
            <select
              className="adm-select"
              value={data.status}
              onChange={(e) => set({ status: e.target.value })}
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div className="adm-field">
            <label className="adm-field-label">Grade</label>
            <input
              className="adm-input"
              value={data.grade}
              onChange={(e) => set({ grade: e.target.value })}
            />
          </div>
          <div className="adm-field">
            <label className="adm-field-label">Hero visual</label>
            <select
              className="adm-select"
              value={data.hero_visual}
              onChange={(e) => set({ hero_visual: e.target.value })}
            >
              {HERO_VISUAL_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div className="adm-field">
            <label className="adm-field-label">Sort order</label>
            <input
              className="adm-input"
              type="number"
              value={data.sort_order}
              onChange={(e) => set({ sort_order: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
        </div>
      </Collapsible>

      {/* Key specs (固定 4) */}
      <Collapsible title="Key Specs (4)">
        <ArrayEditor<KeySpec>
          items={data.key_specs}
          fixed
          onChange={(v) => set({ key_specs: v })}
          newItem={() => ({ value: "", label: "" })}
          itemLabel={(i) => `Spec #${i + 1}`}
          renderItem={(it, _i, update) => (
            <div className="adm-grid-2">
              <div className="adm-field">
                <label className="adm-field-label">Value</label>
                <input
                  className="adm-input"
                  value={it.value}
                  onChange={(e) => update({ value: e.target.value })}
                />
              </div>
              <div className="adm-field">
                <label className="adm-field-label">Label</label>
                <input
                  className="adm-input"
                  value={it.label}
                  onChange={(e) => update({ label: e.target.value })}
                />
              </div>
            </div>
          )}
        />
      </Collapsible>

      {/* Specifications */}
      <Collapsible title="Specifications">
        <ArrayEditor<Spec>
          items={data.specs}
          onChange={(v) => set({ specs: v })}
          newItem={() => ({ key: "", value: "" })}
          addLabel="+ Add spec"
          itemLabel={(i) => `Spec #${i + 1}`}
          renderItem={(it, _i, update) => (
            <div className="adm-grid-2">
              <div className="adm-field">
                <label className="adm-field-label">Key</label>
                <input
                  className="adm-input"
                  value={it.key}
                  onChange={(e) => update({ key: e.target.value })}
                />
              </div>
              <div className="adm-field">
                <label className="adm-field-label">Value</label>
                <input
                  className="adm-input"
                  value={it.value}
                  onChange={(e) => update({ value: e.target.value })}
                />
              </div>
            </div>
          )}
        />
      </Collapsible>

      {/* Performance */}
      <Collapsible title="Performance">
        <ArrayEditor<Perf>
          items={data.performance}
          onChange={(v) => set({ performance: v })}
          newItem={() => ({
            label: "",
            ours: 0,
            oursLabel: "",
            market: 0,
            marketLabel: "",
            maxValue: 0,
          })}
          addLabel="+ Add metric"
          itemLabel={(i) => `Metric #${i + 1}`}
          renderItem={(it, _i, update) => (
            <>
              <div className="adm-field">
                <label className="adm-field-label">Label</label>
                <input
                  className="adm-input"
                  value={it.label}
                  onChange={(e) => update({ label: e.target.value })}
                />
              </div>
              <div className="adm-grid-2">
                <div className="adm-field">
                  <label className="adm-field-label">Ours (number)</label>
                  <input
                    className="adm-input"
                    type="number"
                    step="any"
                    value={it.ours}
                    onChange={(e) => update({ ours: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="adm-field">
                  <label className="adm-field-label">Ours label</label>
                  <input
                    className="adm-input"
                    value={it.oursLabel}
                    onChange={(e) => update({ oursLabel: e.target.value })}
                  />
                </div>
                <div className="adm-field">
                  <label className="adm-field-label">Market (number)</label>
                  <input
                    className="adm-input"
                    type="number"
                    step="any"
                    value={it.market}
                    onChange={(e) => update({ market: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="adm-field">
                  <label className="adm-field-label">Market label</label>
                  <input
                    className="adm-input"
                    value={it.marketLabel}
                    onChange={(e) => update({ marketLabel: e.target.value })}
                  />
                </div>
                <div className="adm-field">
                  <label className="adm-field-label">Max value</label>
                  <input
                    className="adm-input"
                    type="number"
                    step="any"
                    value={it.maxValue}
                    onChange={(e) => update({ maxValue: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div className="adm-field" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <label
                    style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "var(--muted)", fontSize: "0.875rem" }}
                  >
                    <input
                      type="checkbox"
                      checked={!!it.inverted}
                      onChange={(e) => update({ inverted: e.target.checked })}
                    />
                    inverted (lower = better)
                  </label>
                </div>
              </div>
            </>
          )}
        />
      </Collapsible>

      {/* Use cases */}
      <Collapsible title="Use Cases">
        <ArrayEditor<UseCase>
          items={data.use_cases}
          onChange={(v) => set({ use_cases: v })}
          newItem={() => ({ icon: "Zap", title: EMPTY_BI, description: EMPTY_BI })}
          addLabel="+ Add use case"
          itemLabel={(i) => `Use case #${i + 1}`}
          renderItem={(it, _i, update) => (
            <>
              <div className="adm-field">
                <label className="adm-field-label">Icon</label>
                <select
                  className="adm-select"
                  value={it.icon}
                  onChange={(e) => update({ icon: e.target.value })}
                >
                  {ICON_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              <BilingualInput
                label="Title"
                value={it.title}
                onChange={(v) => update({ title: v })}
              />
              <BilingualInput
                label="Description"
                value={it.description}
                onChange={(v) => update({ description: v })}
                multiline
              />
            </>
          )}
        />
      </Collapsible>

      {/* Documents */}
      <Collapsible title="Documents">
        <ArrayEditor<DocItem>
          items={data.documents}
          onChange={(v) => set({ documents: v })}
          newItem={() => ({ name: EMPTY_BI, type: "PDF", size: "", version: "", url: "" })}
          addLabel="+ Add document"
          itemLabel={(i) => `Doc #${i + 1}`}
          renderItem={(it, _i, update) => (
            <>
              <BilingualInput
                label="Name"
                value={it.name}
                onChange={(v) => update({ name: v })}
              />
              <div className="adm-grid-2">
                <div className="adm-field">
                  <label className="adm-field-label">Type</label>
                  <input
                    className="adm-input"
                    value={it.type}
                    onChange={(e) => update({ type: e.target.value })}
                  />
                </div>
                <div className="adm-field">
                  <label className="adm-field-label">Size</label>
                  <input
                    className="adm-input"
                    value={it.size}
                    onChange={(e) => update({ size: e.target.value })}
                  />
                </div>
                <div className="adm-field">
                  <label className="adm-field-label">Version</label>
                  <input
                    className="adm-input"
                    value={it.version ?? ""}
                    onChange={(e) => update({ version: e.target.value })}
                  />
                </div>
                <div className="adm-field">
                  <label className="adm-field-label">URL (optional)</label>
                  <input
                    className="adm-input"
                    value={it.url ?? ""}
                    onChange={(e) => update({ url: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}
        />
      </Collapsible>

      {/* SEO */}
      <Collapsible title="SEO">
        <BilingualInput
          label="Title"
          value={data.seo.title}
          onChange={(v) => set({ seo: { ...data.seo, title: v } })}
        />
        <BilingualInput
          label="Description"
          value={data.seo.description}
          onChange={(v) => set({ seo: { ...data.seo, description: v } })}
          multiline
        />
      </Collapsible>

      <div className="adm-action-bar">
        <button type="button" className="adm-btn adm-btn-primary" onClick={save} disabled={busy}>
          <Save size={14} /> {busy ? "Saving…" : "Save"}
        </button>
      </div>
    </>
  );
}
