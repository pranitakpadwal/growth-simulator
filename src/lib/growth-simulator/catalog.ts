import type {
  ChannelId,
  ChannelMeta,
  FunnelTemplate,
  GoalDefinition,
  IndustryDefinition,
  Platform,
} from "./types";

/**
 * The "clever defaults" layer: the business only has to pick an Industry,
 * a Platform (Website or App), and a Goal (plus budget or a target, and an
 * optional CAC ceiling) — the tool figures out which funnel shape and
 * channel benchmarks apply. Everything below is still fully overridable
 * in the UI.
 *
 * Industry and Platform are deliberately separate dimensions. A personal
 * loan company might run its funnel through its website, its app, or
 * both — baking "App" into the industry name (as an earlier version of
 * this catalog did) hid that choice and silently limited which goals an
 * industry could offer. Goals are still named as the literal, single
 * action a campaign manager is buying media for.
 */

// ---------------------------------------------------------------------------
// Funnel templates
// ---------------------------------------------------------------------------

export const FUNNEL_TEMPLATES: Record<string, FunnelTemplate> = {
  // Approval and disbursal are NOT adjacent in a real digital-lending flow —
  // RBI's digital lending guidelines require KYC/document verification
  // before money moves, and it's routinely the single biggest source of
  // post-approval drop-off (documentation friction, not a credit decision).
  // Folding it into "disbursalRate" hid that bottleneck from the Constraint
  // Engine entirely. Split out as its own stage — see kycVerificationRate's
  // derivation for how the old combined rate was decomposed into two.
  "website-lead-form-lending": {
    id: "website-lead-form-lending",
    label: "Lead → Application → Approval → KYC → Disbursal",
    stages: [
      { id: "leads", label: "Leads", metricId: "landingCvr" },
      { id: "qualified", label: "Qualified leads", metricId: "qualificationRate" },
      { id: "approved", label: "Approved", metricId: "approvalRate" },
      { id: "kyc-verified", label: "KYC verified", metricId: "kycVerificationRate" },
      { id: "funded", label: "Funded customers", metricId: "disbursalRate" },
    ],
    valueStageId: "funded",
    hasRevenue: true,
    valueLabel: "Funded customers",
  },
  // Same principle for investments: an "account opened" is not a customer
  // yet — SEBI/CDSL have repeatedly flagged how many opened demat accounts
  // never fund a single trade. Continues past KYC into actually selecting
  // a plan and completing a funded investment, the real revenue event.
  "website-lead-form-investment": {
    id: "website-lead-form-investment",
    label: "Lead → Qualification → KYC → Plan Selected → Invested",
    stages: [
      { id: "leads", label: "Leads", metricId: "investLeadCvr" },
      { id: "qualified", label: "Qualified leads", metricId: "investQualificationRate" },
      { id: "kyc-verified", label: "KYC verified", metricId: "investKycVerificationRate" },
      { id: "plan-selected", label: "Investment plan selected", metricId: "investPlanSelectionRate" },
      { id: "invested", label: "Funded investors", metricId: "investCompletionRate" },
    ],
    valueStageId: "invested",
    hasRevenue: true,
    valueLabel: "Funded investors",
  },
  "app-install": {
    id: "app-install",
    label: "Store Visit → Install",
    stages: [
      { id: "store-visit", label: "Store listing visits", metricId: "storeListingVisitRate" },
      { id: "install", label: "Installs", metricId: "installRate" },
    ],
    valueStageId: "install",
    hasRevenue: true,
    valueLabel: "Installs",
  },
  "app-lead-form": {
    id: "app-lead-form",
    label: "Store Visit → Install → In-App Lead Form → App Open → In-App Action",
    stages: [
      { id: "store-visit", label: "Store listing visits", metricId: "storeListingVisitRate" },
      { id: "install", label: "Installs", metricId: "installRate" },
      { id: "registration", label: "In-app lead form completed (phone verified)", metricId: "registrationRate" },
      { id: "app-open", label: "App opens", metricId: "appOpenRate" },
      { id: "in-app-action", label: "In-app actions", metricId: "inAppActionRate" },
    ],
    // CAC lands at the in-app lead form / registration event — the literal
    // goal — with app-open / in-app-action shown as downstream activation
    // context rather than folded into acquisition cost.
    valueStageId: "registration",
    hasRevenue: true,
    valueLabel: "In-app leads",
  },
  // Same KYC gap that existed on the website side (see website-lead-form-
  // lending / -investment above) also existed here — the App platform's
  // "app-lead-form" stopped at phone-verified registration for every
  // industry, lending included, with no approval/KYC/disbursal after it.
  // These two mirror the website versions exactly, reusing the same
  // approvalRate/kycVerificationRate/disbursalRate and invest* benchmarks
  // (the underwriting and KYC process doesn't change by acquisition
  // channel) — only the entry stages differ (store visit + install instead
  // of a landing-page click).
  "app-lead-form-lending": {
    id: "app-lead-form-lending",
    label: "Store Visit → Install → Lead → Approved → KYC → Disbursal",
    stages: [
      { id: "store-visit", label: "Store listing visits", metricId: "storeListingVisitRate" },
      { id: "install", label: "Installs", metricId: "installRate" },
      { id: "registration", label: "In-app lead form completed (phone verified)", metricId: "registrationRate" },
      { id: "approved", label: "Approved", metricId: "approvalRate" },
      { id: "kyc-verified", label: "KYC verified", metricId: "kycVerificationRate" },
      { id: "funded", label: "Funded customers", metricId: "disbursalRate" },
    ],
    valueStageId: "funded",
    hasRevenue: true,
    valueLabel: "Funded customers",
  },
  "app-lead-form-investment": {
    id: "app-lead-form-investment",
    label: "Store Visit → Install → Lead → KYC → Plan Selected → Invested",
    stages: [
      { id: "store-visit", label: "Store listing visits", metricId: "storeListingVisitRate" },
      { id: "install", label: "Installs", metricId: "installRate" },
      { id: "registration", label: "In-app lead form completed (phone verified)", metricId: "registrationRate" },
      { id: "kyc-verified", label: "KYC verified", metricId: "investKycVerificationRate" },
      { id: "plan-selected", label: "Investment plan selected", metricId: "investPlanSelectionRate" },
      { id: "invested", label: "Funded investors", metricId: "investCompletionRate" },
    ],
    valueStageId: "invested",
    hasRevenue: true,
    valueLabel: "Funded investors",
  },
  "website-registration": {
    id: "website-registration",
    label: "Engaged Visit → Registration → Activation",
    stages: [
      { id: "engaged-visit", label: "Engaged visits", metricId: "engagedVisitRate" },
      { id: "registration", label: "Registrations", metricId: "siteRegistrationRate" },
      { id: "activation", label: "Activated users", metricId: "activationRate" },
    ],
    // Same principle: CAC lands at the literal "registration" goal;
    // activation is shown as downstream context, not the acquisition target.
    valueStageId: "registration",
    hasRevenue: true,
    valueLabel: "Registrations",
  },
  // Same shape as above, but for registration flows OUTSIDE fintech (News,
  // Social, Business, Travel, Events) — a fintech account-opening funnel and
  // a free-content or event-ticketing signup do not convert at the same
  // rate, and reusing one number for both was overstating volume for every
  // non-finance industry. See `genericSiteRegistrationRate` in benchmarks.ts.
  "website-registration-generic": {
    id: "website-registration-generic",
    label: "Engaged Visit → Registration → Activation",
    stages: [
      { id: "engaged-visit", label: "Engaged visits", metricId: "engagedVisitRate" },
      { id: "registration", label: "Registrations", metricId: "genericSiteRegistrationRate" },
      { id: "activation", label: "Activated users", metricId: "activationRate" },
    ],
    valueStageId: "registration",
    hasRevenue: true,
    valueLabel: "Registrations",
  },
  "website-click": {
    id: "website-click",
    label: "Engaged Visit (awareness / traffic)",
    stages: [{ id: "engaged-visit", label: "Engaged visits", metricId: "engagedVisitRate" }],
    valueStageId: "engaged-visit",
    hasRevenue: false,
    valueLabel: "Engaged visits",
  },
  "app-install-open": {
    id: "app-install-open",
    label: "Store Visit → Install → First Open",
    stages: [
      { id: "store-visit", label: "Store listing visits", metricId: "storeListingVisitRate" },
      { id: "install", label: "Installs", metricId: "installRate" },
      { id: "first-open", label: "App opens (first launch)", metricId: "firstOpenRate" },
    ],
    valueStageId: "first-open",
    hasRevenue: true,
    valueLabel: "App opens",
  },
  "in-app-purchase": {
    id: "in-app-purchase",
    label: "Store Visit → Install → First Open → Purchase",
    stages: [
      { id: "store-visit", label: "Store listing visits", metricId: "storeListingVisitRate" },
      { id: "install", label: "Installs", metricId: "installRate" },
      { id: "first-open", label: "App opens (first launch)", metricId: "firstOpenRate" },
      { id: "purchase", label: "Purchases", metricId: "purchaseRate" },
    ],
    valueStageId: "purchase",
    hasRevenue: true,
    valueLabel: "Purchases",
  },
  "use-calculator": {
    id: "use-calculator",
    label: "Engaged Visit → Calculator Used",
    stages: [
      { id: "engaged-visit", label: "Engaged visits", metricId: "engagedVisitRate" },
      { id: "calculator-used", label: "Calculator uses", metricId: "calculatorUsageRate" },
    ],
    valueStageId: "calculator-used",
    hasRevenue: true,
    valueLabel: "Calculator uses",
  },
  "website-purchase": {
    id: "website-purchase",
    label: "Engaged Visit → Purchase",
    stages: [
      { id: "engaged-visit", label: "Engaged visits", metricId: "engagedVisitRate" },
      { id: "purchase", label: "Purchases", metricId: "websitePurchaseRate" },
    ],
    valueStageId: "purchase",
    hasRevenue: true,
    valueLabel: "Purchases",
  },
  "click-to-call": {
    id: "click-to-call",
    label: "Engaged Visit → Phone Call",
    stages: [
      { id: "engaged-visit", label: "Engaged visits", metricId: "engagedVisitRate" },
      { id: "call", label: "Calls", metricId: "clickToCallRate" },
    ],
    valueStageId: "call",
    hasRevenue: true,
    valueLabel: "Calls",
  },
  "app-reengagement": {
    id: "app-reengagement",
    label: "Click → App Reopened",
    stages: [{ id: "reopen", label: "Re-engaged users", metricId: "reengagementRate" }],
    valueStageId: "reopen",
    hasRevenue: true,
    valueLabel: "Re-engaged users",
  },
};

// ---------------------------------------------------------------------------
// Goals — one per literal action a campaign is bought against.
// ---------------------------------------------------------------------------

export const GOALS: Record<string, GoalDefinition> = {
  "website-lead-form": {
    id: "website-lead-form",
    label: "Website Lead Form",
    description:
      "A visitor fills a lead/application form on your website — the funnel then tracks it through approval, KYC verification, and disbursal to a funded customer.",
    funnelTemplateId: "website-lead-form-lending",
  },
  // Investments gets its own goal instead of sharing "Website Lead Form" —
  // the literal thing a campaign is bought against here isn't a generic
  // form-fill, it's account opening through KYC to an actual funded
  // investment, and naming it that way in the goal picker itself (not just
  // buried in the funnel stages once you're in) is what a campaign manager
  // planning this actually expects to see.
  "website-investment": {
    id: "website-investment",
    label: "Open & Fund an Investment",
    description: "Drive a lead through KYC verification and plan selection to a completed, funded investment.",
    funnelTemplateId: "website-lead-form-investment",
  },
  "app-install": {
    id: "app-install",
    label: "Install the App",
    description: "Drive app installs — the campaign KPI stops at install, not downstream activity.",
    funnelTemplateId: "app-install",
  },
  "app-lead-form": {
    id: "app-lead-form",
    label: "In-App Lead Form",
    description:
      "Drive installs through to a lead form/registration completed inside the app — for lending industries, the funnel then tracks it through approval, KYC verification, and disbursal to a funded customer.",
    funnelTemplateId: "app-lead-form",
  },
  // Same reasoning as "website-investment" above — Investments gets its
  // own app-platform goal instead of the generic "In-App Lead Form",
  // naming the real thing being bought: installs through KYC to a funded
  // investment, not a generic in-app form-fill.
  "app-investment": {
    id: "app-investment",
    label: "Open & Fund an Investment (In-App)",
    description: "Drive installs through KYC verification and plan selection to a completed, funded investment.",
    funnelTemplateId: "app-lead-form-investment",
  },
  "website-registration": {
    id: "website-registration",
    label: "Register on Website",
    description: "Get visitors to complete registration on the website.",
    funnelTemplateId: "website-registration",
  },
  "website-click": {
    id: "website-click",
    label: "Click on Website",
    description: "Top-of-funnel awareness — engaged site visits, no conversion event yet.",
    funnelTemplateId: "website-click",
  },
  "app-install-open": {
    id: "app-install-open",
    label: "Install App + Launch Home Page",
    description: "Install isn't enough on its own — the campaign KPI is the app actually being opened once.",
    funnelTemplateId: "app-install-open",
  },
  "in-app-purchase": {
    id: "in-app-purchase",
    label: "In-App Purchase",
    description: "Drive installs all the way through to a completed in-app purchase or transaction.",
    funnelTemplateId: "in-app-purchase",
  },
  "use-calculator": {
    id: "use-calculator",
    label: "Use Calculator",
    description: "Get visitors to actually run a calculation — a mid-funnel engagement goal, not a lead yet.",
    funnelTemplateId: "use-calculator",
  },
  "website-purchase": {
    id: "website-purchase",
    label: "Website Purchase",
    description: "Drive a completed purchase or transaction directly on the website.",
    funnelTemplateId: "website-purchase",
  },
  "click-to-call": {
    id: "click-to-call",
    label: "Click to Call",
    description: "Drive a phone call to your sales/support line — a major BFSI lead channel alongside web forms.",
    funnelTemplateId: "click-to-call",
  },
  "app-reengagement": {
    id: "app-reengagement",
    label: "App Re-engagement",
    description: "Win back existing, lapsed app users instead of acquiring new ones — a cheaper, different audience.",
    funnelTemplateId: "app-reengagement",
  },
};

/**
 * Goals that acquire a NEW app user via the store listing — used to gate
 * ASO's visibility (re-engagement targets people who already have the app,
 * so it has no store-listing funnel and doesn't belong on the ASO tab).
 */
const APP_ACQUISITION_GOAL_IDS = new Set([
  "app-install",
  "app-install-open",
  "app-lead-form",
  "app-investment",
  "in-app-purchase",
]);

/** Industries whose "app-lead-form" goal routes through the lending KYC/disbursal chain instead of the generic one. */
const LENDING_APP_KYC_INDUSTRY_IDS = new Set(["personal-loans", "emi-calculator", "epf", "credit-cards"]);

/**
 * Goals Google sells as an App Campaign (formerly UAC) rather than as
 * separately-bought Search/Display/YouTube — every app-flavoured goal,
 * including re-engagement (Google runs that as an App campaign variant
 * too). Drives which channels the Google tab shows.
 */
const GOOGLE_UAC_GOAL_IDS = new Set([...APP_ACQUISITION_GOAL_IDS, "app-reengagement"]);

export function isGoogleUacGoal(goalId: string): boolean {
  return GOOGLE_UAC_GOAL_IDS.has(goalId);
}

export function resolveFunnelTemplate(industryId: string, goalId: string): FunnelTemplate {
  if (goalId === "website-investment") {
    return FUNNEL_TEMPLATES["website-lead-form-investment"];
  }
  if (goalId === "app-investment") {
    return FUNNEL_TEMPLATES["app-lead-form-investment"];
  }
  if (goalId === "website-lead-form") {
    return FUNNEL_TEMPLATES["website-lead-form-lending"];
  }
  // App platform's in-app lead form has the same KYC gap the website
  // version had — for the pure-lending industries it routes through
  // approval/KYC/disbursal instead of stopping at phone-verified
  // registration. Investments never reaches this branch — it has its own
  // "app-investment" goal instead (handled above). Every other industry
  // (News, Social, Business, Travel, Events) keeps the original generic
  // template, unaffected.
  if (goalId === "app-lead-form" && LENDING_APP_KYC_INDUSTRY_IDS.has(industryId)) {
    return FUNNEL_TEMPLATES["app-lead-form-lending"];
  }
  // "Register on Website" — Investments keeps the fintech-flavoured
  // registration benchmark (account-opening intent); every other industry
  // uses the lower, non-finance registration benchmark instead of a
  // one-size-fits-all number (see `website-registration-generic` above).
  if (goalId === "website-registration") {
    return industryId === "investments"
      ? FUNNEL_TEMPLATES["website-registration"]
      : FUNNEL_TEMPLATES["website-registration-generic"];
  }
  return FUNNEL_TEMPLATES[GOALS[goalId].funnelTemplateId];
}

// ---------------------------------------------------------------------------
// Industries
// ---------------------------------------------------------------------------

const APP_GOALS_STANDARD = ["app-install", "app-install-open", "app-lead-form", "app-reengagement"] as const;
const APP_GOALS_WITH_PURCHASE = [
  "app-install",
  "app-install-open",
  "app-lead-form",
  "in-app-purchase",
  "app-reengagement",
] as const;

export const INDUSTRIES: IndustryDefinition[] = [
  {
    id: "personal-loans",
    label: "Personal Loans",
    group: "finance",
    defaultPlatform: "website",
    websiteGoalIds: ["website-lead-form", "click-to-call", "website-click"],
    appGoalIds: [...APP_GOALS_STANDARD],
  },
  {
    id: "emi-calculator",
    label: "EMI Calculator",
    group: "finance",
    defaultPlatform: "website",
    websiteGoalIds: ["website-lead-form", "use-calculator", "website-click"],
    appGoalIds: [...APP_GOALS_STANDARD],
  },
  {
    id: "epf",
    label: "EPF (Withdrawal / Transfer Assistance)",
    group: "finance",
    defaultPlatform: "website",
    websiteGoalIds: ["website-lead-form", "click-to-call", "website-click"],
    appGoalIds: [...APP_GOALS_STANDARD],
  },
  {
    id: "credit-cards",
    label: "Credit Cards",
    group: "finance",
    defaultPlatform: "website",
    websiteGoalIds: ["website-lead-form", "click-to-call", "website-click"],
    appGoalIds: [...APP_GOALS_STANDARD],
  },
  {
    id: "investments",
    label: "Investments",
    group: "finance",
    defaultPlatform: "website",
    websiteGoalIds: ["website-investment", "website-registration", "website-purchase", "website-click"],
    appGoalIds: ["app-install", "app-install-open", "app-investment", "in-app-purchase", "app-reengagement"],
  },
  {
    id: "news",
    label: "News / Content",
    group: "app",
    defaultPlatform: "app",
    websiteGoalIds: ["website-registration", "website-click"],
    appGoalIds: [...APP_GOALS_WITH_PURCHASE],
  },
  {
    id: "social",
    label: "Social / Community",
    group: "app",
    defaultPlatform: "app",
    websiteGoalIds: ["website-registration", "website-click"],
    appGoalIds: [...APP_GOALS_WITH_PURCHASE],
  },
  {
    id: "business",
    label: "Business / Productivity",
    group: "app",
    defaultPlatform: "app",
    websiteGoalIds: ["website-registration", "website-click"],
    appGoalIds: [...APP_GOALS_WITH_PURCHASE],
  },
  {
    id: "travel",
    label: "Travel",
    group: "app",
    defaultPlatform: "app",
    websiteGoalIds: ["website-registration", "website-purchase", "website-click"],
    appGoalIds: [...APP_GOALS_WITH_PURCHASE],
  },
  {
    id: "events",
    label: "Events / Ticketing",
    group: "app",
    defaultPlatform: "website",
    websiteGoalIds: ["website-registration", "website-purchase", "website-click"],
    appGoalIds: [...APP_GOALS_WITH_PURCHASE],
  },
];

export function getIndustry(id: string): IndustryDefinition {
  const industry = INDUSTRIES.find((i) => i.id === id);
  if (!industry) throw new Error(`Unknown industry: ${id}`);
  return industry;
}

/** Goals available for an industry under a given platform. */
export function goalsForPlatform(industry: IndustryDefinition, platform: Platform): GoalDefinition[] {
  const ids = platform === "website" ? industry.websiteGoalIds : industry.appGoalIds;
  return ids.map((id) => GOALS[id]);
}

// ---------------------------------------------------------------------------
// Channels
// ---------------------------------------------------------------------------

export const CHANNELS: ChannelMeta[] = [
  { id: "google-search", label: "Google Search", tab: "google", isOrganic: false },
  { id: "google-display", label: "Google Display", tab: "google", isOrganic: false },
  { id: "youtube", label: "YouTube", tab: "google", isOrganic: false },
  { id: "google-uac", label: "Google App Campaigns (UAC)", tab: "google", isOrganic: false },
  { id: "facebook", label: "Facebook", tab: "meta", isOrganic: false },
  { id: "instagram", label: "Instagram", tab: "meta", isOrganic: false },
  { id: "linkedin", label: "LinkedIn", tab: "linkedin", isOrganic: false },
  { id: "seo", label: "SEO", tab: "seo", isOrganic: true },
  { id: "aso", label: "ASO (App Store Optimization)", tab: "aso", isOrganic: true, appOnly: true },
];

export function getChannel(id: ChannelId): ChannelMeta {
  const channel = CHANNELS.find((c) => c.id === id);
  if (!channel) throw new Error(`Unknown channel: ${id}`);
  return channel;
}

const GOOGLE_SPLIT_CHANNEL_IDS: ChannelId[] = ["google-search", "google-display", "youtube"];

/**
 * Channels visible for the current goal:
 * - ASO only for goals that acquire a new app user via the store listing —
 *   re-engagement targets someone who already has the app, so there's no
 *   store-listing funnel to run ASO against for it either.
 * - SEO (organic WEB search) is hidden for every app-store-flavoured goal
 *   (install, install+open, in-app lead form, in-app purchase,
 *   re-engagement) — organic web ranking doesn't drive app installs or
 *   reopen an already-installed app; that's ASO's job, not SEO's. This is
 *   independent of the Google split/UAC choice below: buying Display and
 *   YouTube manually for an app-install goal doesn't turn on organic web
 *   search as a source of installs.
 * - Google defaults to the single blended App Campaigns channel for an
 *   app-acquisition goal, but that's a preference, not a hard rule — many
 *   advertisers also buy Display and YouTube for app installs as separate,
 *   manually-managed line items (video ads driving installs, Display
 *   retargeting), rather than only the auto-placed blended product. So for
 *   a UAC-eligible goal the caller can pass `preferSplit: true` to get the
 *   Search/Display/YouTube split instead — see the buying-mode toggle in
 *   GrowthSimulator. For a non-UAC (website-style) goal the split is the
 *   only option regardless of this flag; isGoogleUacGoal() still decides
 *   that.
 * - LinkedIn is modelled as a website-style channel (its own CPC/CTR into
 *   the shared funnel, like Search) — it follows the same split-vs-UAC
 *   gate as Google, so it appears whenever the split does.
 */
export function channelsForGoal(goalId: string, preferSplit = false): ChannelMeta[] {
  const uac = isGoogleUacGoal(goalId) && !preferSplit;
  return CHANNELS.filter((c) => {
    if (c.appOnly && !APP_ACQUISITION_GOAL_IDS.has(goalId)) return false;
    if (c.id === "seo" && isGoogleUacGoal(goalId)) return false;
    if (c.id === "google-uac" && !uac) return false;
    if (GOOGLE_SPLIT_CHANNEL_IDS.includes(c.id) && uac) return false;
    if (c.id === "linkedin" && uac) return false;
    return true;
  });
}
