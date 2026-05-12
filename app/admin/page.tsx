"use client";
import { useEffect, useState } from "react";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { useAuth } from "@/components/admin/AuthGuard";

export default function AdminDashboard() {
  const { email } = useAuth();
  const [stats, setStats] = useState<{
    productCount: number | null;
    newSubmissions: number | null;
  }>({ productCount: null, newSubmissions: null });

  useEffect(() => {
    (async () => {
      const [products, newSubs] = await Promise.all([
        supabaseAdmin.from("products").select("id", { count: "exact", head: true }),
        supabaseAdmin
          .from("contact_submissions")
          .select("id", { count: "exact", head: true })
          .eq("status", "new"),
      ]);
      setStats({
        productCount: products.count ?? null,
        newSubmissions: newSubs.count ?? null,
      });
    })();
  }, []);

  return (
    <>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Dashboard</h1>
          <p className="adm-page-sub">Welcome back, {email}</p>
        </div>
      </div>

      <div className="adm-deploy-notice">
        <span>
          <strong>注意：</strong>所有 CMS 修改需手動執行 <code>npm run build &amp;&amp; wrangler pages deploy out</code> 才會更新線上版本。
        </span>
      </div>

      <div className="adm-stat-grid">
        <div className="adm-stat-card">
          <div className="adm-stat-card-label">Products</div>
          <div className="adm-stat-card-value">{stats.productCount ?? "…"}</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-card-label">New Submissions</div>
          <div className="adm-stat-card-value">{stats.newSubmissions ?? "…"}</div>
        </div>
        <div className="adm-stat-card">
          <div className="adm-stat-card-label">Last Deploy</div>
          <div className="adm-stat-card-value" style={{ fontSize: "1rem", color: "var(--muted)" }}>
            CLI manual
          </div>
        </div>
      </div>
    </>
  );
}
