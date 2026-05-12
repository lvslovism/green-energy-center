import type { ProductSpec } from "@/lib/cms-helpers";

export default function SpecGrid({ specs }: { specs: ProductSpec[] }) {
  return (
    <div className="spec-grid">
      {specs.map((s) => (
        <div className="spec-row" key={s.key}>
          <div className="spec-key">{s.key}</div>
          <div className="spec-value">{s.value}</div>
        </div>
      ))}
    </div>
  );
}
