"use client";
import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import BilingualInput from "@/components/admin/BilingualInput";
import ArrayEditor from "@/components/admin/ArrayEditor";
import { useToast, DEPLOY_HINT } from "@/components/admin/Toast";

type Bi = { zh: string; en: string };
const EMPTY_BI: Bi = { zh: "", en: "" };

type TeamMember = {
  id?: string;
  sort_order: number;
  initials: string;
  name: string;
  role: Bi;
  avatar_url: string;
};
type Milestone = { id?: string; sort_order: number; year: string; content: Bi };

function bi(v: unknown): Bi {
  if (v && typeof v === "object") {
    const o = v as Record<string, unknown>;
    return { zh: String(o.zh ?? ""), en: String(o.en ?? "") };
  }
  return EMPTY_BI;
}

export default function AdminAboutPage() {
  const { push } = useToast();
  const [team, setTeam] = useState<TeamMember[] | null>(null);
  const [milestones, setMilestones] = useState<Milestone[] | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      const [t, m] = await Promise.all([
        supabaseAdmin.from("team_members").select("*").order("sort_order"),
        supabaseAdmin
          .from("milestones")
          .select("*")
          .eq("page", "about")
          .order("sort_order"),
      ]);
      setTeam(
        ((t.data ?? []) as unknown[]).map((row) => {
          const o = row as Record<string, unknown>;
          return {
            id: String(o.id),
            sort_order: Number(o.sort_order),
            initials: String(o.initials),
            name: String(o.name),
            role: bi(o.role),
            avatar_url: typeof o.avatar_url === "string" ? o.avatar_url : "",
          };
        }),
      );
      setMilestones(
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

  if (!team || !milestones) return <div className="adm-loading">Loading…</div>;

  const save = async () => {
    setBusy(true);
    try {
      // team
      const { error: delT } = await supabaseAdmin
        .from("team_members")
        .delete()
        .not("id", "is", null);
      if (delT) throw new Error(delT.message);
      if (team.length > 0) {
        const { error: insT } = await supabaseAdmin.from("team_members").insert(
          team.map((m, i) => ({
            sort_order: i + 1,
            initials: m.initials,
            name: m.name,
            role: m.role,
            avatar_url: m.avatar_url || null,
          })),
        );
        if (insT) throw new Error(insT.message);
      }

      // milestones(page=about)
      const { error: delM } = await supabaseAdmin
        .from("milestones")
        .delete()
        .eq("page", "about");
      if (delM) throw new Error(delM.message);
      if (milestones.length > 0) {
        const { error: insM } = await supabaseAdmin.from("milestones").insert(
          milestones.map((m, i) => ({
            sort_order: i + 1,
            year: m.year,
            content: m.content,
            page: "about",
          })),
        );
        if (insM) throw new Error(insM.message);
      }

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
          <h1 className="adm-page-title">About</h1>
          <p className="adm-page-sub">Team / Milestones</p>
        </div>
        <button type="button" className="adm-btn adm-btn-primary" onClick={save} disabled={busy}>
          <Save size={14} /> {busy ? "Saving…" : "Save All"}
        </button>
      </div>

      <section className="adm-section">
        <h2 className="adm-section-title">Team members</h2>
        <ArrayEditor<TeamMember>
          items={team}
          onChange={setTeam}
          newItem={() => ({
            sort_order: team.length + 1,
            initials: "",
            name: "",
            role: EMPTY_BI,
            avatar_url: "",
          })}
          addLabel="+ Add member"
          itemLabel={(i) => `Member #${i + 1}`}
          renderItem={(it, _i, update) => (
            <>
              <div className="adm-grid-2">
                <div className="adm-field">
                  <label className="adm-field-label">Initials</label>
                  <input
                    className="adm-input"
                    value={it.initials}
                    onChange={(e) => update({ initials: e.target.value })}
                    maxLength={3}
                  />
                </div>
                <div className="adm-field">
                  <label className="adm-field-label">Name</label>
                  <input
                    className="adm-input"
                    value={it.name}
                    onChange={(e) => update({ name: e.target.value })}
                  />
                </div>
              </div>
              <BilingualInput
                label="Role"
                value={it.role}
                onChange={(v) => update({ role: v })}
              />
              <div className="adm-field">
                <label className="adm-field-label">Avatar URL (optional)</label>
                <input
                  className="adm-input"
                  value={it.avatar_url}
                  onChange={(e) => update({ avatar_url: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </>
          )}
        />
      </section>

      <section className="adm-section">
        <h2 className="adm-section-title">Milestones</h2>
        <ArrayEditor<Milestone>
          items={milestones}
          onChange={setMilestones}
          newItem={() => ({ sort_order: milestones.length + 1, year: "", content: EMPTY_BI })}
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
      </section>

      <div className="adm-action-bar">
        <button type="button" className="adm-btn adm-btn-primary" onClick={save} disabled={busy}>
          <Save size={14} /> {busy ? "Saving…" : "Save All"}
        </button>
      </div>
    </>
  );
}
