import {
  Zap,
  Truck,
  Sun,
  Radio,
  Car,
  Plane,
  Smartphone,
  HeartPulse,
  RefreshCw,
  Activity,
  ShieldCheck,
  Anchor,
  type LucideIcon,
} from "lucide-react";
import type { UseCase } from "@/lib/cms-helpers";

const ICONS: Record<string, LucideIcon> = {
  Zap,
  Truck,
  Sun,
  Radio,
  Car,
  Plane,
  Smartphone,
  HeartPulse,
  RefreshCw,
  Activity,
  ShieldCheck,
  Anchor,
};

export default function UseCaseGrid({ useCases }: { useCases: UseCase[] }) {
  return (
    <div className="usecase-grid">
      {useCases.map((u, i) => {
        const Icon = ICONS[u.icon] ?? Zap;
        return (
          <div className="usecase-card" key={u.title} data-cursor-hover>
            <div className="usecase-idx">0{i + 1}</div>
            <div className="usecase-icon">
              <Icon size={28} strokeWidth={1.4} />
            </div>
            <h3 className="usecase-title">{u.title}</h3>
            <p className="usecase-desc">{u.description}</p>
          </div>
        );
      })}
    </div>
  );
}
