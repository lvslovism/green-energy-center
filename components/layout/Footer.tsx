type FooterProps = {
  copyright: string;
  address: string;
  email: string;
  locales: string;
};

export default function Footer({ copyright, address, email, locales }: FooterProps) {
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
        <div>{copyright}</div>
        <div>{address}</div>
        <div>{email}</div>
        <div>{locales}</div>
      </div>
    </footer>
  );
}
