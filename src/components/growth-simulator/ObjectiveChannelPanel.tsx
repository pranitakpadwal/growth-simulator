"use client";

import type { ChannelId, ChannelObjectiveDefinition } from "@/lib/growth-simulator/types";
import { getUnitBenchmark } from "@/lib/growth-simulator/objectives";
import { formatInrCompact, formatNumber } from "@/lib/growth-simulator/format";

interface Props {
  channelId: ChannelId;
  objective: ChannelObjectiveDefinition;
  spendInr: number;
  costPerUnit: number;
  onCostPerUnitChange: (v: number) => void;
}

/**
 * The panel for a channel bought against a non-funnel objective (Views,
 * Traffic, Engagement/Followers, Messages, Awareness/Impressions) — a
 * simple spend ÷ cost-per-unit -> volume calculation, deliberately NOT
 * routed through the shared click -> lead -> customer funnel. A view or a
 * follow isn't a lead: there's no defensible conversion rate or revenue
 * number to attach to it, so this channel's spend counts toward Total
 * Investment but not toward Leads/CAC/Contribution in the Summary tab —
 * see the "Awareness & Engagement" section there instead.
 */
export default function ObjectiveChannelPanel({ channelId, objective, spendInr, costPerUnit, onCostPerUnitChange }: Props) {
  const benchmark = getUnitBenchmark(channelId, objective.id);
  const volume = spendInr > 0 && costPerUnit > 0 ? spendInr / costPerUnit : 0;

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-foreground/70">{objective.description}</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border border-line bg-surface p-3">
          <div className="text-xs uppercase tracking-wide text-foreground/50">Monthly budget</div>
          <div className="mt-1 font-display text-lg font-semibold text-foreground tabular-nums">
            {formatInrCompact(spendInr)}
          </div>
        </div>
        <label className="rounded-lg border border-line bg-surface p-3">
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-foreground/50">
            Cost per {objective.unitLabel}
            {benchmark && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-medium text-amber-800">
                Tier {benchmark.tier} · {benchmark.confidenceScore}/100
              </span>
            )}
          </div>
          <input
            type="number"
            value={costPerUnit}
            onChange={(e) => onCostPerUnitChange(Number(e.target.value))}
            step="any"
            className="mt-1 w-full rounded border border-line bg-background px-2 py-1 font-display text-lg font-semibold tabular-nums"
          />
          {benchmark && (
            <div className="mt-1 text-xs text-foreground/50">
              Benchmark ₹{benchmark.costPerUnitP25}–₹{benchmark.costPerUnitP75}
            </div>
          )}
        </label>
        <div className="rounded-lg border border-line bg-surface p-3">
          <div className="text-xs uppercase tracking-wide text-foreground/50">Estimated {objective.unitLabel}s / month</div>
          <div className="mt-1 font-display text-lg font-semibold text-foreground tabular-nums">
            {formatNumber(volume)}
          </div>
        </div>
      </div>

      {benchmark && (
        <div className="rounded-lg border border-line bg-surface p-3 text-xs text-foreground/60">
          <span className="font-semibold text-foreground/70">Source: </span>
          {benchmark.source}
          {benchmark.notes && <span className="block mt-1 text-foreground/50">{benchmark.notes}</span>}
        </div>
      )}

      <div className="rounded-lg border border-dashed border-line bg-surface/50 p-3 text-xs text-foreground/50">
        This spend counts toward Total Investment in the Summary tab, but not toward Leads, Blended CAC, or
        Contribution — {objective.unitLabel}s aren&apos;t a revenue-producing conversion. Switch this
        channel&apos;s objective back to &quot;Leads&quot; to route it through the shared funnel instead.
      </div>
    </div>
  );
}
