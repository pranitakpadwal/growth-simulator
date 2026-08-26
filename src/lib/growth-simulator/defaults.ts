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
  "emi-calculator:use-calculator": { revenuePerCustomerInr: 80, variableCostPerCustomerInr: 10, contributionMarginPct: 55 },

  // Finance industries on the App platform — same verticals, lower-intent
  // stages (install, first open) are worth less than the full web funnel's
  // funded-customer value; in-app-lead-form stops at registration, not
  // disbursal, so it's valued well below the website funnel's endpoint.
  "personal-loans:app-install": { revenuePerCustomerInr: 80, variableCostPerCustomerInr: 8, contributionMarginPct: 55 },
  "personal-loans:app-install-open": { revenuePerCustomerInr: 110, variableCostPerCustomerInr: 10, contributionMarginPct: 55 },
  "personal-loans:app-lead-form": { revenuePerCustomerInr: 800, variableCostPerCustomerInr: 60, contributionMarginPct: 60 },
  "emi-calculator:app-install": { revenuePerCustomerInr: 50, variableCostPerCustomerInr: 6, contributionMarginPct: 50 },
  "emi-calculator:app-install-open": { revenuePerCustomerInr: 70, variableCostPerCustomerInr: 8, contributionMarginPct: 50 },
  "emi-calculator:app-lead-form": { revenuePerCustomerInr: 500, variableCostPerCustomerInr: 40, contributionMarginPct: 58 },
  "epf:app-install": { revenuePerCustomerInr: 60, variableCostPerCustomerInr: 7, contributionMarginPct: 55 },
  "epf:app-install-open": { revenuePerCustomerInr: 85, variableCostPerCustomerInr: 9, contributionMarginPct: 55 },
  "epf:app-lead-form": { revenuePerCustomerInr: 600, variableCostPerCustomerInr: 45, contributionMarginPct: 58 },
  "credit-cards:app-install": { revenuePerCustomerInr: 70, variableCostPerCustomerInr: 7, contributionMarginPct: 58 },
  "credit-cards:app-install-open": { revenuePerCustomerInr: 95, variableCostPerCustomerInr: 9, contributionMarginPct: 58 },
  "credit-cards:app-lead-form": { revenuePerCustomerInr: 900, variableCostPerCustomerInr: 65, contributionMarginPct: 62 },
  "investments:app-install": { revenuePerCustomerInr: 90, variableCostPerCustomerInr: 9, contributionMarginPct: 52 },
  "investments:app-install-open": { revenuePerCustomerInr: 120, variableCostPerCustomerInr: 11, contributionMarginPct: 52 },
  "investments:app-lead-form": { revenuePerCustomerInr: 1200, variableCostPerCustomerInr: 80, contributionMarginPct: 55 },
  "investments:in-app-purchase": { revenuePerCustomerInr: 2500, variableCostPerCustomerInr: 150, contributionMarginPct: 55 },

  "news:app-install": { revenuePerCustomerInr: 40, variableCostPerCustomerInr: 5, contributionMarginPct: 50 },
  "news:app-install-open": { revenuePerCustomerInr: 55, variableCostPerCustomerInr: 6, contributionMarginPct: 50 },
  "news:app-lead-form": { revenuePerCustomerInr: 220, variableCostPerCustomerInr: 15, contributionMarginPct: 55 },
  "news:in-app-purchase": { revenuePerCustomerInr: 500, variableCostPerCustomerInr: 30, contributionMarginPct: 60 },

  "social:app-install": { revenuePerCustomerInr: 25, variableCostPerCustomerInr: 3, contributionMarginPct: 45 },
  "social:app-install-open": { revenuePerCustomerInr: 35, variableCostPerCustomerInr: 4, contributionMarginPct: 45 },
  "social:app-lead-form": { revenuePerCustomerInr: 150, variableCostPerCustomerInr: 10, contributionMarginPct: 50 },
  "social:in-app-purchase": { revenuePerCustomerInr: 250, variableCostPerCustomerInr: 15, contributionMarginPct: 55 },

  "business:app-install": { revenuePerCustomerInr: 60, variableCostPerCustomerInr: 5, contributionMarginPct: 55 },
  "business:app-install-open": { revenuePerCustomerInr: 80, variableCostPerCustomerInr: 7, contributionMarginPct: 55 },
  "business:app-lead-form": { revenuePerCustomerInr: 350, variableCostPerCustomerInr: 20, contributionMarginPct: 60 },
  "business:in-app-purchase": { revenuePerCustomerInr: 2000, variableCostPerCustomerInr: 100, contributionMarginPct: 65 },

  "travel:app-install": { revenuePerCustomerInr: 35, variableCostPerCustomerInr: 4, contributionMarginPct: 50 },
  "travel:app-install-open": { revenuePerCustomerInr: 45, variableCostPerCustomerInr: 5, contributionMarginPct: 50 },
  "travel:app-lead-form": { revenuePerCustomerInr: 300, variableCostPerCustomerInr: 15, contributionMarginPct: 58 },
  "travel:in-app-purchase": { revenuePerCustomerInr: 3500, variableCostPerCustomerInr: 150, contributionMarginPct: 60 },
};

const FALLBACK: EconomicsDefaults = { revenuePerCustomerInr: 1000, variableCostPerCustomerInr: 100, contributionMarginPct: 60 };

export function defaultEconomics(industryId: IndustryId, goalId: GoalId): EconomicsDefaults {
  return ECONOMICS_DEFAULTS[`${industryId}:${goalId}`] ?? FALLBACK;
}
