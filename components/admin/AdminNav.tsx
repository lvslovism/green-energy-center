"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import {
  LayoutDashboard,
  Settings,
  Package,
  Cpu,
  Users,
  MessageSquare,
  LogOut,
} from "lucide-react";
import { useAuth } from "./AuthGuard";

const ITEMS: { href: string; label: string; Icon: typeof LayoutDashboard; exact?: boolean }[] = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard, exact: true },
  { href: "/admin/site-settings", label: "Site Settings", Icon: Settings },
  { href: "/admin/products", label: "Products", Icon: Package },
  { href: "/admin/technology", label: "Technology", Icon: Cpu },
  { href: "/admin/about", label: "About", Icon: Users },
  { href: "/admin/submissions", label: "Submissions", Icon: MessageSquare },
];

export default function AdminNav() {
  const pathname = usePathname() ?? "";
  const { email, signOut } = useAuth();

  return (
    <aside className="adm-sidebar">
      <div className="adm-brand">
        <span className="adm-brand-square" />
        <div>
          <div className="adm-brand-name">綠能科技</div>
          <div className="adm-brand-sub">Admin</div>
        </div>
      </div>

      <nav className="adm-nav">
        {ITEMS.map((it) => {
          const active = it.exact
            ? pathname === it.href || pathname === it.href + "/"
            : pathname === it.href || pathname.startsWith(it.href + "/");
          const Icon = it.Icon;
          return (
            <Link
              key={it.href}
              href={it.href as Route}
              className={`adm-nav-item ${active ? "active" : ""}`}
            >
              <span className="adm-nav-icon">
                <Icon size={16} strokeWidth={1.5} />
              </span>
              <span>{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="adm-sidebar-bottom">
        <div className="adm-user-info">{email}</div>
        <button type="button" className="adm-logout-btn" onClick={() => void signOut()}>
          <LogOut size={12} strokeWidth={1.6} />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
