import type { ScenarioName } from "@/lib/growth-simulator/types";
import { formatInrCompact, formatNumber } from "@/lib/growth-simulator/format";

const SCENARIO_LABEL: Record<ScenarioName, string> = {
  conservative: "Conservative",
  base: "Base",
  upside: "Upside",
};

const SCENARIOS: ScenarioName[] = ["conservative", "base", "upside"];

export interface ScenarioFigures {
  spendInr: number;
  valueCount: number;
  cacInr: number;
  revenueInr: number;
  contributionInr: number;
}

/** PRD §27 "Three Forecast Cases" — never show a single-point forecast. */
export default function ScenarioTable({
  forecasts,
  valueLabel,
  hasRevenue,
}: {
  forecasts: Record<ScenarioName, ScenarioFigures>;
  valueLabel: string;
  hasRevenue: boolean;
}) {
  const rows: Array<{ label: string; get: (f: ScenarioFigures) => string }> = [
    { label: valueLabel, get: (f) => formatNumber(f.valueCount) },
    { label: "Spend", get: (f) => formatInrCompact(f.spendInr) },
    { label: "CAC", get: (f) => (f.cacInr > 0 ? formatInrCompact(f.cacInr) : "—") },
    ...(hasRevenue
      ? [
          { label: "Revenue", get: (f: ScenarioFigures) => formatInrCompact(f.revenueInr) },
          { label: "Contribution", get: (f: ScenarioFigures) => formatInrCompact(f.contributionInr) },
        ]
      : []),
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-line bg-brand-soft/40 text-left text-xs uppercase tracking-wide text-foreground/60">
            <th className="px-3 py-2 font-medium">Metric</th>
            {SCENARIOS.map((s) => (
              <th key={s} className="px-3 py-2 text-right font-medium">
                {SCENARIO_LABEL[s]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label} className="border-b border-line last:border-0">
              <td className="px-3 py-2 font-medium text-foreground">{row.label}</td>
              {SCENARIOS.map((s) => (
                <td
                  key={s}
                  className={`px-3 py-2 text-right tabular-nums ${
                    s === "base" ? "font-semibold text-brand-dark" : "text-foreground/70"
                  }`}
                >
                  {row.get(forecasts[s])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
