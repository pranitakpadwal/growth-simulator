import type { IndustryId } from "./types";

/**
 * Who you're actually targeting, per industry — the piece a CMO decides
 * before ever opening Google Ads: age band, income band, employment type,
 * and metro vs. tier-2/3 city split. This is descriptive context, not a
 * modelled input the engine consumes (yet) — it's here so the plan reads
 * as "who + what it costs to reach them", not just a funnel of percentages.
 *
 * Tier 5 (strategy-desk) throughout: household income bands and city-tier
 * splits for India digital audiences aren't published at this granularity
 * by any single free source, so these are engagement-pattern composites,
 * not a citable dataset. Label accordingly in the UI.
 */
export interface AudiencePersona {
  ageRange: string;
  incomeBand: string;
  employment: string;
  geographySplit: string;
  reachEstimate: string;
  notes: string;
}

export const AUDIENCE_PERSONAS: Record<IndustryId, AudiencePersona> = {
  "personal-loans": {
    ageRange: "25–42",
    incomeBand: "₹4L–₹15L annual income",
    employment: "Salaried (private sector) and self-employed/MSME owners",
    geographySplit: "~60% Tier 1 metros, ~40% Tier 2/3 (rising share)",
    reachEstimate: "~45–60M digitally active adults search for personal loan products annually in India",
    notes: "Salaried audiences convert faster (payslip-based underwriting); self-employed has higher AOV but longer approval cycles.",
  },
  "emi-calculator": {
    ageRange: "24–45",
    incomeBand: "₹3L–₹20L annual income",
    employment: "Salaried and self-employed — calculator usage skews slightly more salaried (EMI planning before a scheduled purchase)",
    geographySplit: "~55% Tier 1, ~45% Tier 2/3",
    reachEstimate: "Calculator/EMI-intent search volume in India runs into the low tens of millions of monthly searches across loan, EMI and prepayment queries",
    notes: "This audience is typically earlier in the funnel than direct loan-product search — treat as a top-of-funnel/tool audience, not a lead-ready one.",
  },
  investments: {
    ageRange: "27–45",
    incomeBand: "₹8L–₹35L annual income",
    employment: "Salaried professionals (white-collar) and business owners with investable surplus",
    geographySplit: "~70% Tier 1 metros, ~30% Tier 2/3",
    reachEstimate: "India's demat-account-holder base has grown past 15 crore, concentrated in this income band",
    notes: "Higher trust threshold than lending — expect longer consideration windows and more repeat-visit behaviour before conversion.",
  },
  "news-app": {
    ageRange: "18–40",
    incomeBand: "Broad — free/ad-supported product, not income-gated",
    employment: "Students, early-career professionals, general smartphone population",
    geographySplit: "~40% Tier 1, ~60% Tier 2/3 (regional-language news drives non-metro growth)",
    reachEstimate: "India has 750M+ smartphone internet users; regional-language news readership is the fastest-growing segment",
    notes: "Language and regional edition targeting typically matters more than income targeting for this category.",
  },
  epf: {
    ageRange: "28–50",
    incomeBand: "₹3L–₹12L annual income",
    employment: "Salaried, formal-sector (EPF membership requires a registered employer)",
    geographySplit: "~50% Tier 1, ~50% Tier 2/3 — industrial/manufacturing towns skew this wider than pure metro finance products",
    reachEstimate: "India's EPFO subscriber base runs into the tens of crores; withdrawal/transfer search demand spikes around job transitions and year-end",
    notes: "High-intent, transactional search category — users are usually already mid-process (job change, retirement) rather than browsing.",
  },
  "credit-cards": {
    ageRange: "23–40",
    incomeBand: "₹5L–₹25L annual income",
    employment: "Salaried (private sector) skews heavily — most issuers gate eligibility on payslips",
    geographySplit: "~65% Tier 1 metros, ~35% Tier 2/3",
    reachEstimate: "India's credit card base has crossed 10 crore cards, growing fastest among first-time, digitally-native applicants",
    notes: "Comparison-shopping behaviour is high — expect multi-session research before an application starts.",
  },
  "social-app": {
    ageRange: "16–30",
    incomeBand: "Broad — free product, not income-gated",
    employment: "Students and early-career, mobile-first",
    geographySplit: "~35% Tier 1, ~65% Tier 2/3 — social/dating apps often over-index outside metros relative to other app categories",
    reachEstimate: "India's under-30 smartphone population runs into several hundred million; category engagement is driven by network effects, not raw reach",
    notes: "Retention and viral/referral loops typically matter more here than raw acquisition CAC — factor that into channel mix, not just cost.",
  },
  "business-app": {
    ageRange: "25–45",
    incomeBand: "₹6L–₹30L annual income (individual) or SMB decision-maker",
    employment: "Business owners, founders, and functional professionals (finance, ops, sales) evaluating a work tool",
    geographySplit: "~70% Tier 1, ~30% Tier 2/3",
    reachEstimate: "India has an estimated 60M+ MSMEs and a fast-growing SaaS-buyer base among them",
    notes: "B2B intent — expect a longer, multi-stakeholder consideration cycle than consumer categories above.",
  },
  "travel-app": {
    ageRange: "22–42",
    incomeBand: "₹4L–₹20L annual income",
    employment: "Salaried professionals and young families; strong seasonality around holidays and long weekends",
    geographySplit: "~60% Tier 1, ~40% Tier 2/3",
    reachEstimate: "India's online travel booking market is one of the largest and fastest-growing app-install categories, with sharp seasonal demand spikes",
    notes: "Highly seasonal — benchmarks here should be read as an annual average, not a flat monthly assumption.",
  },
};

export function getAudiencePersona(industryId: IndustryId): AudiencePersona {
  return AUDIENCE_PERSONAS[industryId];
}
