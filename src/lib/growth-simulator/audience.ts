import type { IndustryId } from "./types";

/**
 * Who you're actually targeting, per industry — the piece a CMO decides
 * before ever opening Google Ads. Age and the metro/tier-2-3 split are
 * structured and editable in the UI (a real desk would tighten these per
 * client); income band and employment stay free text since they're
 * naturally descriptive rather than a single adjustable number.
 *
 * Reach is DERIVED, not stored as a fixed string — `estimateReach` scales
 * the reference reach by how wide an age band you've actually selected,
 * so narrowing the age range visibly narrows the reach estimate too.
 *
 * Tier 5 (strategy-desk) throughout: household income bands, city-tier
 * splits, and reach-by-age-band for India digital audiences aren't
 * published at this granularity by any single free source, so these are
 * engagement-pattern composites, not a citable dataset. Label accordingly
 * in the UI.
 */
export interface AudiencePersona {
  ageMin: number;
  ageMax: number;
  incomeBand: string;
  employment: string;
  /** % of the audience in Tier 1 metros — the rest is Tier 2/3. */
  tier1Pct: number;
  /** The age band the reach estimate below was sized for. */
  referenceAgeMin: number;
  referenceAgeMax: number;
  /** Reach (in millions) at the reference age band. */
  reachLowM: number;
  reachHighM: number;
  reachLabel: string; // e.g. "digitally active adults who search for personal loan products annually in India"
  notes: string;
}

export const AUDIENCE_PERSONAS: Record<IndustryId, AudiencePersona> = {
  "personal-loans": {
    ageMin: 25,
    ageMax: 42,
    incomeBand: "₹4L–₹15L annual income",
    employment: "Salaried (private sector) and self-employed/MSME owners",
    tier1Pct: 60,
    referenceAgeMin: 25,
    referenceAgeMax: 42,
    reachLowM: 45,
    reachHighM: 60,
    reachLabel: "digitally active adults search for personal loan products annually in India",
    notes: "Salaried audiences convert faster (payslip-based underwriting); self-employed has higher AOV but longer approval cycles.",
  },
  "emi-calculator": {
    ageMin: 24,
    ageMax: 45,
    incomeBand: "₹3L–₹20L annual income",
    employment: "Salaried and self-employed — calculator usage skews slightly more salaried (EMI planning before a scheduled purchase)",
    tier1Pct: 55,
    referenceAgeMin: 24,
    referenceAgeMax: 45,
    reachLowM: 22,
    reachHighM: 35,
    reachLabel: "monthly searches across loan, EMI and prepayment calculator queries in India",
    notes: "This audience is typically earlier in the funnel than direct loan-product search — treat as a top-of-funnel/tool audience, not a lead-ready one.",
  },
  epf: {
    ageMin: 28,
    ageMax: 50,
    incomeBand: "₹3L–₹12L annual income",
    employment: "Salaried, formal-sector (EPF membership requires a registered employer)",
    tier1Pct: 50,
    referenceAgeMin: 28,
    referenceAgeMax: 50,
    reachLowM: 60,
    reachHighM: 90,
    reachLabel: "EPFO subscribers in India, spiking around job transitions and year-end",
    notes: "High-intent, transactional search category — users are usually already mid-process (job change, retirement) rather than browsing.",
  },
  "credit-cards": {
    ageMin: 23,
    ageMax: 40,
    incomeBand: "₹5L–₹25L annual income",
    employment: "Salaried (private sector) skews heavily — most issuers gate eligibility on payslips",
    tier1Pct: 65,
    referenceAgeMin: 23,
    referenceAgeMax: 40,
    reachLowM: 25,
    reachHighM: 40,
    reachLabel: "digitally active adults evaluating a new credit card annually in India",
    notes: "Comparison-shopping behaviour is high — expect multi-session research before an application starts.",
  },
  investments: {
    ageMin: 27,
    ageMax: 45,
    incomeBand: "₹8L–₹35L annual income",
    employment: "Salaried professionals (white-collar) and business owners with investable surplus",
    tier1Pct: 70,
    referenceAgeMin: 27,
    referenceAgeMax: 45,
    reachLowM: 30,
    reachHighM: 50,
    reachLabel: "demat/investment-account holders and prospects in India",
    notes: "Higher trust threshold than lending — expect longer consideration windows and more repeat-visit behaviour before conversion.",
  },
  news: {
    ageMin: 18,
    ageMax: 40,
    incomeBand: "Broad — free/ad-supported product, not income-gated",
    employment: "Students, early-career professionals, general smartphone population",
    tier1Pct: 40,
    referenceAgeMin: 18,
    referenceAgeMax: 40,
    reachLowM: 300,
    reachHighM: 450,
    reachLabel: "smartphone internet users in India reading news/content in this age band",
    notes: "Language and regional edition targeting typically matters more than income targeting for this category.",
  },
  social: {
    ageMin: 16,
    ageMax: 30,
    incomeBand: "Broad — free product, not income-gated",
    employment: "Students and early-career, mobile-first",
    tier1Pct: 35,
    referenceAgeMin: 16,
    referenceAgeMax: 30,
    reachLowM: 200,
    reachHighM: 320,
    reachLabel: "under-30 smartphone users in India, engagement driven by network effects not raw reach",
    notes: "Retention and viral/referral loops typically matter more here than raw acquisition CAC — factor that into channel mix, not just cost.",
  },
  business: {
    ageMin: 25,
    ageMax: 45,
    incomeBand: "₹6L–₹30L annual income (individual) or SMB decision-maker",
    employment: "Business owners, founders, and functional professionals (finance, ops, sales) evaluating a work tool",
    tier1Pct: 70,
    referenceAgeMin: 25,
    referenceAgeMax: 45,
    reachLowM: 40,
    reachHighM: 60,
    reachLabel: "SMB decision-makers and SaaS-buying professionals in India",
    notes: "B2B intent — expect a longer, multi-stakeholder consideration cycle than consumer categories above.",
  },
  travel: {
    ageMin: 22,
    ageMax: 42,
    incomeBand: "₹4L–₹20L annual income",
    employment: "Salaried professionals and young families; strong seasonality around holidays and long weekends",
    tier1Pct: 60,
    referenceAgeMin: 22,
    referenceAgeMax: 42,
    reachLowM: 80,
    reachHighM: 120,
    reachLabel: "digitally active travel bookers in India, with sharp seasonal demand spikes",
    notes: "Highly seasonal — benchmarks here should be read as an annual average, not a flat monthly assumption.",
  },
};

export function getAudiencePersona(industryId: IndustryId): AudiencePersona {
  return AUDIENCE_PERSONAS[industryId];
}

/**
 * Scales the reference reach by how wide the currently-selected age band
 * is relative to the band it was sized for — narrow the age range, the
 * reach estimate narrows with it. Clamped so a 1-year band doesn't imply
 * near-zero reach (age isn't the only targeting dimension) and widening
 * past the reference band shows diminishing returns (India's population
 * pyramid isn't flat).
 */
export function estimateReach(persona: AudiencePersona): { lowM: number; highM: number } {
  const referenceWidth = Math.max(persona.referenceAgeMax - persona.referenceAgeMin, 1);
  const currentWidth = Math.max(persona.ageMax - persona.ageMin, 1);
  const ratio = Math.min(Math.max(currentWidth / referenceWidth, 0.15), 1.4);
  return {
    lowM: Math.round(persona.reachLowM * ratio),
    highM: Math.round(persona.reachHighM * ratio),
  };
}
