export default function Nav() {
  return (
    <nav className="top-nav">
      <a href="/" className="brand-mark" data-cursor-hover>
        <span className="brand-square" />
        <span style={{ fontSize: "1.125rem", fontWeight: 500, letterSpacing: "-0.025em" }}>
          綠能科技
        </span>
      </a>
      <div
        className="hidden md:flex items-center gap-8 font-mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.25em",
          textTransform: "uppercase",
        }}
      >
        <a href="#" data-cursor-hover>
          產品
        </a>
        <a href="#" data-cursor-hover>
          技術
        </a>
        <a href="#" data-cursor-hover>
          關於
        </a>
        <a href="#" data-cursor-hover>
          聯絡
        </a>
        <span style={{ opacity: 0.3 }}>/</span>
        <button data-cursor-hover>EN</button>
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
