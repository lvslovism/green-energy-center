"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import { Pencil } from "lucide-react";
import { supabaseAdmin } from "@/lib/supabase-admin";

type Row = {
  id: string;
  slug: string;
  sort_order: number;
  status: string;
  grade: string;
  name: { zh?: string; en?: string };
};

export default function AdminProductsPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabaseAdmin
        .from("products")
        .select("id, slug, sort_order, status, grade, name")
        .order("sort_order", { ascending: true });
      if (error) {
        setErr(error.message);
        setRows([]);
        return;
      }
      setRows((data ?? []) as unknown as Row[]);
    })();
  }, []);

  return (
    <>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Products</h1>
          <p className="adm-page-sub">Three product lines. Click Edit to manage the full record.</p>
        </div>
      </div>

      {err && (
        <div
          className="adm-deploy-notice"
          style={{ borderColor: "var(--admin-error)", color: "var(--admin-error)" }}
        >
          Load error: {err}
        </div>
      )}

      {!rows ? (
        <div className="adm-loading">Loading…</div>
      ) : (
        <table className="adm-table">
          <thead>
            <tr>
              <th style={{ width: "3rem" }}>#</th>
              <th>Slug</th>
              <th>Name (ZH)</th>
              <th>Status</th>
              <th>Grade</th>
              <th style={{ width: "6rem" }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td style={{ color: "var(--muted)" }}>{r.sort_order}</td>
                <td>
                  <code style={{ color: "var(--accent)" }}>{r.slug}</code>
                </td>
                <td>{r.name?.zh ?? "—"}</td>
                <td>
                  <span className="adm-badge adm-badge-new">{r.status}</span>
                </td>
                <td>{r.grade}</td>
                <td>
                  <Link
                    href={`/admin/products/${r.slug}` as Route}
                    className="adm-btn adm-btn-ghost"
                    style={{ padding: "0.4rem 0.75rem" }}
                  >
                    <Pencil size={12} /> Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
