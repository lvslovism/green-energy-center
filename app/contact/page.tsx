import type { Metadata } from "next";
import { MapPin, Mail, Phone, Clock } from "lucide-react";
import LenisProvider from "@/components/motion/LenisProvider";
import CustomCursor from "@/components/motion/CustomCursor";
import Nav from "@/components/layout/Nav";
import Footer from "@/components/layout/Footer";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "聯繫我們 | 綠能科技",
  description: "聯繫綠能科技團隊，諮詢鈉離子電池、鋰電池與超電容儲能方案。",
};

const INFO = [
  { Icon: MapPin, label: "OFFICE", value: "台北市信義區松仁路 100 號 15F" },
  { Icon: Mail, label: "EMAIL", value: "info@greentech.tw", accent: true },
  { Icon: Phone, label: "PHONE", value: "+886 2 2720-XXXX" },
  { Icon: Clock, label: "HOURS", value: "Mon - Fri, 09:00 - 18:00 (GMT+8)" },
];

export default function ContactPage() {
  return (
    <LenisProvider>
      <CustomCursor />
      <Nav />
      <main className="static-page">
        <header className="static-header">
          <div className="static-header-inner">
            <div className="static-eyebrow">— CONTACT</div>
            <h1 className="static-h1">聯繫我們</h1>
            <p className="static-sub">
              產品諮詢、合作洽談或技術支援，我們的團隊將在 24 小時內回覆。
            </p>
          </div>
        </header>

        <section className="static-section">
          <div className="static-inner">
            <div className="section-header-row">
              <div className="section-index">01 / GET IN TOUCH</div>
              <h2 className="section-title">寄信給我們</h2>
            </div>
            <div className="contact-grid">
              <div className="contact-form-col">
                <ContactForm />
              </div>
              <aside className="contact-info-col">
                <div className="contact-info-card">
                  {INFO.map((item) => {
                    const { Icon } = item;
                    return (
                      <div className="contact-info-row" key={item.label}>
                        <div className="contact-info-icon" aria-hidden>
                          <Icon size={18} strokeWidth={1.5} />
                        </div>
                        <div className="contact-info-text">
                          <div className="contact-info-label">{item.label}</div>
                          <div
                            className="contact-info-value"
                            style={item.accent ? { color: "var(--accent)" } : undefined}
                          >
                            {item.value}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="map-placeholder">MAP PLACEHOLDER</div>
              </aside>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </LenisProvider>
  );
}
