import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "var(--bg)",
        "bg-soft": "var(--bg-soft)",
        "bg-soft-2": "var(--bg-soft-2)",
        line: "var(--line)",
        "line-soft": "var(--line-soft)",
        text: "var(--text)",
        muted: "var(--muted)",
        accent: "var(--accent)",
        "accent-soft": "var(--accent-soft)",
        "accent-glow": "var(--accent-glow)",
      },
      fontFamily: {
        sans: [
          "var(--font-geist-sans)",
          "var(--font-noto-tc)",
          "system-ui",
          "sans-serif",
        ],
        mono: ["var(--font-jetbrains)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
