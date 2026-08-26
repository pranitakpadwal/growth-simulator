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
 *
 * v2: the funnel is no longer hardcoded to personal loans. A `FunnelTemplate`
 * (a generic ordered list of conversion stages) is selected from the user's
 * Industry + Goal, and every channel — paid or organic — feeds the same
 * template starting from an entry count. That's what lets one engine cover
 * "personal loan lead gen" and "news app installs" alike.
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
  /** 0-100, per PRD §9 — how applicable this benchmark is to an India business in this vertical. */
  applicabilityScore: number;
  notes: string;
}

// ---------------------------------------------------------------------------
// Industry / Goal / Funnel-template catalog — the "clever defaults" layer.
// ---------------------------------------------------------------------------

export type IndustryId =
  | "personal-loans"
  | "emi-calculator"
  | "epf"
  | "credit-cards"
  | "investments"
  | "news"
  | "social"
  | "business"
  | "travel";

/**
 * Content-vertical proxy for channel CPC/CTR selection (finance keywords
 * price differently to general-consumer ones) — an internal key only,
 * never rendered. Orthogonal to `Platform`: an industry's vertical doesn't
 * change when you switch it from Website to App.
 */
export type IndustryGroup = "finance" | "app";

/**
 * Website vs. App — a business decision independent of industry. A
 * personal loan company can run its funnel through its website, its app,
 * or both; "News App" baking the platform into the industry name was the
 * bug this type fixes.
 */
export type Platform = "website" | "app";

export type GoalId =
  | "website-lead-form"
  | "app-install"
  | "app-install-open"
  | "app-lead-form"
  | "in-app-purchase"
  | "use-calculator"
  | "website-registration"
  | "website-click";

export interface GoalDefinition {
  id: GoalId;
  label: string;
  description: string;
  funnelTemplateId: string;
}

export interface IndustryDefinition {
  id: IndustryId;
  label: string;
  group: IndustryGroup;
  /** Which platform we pre-select — still fully switchable in the UI. */
  defaultPlatform: Platform;
  /** Goals offered when Platform = Website. */
  websiteGoalIds: GoalId[];
  /** Goals offered when Platform = App. */
  appGoalIds: GoalId[];
}

/** One stage in a funnel template — converts FROM the previous stage's count. */
export interface FunnelStageTemplate {
  id: string;
  label: string;
  /** Benchmark metric id supplying this stage's conversion rate. */
  metricId: string;
}

export interface FunnelTemplate {
  id: string;
  label: string;
  /** Ordered stages applied to the entry count (clicks, or an organic-channel equivalent). */
  stages: FunnelStageTemplate[];
  /** Which stage's count represents a "conversion" for CAC / revenue purposes. */
  valueStageId: string;
  /** Whether this goal has a revenue/contribution model at all (website-click does not). */
  hasRevenue: boolean;
  valueLabel: string; // e.g. "Funded customers", "Registered users", "Engaged visits"
}

// ---------------------------------------------------------------------------
// Channels
// ---------------------------------------------------------------------------

export type ChannelId = "google-search" | "google-display" | "youtube" | "meta" | "seo" | "aso";
export type ChannelTabId = "google" | "meta" | "seo" | "aso";

export interface ChannelMeta {
  id: ChannelId;
  label: string;
  tab: ChannelTabId;
  isOrganic: boolean;
  /** ASO only applies when the goal is App Install. */
  appOnly?: boolean;
}

/** Paid-channel CPC/CTR benchmark, varies by industry group. */
export interface ChannelBenchmark {
  channelId: ChannelId;
  cpc: number; // ₹ per click
  cpcP25: number;
  cpcP75: number;
  ctr: number; // % impression -> click
  ctrP25: number;
  ctrP75: number;
  source: string;
  tier: BenchmarkTier;
  confidenceScore: number;
}

export type ScenarioName = "conservative" | "base" | "upside";

/** Uniform per-scenario shock, applied to every channel's CPC and every funnel stage rate. */
export interface ScenarioMultipliers {
  cpcMult: number;
  rateMult: number;
}

export type BudgetCadence = "monthly" | "daily";

/** A per-stage assumption value plus where it came from — keyed by stage/metric id. */
export interface StageAssumption {
  metricId: string;
  value: number; // %
  valueClass: ValueClass;
}

export interface ChannelInputs {
  channelId: ChannelId;
  /** Paid channels: ₹/month allocated. Organic channels: 0 (spend-free). */
  monthlySpendInr: number;
  /** Paid channels: CPC. Organic channels: unused (entry count given directly). */
  cpc: number;
  cpcValueClass: ValueClass;
  /** Organic-only: user's estimate of monthly entry volume (clicks / store visits). */
  organicEntryVolume?: number;
}

export interface FunnelStageResult {
  stageId: string;
  label: string;
  count: number;
  rate: number; // % applied to reach this stage from the previous one
}

export interface ChannelForecast {
  channelId: ChannelId;
  scenario: ScenarioName;
  entryCount: number; // clicks, or organic-equivalent entries
  spendInr: number;
  stages: FunnelStageResult[];
  valueCount: number; // count at the template's valueStageId
  cacInr: number; // spend / valueCount (organic channels: 0 spend -> 0 CAC)
  revenueInr: number;
  contributionInr: number;
}

export interface ConstraintAssessment {
  metricId: string;
  label: string;
  companyValue: number;
  benchmarkMedian: number;
  gapPct: number; // negative = below benchmark (worse), positive = above
  isBottleneck: boolean;
}
