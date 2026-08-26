import type { FunnelForecast, ScenarioName } from "@/lib/growth-simulator/types";
import { formatInrCompact, formatNumber } from "@/lib/growth-simulator/format";

const SCENARIO_LABEL: Record<ScenarioName, string> = {
  conservative: "Conservative",
  base: "Base",
  upside: "Upside",
};

/** PRD §27 "Three Forecast Cases" — never show a single-point forecast. */
export default function ScenarioTable({
  forecasts,
}: {
  forecasts: Record<ScenarioName, FunnelForecast>;
}) {
  const rows: Array<{ label: string; get: (f: FunnelForecast) => string }> = [
    { label: "Funded customers", get: (f) => formatNumber(f.fundedCustomers) },
    { label: "Media spend", get: (f) => formatInrCompact(f.spendInr) },
    { label: "CAC", get: (f) => formatInrCompact(f.cacInr) },
    { label: "Revenue", get: (f) => formatInrCompact(f.revenueInr) },
    { label: "Contribution", get: (f) => formatInrCompact(f.contributionInr) },
  ];

  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[480px] text-sm">
        <thead>
          <tr className="border-b border-line bg-brand-soft/40 text-left text-xs uppercase tracking-wide text-foreground/60">
            <th className="px-3 py-2 font-medium">Metric</th>
            {(["conservative", "base", "upside"] as ScenarioName[]).map((s) => (
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
              {(["conservative", "base", "upside"] as ScenarioName[]).map((s) => (
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
