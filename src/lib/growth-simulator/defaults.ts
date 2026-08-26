import type { FunnelTemplate, IndustryId } from "./types";
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
 * Starting economics per industry — these are assumptions, not benchmarks
 * (no cross-company revenue-per-customer dataset backs them), and are
 * exactly the kind of number a real engagement replaces with the client's
 * own P&L on day one.
 */
const ECONOMICS_DEFAULTS: Record<IndustryId, EconomicsDefaults> = {
  "personal-loans": { revenuePerCustomerInr: 6000, variableCostPerCustomerInr: 400, contributionMarginPct: 70 },
  "emi-calculator": { revenuePerCustomerInr: 5500, variableCostPerCustomerInr: 400, contributionMarginPct: 68 },
  investments: { revenuePerCustomerInr: 3200, variableCostPerCustomerInr: 250, contributionMarginPct: 60 },
  "news-app": { revenuePerCustomerInr: 220, variableCostPerCustomerInr: 15, contributionMarginPct: 55 },
};

export function defaultEconomics(industryId: IndustryId): EconomicsDefaults {
  return ECONOMICS_DEFAULTS[industryId];
}
