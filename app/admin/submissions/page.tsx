"use client";
import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { useToast } from "@/components/admin/Toast";

type Submission = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  product_interest: string | null;
  message: string;
  locale: string;
  status: "new" | "read" | "replied" | "archived";
  email_sent: boolean;
  email_sent_at: string | null;
  created_at: string;
};

type Filter = "all" | "new" | "read" | "replied" | "archived";

const STATUS_FLOW: Submission["status"][] = ["new", "read", "replied", "archived"];

function fmt(ts: string): string {
  try {
    return new Date(ts).toLocaleString("zh-TW", { hour12: false });
  } catch {
    return ts;
  }
}

export default function AdminSubmissionsPage() {
  const { push } = useToast();
  const [rows, setRows] = useState<Submission[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const load = async () => {
    const { data, error } = await supabaseAdmin
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      push({ kind: "error", title: "Load failed", body: error.message });
      setRows([]);
      return;
    }
    setRows((data ?? []) as unknown as Submission[]);
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!rows) return <div className="adm-loading">Loading…</div>;

  const filtered = filter === "all" ? rows : rows.filter((r) => r.status === filter);

  const setStatus = async (id: string, status: Submission["status"]) => {
    const { error } = await supabaseAdmin
      .from("contact_submissions")
      .update({ status })
      .eq("id", id);
    if (error) {
      push({ kind: "error", title: "Update failed", body: error.message });
      return;
    }
    setRows((prev) => (prev ? prev.map((r) => (r.id === id ? { ...r, status } : r)) : prev));
    push({ kind: "success", title: "Status updated" });
  };

  return (
    <>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Submissions</h1>
          <p className="adm-page-sub">{rows.length} total · click row to expand message</p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          {(["all", "new", "read", "replied", "archived"] as Filter[]).map((f) => (
            <button
              key={f}
              type="button"
              className={`adm-btn ${filter === f ? "adm-btn-primary" : "adm-btn-ghost"}`}
              onClick={() => setFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <table className="adm-table">
        <thead>
          <tr>
            <th style={{ width: "10rem" }}>Received</th>
            <th>Name</th>
            <th>Email</th>
            <th>Company</th>
            <th>Product</th>
            <th>Locale</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {filtered.length === 0 && (
            <tr>
              <td colSpan={7} style={{ textAlign: "center", color: "var(--muted)" }}>
                No submissions
              </td>
            </tr>
          )}
          {filtered.map((s) => {
            const expanded = expandedId === s.id;
            const badgeClass = `adm-badge adm-badge-${s.status}`;
            return (
              <>
                <tr
                  key={s.id}
                  onClick={() => setExpandedId(expanded ? null : s.id)}
                  style={{ cursor: "pointer" }}
                >
                  <td style={{ fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}>
                    {fmt(s.created_at)}
                  </td>
                  <td>{s.name}</td>
                  <td>
                    <a href={`mailto:${s.email}`} style={{ color: "var(--accent)" }}>
                      {s.email}
                    </a>
                  </td>
                  <td>{s.company ?? "—"}</td>
                  <td>{s.product_interest ?? "—"}</td>
                  <td>{s.locale}</td>
                  <td>
                    <span className={badgeClass}>{s.status}</span>
                  </td>
                </tr>
                {expanded && (
                  <tr key={`${s.id}-detail`}>
                    <td colSpan={7} style={{ background: "var(--bg-soft-2)" }}>
                      <div style={{ padding: "1rem", whiteSpace: "pre-wrap", lineHeight: 1.7 }}>
                        {s.message}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          padding: "0 1rem 1rem",
                          flexWrap: "wrap",
                        }}
                      >
                        {STATUS_FLOW.map((st) => (
                          <button
                            key={st}
                            type="button"
                            className={`adm-btn ${s.status === st ? "adm-btn-primary" : "adm-btn-ghost"}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              void setStatus(s.id, st);
                            }}
                            disabled={s.status === st}
                          >
                            → {st}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </>
            );
          })}
        </tbody>
      </table>
    </>
  );
}
