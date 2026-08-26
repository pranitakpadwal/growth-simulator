import type { ConstraintAssessment, ScenarioName } from "@/lib/growth-simulator/types";
import type { ChannelEfficiency } from "@/lib/growth-simulator/engine";
import { formatInrCompact, formatNumber } from "@/lib/growth-simulator/format";
import BenchmarkTable, { type BenchmarkRow } from "./BenchmarkTable";
import ConstraintCard from "./ConstraintCard";
import ChannelEfficiencyTable from "./ChannelEfficiencyTable";
import SourceList, { type SourceEntry } from "./SourceList";
import MediaSplitBar, { type MediaSplitSlice } from "./MediaSplitBar";
import ScenarioBarChart from "./ScenarioBarChart";

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
}: Props) {
  const cacOverTarget = targetCacInr != null && blendedCacInr > targetCacInr;

  return (
    <div className="flex flex-col gap-8">
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryStat label="Total investment" value={formatInrCompact(totalSpendInr)} />
        <SummaryStat label={valueLabel} value={formatNumber(totalConversions)} />
        <SummaryStat
          label="Blended CAC"
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
        {hasRevenue && <SummaryStat label="Contribution" value={formatInrCompact(totalContributionInr)} />}
        {hasRevenue && <SummaryStat label="GEI" value={gei.toFixed(2)} sub="Contribution ₹ per ₹ spent" />}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <MediaSplitBar slices={mediaSplit} />
        <ScenarioBarChart values={scenarioConversionTotals} valueLabel={valueLabel} />
      </section>

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
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "good" | "bad" | "neutral";
}) {
  const toneClass = tone === "good" ? "text-brand-dark" : tone === "bad" ? "text-red-700" : "text-foreground/50";
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <div className="text-xs uppercase tracking-wide text-foreground/50">{label}</div>
      <div className="mt-1 font-display text-xl font-semibold text-foreground">{value}</div>
      {sub && <div className={`mt-0.5 text-xs ${toneClass}`}>{sub}</div>}
    </div>
  );
}
