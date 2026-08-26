import type {
  ChannelId,
  ChannelMeta,
  FunnelTemplate,
  GoalDefinition,
  IndustryDefinition,
} from "./types";

/**
 * The "clever defaults" layer (per the request: business only has to pick an
 * Industry and a Goal, budget, and a CAC ceiling — the tool figures out
 * which funnel shape and channel benchmarks apply). Everything below is
 * still fully overridable in the UI; this is the starting point, not a lock.
 */

// ---------------------------------------------------------------------------
// Funnel templates
// ---------------------------------------------------------------------------

export const FUNNEL_TEMPLATES: Record<string, FunnelTemplate> = {
  "lead-gen-lending": {
    id: "lead-gen-lending",
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
  "lead-gen-investment": {
    id: "lead-gen-investment",
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
    label: "Store Visit → Install → Registration → App Open → In-App Action",
    stages: [
      { id: "store-visit", label: "Store listing visits", metricId: "storeListingVisitRate" },
      { id: "install", label: "Installs", metricId: "installRate" },
      { id: "registration", label: "Registered users (phone verified)", metricId: "registrationRate" },
      { id: "app-open", label: "App opens", metricId: "appOpenRate" },
      { id: "in-app-action", label: "In-app actions", metricId: "inAppActionRate" },
    ],
    // CAC is measured at registration (the standard "acquired user" definition for
    // apps) — app opens / in-app actions are shown as downstream activation, not
    // folded into acquisition cost.
    valueStageId: "registration",
    hasRevenue: true,
    valueLabel: "Registered users",
  },
  "website-registration": {
    id: "website-registration",
    label: "Engaged Visit → Registration → Activation",
    stages: [
      { id: "engaged-visit", label: "Engaged visits", metricId: "engagedVisitRate" },
      { id: "registration", label: "Registrations", metricId: "siteRegistrationRate" },
      { id: "activation", label: "Activated users", metricId: "activationRate" },
    ],
    valueStageId: "activation",
    hasRevenue: true,
    valueLabel: "Activated users",
  },
  "website-click": {
    id: "website-click",
    label: "Engaged Visit (awareness / traffic)",
    stages: [{ id: "engaged-visit", label: "Engaged visits", metricId: "engagedVisitRate" }],
    valueStageId: "engaged-visit",
    hasRevenue: false,
    valueLabel: "Engaged visits",
  },
};

// ---------------------------------------------------------------------------
// Goals
// ---------------------------------------------------------------------------

export const GOALS: Record<string, GoalDefinition> = {
  "lead-gen": {
    id: "lead-gen",
    label: "Lead / Form Fill",
    description: "Capture a qualified lead that a sales or underwriting team converts.",
    funnelTemplateId: "lead-gen-lending", // overridden per-industry below
  },
  "app-install": {
    id: "app-install",
    label: "App Install",
    description: "Drive installs and get users to a registered, active state.",
    funnelTemplateId: "app-install",
  },
  "website-registration": {
    id: "website-registration",
    label: "Website Registration",
    description: "Get visitors to create and activate an account on the website.",
    funnelTemplateId: "website-registration",
  },
  "website-click": {
    id: "website-click",
    label: "Website Click / Traffic",
    description: "Top-of-funnel awareness — engaged site visits, no conversion event yet.",
    funnelTemplateId: "website-click",
  },
};

/** Per-industry override: which funnel template "Lead / Form Fill" actually resolves to. */
export function resolveFunnelTemplate(industryId: string, goalId: string): FunnelTemplate {
  if (goalId === "lead-gen") {
    return industryId === "investments"
      ? FUNNEL_TEMPLATES["lead-gen-investment"]
      : FUNNEL_TEMPLATES["lead-gen-lending"];
  }
  return FUNNEL_TEMPLATES[GOALS[goalId].funnelTemplateId];
}

// ---------------------------------------------------------------------------
// Industries
// ---------------------------------------------------------------------------

export const INDUSTRIES: IndustryDefinition[] = [
  {
    id: "personal-loans",
    label: "Personal Loans",
    group: "finance",
    defaultGoalId: "lead-gen",
    goalIds: ["lead-gen", "website-click"],
  },
  {
    id: "emi-calculator",
    label: "EMI Calculator",
    group: "finance",
    defaultGoalId: "lead-gen",
    goalIds: ["lead-gen", "website-click"],
  },
  {
    id: "investments",
    label: "Investments",
    group: "finance",
    defaultGoalId: "lead-gen",
    goalIds: ["lead-gen", "website-registration", "website-click"],
  },
  {
    id: "news-app",
    label: "News / Content App",
    group: "app",
    defaultGoalId: "app-install",
    goalIds: ["app-install", "website-click"],
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

/** Channels visible for the current goal — ASO only shows up for App Install. */
export function channelsForGoal(goalId: string): ChannelMeta[] {
  return CHANNELS.filter((c) => !c.appOnly || goalId === "app-install");
}
