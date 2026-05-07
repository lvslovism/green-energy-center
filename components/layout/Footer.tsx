export default function Footer() {
  return (
    <footer
      style={{
        padding: "2.5rem 2rem",
        borderTop: "1px solid var(--line)",
        position: "relative",
        zIndex: 2,
        background: "var(--bg)",
      }}
    >
      <div
        style={{
          maxWidth: 1500,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          fontFamily: "var(--font-jetbrains), monospace",
          fontSize: 10,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "var(--muted)",
          paddingTop: "2rem",
          borderTop: "1px solid var(--line-soft)",
        }}
      >
        <div>© 2026 GREEN ENERGY TECH</div>
        <div>TAIPEI · 台灣</div>
        <div>info@greentech.tw</div>
        <div>EN / 繁中 / 简中 / JP</div>
      </div>
    </footer>
  );
}
