import type { IndustryId } from "./types";

/**
 * Who you're actually targeting, per industry — the piece a CMO decides
 * before ever opening Google Ads. Age and the metro/tier-2-3 split are
 * structured and editable in the UI (a real desk would tighten these per
 * client); income band and employment stay free text since they're
 * naturally descriptive rather than a single adjustable number.
 *
 * Tier 5 (strategy-desk) throughout: household income bands and city-tier
 * splits for India digital audiences aren't published at this granularity
 * by any single free source, so these are engagement-pattern composites,
 * not a citable dataset. Label accordingly in the UI.
 */
export interface AudiencePersona {
  ageMin: number;
  ageMax: number;
  incomeBand: string;
  employment: string;
  /** % of the audience in Tier 1 metros — the rest is Tier 2/3. */
  tier1Pct: number;
  reachEstimate: string;
  notes: string;
}

export const AUDIENCE_PERSONAS: Record<IndustryId, AudiencePersona> = {
  "personal-loans": {
    ageMin: 25,
    ageMax: 42,
    incomeBand: "₹4L–₹15L annual income",
    employment: "Salaried (private sector) and self-employed/MSME owners",
    tier1Pct: 60,
    reachEstimate: "~45–60M digitally active adults search for personal loan products annually in India",
    notes: "Salaried audiences convert faster (payslip-based underwriting); self-employed has higher AOV but longer approval cycles.",
  },
  "emi-calculator": {
    ageMin: 24,
    ageMax: 45,
    incomeBand: "₹3L–₹20L annual income",
    employment: "Salaried and self-employed — calculator usage skews slightly more salaried (EMI planning before a scheduled purchase)",
    tier1Pct: 55,
    reachEstimate: "Calculator/EMI-intent search volume in India runs into the low tens of millions of monthly searches across loan, EMI and prepayment queries",
    notes: "This audience is typically earlier in the funnel than direct loan-product search — treat as a top-of-funnel/tool audience, not a lead-ready one.",
  },
  epf: {
    ageMin: 28,
    ageMax: 50,
    incomeBand: "₹3L–₹12L annual income",
    employment: "Salaried, formal-sector (EPF membership requires a registered employer)",
    tier1Pct: 50,
    reachEstimate: "India's EPFO subscriber base runs into the tens of crores; withdrawal/transfer search demand spikes around job transitions and year-end",
    notes: "High-intent, transactional search category — users are usually already mid-process (job change, retirement) rather than browsing.",
  },
  "credit-cards": {
    ageMin: 23,
    ageMax: 40,
    incomeBand: "₹5L–₹25L annual income",
    employment: "Salaried (private sector) skews heavily — most issuers gate eligibility on payslips",
    tier1Pct: 65,
    reachEstimate: "India's credit card base has crossed 10 crore cards, growing fastest among first-time, digitally-native applicants",
    notes: "Comparison-shopping behaviour is high — expect multi-session research before an application starts.",
  },
  investments: {
    ageMin: 27,
    ageMax: 45,
    incomeBand: "₹8L–₹35L annual income",
    employment: "Salaried professionals (white-collar) and business owners with investable surplus",
    tier1Pct: 70,
    reachEstimate: "India's demat-account-holder base has grown past 15 crore, concentrated in this income band",
    notes: "Higher trust threshold than lending — expect longer consideration windows and more repeat-visit behaviour before conversion.",
  },
  "news-app": {
    ageMin: 18,
    ageMax: 40,
    incomeBand: "Broad — free/ad-supported product, not income-gated",
    employment: "Students, early-career professionals, general smartphone population",
    tier1Pct: 40,
    reachEstimate: "India has 750M+ smartphone internet users; regional-language news readership is the fastest-growing segment",
    notes: "Language and regional edition targeting typically matters more than income targeting for this category.",
  },
  "social-app": {
    ageMin: 16,
    ageMax: 30,
    incomeBand: "Broad — free product, not income-gated",
    employment: "Students and early-career, mobile-first",
    tier1Pct: 35,
    reachEstimate: "India's under-30 smartphone population runs into several hundred million; category engagement is driven by network effects, not raw reach",
    notes: "Retention and viral/referral loops typically matter more here than raw acquisition CAC — factor that into channel mix, not just cost.",
  },
  "business-app": {
    ageMin: 25,
    ageMax: 45,
    incomeBand: "₹6L–₹30L annual income (individual) or SMB decision-maker",
    employment: "Business owners, founders, and functional professionals (finance, ops, sales) evaluating a work tool",
    tier1Pct: 70,
    reachEstimate: "India has an estimated 60M+ MSMEs and a fast-growing SaaS-buyer base among them",
    notes: "B2B intent — expect a longer, multi-stakeholder consideration cycle than consumer categories above.",
  },
  "travel-app": {
    ageMin: 22,
    ageMax: 42,
    incomeBand: "₹4L–₹20L annual income",
    employment: "Salaried professionals and young families; strong seasonality around holidays and long weekends",
    tier1Pct: 60,
    reachEstimate: "India's online travel booking market is one of the largest and fastest-growing app-install categories, with sharp seasonal demand spikes",
    notes: "Highly seasonal — benchmarks here should be read as an annual average, not a flat monthly assumption.",
  },
};

export function getAudiencePersona(industryId: IndustryId): AudiencePersona {
  return AUDIENCE_PERSONAS[industryId];
}
