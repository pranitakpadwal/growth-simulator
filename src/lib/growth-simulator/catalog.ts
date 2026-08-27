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
  "website-lead-form-lending": {
    id: "website-lead-form-lending",
    label: "Lead → Application → Approval → Disbursal",
    stages: [
      { id: "leads", label: "Leads", metricId: "landingCvr" },
      { id: "qualified", label: "Qualified leads", metricId: "qualificationRate" },
      { id: "approved", label: "Approved", metricId: "approvalRate" },
      { id: "funded", label: "Funded customers", metricId: "disbursalRate" },
    ],
    valueStageId: "funded",
    hasRevenue: true,
    valueLabel: "Funded customers",
  },
  "website-lead-form-investment": {
    id: "website-lead-form-investment",
    label: "Lead → Qualification → Account Opened",
    stages: [
      { id: "leads", label: "Leads", metricId: "investLeadCvr" },
      { id: "qualified", label: "Qualified leads", metricId: "investQualificationRate" },
      { id: "converted", label: "Accounts opened", metricId: "investConversionRate" },
    ],
    valueStageId: "converted",
    hasRevenue: true,
    valueLabel: "Accounts opened",
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
    description: "A visitor fills a lead/application form on your website.",
    funnelTemplateId: "website-lead-form-lending", // overridden per-industry in resolveFunnelTemplate
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
    description: "Drive installs through to a lead form/registration completed inside the app.",
    funnelTemplateId: "app-lead-form",
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
const APP_ACQUISITION_GOAL_IDS = new Set(["app-install", "app-install-open", "app-lead-form", "in-app-purchase"]);

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

/** Per-industry override: "Website Lead Form" resolves to a different template for lending vs. investment products. */
export function resolveFunnelTemplate(industryId: string, goalId: string): FunnelTemplate {
  if (goalId === "website-lead-form") {
    return industryId === "investments"
      ? FUNNEL_TEMPLATES["website-lead-form-investment"]
      : FUNNEL_TEMPLATES["website-lead-form-lending"];
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
    websiteGoalIds: ["website-lead-form", "website-registration", "website-purchase", "website-click"],
    appGoalIds: [...APP_GOALS_WITH_PURCHASE],
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
 * - ASO only for goals that acquire a new app user via the store listing.
 * - Google shows either the Search/Display/YouTube split (website-style
 *   buying) OR the single App Campaigns channel (app-style buying),
 *   never both — see isGoogleUacGoal().
 */
export function channelsForGoal(goalId: string): ChannelMeta[] {
  const uac = isGoogleUacGoal(goalId);
  return CHANNELS.filter((c) => {
    if (c.appOnly && !APP_ACQUISITION_GOAL_IDS.has(goalId)) return false;
    if (c.id === "google-uac" && !uac) return false;
    if (GOOGLE_SPLIT_CHANNEL_IDS.includes(c.id) && uac) return false;
    return true;
  });
}
