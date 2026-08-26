"use client";

import type { ChannelId, FunnelTemplate, IndustryGroup, ValueClass } from "@/lib/growth-simulator/types";
import { getChannelBenchmark } from "@/lib/growth-simulator/benchmarks";
import { runThreePaidScenarios, maxSustainableCpc, costLadder } from "@/lib/growth-simulator/engine";
import { formatInrCompact, formatNumber } from "@/lib/growth-simulator/format";
import ScenarioTable from "./ScenarioTable";
import CostLadder from "./CostLadder";
import FunnelChart from "./FunnelChart";
import ScenarioBarChart from "./ScenarioBarChart";
import InfoTooltip from "./InfoTooltip";

interface Props {
  channelId: ChannelId;
  label: string;
  group: IndustryGroup;
  spendInr: number;
  cpcValue: number;
  cpcValueClass: ValueClass;
  onCpcChange: (v: number) => void;
  ctrValue: number;
  ctrValueClass: ValueClass;
  onCtrChange: (v: number) => void;
  template: FunnelTemplate;
  stageAssumptions: Record<string, number>;
  onStageRateChange: (metricId: string, value: number) => void;
  targetCacInr: number | null;
  revenuePerCustomerInr: number;
  variableCostPerCustomerInr: number;
  contributionMarginPct: number;
}

/** One paid channel's tab body — CPC/CTR inputs, spend, and a three-case forecast through the shared funnel. */
export default function ChannelPanel({
  channelId,
  label,
  group,
  spendInr,
  cpcValue,
  cpcValueClass,
  onCpcChange,
  ctrValue,
  ctrValueClass,
  onCtrChange,
  template,
  stageAssumptions,
  onStageRateChange,
  targetCacInr,
  revenuePerCustomerInr,
  variableCostPerCustomerInr,
  contributionMarginPct,
}: Props) {
  const benchmark = getChannelBenchmark(group, channelId);
  const estimatedClicks = cpcValue > 0 ? spendInr / cpcValue : 0;
  const estimatedImpressions = ctrValue > 0 ? estimatedClicks / (ctrValue / 100) : 0;

  const forecasts = runThreePaidScenarios({
    channelId,
    spendInr,
    baseCpc: cpcValue,
    template,
    stageAssumptions,
    revenuePerCustomerInr,
    variableCostPerCustomerInr,
    contributionMarginPct,
  });

  const maxCpc = targetCacInr != null ? maxSustainableCpc(template, stageAssumptions, targetCacInr) : null;
  const overTarget = maxCpc != null && cpcValue > maxCpc;
  const rungs = costLadder(cpcValue, template, stageAssumptions);

  const funnelStages = [
    { label: "Impressions", count: estimatedImpressions },
    { label: "Clicks", count: estimatedClicks },
    ...forecasts.base.stages.map((s) => ({
      label: s.label,
      count: s.count,
      rate: s.rate,
      metricId: template.stages.find((st) => st.id === s.stageId)?.metricId,
      isValueStage: s.stageId === template.valueStageId,
    })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-line bg-surface p-3">
          <div className="text-xs uppercase tracking-wide text-foreground/50">Monthly budget</div>
          <div className="mt-1 font-display text-lg font-semibold text-foreground">
            {formatInrCompact(spendInr)}
          </div>
        </div>
        <label className="rounded-lg border border-line bg-surface p-3">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-foreground/50">
            <span className="flex items-center">
              CPC
              <InfoTooltip term="cpc" />
            </span>
            <span className={cpcValueClass === "actual" ? "text-brand-dark" : "text-amber-700"}>
              {cpcValueClass === "actual" ? "Actual" : "Benchmark"}
            </span>
          </div>
          <input
            type="number"
            value={cpcValue}
            onChange={(e) => onCpcChange(Number(e.target.value))}
            step="any"
            className="mt-1 w-full rounded border border-line bg-background px-2 py-1 font-display text-lg font-semibold tabular-nums"
          />
          <div className="mt-1 text-xs text-foreground/50">
            Benchmark {formatInrCompact(benchmark.cpcP25)}–{formatInrCompact(benchmark.cpcP75)}
          </div>
        </label>
        <label className="rounded-lg border border-line bg-surface p-3">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-foreground/50">
            <span className="flex items-center">
              CTR
              <InfoTooltip term="ctr" />
            </span>
            <span className={ctrValueClass === "actual" ? "text-brand-dark" : "text-amber-700"}>
              {ctrValueClass === "actual" ? "Actual" : "Benchmark"}
            </span>
          </div>
          <input
            type="number"
            value={ctrValue}
            onChange={(e) => onCtrChange(Number(e.target.value))}
            step="any"
            className="mt-1 w-full rounded border border-line bg-background px-2 py-1 font-display text-lg font-semibold tabular-nums"
          />
          <div className="mt-1 text-xs text-foreground/50">
            ≈ {formatNumber(estimatedImpressions)} impressions/mo at this CTR
          </div>
        </label>
        <div className="rounded-lg border border-line bg-surface p-3">
          <div className="text-xs uppercase tracking-wide text-foreground/50">Source</div>
          <div className="mt-1 text-xs text-foreground/70">{benchmark.source}</div>
          <div className="mt-1 text-xs text-foreground/50">Tier {benchmark.tier} · confidence {benchmark.confidenceScore}/100</div>
        </div>
      </div>

      {maxCpc != null && (
        <div
          className={`rounded-lg border p-3 text-sm ${
            overTarget ? "border-red-200 bg-red-50 text-red-800" : "border-line bg-brand-soft/40 text-brand-dark"
          }`}
        >
          To hit your target CAC, keep {label} CPC under{" "}
          <strong>{formatInrCompact(maxCpc)}</strong>. You&apos;re currently at{" "}
          <strong>{formatInrCompact(cpcValue)}</strong>
          {overTarget ? " — over target." : " — within target."}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <FunnelChart stages={funnelStages} onRateChange={onStageRateChange} />
        <CostLadder rungs={rungs} cpc={cpcValue} />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <ScenarioBarChart
          values={{
            conservative: forecasts.conservative.valueCount,
            base: forecasts.base.valueCount,
            upside: forecasts.upside.valueCount,
          }}
          valueLabel={template.valueLabel}
        />
        <ScenarioTable forecasts={forecasts} valueLabel={template.valueLabel} hasRevenue={template.hasRevenue} />
      </div>
    </div>
  );
}
