import type {
  ChannelId,
  ChannelMeta,
  FunnelTemplate,
  GoalDefinition,
  IndustryDefinition,
} from "./types";

/**
 * The "clever defaults" layer: the business only has to pick an Industry
 * and a Goal (plus budget or a target, and an optional CAC ceiling) — the
 * tool figures out which funnel shape and channel benchmarks apply.
 * Everything below is still fully overridable in the UI.
 *
 * Goals are named as the literal, single action a campaign manager is
 * actually buying media for — "Install the App", "Register on Website" —
 * not a merged concept, since a web lead form and an in-app lead form are
 * different funnels bought through different channels.
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
};

/** The goals that put an app in the customer's hands — used to gate ASO's visibility. */
const APP_GOAL_IDS = new Set(["app-install", "app-install-open", "app-lead-form", "in-app-purchase"]);

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

const LEAD_FORM_GOALS = ["website-lead-form", "website-click"] as const;
const APP_GOALS = ["app-install", "app-install-open", "app-lead-form", "in-app-purchase", "website-click"] as const;

export const INDUSTRIES: IndustryDefinition[] = [
  {
    id: "personal-loans",
    label: "Personal Loans",
    group: "finance",
    defaultGoalId: "website-lead-form",
    goalIds: [...LEAD_FORM_GOALS],
  },
  {
    id: "emi-calculator",
    label: "EMI Calculator",
    group: "finance",
    defaultGoalId: "website-lead-form",
    goalIds: ["website-lead-form", "use-calculator", "website-click"],
  },
  {
    id: "epf",
    label: "EPF (Withdrawal / Transfer Assistance)",
    group: "finance",
    defaultGoalId: "website-lead-form",
    goalIds: [...LEAD_FORM_GOALS],
  },
  {
    id: "credit-cards",
    label: "Credit Cards",
    group: "finance",
    defaultGoalId: "website-lead-form",
    goalIds: [...LEAD_FORM_GOALS],
  },
  {
    id: "investments",
    label: "Investments",
    group: "finance",
    defaultGoalId: "website-lead-form",
    goalIds: ["website-lead-form", "website-registration", "website-click"],
  },
  {
    id: "news-app",
    label: "News / Content App",
    group: "app",
    defaultGoalId: "app-install",
    goalIds: [...APP_GOALS],
  },
  {
    id: "social-app",
    label: "Social / Friends App",
    group: "app",
    defaultGoalId: "app-install",
    goalIds: [...APP_GOALS],
  },
  {
    id: "business-app",
    label: "Business App",
    group: "app",
    defaultGoalId: "app-install",
    goalIds: [...APP_GOALS],
  },
  {
    id: "travel-app",
    label: "Travel App",
    group: "app",
    defaultGoalId: "app-install",
    goalIds: [...APP_GOALS],
  },
];

export function getIndustry(id: string): IndustryDefinition {
  const industry = INDUSTRIES.find((i) => i.id === id);
  if (!industry) throw new Error(`Unknown industry: ${id}`);
  return industry;
}

// ---------------------------------------------------------------------------
// Channels
// ---------------------------------------------------------------------------

export const CHANNELS: ChannelMeta[] = [
  { id: "google-search", label: "Google Search", tab: "google", isOrganic: false },
  { id: "google-display", label: "Google Display", tab: "google", isOrganic: false },
  { id: "youtube", label: "YouTube", tab: "google", isOrganic: false },
  { id: "meta", label: "Meta", tab: "meta", isOrganic: false },
  { id: "seo", label: "SEO", tab: "seo", isOrganic: true },
  { id: "aso", label: "ASO (App Store Optimization)", tab: "aso", isOrganic: true, appOnly: true },
];

export function getChannel(id: ChannelId): ChannelMeta {
  const channel = CHANNELS.find((c) => c.id === id);
  if (!channel) throw new Error(`Unknown channel: ${id}`);
  return channel;
}

/** Channels visible for the current goal — ASO only shows up for an app-acquisition goal. */
export function channelsForGoal(goalId: string): ChannelMeta[] {
  return CHANNELS.filter((c) => !c.appOnly || APP_GOAL_IDS.has(goalId));
}
