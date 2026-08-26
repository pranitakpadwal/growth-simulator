"use client";

import type { BenchmarkMetric, ValueClass } from "@/lib/growth-simulator/types";
import { formatInrCompact, formatPct } from "@/lib/growth-simulator/format";
import ProvenanceBadge from "./ProvenanceBadge";

export interface BenchmarkRow {
  benchmark: BenchmarkMetric;
  value: number;
  valueClass: ValueClass;
  onChange: (next: number) => void;
  /** Cost metrics (CPC, CAC) are "better" the lower they run — inverts the position logic. */
  isCostMetric?: boolean;
}

const POSITION_STYLE: Record<string, string> = {
  Below: "bg-red-100 text-red-800",
  "Best in class range": "bg-brand-soft text-brand-dark",
  Normal: "bg-brand-soft text-brand-dark",
  Above: "bg-red-100 text-red-800",
};

function position(row: BenchmarkRow): string {
  const { benchmark, value, isCostMetric } = row;
  const good = isCostMetric ? value < benchmark.p25 : value > benchmark.p75;
  const bad = isCostMetric ? value > benchmark.p75 : value < benchmark.p25;
  if (good) return "Best in class range";
  if (bad) return "Below";
  return "Normal";
}

/**
 * PRD §10 "Never Use a Single Benchmark" — every metric shows the market
 * range, the company's own value, and a plain-language position, not a
 * lone percentage.
 */
export default function BenchmarkTable({ rows }: { rows: BenchmarkRow[] }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-line bg-brand-soft/40 text-left text-xs uppercase tracking-wide text-foreground/60">
            <th className="px-3 py-2 font-medium">Metric</th>
            <th className="px-3 py-2 font-medium">Your value</th>
            <th className="px-3 py-2 font-medium">Benchmark range (P25–P75)</th>
            <th className="px-3 py-2 font-medium">Position</th>
            <th className="px-3 py-2 font-medium">Source</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const { benchmark } = row;
            const fmt = (v: number) => (benchmark.unit === "inr" ? formatInrCompact(v) : formatPct(v));
            const pos = position(row);
            return (
              <tr key={benchmark.id} className="border-b border-line last:border-0">
                <td className="px-3 py-2 font-medium text-foreground">{benchmark.label}</td>
                <td className="px-3 py-2">
                  <input
                    type="number"
                    value={row.value}
                    onChange={(e) => row.onChange(Number(e.target.value))}
                    className="w-24 rounded border border-line bg-background px-2 py-1 text-right tabular-nums"
                    step="any"
                  />
                </td>
                <td className="px-3 py-2 text-foreground/70 tabular-nums">
                  {fmt(benchmark.p25)} – {fmt(benchmark.p75)}
                </td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${POSITION_STYLE[pos]}`}>
                    {pos}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <ProvenanceBadge valueClass={row.valueClass} benchmark={benchmark} companyValue={row.value} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
