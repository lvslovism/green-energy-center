"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";

type NavLink = {
  label: string;
  href: string;
  /** 若 truthy，當前頁是首頁時點擊改為 smooth scroll 到指定 id */
  scrollTargetOnHome?: string;
};

const NAV_LINKS: NavLink[] = [
  { label: "產品", href: "/#products", scrollTargetOnHome: "products" },
  { label: "技術", href: "/technology" },
  { label: "關於", href: "/about" },
  { label: "聯絡", href: "/contact" },
];

export default function Nav() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const handleHomeAnchor = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    if (!isHome) return;
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleBrand = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!isHome) return;
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDisabledClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  };

  return (
    <nav className="top-nav">
      <Link href={"/" as Route} className="brand-mark" data-cursor-hover onClick={handleBrand}>
        <span className="brand-square" />
        <span style={{ fontSize: "1.125rem", fontWeight: 500, letterSpacing: "-0.025em" }}>
          綠能科技
        </span>
      </Link>
      <div
        className="hidden md:flex items-center gap-8 font-mono"
        style={{
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        {NAV_LINKS.map((link) => {
          const isActive =
            !link.scrollTargetOnHome &&
            (pathname === link.href || pathname?.startsWith(link.href + "/"));

          if (link.scrollTargetOnHome && isHome) {
            return (
              <a
                key={link.href}
                href={`#${link.scrollTargetOnHome}`}
                onClick={(e) => handleHomeAnchor(e, link.scrollTargetOnHome!)}
                data-cursor-hover
              >
                {link.label}
              </a>
            );
          }
          return (
            <Link
              key={link.href}
              href={link.href as Route}
              data-cursor-hover
              style={isActive ? { color: "var(--accent)" } : undefined}
            >
              {link.label}
            </Link>
          );
        })}
        <span style={{ opacity: 0.3 }}>/</span>
        <button
          onClick={handleDisabledClick}
          aria-disabled="true"
          title="Locale switching coming soon"
          style={{ opacity: 0.3, cursor: "not-allowed" }}
        >
          EN
        </button>
      </div>
      <style>{`
        .top-nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 50;
          padding: 1.25rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: linear-gradient(180deg, rgba(10,14,20,0.85), transparent);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border-bottom: 1px solid var(--line-soft);
        }
        .top-nav a, .top-nav button {
          color: inherit;
          text-decoration: none;
          background: none;
          border: none;
          padding: 0;
          cursor: inherit;
        }
        .brand-mark {
          display: flex;
          align-items: center;
          gap: 0.65rem;
        }
        .brand-square {
          width: 14px;
          height: 14px;
          background: var(--accent);
          box-shadow: 0 0 10px var(--accent-glow);
          position: relative;
          display: inline-block;
        }
        .brand-square::after {
          content: '';
          position: absolute;
          inset: 3px;
          background: var(--bg);
        }
      `}</style>
    </nav>
  );
}
