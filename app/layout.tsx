import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { JetBrains_Mono, Noto_Sans_TC } from "next/font/google";
import "./globals.css";
import LangSync from "@/components/i18n/LangSync";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  variable: "--font-noto-tc",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Green Energy — 綠能科技",
  description: "Next-gen energy storage. From sodium-ion to supercapacitors.",
};

/**
 * Root layout for static export. <html lang> defaults to zh-Hant；
 * 對 /en/ 系列路由由 client-side LangSync 改為 "en"，
 * 主要改善螢幕閱讀器與瀏覽器拼字檢查行為。
 * （hreflang 由各 [locale]/page.tsx 的 generateMetadata 處理）
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${GeistSans.variable} ${jetbrainsMono.variable} ${notoSansTC.variable}`}
    >
      <body className="font-sans">
        <LangSync />
        {children}
      </body>
    </html>
  );
}
