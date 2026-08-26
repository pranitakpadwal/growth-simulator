import type { FunnelTemplate, GoalId, IndustryId } from "./types";
import { getFunnelBenchmark } from "./benchmarks";

/** Every stage in the template defaults to its benchmark median until overridden. */
export function defaultStageAssumptions(template: FunnelTemplate): Record<string, number> {
  const assumptions: Record<string, number> = {};
  for (const stage of template.stages) {
    assumptions[stage.metricId] = getFunnelBenchmark(stage.metricId).median;
  }
  return assumptions;
}

export interface EconomicsDefaults {
  revenuePerCustomerInr: number;
  variableCostPerCustomerInr: number;
  contributionMarginPct: number;
}

/**
 * Starting economics per industry + goal — these are assumptions, not
 * benchmarks (no cross-company revenue dataset backs them), and are
 * exactly the kind of number a real engagement replaces with the
 * client's own P&L on day one.
 *
 * Keyed by goal because the "unit" being valued changes with the goal:
 * an install is worth far less than a completed lead form, even for the
 * same app — so the same industry needs a different default per goal.
 */
const ECONOMICS_DEFAULTS: Partial<Record<`${IndustryId}:${GoalId}`, EconomicsDefaults>> = {
  "personal-loans:website-lead-form": { revenuePerCustomerInr: 6000, variableCostPerCustomerInr: 400, contributionMarginPct: 70 },
  "emi-calculator:website-lead-form": { revenuePerCustomerInr: 5500, variableCostPerCustomerInr: 400, contributionMarginPct: 68 },
  "epf:website-lead-form": { revenuePerCustomerInr: 2500, variableCostPerCustomerInr: 300, contributionMarginPct: 65 },
  "credit-cards:website-lead-form": { revenuePerCustomerInr: 4500, variableCostPerCustomerInr: 350, contributionMarginPct: 72 },
  "investments:website-lead-form": { revenuePerCustomerInr: 3200, variableCostPerCustomerInr: 250, contributionMarginPct: 60 },
  "investments:website-registration": { revenuePerCustomerInr: 2000, variableCostPerCustomerInr: 150, contributionMarginPct: 55 },

  "news-app:app-install": { revenuePerCustomerInr: 40, variableCostPerCustomerInr: 5, contributionMarginPct: 50 },
  "news-app:app-lead-form": { revenuePerCustomerInr: 220, variableCostPerCustomerInr: 15, contributionMarginPct: 55 },
  "social-app:app-install": { revenuePerCustomerInr: 25, variableCostPerCustomerInr: 3, contributionMarginPct: 45 },
  "social-app:app-lead-form": { revenuePerCustomerInr: 150, variableCostPerCustomerInr: 10, contributionMarginPct: 50 },
  "business-app:app-install": { revenuePerCustomerInr: 60, variableCostPerCustomerInr: 5, contributionMarginPct: 55 },
  "business-app:app-lead-form": { revenuePerCustomerInr: 350, variableCostPerCustomerInr: 20, contributionMarginPct: 60 },
  "travel-app:app-install": { revenuePerCustomerInr: 35, variableCostPerCustomerInr: 4, contributionMarginPct: 50 },
  "travel-app:app-lead-form": { revenuePerCustomerInr: 300, variableCostPerCustomerInr: 15, contributionMarginPct: 58 },
};

const FALLBACK: EconomicsDefaults = { revenuePerCustomerInr: 1000, variableCostPerCustomerInr: 100, contributionMarginPct: 60 };

export function defaultEconomics(industryId: IndustryId, goalId: GoalId): EconomicsDefaults {
  return ECONOMICS_DEFAULTS[`${industryId}:${goalId}`] ?? FALLBACK;
}
