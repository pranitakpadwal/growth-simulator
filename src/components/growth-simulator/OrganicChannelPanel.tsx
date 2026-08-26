"use client";

import type { ChannelId, FunnelTemplate } from "@/lib/growth-simulator/types";
import { runThreeOrganicScenarios } from "@/lib/growth-simulator/engine";
import { formatInrCompact } from "@/lib/growth-simulator/format";
import ScenarioTable from "./ScenarioTable";

interface Props {
  channelId: ChannelId;
  label: string;
  entryVolumeLabel: string;
  entryVolume: number;
  onEntryVolumeChange: (v: number) => void;
  investmentInr: number;
  onInvestmentChange: (v: number) => void;
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
 */
export default function OrganicChannelPanel({
  channelId,
  label,
  entryVolumeLabel,
  entryVolume,
  onEntryVolumeChange,
  investmentInr,
  onInvestmentChange,
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
  });

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

      <ScenarioTable forecasts={forecasts} valueLabel={template.valueLabel} hasRevenue={template.hasRevenue} />
    </div>
  );
}
