"use client";

const SECTION_LINKS = [
  { label: "產品", id: "products" },
  // 暫時指向 #stats，Step 2 才會有正式 /technology 頁
  { label: "技術", id: "stats" },
  { label: "關於", id: "vision" },
  { label: "聯絡", id: "contact" },
];

const handleAnchor = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
  e.preventDefault();
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
};

const handleDisabledClick = (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
};

export default function Nav() {
  return (
    <nav className="top-nav">
      <a
        href="#"
        className="brand-mark"
        data-cursor-hover
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <span className="brand-square" />
        <span style={{ fontSize: "1.125rem", fontWeight: 500, letterSpacing: "-0.025em" }}>
          綠能科技
        </span>
      </a>
      <div
        className="hidden md:flex items-center gap-8 font-mono"
        style={{
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        {SECTION_LINKS.map((link) => (
          <a
            key={link.id}
            href={`#${link.id}`}
            onClick={(e) => handleAnchor(e, link.id)}
            data-cursor-hover
          >
            {link.label}
          </a>
        ))}
        <span style={{ opacity: 0.3 }}>/</span>
        <button
          onClick={handleDisabledClick}
          aria-disabled="true"
          title="Locale switching coming soon"
          style={{
            opacity: 0.3,
            cursor: "not-allowed",
          }}
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
