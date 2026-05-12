"use client";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import BilingualInput from "@/components/admin/BilingualInput";
import ArrayEditor from "@/components/admin/ArrayEditor";
import Collapsible from "@/components/admin/Collapsible";
import { useToast, DEPLOY_HINT } from "@/components/admin/Toast";

type Bi = { zh: string; en: string };
const EMPTY_BI: Bi = { zh: "", en: "" };

type Pillar = { id?: string; sort_order: number; icon: string; title: Bi; description: Bi };
type RdStat = { id?: string; sort_order: number; value: string; label: Bi };
type Cert = { id?: string; sort_order: number; name: string };
type Milestone = { id?: string; sort_order: number; year: string; content: Bi };

const PILLAR_ICONS = ["Atom", "Cog", "Cpu", "Zap", "Database", "Shield"];

function bi(v: unknown): Bi {
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return { zh: String(o.zh ?? ""), en: String(o.en ?? "") };
  }
  return EMPTY_BI;
}

export default function AdminTechnologyPage() {
  const { push } = useToast();
  const [pillars, setPillars] = useState<Pillar[] | null>(null);
  const [stats, setStats] = useState<RdStat[] | null>(null);
  const [certs, setCerts] = useState<Cert[] | null>(null);
  const [roadmap, setRoadmap] = useState<Milestone[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const [p, r, c, m] = await Promise.all([
        supabaseAdmin.from("technology_pillars").select("*").order("sort_order"),
        supabaseAdmin.from("rd_stats").select("*").order("sort_order"),
        supabaseAdmin.from("certifications").select("*").order("sort_order"),
        supabaseAdmin
          .from("milestones")
          .select("*")
          .eq("page", "technology")
          .order("sort_order"),
      ]);
      setPillars(
        ((p.data ?? []) as unknown[]).map((row) => {
          const o = row as Record<string, unknown>;
          return {
            id: String(o.id),
            sort_order: Number(o.sort_order),
            icon: String(o.icon),
            title: bi(o.title),
            description: bi(o.description),
          };
        }),
      );
      setStats(
        ((r.data ?? []) as unknown[]).map((row) => {
          const o = row as Record<string, unknown>;
          return {
            id: String(o.id),
            sort_order: Number(o.sort_order),
            value: String(o.value),
            label: bi(o.label),
          };
        }),
      );
      setCerts(
        ((c.data ?? []) as unknown[]).map((row) => {
          const o = row as Record<string, unknown>;
          return {
            id: String(o.id),
            sort_order: Number(o.sort_order),
            name: String(o.name),
          };
        }),
      );
      setRoadmap(
        ((m.data ?? []) as unknown[]).map((row) => {
          const o = row as Record<string, unknown>;
          return {
            id: String(o.id),
            sort_order: Number(o.sort_order),
            year: String(o.year),
            content: bi(o.content),
          };
        }),
      );
    })();
  }, []);

  if (!pillars || !stats || !certs || !roadmap) {
    return <div className="adm-loading">Loading…</div>;
  }

  /** 通用 sync：delete-all + insert-all 簡單但有效（資料量小） */
  const syncTable = async (
    table: "technology_pillars" | "rd_stats" | "certifications" | "milestones",
    rows: object[],
    where?: { col: string; val: string },
  ) => {
    let del = supabaseAdmin.from(table).delete();
    if (where) {
      del = del.eq(where.col, where.val);
    } else {
      // 必須加非 trivial 過濾才能 delete all on Supabase；用 not.is.null + id
      del = del.not("id", "is", null);
    }
    const { error: delErr } = await del;
    if (delErr) throw new Error(`delete ${table}: ${delErr.message}`);
    if (rows.length === 0) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error: insErr } = await supabaseAdmin.from(table).insert(rows as any);
    if (insErr) throw new Error(`insert ${table}: ${insErr.message}`);
  };

  const save = async () => {
    setBusy(true);
    try {
      await syncTable(
        "technology_pillars",
        pillars.map((p, i) => ({
          sort_order: i + 1,
          icon: p.icon,
          title: p.title,
          description: p.description,
        })),
      );
      await syncTable(
        "rd_stats",
        stats.map((s, i) => ({ sort_order: i + 1, value: s.value, label: s.label })),
      );
      await syncTable(
        "certifications",
        certs.map((c, i) => ({ sort_order: i + 1, name: c.name })),
      );
      await syncTable(
        "milestones",
        roadmap.map((m, i) => ({
          sort_order: i + 1,
          year: m.year,
          content: m.content,
          page: "technology",
        })),
        { col: "page", val: "technology" },
      );
      push({ kind: "success", title: "Saved", body: DEPLOY_HINT });
    } catch (e) {
      push({
        kind: "error",
        title: "Save failed",
        body: e instanceof Error ? e.message : "Unknown error",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Technology</h1>
          <p className="adm-page-sub">Pillars / R&amp;D Stats / Certifications / Roadmap</p>
        </div>
        <button type="button" className="adm-btn adm-btn-primary" onClick={save} disabled={busy}>
          <Save size={14} /> {busy ? "Saving…" : "Save All"}
        </button>
      </div>

      <Collapsible title="Pillars" defaultOpen>
        <ArrayEditor<Pillar>
          items={pillars}
          onChange={setPillars}
          newItem={() => ({ sort_order: pillars.length + 1, icon: "Atom", title: EMPTY_BI, description: EMPTY_BI })}
          addLabel="+ Add pillar"
          itemLabel={(i) => `Pillar #${i + 1}`}
          renderItem={(it, _i, update) => (
            <>
              <div className="adm-field">
                <label className="adm-field-label">Icon</label>
                <select
                  className="adm-select"
                  value={it.icon}
                  onChange={(e) => update({ icon: e.target.value })}
                >
                  {PILLAR_ICONS.map((o) => (
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

      <Collapsible title="R&D Stats">
        <ArrayEditor<RdStat>
          items={stats}
          onChange={setStats}
          newItem={() => ({ sort_order: stats.length + 1, value: "", label: EMPTY_BI })}
          addLabel="+ Add stat"
          itemLabel={(i) => `Stat #${i + 1}`}
          renderItem={(it, _i, update) => (
            <>
              <div className="adm-field">
                <label className="adm-field-label">Value</label>
                <input
                  className="adm-input"
                  value={it.value}
                  onChange={(e) => update({ value: e.target.value })}
                />
              </div>
              <BilingualInput
                label="Label"
                value={it.label}
                onChange={(v) => update({ label: v })}
              />
            </>
          )}
        />
      </Collapsible>

      <Collapsible title="Certifications">
        <ArrayEditor<Cert>
          items={certs}
          onChange={setCerts}
          newItem={() => ({ sort_order: certs.length + 1, name: "" })}
          addLabel="+ Add certification"
          itemLabel={(i) => `Cert #${i + 1}`}
          renderItem={(it, _i, update) => (
            <div className="adm-field" style={{ marginBottom: 0 }}>
              <label className="adm-field-label">Name</label>
              <input
                className="adm-input"
                value={it.name}
                onChange={(e) => update({ name: e.target.value })}
              />
            </div>
          )}
        />
      </Collapsible>

      <Collapsible title="Roadmap">
        <ArrayEditor<Milestone>
          items={roadmap}
          onChange={setRoadmap}
          newItem={() => ({ sort_order: roadmap.length + 1, year: "", content: EMPTY_BI })}
          addLabel="+ Add milestone"
          itemLabel={(i) => `Node #${i + 1}`}
          renderItem={(it, _i, update) => (
            <>
              <div className="adm-field">
                <label className="adm-field-label">Year</label>
                <input
                  className="adm-input"
                  value={it.year}
                  onChange={(e) => update({ year: e.target.value })}
                  placeholder="e.g. 2024 Q4"
                />
              </div>
              <BilingualInput
                label="Content"
                value={it.content}
                onChange={(v) => update({ content: v })}
                multiline
              />
            </>
          )}
        />
      </Collapsible>

      <div className="adm-action-bar">
        <button type="button" className="adm-btn adm-btn-primary" onClick={save} disabled={busy}>
          <Save size={14} /> {busy ? "Saving…" : "Save All"}
        </button>
      </div>
    </>
  );
}
