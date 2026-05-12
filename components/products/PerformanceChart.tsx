"use client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { PerformanceMetric } from "@/lib/cms-helpers";

const ACCENT = "#5EEAD4";
const MARKET = "#3b4860";
const GRID = "rgba(94, 234, 212, 0.06)";
const AXIS = "#8290A4";

type ChartRow = {
  label: string;
  ours: number;
  market: number;
  oursLabel: string;
  marketLabel: string;
  inverted: boolean;
};

function computeNormalizedRow(m: PerformanceMetric): ChartRow {
  // 對 inverted 指標，圖表上顯示為 (max - value)，使「越大越好」一致呈現
  if (m.inverted) {
    return {
      label: m.label,
      ours: Math.max(0, m.maxValue - m.ours),
      market: Math.max(0, m.maxValue - m.market),
      oursLabel: m.oursLabel,
      marketLabel: m.marketLabel,
      inverted: true,
    };
  }
  return {
    label: m.label,
    ours: m.ours,
    market: m.market,
    oursLabel: m.oursLabel,
    marketLabel: m.marketLabel,
    inverted: false,
  };
}

type TooltipPayloadItem = {
  dataKey: string;
  payload: ChartRow;
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}

type Labels = {
  ours: string;
  market: string;
  lowerBetter: string;
  notePrefix: string;
  noteEm: string;
  noteSuffix: string;
};

function CustomTooltip({
  active,
  payload,
  label,
  labels,
}: CustomTooltipProps & { labels: Labels }) {
  if (!active || !payload || payload.length === 0) return null;
  const row = payload[0].payload;
  return (
    <div
      style={{
        background: "rgba(10,14,20,0.95)",
        border: "1px solid var(--line)",
        padding: "0.75rem 1rem",
        fontFamily: "var(--font-jetbrains), monospace",
        fontSize: 11,
        color: "var(--text)",
      }}
    >
      <div style={{ color: "var(--muted)", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>
        {label}
      </div>
      <div style={{ color: ACCENT, marginBottom: "0.25rem" }}>
        ● {labels.ours} · <strong>{row.oursLabel}</strong>
      </div>
      <div style={{ color: AXIS }}>
        ● {labels.market} · {row.marketLabel}
      </div>
      {row.inverted && (
        <div style={{ marginTop: "0.5rem", fontSize: 9, color: AXIS, letterSpacing: "0.15em" }}>
          {labels.lowerBetter}
        </div>
      )}
    </div>
  );
}

export default function PerformanceChart({
  data,
  labels,
}: {
  data: PerformanceMetric[];
  labels: Labels;
}) {
  const rows: ChartRow[] = data.map(computeNormalizedRow);

  return (
    <div className="perf-chart-wrap">
      <ResponsiveContainer width="100%" height={Math.max(300, rows.length * 80 + 80)}>
        <BarChart data={rows} layout="vertical" margin={{ top: 16, right: 32, left: 32, bottom: 16 }}>
          <CartesianGrid stroke={GRID} horizontal={false} />
          <XAxis
            type="number"
            stroke={AXIS}
            tick={{ fill: AXIS, fontFamily: "var(--font-jetbrains), monospace", fontSize: 10 }}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={260}
            stroke={AXIS}
            tick={{ fill: AXIS, fontFamily: "var(--font-jetbrains), monospace", fontSize: 11 }}
          />
          <Tooltip cursor={{ fill: "rgba(94,234,212,0.04)" }} content={<CustomTooltip labels={labels} />} />
          <Legend
            wrapperStyle={{
              fontFamily: "var(--font-jetbrains), monospace",
              fontSize: 10,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: AXIS,
            }}
            iconType="square"
          />
          <Bar dataKey="ours" name={labels.ours} fill={ACCENT} radius={[0, 0, 0, 0]} barSize={14}>
            {rows.map((_, i) => (
              <Cell key={i} fill={ACCENT} />
            ))}
          </Bar>
          <Bar dataKey="market" name={labels.market} fill={MARKET} radius={[0, 0, 0, 0]} barSize={14}>
            {rows.map((_, i) => (
              <Cell key={i} fill={MARKET} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="perf-note">
        {labels.notePrefix}
        <em>{labels.noteEm}</em>
        {labels.noteSuffix}
      </p>
    </div>
  );
}
