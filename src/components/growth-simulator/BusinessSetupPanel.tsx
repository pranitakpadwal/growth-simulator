"use client";

import type { BudgetCadence, GoalDefinition, IndustryDefinition } from "@/lib/growth-simulator/types";
import { formatInrCompact } from "@/lib/growth-simulator/format";

export type PlanMode = "budget" | "goal";

interface Props {
  industries: IndustryDefinition[];
  industryId: string;
  onIndustryChange: (id: string) => void;

  availableGoals: GoalDefinition[];
  goalId: string;
  onGoalChange: (id: string) => void;

  planMode: PlanMode;
  onPlanModeChange: (m: PlanMode) => void;

  cadence: BudgetCadence;
  onCadenceChange: (c: BudgetCadence) => void;
  budgetInputValue: number;
  onBudgetChange: (v: number) => void;
  monthlyBudgetInr: number;

  targetConversionsInput: string;
  onTargetConversionsChange: (v: string) => void;
  computedBudgetInr: number;
  blendedCacInr: number;

  targetCacInput: string;
  onTargetCacChange: (v: string) => void;

  googlePct: number;
  onGooglePctChange: (v: number) => void;

  hasRevenue: boolean;
  revenuePerCustomerInr: number;
  onRevenueChange: (v: number) => void;
  variableCostPerCustomerInr: number;
  onVariableCostChange: (v: number) => void;
  contributionMarginPct: number;
  onContributionMarginChange: (v: number) => void;
  valueLabel: string;
}

/**
 * PRD §42 "Minimum Required Inputs" — the CXO only has to pick an industry,
 * a goal, and either a budget or a target. Everything else (funnel shape,
 * benchmarks, channel defaults) follows automatically from that choice.
 *
 * "Plan by budget" is the usual direction (budget → forecast outcome).
 * "Plan by target" is the reverse a working marketer actually starts from
 * half the time — "I need 5,000 leads this month" — and back-solves the
 * paid budget required to hit it from the current CPC and funnel rates.
 */
export default function BusinessSetupPanel({
  industries,
  industryId,
  onIndustryChange,
  availableGoals,
  goalId,
  onGoalChange,
  planMode,
  onPlanModeChange,
  cadence,
  onCadenceChange,
  budgetInputValue,
  onBudgetChange,
  monthlyBudgetInr,
  targetConversionsInput,
  onTargetConversionsChange,
  computedBudgetInr,
  blendedCacInr,
  targetCacInput,
  onTargetCacChange,
  googlePct,
  onGooglePctChange,
  hasRevenue,
  revenuePerCustomerInr,
  onRevenueChange,
  variableCostPerCustomerInr,
  onVariableCostChange,
  contributionMarginPct,
  onContributionMarginChange,
  valueLabel,
}: Props) {
  return (
    <section className="rounded-lg border border-line bg-surface p-4">
      <h2 className="font-display text-lg font-semibold text-foreground">What are you trying to achieve?</h2>
      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs text-foreground/60">Industry</span>
          <select
            value={industryId}
            onChange={(e) => onIndustryChange(e.target.value)}
            className="rounded border border-line bg-background px-2 py-1.5"
          >
            {industries.map((i) => (
              <option key={i.id} value={i.id}>
                {i.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs text-foreground/60">Goal</span>
          <select
            value={goalId}
            onChange={(e) => onGoalChange(e.target.value)}
            className="rounded border border-line bg-background px-2 py-1.5"
          >
            {availableGoals.map((g) => (
              <option key={g.id} value={g.id}>
                {g.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-foreground/50">{availableGoals.find((g) => g.id === goalId)?.description}</span>
        </label>

        <div className="flex flex-col gap-1 text-sm sm:col-span-2 lg:col-span-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-foreground/60">
              {planMode === "budget" ? "Budget" : `Target ${valueLabel.toLowerCase()} / month`}
            </span>
            <div className="flex rounded-full border border-line p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => onPlanModeChange("budget")}
                className={`rounded-full px-2 py-0.5 ${
                  planMode === "budget" ? "bg-brand text-white" : "text-foreground/60"
                }`}
              >
                I know my budget
              </button>
              <button
                type="button"
                onClick={() => onPlanModeChange("goal")}
                className={`rounded-full px-2 py-0.5 ${
                  planMode === "goal" ? "bg-brand text-white" : "text-foreground/60"
                }`}
              >
                I have a target
              </button>
            </div>
          </div>

          {planMode === "budget" ? (
            <>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  value={budgetInputValue}
                  onChange={(e) => onBudgetChange(Number(e.target.value))}
                  className="w-full rounded border border-line bg-background px-2 py-1.5 tabular-nums"
                  step="any"
                />
                <select
                  value={cadence}
                  onChange={(e) => onCadenceChange(e.target.value as BudgetCadence)}
                  className="rounded border border-line bg-background px-1.5 py-1.5 text-xs"
                >
                  <option value="monthly">₹/month</option>
                  <option value="daily">₹/day</option>
                </select>
              </div>
              <span className="text-xs text-foreground/50">= {formatInrCompact(monthlyBudgetInr)}/month</span>
            </>
          ) : (
            <>
              <input
                type="number"
                value={targetConversionsInput}
                onChange={(e) => onTargetConversionsChange(e.target.value)}
                placeholder="e.g. 5000"
                className="w-full rounded border border-line bg-background px-2 py-1.5 tabular-nums"
                step="any"
              />
              <span className="text-xs text-foreground/50">
                {blendedCacInr > 0 ? (
                  <>
                    ≈ {formatInrCompact(blendedCacInr)} per {valueLabel.toLowerCase().replace(/s$/, "")} at your
                    current channel mix → <strong className="text-foreground">{formatInrCompact(computedBudgetInr)}/month</strong> paid
                    budget needed
                  </>
                ) : (
                  "Set your channel CPCs first so a budget can be back-solved."
                )}
              </span>
            </>
          )}
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs text-foreground/60">Target CAC (optional)</span>
          <input
            type="number"
            value={targetCacInput}
            onChange={(e) => onTargetCacChange(e.target.value)}
            placeholder="e.g. 1200"
            className="rounded border border-line bg-background px-2 py-1.5 tabular-nums"
            step="any"
          />
          <span className="text-xs text-foreground/50">Max ₹ willing to pay per {valueLabel.toLowerCase()}</span>
        </label>
      </div>

      <div className="mt-4 border-t border-line pt-4">
        <span className="text-xs text-foreground/60">Paid budget split — Google vs. Meta</span>
        <div className="mt-1.5 flex items-center gap-3">
          <span className="w-16 text-xs text-foreground/50">Google {googlePct}%</span>
          <input
            type="range"
            min={0}
            max={100}
            value={googlePct}
            onChange={(e) => onGooglePctChange(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-16 text-right text-xs text-foreground/50">Meta {100 - googlePct}%</span>
        </div>
      </div>

      {hasRevenue && (
        <div className="mt-4 grid grid-cols-2 gap-4 border-t border-line pt-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs text-foreground/60">Revenue / {valueLabel.toLowerCase().replace(/s$/, "")} (₹)</span>
            <input
              type="number"
              value={revenuePerCustomerInr}
              onChange={(e) => onRevenueChange(Number(e.target.value))}
              className="rounded border border-line bg-background px-2 py-1.5 tabular-nums"
              step="any"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs text-foreground/60">Variable cost / conversion (₹)</span>
            <input
              type="number"
              value={variableCostPerCustomerInr}
              onChange={(e) => onVariableCostChange(Number(e.target.value))}
              className="rounded border border-line bg-background px-2 py-1.5 tabular-nums"
              step="any"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-xs text-foreground/60">Contribution margin (%)</span>
            <input
              type="number"
              value={contributionMarginPct}
              onChange={(e) => onContributionMarginChange(Number(e.target.value))}
              className="rounded border border-line bg-background px-2 py-1.5 tabular-nums"
              step="any"
            />
          </label>
        </div>
      )}
    </section>
  );
}
