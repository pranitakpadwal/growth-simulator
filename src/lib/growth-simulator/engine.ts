import type {
  ChannelForecast,
  ChannelId,
  ConstraintAssessment,
  FunnelStageResult,
  FunnelTemplate,
  ScenarioMultipliers,
  ScenarioName,
} from "./types";
import { getFunnelBenchmark } from "./benchmarks";

/**
 * Deterministic forecast + scenario + constraint + allocation engine.
 *
 * PRD §45: "The calculation layer should be deterministic. AI should not
 * perform the core calculations... The AI is the strategist interface.
 * The calculation engine is the source of truth." Nothing here calls an
 * LLM or invents a number — every output is a pure function of the inputs
 * passed in.
 *
 * v2: one generic funnel walker (`runChannelFunnel`) drives every channel
 * (paid or organic) through whichever `FunnelTemplate` the selected
 * Industry + Goal resolved to — see catalog.ts.
 */

// PRD §17 scenario types — conservative/base/upside apply as one uniform
// shock to CPC and to every downstream funnel-stage rate, regardless of
// which template is active (PRD §27 "Three Forecast Cases").
export const SCENARIO_MULTIPLIERS: Record<ScenarioName, ScenarioMultipliers> = {
  conservative: { cpcMult: 1.15, rateMult: 0.85 },
  base: { cpcMult: 1, rateMult: 1 },
  upside: { cpcMult: 0.92, rateMult: 1.15 },
};

export interface RunChannelFunnelParams {
  channelId: ChannelId;
  /** Clicks (paid) or the organic-channel equivalent entry volume. */
  entryCount: number;
  spendInr: number;
  template: FunnelTemplate;
  /** Current value (%) per stage metric id — the editable assumption feeding each stage. */
  stageAssumptions: Record<string, number>;
  scenario: ScenarioName;
  revenuePerCustomerInr: number;
  variableCostPerCustomerInr: number;
  contributionMarginPct: number;
}

/** PRD §14/§15 generalized — walks any funnel template from an entry count to its value stage. */
export function runChannelFunnel(params: RunChannelFunnelParams): ChannelForecast {
  const { rateMult } = SCENARIO_MULTIPLIERS[params.scenario];

  const stages: FunnelStageResult[] = [];
  let count = params.entryCount;
  for (const stageTemplate of params.template.stages) {
    const rate = clampPct((params.stageAssumptions[stageTemplate.metricId] ?? 0) * rateMult);
    count = count * (rate / 100);
    stages.push({ stageId: stageTemplate.id, label: stageTemplate.label, count, rate });
  }

  const valueStage = stages.find((s) => s.stageId === params.template.valueStageId);
  const valueCount = valueStage?.count ?? 0;

  const cacInr = params.spendInr > 0 && valueCount > 0 ? params.spendInr / valueCount : 0;

  let revenueInr = 0;
  let contributionInr = -params.spendInr;
  if (params.template.hasRevenue) {
    revenueInr = valueCount * params.revenuePerCustomerInr;
    const grossContribution = revenueInr * (params.contributionMarginPct / 100);
    contributionInr = grossContribution - params.spendInr - valueCount * params.variableCostPerCustomerInr;
  }

  return {
    channelId: params.channelId,
    scenario: params.scenario,
    entryCount: params.entryCount,
    spendInr: params.spendInr,
    stages,
    valueCount,
    cacInr,
    revenueInr,
    contributionInr,
  };
}

const SCENARIOS: ScenarioName[] = ["conservative", "base", "upside"];

export interface PaidChannelParams
  extends Omit<RunChannelFunnelParams, "scenario" | "entryCount"> {
  /** Base CPC before any scenario shock — clicks are re-derived per scenario from spend/CPC. */
  baseCpc: number;
}

/**
 * Three-case forecast for a PAID channel. Unlike organic channels, a paid
 * channel's entry count (clicks) isn't fixed across scenarios — it's
 * spend ÷ CPC, and CPC itself moves with the scenario (PRD §16 "what if
 * CPC rises 20%?"), so entry count has to be re-derived per scenario
 * rather than shocked directly.
 */
export function runThreePaidScenarios(params: PaidChannelParams): Record<ScenarioName, ChannelForecast> {
  const result = {} as Record<ScenarioName, ChannelForecast>;
  for (const scenario of SCENARIOS) {
    const cpc = params.baseCpc * SCENARIO_MULTIPLIERS[scenario].cpcMult;
    const entryCount = cpc > 0 ? params.spendInr / cpc : 0;
    result[scenario] = runChannelFunnel({ ...params, entryCount, scenario });
  }
  return result;
}

/**
 * Three-case forecast for an ORGANIC channel (SEO/ASO) — entry volume is a
 * user estimate held constant across scenarios (no CPC to shock); only the
 * downstream funnel rates move.
 */
export function runThreeOrganicScenarios(
  params: Omit<RunChannelFunnelParams, "scenario">
): Record<ScenarioName, ChannelForecast> {
  const result = {} as Record<ScenarioName, ChannelForecast>;
  for (const scenario of SCENARIOS) {
    result[scenario] = runChannelFunnel({ ...params, scenario });
  }
  return result;
}

/**
 * PRD §51-style back-solve: given a target CAC and the current downstream
 * funnel rates, what's the most this channel can afford to pay per click
 * and still land at (or under) that CAC?
 *
 * CAC = spend / valueCount = (entry × cpc) / (entry × cumulativeRate)
 *     = cpc / cumulativeRate
 * ⇒ maxCpc = targetCac × cumulativeRate
 *
 * `cumulativeRate` only multiplies stages up to and including the value
 * stage — stages after it (e.g. app-open, in-app-action, which sit past
 * "registration" in the app-install template) don't affect acquisition cost.
 */
export function maxSustainableCpc(
  template: FunnelTemplate,
  stageAssumptions: Record<string, number>,
  targetCacInr: number
): number {
  let cumulativeRate = 1;
  for (const stage of template.stages) {
    cumulativeRate *= (stageAssumptions[stage.metricId] ?? 0) / 100;
    if (stage.id === template.valueStageId) break;
  }
  return targetCacInr * cumulativeRate;
}

export interface CostLadderRung {
  stageId: string;
  label: string;
  rate: number; // % conversion INTO this stage from the previous one
  cumulativeCostInr: number; // cost to acquire one unit of this stage, all upstream drop-off included
  isValueStage: boolean;
}

/**
 * The "CPC is not CPI" cascade — cost compounds at every drop-off, so the
 * number you're bidding (CPC) and the number that actually matters (cost
 * per funded customer / registered user / whatever the value stage is)
 * can be many multiples apart. Walks the full template, not just up to the
 * value stage, so downstream activation cost is visible too.
 */
export function costLadder(
  baseCpc: number,
  template: FunnelTemplate,
  stageAssumptions: Record<string, number>
): CostLadderRung[] {
  let cumulativeRate = 1;
  return template.stages.map((stage) => {
    const rate = (stageAssumptions[stage.metricId] ?? 0) / 100;
    cumulativeRate *= rate;
    return {
      stageId: stage.id,
      label: stage.label,
      rate: rate * 100,
      cumulativeCostInr: cumulativeRate > 0 ? baseCpc / cumulativeRate : 0,
      isValueStage: stage.id === template.valueStageId,
    };
  });
}

export interface PaidChannelWeight {
  channelId: ChannelId;
  cpc: number;
  /** Share of the paid budget this channel gets — shares are normalized, needn't sum to exactly 100. */
  sharePct: number;
}

/**
 * Goal-first planning ("I need 5,000 leads — what should I spend?"), the
 * mirror image of the usual budget → outcome direction. Because the funnel
 * model is linear (no diminishing-returns curve on paid channels — see
 * README), blended CAC is invariant to the budget's absolute size: probing
 * at one nominal budget and reading off spend/conversions gives the same
 * ratio a real budget of any size would. `blendedCacInr` is exposed
 * alongside the answer so the UI can show its work.
 */
export function computeRequiredPaidBudget(params: {
  targetConversions: number;
  template: FunnelTemplate;
  stageAssumptions: Record<string, number>;
  channelWeights: PaidChannelWeight[];
}): { requiredBudgetInr: number; blendedCacInr: number } {
  const NOMINAL_PROBE_BUDGET_INR = 1_00_00_000; // ₹1 Cr — arbitrary; see doc comment above
  const shareSum = params.channelWeights.reduce((sum, w) => sum + w.sharePct, 0) || 1;

  let spend = 0;
  let conversions = 0;
  for (const weight of params.channelWeights) {
    const channelSpend = NOMINAL_PROBE_BUDGET_INR * (weight.sharePct / shareSum);
    let count = weight.cpc > 0 ? channelSpend / weight.cpc : 0;
    for (const stage of params.template.stages) {
      count *= (params.stageAssumptions[stage.metricId] ?? 0) / 100;
      if (stage.id === params.template.valueStageId) break;
    }
    spend += channelSpend;
    conversions += count;
  }

  const blendedCacInr = conversions > 0 ? spend / conversions : 0;
  const requiredBudgetInr = blendedCacInr > 0 ? params.targetConversions * blendedCacInr : 0;
  return { requiredBudgetInr, blendedCacInr };
}

/**
 * PRD §20 Constraint Engine — walk each benchmarked funnel stage and flag
 * whichever one sits furthest below its benchmark median. That stage is
 * the bottleneck the recommendation engine should target before telling
 * anyone to spend more media budget.
 */
export function assessConstraints(
  template: FunnelTemplate,
  stageAssumptions: Record<string, number>
): { constraints: ConstraintAssessment[]; bottleneck: ConstraintAssessment } {
  const constraints: ConstraintAssessment[] = template.stages.map((stage) => {
    const benchmark = getFunnelBenchmark(stage.metricId);
    const companyValue = stageAssumptions[stage.metricId] ?? 0;
    const gapPct = ((companyValue - benchmark.median) / benchmark.median) * 100;
    return {
      metricId: stage.metricId,
      label: stage.label,
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

export interface ChannelEfficiency {
  channelId: ChannelId;
  isOrganic: boolean;
  spendInr: number;
  contributionInr: number;
  valueCount: number;
  cacInr: number;
  /** Contribution ₹ per ₹ spent — null for organic channels (no spend to divide by). */
  efficiency: number | null;
}

/**
 * PRD §18 "Next Rupee" idea, computed from REAL current inputs rather than
 * an illustrative decay curve: ranks channels by contribution produced per
 * rupee actually spent this period. A channel with zero spend this period
 * (organic with no content/ASO investment entered) has no ratio to rank by
 * and sorts by absolute contribution instead — still worth investing in,
 * just not comparable on a ₹-in/₹-out basis until an investment is entered.
 */
export function rankChannelEfficiency(
  forecasts: Array<{ channelId: ChannelId; isOrganic: boolean; forecast: ChannelForecast }>
): ChannelEfficiency[] {
  const rows: ChannelEfficiency[] = forecasts.map(({ channelId, isOrganic, forecast }) => ({
    channelId,
    isOrganic,
    spendInr: forecast.spendInr,
    contributionInr: forecast.contributionInr,
    valueCount: forecast.valueCount,
    cacInr: forecast.cacInr,
    efficiency: forecast.spendInr > 0 ? forecast.contributionInr / forecast.spendInr : null,
  }));

  // Channels with a spend/contribution ratio sort by that ratio first (highest
  // return per rupee wins); channels with no spend this period (organic with
  // no content/ASO investment entered) sort among themselves by absolute
  // contribution, and always trail the ratio-comparable channels.
  return rows.sort((a, b) => {
    if (a.efficiency !== null && b.efficiency !== null) return b.efficiency - a.efficiency;
    if (a.efficiency === null && b.efficiency === null) return b.contributionInr - a.contributionInr;
    return a.efficiency === null ? 1 : -1;
  });
}

function clampPct(v: number): number {
  return Math.max(0, Math.min(100, v));
}
