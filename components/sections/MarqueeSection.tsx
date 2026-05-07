import Marquee from "@/components/motion/Marquee";
import type { MarqueeItem } from "@/lib/types";

export default function MarqueeSection({ items }: { items: MarqueeItem[] }) {
  return (
    <section
      style={{
        borderTop: "1px solid var(--line-soft)",
        borderBottom: "1px solid var(--line-soft)",
        overflow: "hidden",
        position: "relative",
        zIndex: 2,
        background: "var(--bg)",
      }}
    >
      <Marquee items={items} />
    </section>
  );
}
