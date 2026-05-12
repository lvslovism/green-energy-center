"use client";
import { useEffect } from "react";
import AuthGuard from "@/components/admin/AuthGuard";
import AdminNav from "@/components/admin/AdminNav";
import { ToastProvider } from "@/components/admin/Toast";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // 把 body 標記為 admin，套用 CSS overrides（隱藏首頁網格 + 還原游標）
  useEffect(() => {
    document.body.dataset.admin = "1";
    return () => {
      delete document.body.dataset.admin;
    };
  }, []);

  return (
    <ToastProvider>
      <AuthGuard>
        <div className="adm-shell">
          <AdminNav />
          <main className="adm-content">{children}</main>
        </div>
      </AuthGuard>
    </ToastProvider>
  );
}
