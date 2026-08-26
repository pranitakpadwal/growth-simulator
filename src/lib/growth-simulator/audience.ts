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
};

export function getAudiencePersona(industryId: IndustryId): AudiencePersona {
  return AUDIENCE_PERSONAS[industryId];
}
