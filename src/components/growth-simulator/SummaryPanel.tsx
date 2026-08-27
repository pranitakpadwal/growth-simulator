import type { ConstraintAssessment, ScenarioName } from "@/lib/growth-simulator/types";
import type { ChannelEfficiency } from "@/lib/growth-simulator/engine";
import { formatInrCompact, formatNumber } from "@/lib/growth-simulator/format";
import BenchmarkTable, { type BenchmarkRow } from "./BenchmarkTable";
import ConstraintCard from "./ConstraintCard";
import ChannelEfficiencyTable from "./ChannelEfficiencyTable";
import SourceList, { type SourceEntry } from "./SourceList";
import MediaSplitBar, { type MediaSplitSlice } from "./MediaSplitBar";
import ScenarioBarChart from "./ScenarioBarChart";
import InfoTooltip from "./InfoTooltip";

export interface ObjectiveResult {
  channelId: string;
  channelLabel: string;
  objectiveLabel: string;
  unitLabel: string;
  spendInr: number;
  volume: number;
}

interface Props {
  totalSpendInr: number;
  totalConversions: number;
  blendedCacInr: number;
  totalRevenueInr: number;
  totalContributionInr: number;
  gei: number;
  hasRevenue: boolean;
  valueLabel: string;
  targetCacInr: number | null;
  constraints: ConstraintAssessment[];
  bottleneck: ConstraintAssessment;
  efficiencyRows: ChannelEfficiency[];
  benchmarkRows: BenchmarkRow[];
  sources: SourceEntry[];
  mediaSplit: MediaSplitSlice[];
  scenarioConversionTotals: Record<ScenarioName, number>;
  objectiveResults: ObjectiveResult[];
}

/** PRD §24 CXO dashboard — the roll-up across every channel tab. */
export default function SummaryPanel({
  totalSpendInr,
  totalConversions,
  blendedCacInr,
  totalRevenueInr,
  totalContributionInr,
  gei,
  hasRevenue,
  valueLabel,
  targetCacInr,
  constraints,
  bottleneck,
  efficiencyRows,
  benchmarkRows,
  sources,
  mediaSplit,
  scenarioConversionTotals,
  objectiveResults,
}: Props) {
  const cacOverTarget = targetCacInr != null && blendedCacInr > targetCacInr;

  return (
    <div className="flex flex-col gap-8">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryStat label="Total investment" value={formatInrCompact(totalSpendInr)} />
        <SummaryStat label={valueLabel} value={formatNumber(totalConversions)} />
        <SummaryStat
          label="Blended CAC"
          term="blendedCac"
          value={blendedCacInr > 0 ? formatInrCompact(blendedCacInr) : "—"}
          sub={
            targetCacInr != null
              ? cacOverTarget
                ? `Over ₹${targetCacInr.toLocaleString("en-IN")} target`
                : `Within ₹${targetCacInr.toLocaleString("en-IN")} target`
              : undefined
          }
          tone={targetCacInr != null ? (cacOverTarget ? "bad" : "good") : "neutral"}
        />
        {hasRevenue && <SummaryStat label="Revenue" value={formatInrCompact(totalRevenueInr)} />}
        {hasRevenue && (
          <SummaryStat label="Contribution" term="contribution" value={formatInrCompact(totalContributionInr)} />
        )}
        {hasRevenue && (
          <SummaryStat label="GEI" term="gei" value={gei.toFixed(2)} sub="Contribution ₹ per ₹ spent" />
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MediaSplitBar slices={mediaSplit} />
        <ScenarioBarChart values={scenarioConversionTotals} valueLabel={valueLabel} />
      </section>

      {objectiveResults.length > 0 && (
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">Awareness &amp; Engagement</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Channels bought against a non-lead objective — counted in Total Investment above, but not in{" "}
            {valueLabel}, Blended CAC, or Contribution. A view, a follow, or a message isn&apos;t a lead.
          </p>
          <div className="mt-3 overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-surface text-xs uppercase tracking-wide text-foreground/50">
                <tr>
                  <th className="px-4 py-2">Channel</th>
                  <th className="px-4 py-2">Objective</th>
                  <th className="px-4 py-2 text-right">Spend</th>
                  <th className="px-4 py-2 text-right">Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {objectiveResults.map((r) => (
                  <tr key={r.channelId}>
                    <td className="px-4 py-2.5 font-medium text-foreground">{r.channelLabel}</td>
                    <td className="px-4 py-2.5 text-foreground/70">{r.objectiveLabel}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{formatInrCompact(r.spendInr)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {formatNumber(r.volume)} {r.unitLabel}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section>
        <h2 className="font-display text-lg font-semibold text-foreground">Benchmark position</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Post-click funnel assumptions, shared across every channel above.
        </p>
        <div className="mt-3">
          <BenchmarkTable rows={benchmarkRows} />
        </div>
      </section>

      <section>
        <ConstraintCard constraints={constraints} bottleneck={bottleneck} />
      </section>

      <section>
        <h3 className="font-display text-lg font-semibold text-foreground">Where should the next rupee go?</h3>
        <p className="mt-1 text-sm text-foreground/70">
          Every channel you&apos;ve configured, ranked by contribution produced per rupee spent.
        </p>
        <div className="mt-3">
          <ChannelEfficiencyTable rows={efficiencyRows} hasRevenue={hasRevenue} />
        </div>
      </section>

      <SourceList entries={sources} />
    </div>
  );
}

function SummaryStat({
  label,
  value,
  sub,
  tone = "neutral",
  term,
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "good" | "bad" | "neutral";
  term?: string;
}) {
  const toneClass = tone === "good" ? "text-brand-dark" : tone === "bad" ? "text-red-700" : "text-foreground/50";
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <div className="flex items-center text-xs uppercase tracking-wide text-foreground/50">
        {label}
        {term && <InfoTooltip term={term} />}
      </div>
      <div className="mt-1 font-display text-xl font-semibold text-foreground">{value}</div>
      {sub && <div className={`mt-0.5 text-xs ${toneClass}`}>{sub}</div>}
    </div>
  );
}
