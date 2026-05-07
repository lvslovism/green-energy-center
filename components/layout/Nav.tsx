"use client";
import { usePathname } from "next/navigation";
import Link from "next/link";
import type { Route } from "next";
import { isLocale, DEFAULT_LOCALE, LOCALE_TOGGLE_LABEL, type Locale } from "@/lib/i18n/locales";

type NavStrings = {
  brand: string;
  products: string;
  technology: string;
  about: string;
  contact: string;
};

type NavProps = {
  locale: Locale;
  strings: NavStrings;
};

/** 把 pathname 改寫到目標 locale。例：/zh/about/ → /en/about/ */
function rewriteLocale(pathname: string | null, target: Locale): string {
  if (!pathname) return `/${target}/`;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return `/${target}/`;
  if (isLocale(parts[0])) {
    parts[0] = target;
  } else {
    parts.unshift(target);
  }
  return `/${parts.join("/")}/`;
}

export default function Nav({ locale, strings }: NavProps) {
  const pathname = usePathname();
  const isHome =
    pathname === `/${locale}` || pathname === `/${locale}/` || pathname === "/";

  const NAV_LINKS: { label: string; href: string; scrollTargetOnHome?: string }[] = [
    {
      label: strings.products,
      href: `/${locale}/#products`,
      scrollTargetOnHome: "products",
    },
    { label: strings.technology, href: `/${locale}/technology/` },
    { label: strings.about, href: `/${locale}/about/` },
    { label: strings.contact, href: `/${locale}/contact/` },
  ];

  const targetLocale: Locale = locale === "zh" ? "en" : "zh";
  const switcherHref = rewriteLocale(pathname, targetLocale);

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

  return (
    <nav className="top-nav">
      <Link
        href={`/${locale}/` as Route}
        className="brand-mark"
        data-cursor-hover
        onClick={handleBrand}
      >
        <span className="brand-square" />
        <span style={{ fontSize: "1.125rem", fontWeight: 500, letterSpacing: "-0.025em" }}>
          {strings.brand}
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
            (pathname === link.href ||
              pathname?.startsWith(link.href.replace(/\/$/, "") + "/"));

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
        <Link
          href={switcherHref as Route}
          data-cursor-hover
          aria-label="Switch language"
          style={{ color: "var(--accent)" }}
        >
          {LOCALE_TOGGLE_LABEL[locale]}
        </Link>
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

/** Default locale fallback prop helper (for pages forgetting to pass locale) */
export const DEFAULT_NAV_LOCALE: Locale = DEFAULT_LOCALE;
