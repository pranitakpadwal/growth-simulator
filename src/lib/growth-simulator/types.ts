/**
 * Growth Strategy Simulator — shared types.
 *
 * Every number the simulator shows must be traceable to one of these four
 * classes (PRD §38 "AI Guardrails" / §84 "No number without provenance"):
 *
 *   - actual      company first-party data
 *   - benchmark   external market data (tiered by source quality, PRD §5)
 *   - assumption  a model input with no first-party backing, benchmark-derived
 *   - forecast    a calculated output of the deterministic engine
 *
 * Nothing in this module is an LLM call — this is the deterministic
 * "source of truth" layer the PRD (§45/§72) insists sit under any AI
 * explanation surface.
 */

/** PRD §5 — five-level benchmark hierarchy, highest priority first. */
export type BenchmarkTier =
  | 1 // Company first-party data
  | 2 // Platform data (Google/Meta/GA4/AppsFlyer raw exports)
  | 3 // Large third-party benchmark datasets (Semrush, WordStream, AppsFlyer/Adjust reports)
  | 4 // Industry research (association reports, research firms)
  | 5; // Expert / strategy-desk benchmark (agency & consulting derived)

export type Geography = "India" | "US" | "APAC" | "Global";

export type ValueClass = "actual" | "benchmark" | "assumption" | "forecast" | "target";

/**
 * A single benchmarked metric with full provenance (PRD §6 benchmark
 * metadata, §8 confidence score, §9 applicability score).
 */
export interface BenchmarkMetric {
  id: string;
  label: string;
  unit: "inr" | "pct" | "ratio" | "days";
  industry: string;
  product: string;
  geography: Geography;
  /** 25th percentile, median, 75th percentile, best observed. */
  p25: number;
  median: number;
  p75: number;
  bestInClass: number;
  tier: BenchmarkTier;
  source: string;
  sourceUrl?: string;
  sourceDate: string; // ISO date the underlying data was collected/published
  lastVerified: string; // ISO date we last checked this figure still holds
  /** 0-100, per PRD §8 scoring model (source quality/sample/recency/geo/category/funnel match). */
  confidenceScore: number;
  /** 0-100, per PRD §9 — how applicable this benchmark is to an India personal-loan business specifically. */
  applicabilityScore: number;
  notes: string;
}

/** A funnel-stage assumption the engine consumes — always paired with its benchmark. */
export interface FunnelAssumption {
  metricId: string;
  /** The value actually used in calculations. Starts equal to the benchmark median. */
  value: number;
  /** Where `value` currently came from. Flips to "actual" the moment a user overrides it. */
  valueClass: ValueClass;
}

export type ScenarioName = "conservative" | "base" | "upside";

export interface ScenarioMultipliers {
  cpc: number; // multiplies CPC
  landingCvr: number; // multiplies landing-page CVR
  approvalRate: number; // multiplies approval rate
  disbursalRate: number; // multiplies disbursal rate
}

export interface FunnelInputs {
  budgetInr: number;
  cpc: number;
  ctr: number; // impression -> click
  addressableImpressions: number; // reach available at this budget/market
  landingCvr: number; // click -> lead
  qualificationRate: number; // lead -> qualified lead
  approvalRate: number; // qualified -> approved
  disbursalRate: number; // approved -> funded/disbursed
  revenuePerCustomerInr: number;
  variableCostPerCustomerInr: number;
  contributionMarginPct: number; // applied to revenue before variable cost/media
}

export interface FunnelForecast {
  scenario: ScenarioName;
  clicks: number;
  spendInr: number;
  leads: number;
  qualifiedLeads: number;
  approvedCustomers: number;
  fundedCustomers: number;
  revenueInr: number;
  contributionInr: number;
  cacInr: number;
}

export interface GrowthChannel {
  id: string;
  label: string;
  category: "capture" | "build" | "improve" | "retain" | "defend";
  /** ₹ of incremental contribution per ₹1 invested, for the FIRST ₹1 crore. */
  baseMarginalReturn: number;
  /** Fraction the marginal return decays by for every additional ₹1 crore invested (diminishing returns, PRD §48). */
  decayPerCrore: number;
  /** Crores already allocated in the current plan. */
  currentAllocationCr: number;
  /** Crores beyond which the channel can't realistically absorb more spend. */
  maxScaleCr: number;
  timeToImpact: string;
  confidence: "Low" | "Medium" | "High";
  risk: "Low" | "Medium" | "High";
}

export interface NextRupeeResult extends GrowthChannel {
  nextCroreMarginalValue: number;
  cumulativeValueAtCurrentAllocation: number;
}

export interface ConstraintAssessment {
  metricId: string;
  label: string;
  companyValue: number;
  benchmarkMedian: number;
  gapPct: number; // negative = below benchmark (worse), positive = above
  isBottleneck: boolean;
}
