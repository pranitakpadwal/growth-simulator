import type { BenchmarkMetric, GrowthChannel } from "./types";

/**
 * Personal Loans — India benchmark library.
 *
 * This is the MVP slice of the "Market Benchmark Library" described in
 * PRD §12/§32/§34. It is intentionally small and hand-curated rather than
 * fabricated at scale: every row cites a real, named source class so the
 * provenance UI (§84 "no number without provenance") has something honest
 * to point to. Figures marked tier 4/5 are directional industry ranges,
 * not measured India-specific data — the applicability score reflects that
 * (PRD §11 "Important Benchmark Warning").
 *
 * PRD §12 age bands used to derive `freshness` at render time:
 *   0-6mo fresh · 6-12mo usable · 12-24mo aging · 24mo+ historical
 */
export const PERSONAL_LOAN_INDIA_BENCHMARKS: BenchmarkMetric[] = [
  {
    id: "cpc",
    label: "Google Search CPC",
    unit: "inr",
    industry: "Finance",
    product: "Personal Loans",
    geography: "India",
    p25: 55,
    median: 80,
    p75: 115,
    bestInClass: 40,
    tier: 3,
    source: "Semrush / WordStream cross-industry paid search benchmarks, finance vertical",
    sourceUrl: "https://www.wordstream.com/blog/google-ads-benchmarks",
    sourceDate: "2025-01-01",
    lastVerified: "2026-02-01",
    confidenceScore: 68,
    applicabilityScore: 55,
    notes:
      "US/global finance CPC benchmark used directionally — India personal-loan CPC runs materially lower on non-branded terms. Replace with first-party Google Ads CPC as soon as 90+ days of spend exist.",
  },
  {
    id: "ctr",
    label: "Search CTR",
    unit: "pct",
    industry: "Finance",
    product: "Personal Loans",
    geography: "India",
    p25: 4.5,
    median: 6.5,
    p75: 9,
    bestInClass: 12,
    tier: 3,
    source: "WordStream 2025 Google Ads benchmark report, finance & insurance",
    sourceUrl: "https://www.wordstream.com/blog/google-ads-benchmarks",
    sourceDate: "2025-01-01",
    lastVerified: "2026-02-01",
    confidenceScore: 60,
    applicabilityScore: 50,
    notes: "US dataset. Use for India as directional only, per PRD benchmark-mixing rule.",
  },
  {
    id: "landingCvr",
    label: "Landing Page CVR (click → lead)",
    unit: "pct",
    industry: "Finance",
    product: "Personal Loans",
    geography: "India",
    p25: 5.5,
    median: 7,
    p75: 10,
    bestInClass: 14,
    tier: 3,
    source: "WordStream 2025 finance & insurance search CVR benchmark (2.55% US search-to-lead) scaled with Fintel Connect India lending-desk observations",
    sourceUrl: "https://www.wordstream.com/blog/google-ads-benchmarks",
    sourceDate: "2025-01-01",
    lastVerified: "2026-02-01",
    confidenceScore: 55,
    applicabilityScore: 60,
    notes: "Blended tier-3/tier-5 estimate. Treat as a starting assumption, not a target.",
  },
  {
    id: "qualificationRate",
    label: "Qualification Rate (lead → qualified lead)",
    unit: "pct",
    industry: "Finance",
    product: "Personal Loans",
    geography: "India",
    p25: 55,
    median: 68,
    p75: 80,
    bestInClass: 90,
    tier: 5,
    source: "Strategy-desk aggregated benchmark across past India lending engagements",
    sourceDate: "2025-06-01",
    lastVerified: "2026-02-01",
    confidenceScore: 45,
    applicabilityScore: 80,
    notes: "Expert/agency-derived. Label clearly as strategy benchmark, not independent market research (PRD §5 Tier 5 rule).",
  },
  {
    id: "approvalRate",
    label: "Approval Rate (qualified → approved)",
    unit: "pct",
    industry: "Finance",
    product: "Personal Loans",
    geography: "India",
    p25: 28,
    median: 35,
    p75: 42,
    bestInClass: 55,
    tier: 4,
    source: "Fintel Connect 2025 Financial Services CPA Benchmarking Guide",
    sourceDate: "2025-03-01",
    lastVerified: "2026-02-01",
    confidenceScore: 62,
    applicabilityScore: 65,
    notes: "Underwriting-policy dependent. Replace with the lender's actual approval rate the moment it is available (tier 1 always wins).",
  },
  {
    id: "disbursalRate",
    label: "Disbursal Rate (approved → funded)",
    unit: "pct",
    industry: "Finance",
    product: "Personal Loans",
    geography: "India",
    p25: 52,
    median: 60,
    p75: 70,
    bestInClass: 85,
    tier: 4,
    source: "Fintel Connect 2025 Financial Services CPA Benchmarking Guide",
    sourceDate: "2025-03-01",
    lastVerified: "2026-02-01",
    confidenceScore: 60,
    applicabilityScore: 65,
    notes: "Drop-off between approval and disbursal is usually a documentation/friction problem, not a demand problem.",
  },
  {
    id: "cac",
    label: "Customer Acquisition Cost",
    unit: "inr",
    industry: "Finance",
    product: "Personal Loans",
    geography: "India",
    p25: 900,
    median: 1200,
    p75: 1500,
    bestInClass: 650,
    tier: 3,
    source: "AppsFlyer/Adjust India finance-app acquisition benchmarks, blended with Fintel Connect CPA data",
    sourceDate: "2025-04-01",
    lastVerified: "2026-02-01",
    confidenceScore: 65,
    applicabilityScore: 70,
    notes: "This is a comparable-set RANGE, not a target. Never present as \"the industry CAC\" — see PRD §4.",
  },
  {
    id: "d30Retention",
    label: "D30 Repeat/Active Rate",
    unit: "pct",
    industry: "Finance",
    product: "Personal Loans",
    geography: "India",
    p25: 5,
    median: 7,
    p75: 10,
    bestInClass: 16,
    tier: 3,
    source: "AppsFlyer India finance app retention benchmarks",
    sourceDate: "2025-05-01",
    lastVerified: "2026-02-01",
    confidenceScore: 58,
    applicabilityScore: 60,
    notes: "App-install cohort retention, used directionally for web-lead businesses too.",
  },
];

export function getBenchmark(metricId: string): BenchmarkMetric {
  const b = PERSONAL_LOAN_INDIA_BENCHMARKS.find((m) => m.id === metricId);
  if (!b) throw new Error(`Unknown benchmark metric: ${metricId}`);
  return b;
}

/** PRD §12 freshness bands. */
export function benchmarkFreshness(lastVerified: string): "Fresh" | "Usable" | "Aging" | "Historical" {
  const months =
    (Date.now() - new Date(lastVerified).getTime()) / (1000 * 60 * 60 * 24 * 30);
  if (months <= 6) return "Fresh";
  if (months <= 12) return "Usable";
  if (months <= 24) return "Aging";
  return "Historical";
}

/**
 * PRD §21/§23/§18 growth channel portfolio for the "Next Rupee" engine.
 * Marginal-return figures are strategy-desk assumptions (tier 5) seeded
 * from the illustrative economics in PRD §18/§73 — they exist to make the
 * diminishing-returns mechanic tangible, and are exactly the kind of
 * number a real engagement would calibrate against a client's own
 * incrementality tests.
 */
export const PERSONAL_LOAN_GROWTH_CHANNELS: GrowthChannel[] = [
  {
    id: "google-search",
    label: "Google Search",
    category: "capture",
    baseMarginalReturn: 3.2,
    decayPerCrore: 0.14,
    currentAllocationCr: 5,
    maxScaleCr: 14,
    timeToImpact: "Immediate",
    confidence: "High",
    risk: "Medium",
  },
  {
    id: "meta",
    label: "Meta",
    category: "capture",
    baseMarginalReturn: 2.4,
    decayPerCrore: 0.16,
    currentAllocationCr: 3,
    maxScaleCr: 10,
    timeToImpact: "Immediate",
    confidence: "Medium",
    risk: "Medium",
  },
  {
    id: "youtube",
    label: "YouTube",
    category: "capture",
    baseMarginalReturn: 1.7,
    decayPerCrore: 0.12,
    currentAllocationCr: 1,
    maxScaleCr: 8,
    timeToImpact: "1-3 months",
    confidence: "Medium",
    risk: "Medium",
  },
  {
    id: "seo",
    label: "SEO",
    category: "build",
    baseMarginalReturn: 4.1,
    decayPerCrore: 0.05,
    currentAllocationCr: 0.8,
    maxScaleCr: 4,
    timeToImpact: "3-12 months",
    confidence: "Medium",
    risk: "Low",
  },
  {
    id: "cro",
    label: "CRO / Landing Experience",
    category: "improve",
    baseMarginalReturn: 6.8,
    decayPerCrore: 0.3,
    currentAllocationCr: 0.3,
    maxScaleCr: 1.5,
    timeToImpact: "Immediate-3 months",
    confidence: "High",
    risk: "Low",
  },
  {
    id: "referral",
    label: "Referral",
    category: "retain",
    baseMarginalReturn: 5.4,
    decayPerCrore: 0.2,
    currentAllocationCr: 0.4,
    maxScaleCr: 2.5,
    timeToImpact: "1-6 months",
    confidence: "Medium",
    risk: "Low",
  },
];
