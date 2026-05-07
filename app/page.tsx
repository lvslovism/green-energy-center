"use client";
import { useEffect } from "react";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";

/**
 * 根路徑 redirect 到預設語系。
 * Static export 不支援 Next 內建 server-side redirect()，
 * 改用 client-side replace + <a> fallback（無 JS 也能點擊）。
 */
export default function RootRedirect() {
  useEffect(() => {
    window.location.replace(`/${DEFAULT_LOCALE}/`);
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: "1rem",
        background: "var(--bg)",
        color: "var(--text)",
        fontFamily: "var(--font-jetbrains), monospace",
        fontSize: 12,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
      }}
    >
      <span style={{ color: "var(--muted)" }}>Redirecting…</span>
      <a href={`/${DEFAULT_LOCALE}/`} style={{ color: "var(--accent)" }}>
        /{DEFAULT_LOCALE}/
      </a>
    </div>
  );
}
