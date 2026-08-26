import type {
  ConstraintAssessment,
  FunnelForecast,
  FunnelInputs,
  GrowthChannel,
  NextRupeeResult,
  ScenarioMultipliers,
  ScenarioName,
} from "./types";
import { getBenchmark } from "./benchmarks";

/**
 * Deterministic forecast + scenario + allocation engine.
 *
 * PRD §45: "The calculation layer should be deterministic. AI should not
 * perform the core calculations... The AI is the strategist interface.
 * The calculation engine is the source of truth." Nothing here calls an
 * LLM or invents a number — every output is a pure function of the inputs
 * passed in, which is what lets an AI layer safely narrate these results.
 */

// PRD §17 scenario types — conservative/base/upside apply directly to the
// funnel-facing assumptions (PRD §27 "Three Forecast Cases").
export const SCENARIO_MULTIPLIERS: Record<ScenarioName, ScenarioMultipliers> = {
  conservative: { cpc: 1.15, landingCvr: 0.85, approvalRate: 0.9, disbursalRate: 0.9 },
  base: { cpc: 1, landingCvr: 1, approvalRate: 1, disbursalRate: 1 },
  upside: { cpc: 0.92, landingCvr: 1.15, approvalRate: 1.08, disbursalRate: 1.05 },
};

/** PRD §14/§15 — the basic funnel forecast model, search → clicks → ... → contribution. */
export function runFunnelForecast(inputs: FunnelInputs, scenario: ScenarioName): FunnelForecast {
  const mult = SCENARIO_MULTIPLIERS[scenario];

  const cpc = inputs.cpc * mult.cpc;
  const landingCvr = clampPct(inputs.landingCvr * mult.landingCvr);
  const approvalRate = clampPct(inputs.approvalRate * mult.approvalRate);
  const disbursalRate = clampPct(inputs.disbursalRate * mult.disbursalRate);

  // Budget is fixed by the user; CPC (which moves per scenario) determines
  // how many clicks that fixed budget actually buys — this is what makes
  // "what if CPC rises 20%?" bite in the forecast rather than being cosmetic.
  const clicksFromBudget = inputs.budgetInr / Math.max(cpc, 1);
  const clicksFromReach = inputs.addressableImpressions * (inputs.ctr / 100);
  const clicks = Math.min(clicksFromBudget, clicksFromReach);
  const spendInr = clicks * cpc;

  const leads = clicks * (landingCvr / 100);
  const qualifiedLeads = leads * (inputs.qualificationRate / 100);
  const approvedCustomers = qualifiedLeads * (approvalRate / 100);
  const fundedCustomers = approvedCustomers * (disbursalRate / 100);

  const revenueInr = fundedCustomers * inputs.revenuePerCustomerInr;
  const grossContribution = revenueInr * (inputs.contributionMarginPct / 100);
  const contributionInr =
    grossContribution - spendInr - fundedCustomers * inputs.variableCostPerCustomerInr;

  const cacInr = fundedCustomers > 0 ? spendInr / fundedCustomers : 0;

  return {
    scenario,
    clicks,
    spendInr,
    leads,
    qualifiedLeads,
    approvedCustomers,
    fundedCustomers,
    revenueInr,
    contributionInr,
    cacInr,
  };
}

export function runThreeCaseForecast(inputs: FunnelInputs): Record<ScenarioName, FunnelForecast> {
  return {
    conservative: runFunnelForecast(inputs, "conservative"),
    base: runFunnelForecast(inputs, "base"),
    upside: runFunnelForecast(inputs, "upside"),
  };
}

/**
 * PRD §20 Constraint Engine — walk each benchmarked funnel stage and flag
 * whichever one sits furthest below its benchmark median. That stage is
 * the bottleneck the recommendation engine should target before telling
 * anyone to spend more media budget.
 */
export function assessConstraints(inputs: FunnelInputs): {
  constraints: ConstraintAssessment[];
  bottleneck: ConstraintAssessment;
} {
  const checks: Array<{ metricId: string; label: string; companyValue: number }> = [
    { metricId: "cpc", label: "Google Search CPC", companyValue: inputs.cpc },
    { metricId: "landingCvr", label: "Landing Page CVR", companyValue: inputs.landingCvr },
    {
      metricId: "qualificationRate",
      label: "Qualification Rate",
      companyValue: inputs.qualificationRate,
    },
    { metricId: "approvalRate", label: "Approval Rate", companyValue: inputs.approvalRate },
    { metricId: "disbursalRate", label: "Disbursal Rate", companyValue: inputs.disbursalRate },
  ];

  const constraints: ConstraintAssessment[] = checks.map(({ metricId, label, companyValue }) => {
    const benchmark = getBenchmark(metricId);
    // CPC is a cost metric — being "below benchmark" is good, so its gap
    // sign is inverted relative to the conversion-rate metrics.
    const isCostMetric = metricId === "cpc";
    const rawGapPct = ((companyValue - benchmark.median) / benchmark.median) * 100;
    const gapPct = isCostMetric ? -rawGapPct : rawGapPct;
    return {
      metricId,
      label,
      companyValue,
      benchmarkMedian: benchmark.median,
      gapPct,
      isBottleneck: false,
    };
  });

  const worst = constraints.reduce((a, b) => (b.gapPct < a.gapPct ? b : a));
  worst.isBottleneck = true;

  return { constraints, bottleneck: worst };
}

/**
 * PRD §18/§48 "Next Rupee" engine — models diminishing marginal returns
 * per channel and ranks channels by the value the NEXT ₹1 crore would
 * produce, not by historical CAC or cumulative ROAS.
 */
export function computeNextRupee(channels: GrowthChannel[]): NextRupeeResult[] {
  return channels
    .map((channel) => {
      const cumulativeValueAtCurrentAllocation = marginalValueCurve(
        channel,
        0,
        channel.currentAllocationCr
      );
      const nextCroreMarginalValue =
        channel.currentAllocationCr >= channel.maxScaleCr
          ? 0
          : valueAtCrore(channel, channel.currentAllocationCr);
      return { ...channel, nextCroreMarginalValue, cumulativeValueAtCurrentAllocation };
    })
    .sort((a, b) => b.nextCroreMarginalValue - a.nextCroreMarginalValue);
}

/** ₹ return produced by the crore-increment starting at `fromCr`. */
function valueAtCrore(channel: GrowthChannel, fromCr: number): number {
  const decayedReturn =
    channel.baseMarginalReturn * Math.pow(1 - channel.decayPerCrore, Math.floor(fromCr));
  return Math.max(decayedReturn, 0);
}

/** Integrates the marginal-return curve (in whole-crore steps) between two allocation levels. */
function marginalValueCurve(channel: GrowthChannel, fromCr: number, toCr: number): number {
  let total = 0;
  for (let cr = fromCr; cr < toCr; cr += 1) {
    total += valueAtCrore(channel, cr);
  }
  return total;
}

/** PRD §19 Growth Efficiency Index — the single executive roll-up metric. */
export function computeGEI(incrementalContributionInr: number, incrementalInvestmentInr: number): number {
  if (incrementalInvestmentInr <= 0) return 0;
  return incrementalContributionInr / incrementalInvestmentInr;
}

/** PRD §51 sensitivity analysis — recompute the base forecast under a stepped +/- shock to one input. */
export function runSensitivity(
  inputs: FunnelInputs,
  field: "cpc" | "landingCvr" | "budgetInr",
  stepsPct: number[]
): Array<{ shockPct: number; forecast: FunnelForecast }> {
  return stepsPct.map((shockPct) => {
    const shocked: FunnelInputs = { ...inputs, [field]: inputs[field] * (1 + shockPct / 100) };
    return { shockPct, forecast: runFunnelForecast(shocked, "base") };
  });
}

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, v));
}
