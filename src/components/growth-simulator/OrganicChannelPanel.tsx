"use client";

import type { ChannelId, FunnelTemplate } from "@/lib/growth-simulator/types";
import { runThreeOrganicScenarios } from "@/lib/growth-simulator/engine";
import { formatInrCompact, formatPct } from "@/lib/growth-simulator/format";
import ScenarioTable from "./ScenarioTable";
import FunnelChart from "./FunnelChart";
import InfoTooltip from "./InfoTooltip";

interface Props {
  channelId: ChannelId;
  label: string;
  entryVolumeLabel: string;
  entryVolume: number;
  onEntryVolumeChange: (v: number) => void;
  investmentInr: number;
  onInvestmentChange: (v: number) => void;
  overrideEnabled: boolean;
  onOverrideEnabledChange: (v: boolean) => void;
  overrideRatePct: number;
  onOverrideRatePctChange: (v: number) => void;
  template: FunnelTemplate;
  stageAssumptions: Record<string, number>;
  revenuePerCustomerInr: number;
  variableCostPerCustomerInr: number;
  contributionMarginPct: number;
}

/**
 * SEO/ASO tab body — no CPC to buy clicks with; the user estimates monthly
 * organic entry volume directly (organic search clicks, or organic App
 * Store listing visits) and, optionally, a content/ASO investment budget
 * so this channel still shows up in the Summary's efficiency ranking.
 *
 * Organic traffic quality varies far more than paid (a commercial landing
 * page vs. a branding-only blog post, or a high-intent Play Store search
 * vs. a browse/explore listing) in a way the shared paid-channel funnel
 * assumptions don't capture. Rather than forking a separate template per
 * intent, an optional override lets this channel skip the shared stage-by-
 * stage funnel and go straight from entry volume to the goal at whatever
 * blended conversion rate the user actually has data for.
 */
export default function OrganicChannelPanel({
  channelId,
  label,
  entryVolumeLabel,
  entryVolume,
  onEntryVolumeChange,
  investmentInr,
  onInvestmentChange,
  overrideEnabled,
  onOverrideEnabledChange,
  overrideRatePct,
  onOverrideRatePctChange,
  template,
  stageAssumptions,
  revenuePerCustomerInr,
  variableCostPerCustomerInr,
  contributionMarginPct,
}: Props) {
  const forecasts = runThreeOrganicScenarios({
    channelId,
    entryCount: entryVolume,
    spendInr: investmentInr,
    template,
    stageAssumptions,
    revenuePerCustomerInr,
    variableCostPerCustomerInr,
    contributionMarginPct,
    overrideConversionRatePct: overrideEnabled ? overrideRatePct : undefined,
  });

  const funnelStages = [
    { label: entryVolumeLabel, count: entryVolume },
    ...forecasts.base.stages.map((s) => ({
      label: s.label,
      count: s.count,
      isValueStage: s.stageId === template.valueStageId,
    })),
  ];

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-foreground/70">
        {label} is an organic channel — no media auction, so there&apos;s no CPC to set. Estimate the
        volume it realistically delivers per month and (optionally) what you&apos;re investing in it
        (content production, app-listing optimization) so it shows up comparably in the Summary tab.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs text-foreground/60">{entryVolumeLabel} (per month)</span>
          <input
            type="number"
            value={entryVolume}
            onChange={(e) => onEntryVolumeChange(Number(e.target.value))}
            step="any"
            className="rounded border border-line bg-background px-2 py-1.5 tabular-nums"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs text-foreground/60">Content / optimization investment (₹/month, optional)</span>
          <input
            type="number"
            value={investmentInr}
            onChange={(e) => onInvestmentChange(Number(e.target.value))}
            step="any"
            className="rounded border border-line bg-background px-2 py-1.5 tabular-nums"
          />
          <span className="text-xs text-foreground/50">
            {investmentInr > 0
              ? `${formatInrCompact(investmentInr)}/month treated as this channel's spend for CAC/GEI.`
              : "Leave at 0 to treat this as a free organic lever."}
          </span>
        </label>
      </div>

      <div className="rounded-lg border border-line bg-surface p-4">
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={overrideEnabled}
            onChange={(e) => onOverrideEnabledChange(e.target.checked)}
            className="h-4 w-4"
          />
          <span className="flex items-center font-medium text-foreground">
            Set a custom conversion rate for this traffic
            <InfoTooltip definition="Organic traffic quality varies a lot by intent — a commercial landing page converts very differently to a branding-only blog post, and a high-intent Play Store search converts differently to a browse listing. Turn this on to skip the shared funnel assumptions and set one blended rate for this channel's traffic instead." />
          </span>
        </label>
        {overrideEnabled && (
          <div className="mt-3 flex items-center gap-3">
            <input
              type="range"
              min={0}
              max={50}
              step={0.5}
              value={overrideRatePct}
              onChange={(e) => onOverrideRatePctChange(Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-20 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
              {formatPct(overrideRatePct)}
            </span>
          </div>
        )}
        <p className="mt-2 text-xs text-foreground/50">
          {overrideEnabled
            ? `${entryVolumeLabel.replace("Estimated ", "")} → ${template.valueLabel.toLowerCase()} directly at ${formatPct(
                overrideRatePct
              )}, bypassing the shared funnel stages below.`
            : "Off: uses the same shared funnel stages as the paid channels (editable in the Summary tab's benchmark table)."}
        </p>
      </div>

      <FunnelChart stages={funnelStages} />

      <ScenarioTable forecasts={forecasts} valueLabel={template.valueLabel} hasRevenue={template.hasRevenue} />
    </div>
  );
}
