export type AudienceStrategyId = "cold" | "retargeting" | "lookalike";

export interface AudienceStrategyDefinition {
  id: AudienceStrategyId;
  label: string;
  description: string;
  /** Multiplies every paid channel's CPC benchmark when this strategy is selected. */
  cpcMult: number;
}

/**
 * "What if we target our known customer list, or a lookalike audience,
 * instead of cold?" — modelled as a CPC adjustment only, not a conversion-
 * rate one. Deliberately narrow: retargeting/lookalike are well-established
 * to buy cheaper reach (a warm or similar audience costs less to win an
 * auction against), but whether that traffic then converts better is far
 * more dependent on the actual creative/offer and the underlying funnel's
 * business process (KYC, underwriting, checkout) than on audience type
 * alone — and layering a second multiplier onto the same editable funnel
 * rates would fight with a user's own edits there. Keeping this to CPC
 * keeps the two levers independent and each easy to reason about.
 */
export const AUDIENCE_STRATEGIES: Record<AudienceStrategyId, AudienceStrategyDefinition> = {
  cold: {
    id: "cold",
    label: "New / Cold Audience",
    description: "Standard prospecting — the benchmark CPC as-is.",
    cpcMult: 1,
  },
  retargeting: {
    id: "retargeting",
    label: "Retargeting (Known Customer List)",
    description: "Uploaded customer/CRM list — warmest audience, typically the cheapest CPC.",
    cpcMult: 0.6,
  },
  lookalike: {
    id: "lookalike",
    label: "Lookalike Audience",
    description: "Modelled on your customer list but not people you already know — cheaper than cold, pricier than retargeting.",
    cpcMult: 0.85,
  },
};

export const AUDIENCE_STRATEGY_LIST: AudienceStrategyDefinition[] = Object.values(AUDIENCE_STRATEGIES);
