"use client";

import { useMemo, useState } from "react";
import type { ChannelId, ChannelObjectiveId, ChannelTabId, GoalId, IndustryId, Platform, ValueClass } from "@/lib/growth-simulator/types";
import {
  INDUSTRIES,
  channelsForGoal,
  getChannel,
  getIndustry,
  goalsForPlatform,
  isGoogleUacGoal,
  resolveFunnelTemplate,
} from "@/lib/growth-simulator/catalog";
import { getChannelBenchmark, getFunnelBenchmark } from "@/lib/growth-simulator/benchmarks";
import { getChannelObjectives, getUnitBenchmark } from "@/lib/growth-simulator/objectives";
import { defaultEconomics, type EconomicsDefaults } from "@/lib/growth-simulator/defaults";
import {
  assessConstraints,
  computeRequiredPaidBudget,
  rankChannelEfficiency,
  runThreeOrganicScenarios,
  runThreePaidScenarios,
  type ChannelEfficiency,
  type PaidChannelWeight,
} from "@/lib/growth-simulator/engine";
import type { ChannelForecast, BudgetCadence, ScenarioName } from "@/lib/growth-simulator/types";
import { getAudiencePersona, type AudiencePersona } from "@/lib/growth-simulator/audience";
import { AUDIENCE_STRATEGIES, type AudienceStrategyId } from "@/lib/growth-simulator/audienceStrategy";
import { formatInrCompact } from "@/lib/growth-simulator/format";
import type { BenchmarkRow } from "./BenchmarkTable";
import BusinessSetupPanel, { type PlanMode } from "./BusinessSetupPanel";
import AudienceCard from "./AudienceCard";
import ChannelPanel from "./ChannelPanel";
import ObjectiveChannelPanel from "./ObjectiveChannelPanel";
import OrganicChannelPanel from "./OrganicChannelPanel";
import SummaryPanel from "./SummaryPanel";

const PAID_CHANNEL_IDS: ChannelId[] = [
  "google-search",
  "google-display",
  "youtube",
  "google-uac",
  "facebook",
  "instagram",
  "linkedin",
];

/** Channels where a non-"leads" objective (Views, Traffic, Engagement, Messages, Awareness) is even offered. */
const OBJECTIVE_CAPABLE_CHANNEL_IDS = new Set<ChannelId>(["youtube", "facebook", "instagram", "linkedin"]);

function initialCpcMap(
  group: "finance" | "app",
  cpcMult: number = 1
): Record<ChannelId, { value: number; valueClass: ValueClass }> {
  const map = {} as Record<ChannelId, { value: number; valueClass: ValueClass }>;
  for (const id of PAID_CHANNEL_IDS) {
    map[id] = { value: getChannelBenchmark(group, id).cpc * cpcMult, valueClass: "benchmark" };
  }
  return map;
}

function initialCtrMap(group: "finance" | "app"): Record<ChannelId, { value: number; valueClass: ValueClass }> {
  const map = {} as Record<ChannelId, { value: number; valueClass: ValueClass }>;
  for (const id of PAID_CHANNEL_IDS) {
    map[id] = { value: getChannelBenchmark(group, id).ctr, valueClass: "benchmark" };
  }
  return map;
}

function initialStageMap(templateId: string, stages: { metricId: string }[]): Record<string, { value: number; valueClass: ValueClass }> {
  const map: Record<string, { value: number; valueClass: ValueClass }> = {};
  for (const stage of stages) {
    map[stage.metricId] = { value: getFunnelBenchmark(stage.metricId).median, valueClass: "benchmark" };
  }
  return map;
}

interface OrganicState {
  entryVolume: number;
  investmentInr: number;
  overrideEnabled: boolean;
  overrideRatePct: number;
}

const TAB_LABEL: Record<ChannelTabId | "summary", string> = {
  google: "Google",
  meta: "Meta",
  linkedin: "LinkedIn",
  seo: "SEO",
  aso: "ASO",
  summary: "Summary",
};

export default function GrowthSimulator() {
  const [industryId, setIndustryId] = useState<IndustryId>("personal-loans");
  const [platform, setPlatform] = useState<Platform>(getIndustry("personal-loans").defaultPlatform);
  const [audienceStrategy, setAudienceStrategy] = useState<AudienceStrategyId>("cold");
  const [goalId, setGoalId] = useState<GoalId>(
    goalsForPlatform(getIndustry("personal-loans"), getIndustry("personal-loans").defaultPlatform)[0].id
  );
  const [planMode, setPlanMode] = useState<PlanMode>("budget");
  const [cadence, setCadence] = useState<BudgetCadence>("monthly");
  const [budgetInputValue, setBudgetInputValue] = useState(500000); // ₹5L
  const [targetConversionsInput, setTargetConversionsInput] = useState("5000");
  const [targetCacInput, setTargetCacInput] = useState("");
  const [googlePct, setGooglePct] = useState(70);
  const [searchPct, setSearchPct] = useState(55);
  const [displayPct, setDisplayPct] = useState(20);
  const [youtubePct, setYoutubePct] = useState(25);
  const [facebookPct, setFacebookPct] = useState(60);
  // Sub-channels a user can switch off entirely — "I don't want to run
  // YouTube, only Search" — rather than fiddling percentages down to 0.
  // Missing from the map = enabled (default); only Search/Display/YouTube
  // and Facebook/Instagram are togglable, since those are the ones bought
  // as a deliberate split — Google App Campaigns (UAC) is already a single
  // auto-placed channel with nothing to split.
  const [channelEnabled, setChannelEnabled] = useState<Partial<Record<ChannelId, boolean>>>({});
  // LinkedIn's slice of TOTAL monthly budget, taken off the top; Google and
  // Meta then split whatever's left via googlePct as before. Defaults to 0
  // so existing plans are unaffected until a user deliberately allocates to
  // LinkedIn — it's a new, opt-in channel, not a silent budget cut.
  const [linkedinPct, setLinkedinPct] = useState(0);
  // What each objective-capable channel (YouTube/Facebook/Instagram/
  // LinkedIn) is actually bought against — see objectives.ts. Missing from
  // the map = "leads", i.e. the original funnel-driving behaviour.
  const [channelObjective, setChannelObjective] = useState<Partial<Record<ChannelId, ChannelObjectiveId>>>({});
  // Editable cost-per-unit for a channel's non-"leads" objective (₹ per
  // view/click/follow/message/impression) — missing = use that objective's
  // benchmark. Only one objective is active per channel at a time, so one
  // value per channel id is enough.
  const [objectiveUnitCost, setObjectiveUnitCost] = useState<Partial<Record<ChannelId, number>>>({});
  const [activeTab, setActiveTab] = useState<ChannelTabId | "summary">("google");

  function isChannelEnabled(id: ChannelId): boolean {
    return channelEnabled[id] ?? true;
  }

  function toggleChannelEnabled(id: ChannelId) {
    setChannelEnabled((prev) => ({ ...prev, [id]: !(prev[id] ?? true) }));
  }

  function getChannelObjectiveId(id: ChannelId): ChannelObjectiveId {
    return channelObjective[id] ?? "leads";
  }

  function setChannelObjectiveId(id: ChannelId, objectiveId: ChannelObjectiveId) {
    setChannelObjective((prev) => ({ ...prev, [id]: objectiveId }));
    // Reset the unit-cost override so switching objectives shows that
    // objective's own benchmark rather than a stale value left over from
    // whatever was previously selected.
    setObjectiveUnitCost((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  /** Only a "leads" objective (or a channel with no objective choice at all) drives the shared funnel/CAC math. */
  function channelFeedsFunnel(id: ChannelId): boolean {
    return !OBJECTIVE_CAPABLE_CHANNEL_IDS.has(id) || getChannelObjectiveId(id) === "leads";
  }

  function getObjectiveUnitCostValue(id: ChannelId): number {
    if (objectiveUnitCost[id] != null) return objectiveUnitCost[id]!;
    return getUnitBenchmark(id, getChannelObjectiveId(id))?.costPerUnit ?? 0;
  }

  function setObjectiveUnitCostVal(id: ChannelId, value: number) {
    setObjectiveUnitCost((prev) => ({ ...prev, [id]: value }));
  }

  const initialTemplate = useMemo(() => resolveFunnelTemplate(industryId, goalId), [industryId, goalId]);
  const [channelCpc, setChannelCpc] = useState(() => initialCpcMap(getIndustry(industryId).group));
  const [channelCtr, setChannelCtr] = useState(() => initialCtrMap(getIndustry(industryId).group));
  const [stageAssumptions, setStageAssumptions] = useState(() =>
    initialStageMap(initialTemplate.id, initialTemplate.stages)
  );
  const [economics, setEconomics] = useState<EconomicsDefaults>(() => defaultEconomics(industryId, goalId));
  // Organic entry volume has no benchmark behind it — it's literally
  // whatever traffic/store-listing-visits YOUR site/app already gets,
  // which this tool has no way to know. Defaulting it to a nonzero number
  // was quietly adding hundreds of "free" conversions to every plan before
  // the user touched anything — the opposite of "no number without
  // provenance." Starts at 0; the user enters their own real number.
  const [organic, setOrganic] = useState<{ seo: OrganicState; aso: OrganicState }>({
    seo: { entryVolume: 0, investmentInr: 0, overrideEnabled: false, overrideRatePct: 5 },
    aso: { entryVolume: 0, investmentInr: 0, overrideEnabled: false, overrideRatePct: 8 },
  });
  const [audience, setAudience] = useState<AudiencePersona>(() => getAudiencePersona(industryId));

  // For an app-acquisition goal, Google defaults to the single blended App
  // Campaign — but plenty of advertisers also buy Display and YouTube for
  // app installs as separate, manually-managed line items (video ads
  // driving installs, Display retargeting), not just the auto-placed
  // blended product. This lets that be a choice instead of a hard rule.
  const [preferSplitForApp, setPreferSplitForApp] = useState(false);

  const industry = useMemo(() => getIndustry(industryId), [industryId]);
  const availableGoals = useMemo(() => goalsForPlatform(industry, platform), [industry, platform]);
  const template = useMemo(() => resolveFunnelTemplate(industryId, goalId), [industryId, goalId]);
  const usesGoogleUac = isGoogleUacGoal(goalId) && !preferSplitForApp;
  const visibleChannels = useMemo(() => channelsForGoal(goalId, preferSplitForApp), [goalId, preferSplitForApp]);
  const visibleTabs = useMemo(() => {
    const tabs = Array.from(new Set(visibleChannels.map((c) => c.tab)));
    return [...tabs, "summary" as const];
  }, [visibleChannels]);

  function handleIndustryChange(id: string) {
    const nextIndustry = getIndustry(id);
    const nextPlatform = nextIndustry.defaultPlatform;
    const nextGoalId = goalsForPlatform(nextIndustry, nextPlatform)[0].id;
    const nextTemplate = resolveFunnelTemplate(id, nextGoalId);
    setIndustryId(nextIndustry.id);
    setPlatform(nextPlatform);
    setGoalId(nextGoalId);
    setPreferSplitForApp(false);
    setEconomics(defaultEconomics(nextIndustry.id, nextGoalId));
    setAudience(getAudiencePersona(nextIndustry.id));
    setChannelCpc(initialCpcMap(nextIndustry.group, AUDIENCE_STRATEGIES[audienceStrategy].cpcMult));
    setChannelCtr(initialCtrMap(nextIndustry.group));
    setStageAssumptions(initialStageMap(nextTemplate.id, nextTemplate.stages));
    setActiveTab(channelsForGoal(nextGoalId)[0]?.tab ?? "summary");
  }

  function handlePlatformChange(next: Platform) {
    const nextGoalId = goalsForPlatform(industry, next)[0].id;
    const nextTemplate = resolveFunnelTemplate(industryId, nextGoalId);
    setPlatform(next);
    setGoalId(nextGoalId);
    setPreferSplitForApp(false);
    setEconomics(defaultEconomics(industryId, nextGoalId));
    setStageAssumptions(initialStageMap(nextTemplate.id, nextTemplate.stages));
    setActiveTab(channelsForGoal(nextGoalId)[0]?.tab ?? "summary");
  }

  function handleAudienceStrategyChange(next: AudienceStrategyId) {
    setAudienceStrategy(next);
    setChannelCpc(initialCpcMap(industry.group, AUDIENCE_STRATEGIES[next].cpcMult));
  }

  function handleGoalChange(id: string) {
    const nextTemplate = resolveFunnelTemplate(industryId, id);
    setGoalId(id as GoalId);
    setEconomics(defaultEconomics(industryId, id as GoalId));
    setStageAssumptions(initialStageMap(nextTemplate.id, nextTemplate.stages));
    setActiveTab(channelsForGoal(id, preferSplitForApp)[0]?.tab ?? "summary");
  }

  function setStageValue(metricId: string, value: number) {
    setStageAssumptions((prev) => ({ ...prev, [metricId]: { value, valueClass: "actual" } }));
  }

  function setCtrValue(channelId: ChannelId, value: number) {
    setChannelCtr((prev) => ({ ...prev, [channelId]: { value, valueClass: "actual" } }));
  }

  function setCpcValue(channelId: ChannelId, value: number) {
    setChannelCpc((prev) => ({ ...prev, [channelId]: { value, valueClass: "actual" } }));
  }

  function setOrganicField<K extends keyof OrganicState>(key: "seo" | "aso", field: K, value: OrganicState[K]) {
    setOrganic((prev) => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  }

  const targetCacInr = targetCacInput.trim() === "" ? null : Number(targetCacInput);

  const stageAssumptionsPlain = useMemo(() => {
    const plain: Record<string, number> = {};
    for (const [metricId, a] of Object.entries(stageAssumptions)) plain[metricId] = a.value;
    return plain;
  }, [stageAssumptions]);

  // Effective sub-split % — a disabled channel contributes 0 and its share
  // is redistributed across whichever sub-channels are still enabled,
  // without losing the user's original slider position (re-enabling
  // restores it).
  const effSearchPct = isChannelEnabled("google-search") ? searchPct : 0;
  const effDisplayPct = isChannelEnabled("google-display") ? displayPct : 0;
  const effYoutubePct = isChannelEnabled("youtube") ? youtubePct : 0;
  const googleSubSplitSum = effSearchPct + effDisplayPct + effYoutubePct || 1;
  const effFacebookPct = isChannelEnabled("facebook") ? facebookPct : 0;
  const effInstagramPct = isChannelEnabled("instagram") ? 100 - facebookPct : 0;
  const metaSubSplitSum = effFacebookPct + effInstagramPct || 1;
  // LinkedIn takes its slice off the top of the TOTAL budget; Google and
  // Meta then split whatever's left, via the same googlePct as before.
  const nonLinkedinPoolPct = 100 - linkedinPct;
  // A channel still gets its real budget share regardless of objective —
  // switching YouTube to "Views" doesn't cut its spend, it just changes
  // what that spend is optimizing for. Only the funnel-feeding weight used
  // for goal-first back-solving (channelWeights below) should exclude a
  // non-"leads" objective, since a view or a follow isn't a lead to solve
  // a budget against.
  const effYoutubeFunnelPct = channelFeedsFunnel("youtube") ? effYoutubePct : 0;
  const youtubeGoogleSubSplitSum = effSearchPct + effDisplayPct + effYoutubeFunnelPct || 1;
  const effFacebookFunnelPct = channelFeedsFunnel("facebook") ? effFacebookPct : 0;
  const effInstagramFunnelPct = channelFeedsFunnel("instagram") ? effInstagramPct : 0;
  const metaFunnelSubSplitSum = effFacebookFunnelPct + effInstagramFunnelPct || 1;

  const channelWeights: PaidChannelWeight[] = [
    {
      channelId: "google-search",
      cpc: channelCpc["google-search"].value,
      sharePct: usesGoogleUac ? 0 : nonLinkedinPoolPct * googlePct * (effSearchPct / youtubeGoogleSubSplitSum),
    },
    {
      channelId: "google-display",
      cpc: channelCpc["google-display"].value,
      sharePct: usesGoogleUac ? 0 : nonLinkedinPoolPct * googlePct * (effDisplayPct / youtubeGoogleSubSplitSum),
    },
    {
      channelId: "youtube",
      cpc: channelCpc.youtube.value,
      sharePct: usesGoogleUac ? 0 : nonLinkedinPoolPct * googlePct * (effYoutubeFunnelPct / youtubeGoogleSubSplitSum),
    },
    {
      channelId: "google-uac",
      cpc: channelCpc["google-uac"].value,
      sharePct: usesGoogleUac ? nonLinkedinPoolPct * googlePct : 0,
    },
    {
      channelId: "facebook",
      cpc: channelCpc.facebook.value,
      sharePct: nonLinkedinPoolPct * (100 - googlePct) * (effFacebookFunnelPct / metaFunnelSubSplitSum),
    },
    {
      channelId: "instagram",
      cpc: channelCpc.instagram.value,
      sharePct: nonLinkedinPoolPct * (100 - googlePct) * (effInstagramFunnelPct / metaFunnelSubSplitSum),
    },
    {
      channelId: "linkedin",
      cpc: channelCpc.linkedin.value,
      sharePct: channelFeedsFunnel("linkedin") ? linkedinPct * 100 : 0,
    },
  ];

  const { requiredBudgetInr, blendedCacInr } = useMemo(
    () =>
      computeRequiredPaidBudget({
        targetConversions: Number(targetConversionsInput) || 0,
        template,
        stageAssumptions: stageAssumptionsPlain,
        channelWeights,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      targetConversionsInput,
      template,
      stageAssumptionsPlain,
      channelCpc,
      googlePct,
      searchPct,
      displayPct,
      youtubePct,
      facebookPct,
      usesGoogleUac,
      channelEnabled,
      linkedinPct,
      channelObjective,
    ]
  );

  const monthlyBudgetInr =
    planMode === "goal" ? requiredBudgetInr : cadence === "daily" ? budgetInputValue * 30 : budgetInputValue;

  const linkedinBudget = monthlyBudgetInr * (linkedinPct / 100);
  const googleMetaPoolInr = monthlyBudgetInr * (nonLinkedinPoolPct / 100);
  const googleBudget = googleMetaPoolInr * (googlePct / 100);
  const metaBudget = googleMetaPoolInr * ((100 - googlePct) / 100);
  const searchBudget = usesGoogleUac ? 0 : googleBudget * (effSearchPct / googleSubSplitSum);
  const displayBudget = usesGoogleUac ? 0 : googleBudget * (effDisplayPct / googleSubSplitSum);
  const youtubeBudget = usesGoogleUac ? 0 : googleBudget * (effYoutubePct / googleSubSplitSum);
  const uacBudget = usesGoogleUac ? googleBudget : 0;
  const facebookBudget = metaBudget * (effFacebookPct / metaSubSplitSum);
  const instagramBudget = metaBudget * (effInstagramPct / metaSubSplitSum);

  const channelSpend: Record<ChannelId, number> = useMemo(
    () => ({
      "google-search": searchBudget,
      "google-display": displayBudget,
      youtube: youtubeBudget,
      "google-uac": uacBudget,
      facebook: facebookBudget,
      instagram: instagramBudget,
      linkedin: linkedinBudget,
      seo: organic.seo.investmentInr,
      aso: organic.aso.investmentInr,
    }),
    [searchBudget, displayBudget, youtubeBudget, uacBudget, facebookBudget, instagramBudget, linkedinBudget, organic]
  );

  // Impressions = clicks ÷ CTR, purely derived from your own CPC/CTR
  // inputs — NOT sized from the audience reach estimate below. Shown next
  // to reach so the two can be sanity-checked against each other instead
  // of silently disagreeing (see AudienceCard's frequency note).
  const totalMonthlyImpressions = useMemo(() => {
    let total = 0;
    for (const channel of visibleChannels) {
      if (channel.isOrganic) continue;
      const spend = channelSpend[channel.id] ?? 0;
      const cpc = channelCpc[channel.id]?.value ?? 0;
      const ctr = channelCtr[channel.id]?.value ?? 0;
      if (spend > 0 && cpc > 0 && ctr > 0) {
        total += spend / cpc / (ctr / 100);
      }
    }
    return total;
  }, [visibleChannels, channelSpend, channelCpc, channelCtr]);

  const allForecasts = useMemo(() => {
    const map: Partial<Record<ChannelId, Record<ScenarioName, ChannelForecast>>> = {};
    for (const channel of visibleChannels) {
      // A channel bought against Views/Traffic/Engagement/Messages/Awareness
      // doesn't produce a "lead" — it has no place in the shared funnel, CAC,
      // or revenue math. Its own volume is computed separately in its panel
      // (ObjectiveChannelPanel) from a simple spend ÷ cost-per-unit.
      if (!channel.isOrganic && !channelFeedsFunnel(channel.id)) continue;
      if (channel.isOrganic) {
        const key = channel.id as "seo" | "aso";
        const state = organic[key];
        map[channel.id] = runThreeOrganicScenarios({
          channelId: channel.id,
          entryCount: state.entryVolume,
          spendInr: channelSpend[channel.id],
          template,
          stageAssumptions: stageAssumptionsPlain,
          revenuePerCustomerInr: economics.revenuePerCustomerInr,
          variableCostPerCustomerInr: economics.variableCostPerCustomerInr,
          contributionMarginPct: economics.contributionMarginPct,
          overrideConversionRatePct: state.overrideEnabled ? state.overrideRatePct : undefined,
        });
      } else {
        map[channel.id] = runThreePaidScenarios({
          channelId: channel.id,
          spendInr: channelSpend[channel.id],
          baseCpc: channelCpc[channel.id].value,
          template,
          stageAssumptions: stageAssumptionsPlain,
          revenuePerCustomerInr: economics.revenuePerCustomerInr,
          variableCostPerCustomerInr: economics.variableCostPerCustomerInr,
          contributionMarginPct: economics.contributionMarginPct,
        });
      }
    }
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibleChannels, channelSpend, organic, channelCpc, template, stageAssumptionsPlain, economics, channelObjective]);

  const baseForecasts = useMemo(() => {
    const map: Partial<Record<ChannelId, ChannelForecast>> = {};
    for (const channel of visibleChannels) {
      const f = allForecasts[channel.id];
      if (f) map[channel.id] = f.base;
    }
    return map;
  }, [visibleChannels, allForecasts]);

  const totals = useMemo(() => {
    let spend = 0;
    let conversions = 0;
    let revenue = 0;
    let contribution = 0;
    for (const channel of visibleChannels) {
      const f = baseForecasts[channel.id];
      if (!f) continue;
      spend += f.spendInr;
      conversions += f.valueCount;
      revenue += f.revenueInr;
      contribution += f.contributionInr;
    }
    return {
      spend,
      conversions,
      revenue,
      contribution,
      cac: spend > 0 && conversions > 0 ? spend / conversions : 0,
      gei: spend > 0 ? contribution / spend : 0,
    };
  }, [visibleChannels, baseForecasts]);

  // Every rupee actually allocated, including channels bought against a
  // non-"leads" objective (Views/Traffic/Engagement/Messages/Awareness) —
  // `totals.spend` above deliberately excludes those since they don't
  // produce a lead, but the money was still spent and should still show up
  // as invested.
  const totalAllSpendInr = useMemo(
    () => visibleChannels.reduce((sum, c) => sum + (channelSpend[c.id] ?? 0), 0),
    [visibleChannels, channelSpend]
  );

  // Volume for channels bought against a non-funnel objective — kept
  // entirely separate from Leads/CAC/Contribution above; see
  // ObjectiveChannelPanel's explanation of why.
  const objectiveResults = useMemo(
    () =>
      visibleChannels
        .filter((c) => !c.isOrganic && OBJECTIVE_CAPABLE_CHANNEL_IDS.has(c.id) && !channelFeedsFunnel(c.id))
        .map((c) => {
          const objective = getChannelObjectives(c.id).find((o) => o.id === getChannelObjectiveId(c.id))!;
          const spendInr = channelSpend[c.id] ?? 0;
          const costPerUnit = getObjectiveUnitCostValue(c.id);
          return {
            channelId: c.id,
            channelLabel: getChannel(c.id).label,
            objectiveLabel: objective.label,
            unitLabel: objective.unitLabel,
            spendInr,
            volume: spendInr > 0 && costPerUnit > 0 ? spendInr / costPerUnit : 0,
          };
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibleChannels, channelSpend, channelObjective, objectiveUnitCost]
  );

  const scenarioConversionTotals = useMemo(() => {
    const result: Record<ScenarioName, number> = { conservative: 0, base: 0, upside: 0 };
    for (const channel of visibleChannels) {
      const f = allForecasts[channel.id];
      if (!f) continue;
      result.conservative += f.conservative.valueCount;
      result.base += f.base.valueCount;
      result.upside += f.upside.valueCount;
    }
    return result;
  }, [visibleChannels, allForecasts]);

  const mediaSplit = visibleChannels.map((c) => ({ channelId: c.id, spendInr: channelSpend[c.id] ?? 0 }));

  const { constraints, bottleneck } = useMemo(
    () => assessConstraints(template, stageAssumptionsPlain),
    [template, stageAssumptionsPlain]
  );

  const efficiencyRows: ChannelEfficiency[] = useMemo(
    () =>
      rankChannelEfficiency(
        visibleChannels
          .filter((c) => baseForecasts[c.id] && (c.isOrganic || isChannelEnabled(c.id)))
          .map((c) => ({ channelId: c.id, isOrganic: c.isOrganic, forecast: baseForecasts[c.id]! }))
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [visibleChannels, baseForecasts, channelEnabled]
  );

  const benchmarkRows: BenchmarkRow[] = template.stages.map((stage) => ({
    benchmark: getFunnelBenchmark(stage.metricId),
    value: stageAssumptions[stage.metricId].value,
    valueClass: stageAssumptions[stage.metricId].valueClass,
    onChange: (v: number) => setStageValue(stage.metricId, v),
  }));

  const sources = [
    ...template.stages.map((stage) => {
      const b = getFunnelBenchmark(stage.metricId);
      return { label: b.label, source: b.source, tier: b.tier, sourceUrl: b.sourceUrl };
    }),
    ...visibleChannels
      .filter((c) => !c.isOrganic && isChannelEnabled(c.id) && channelFeedsFunnel(c.id))
      .map((c) => {
        const b = getChannelBenchmark(industry.group, c.id);
        return { label: `${c.label} CPC/CTR`, source: b.source, tier: b.tier };
      }),
    ...objectiveResults
      .map((r) => {
        const b = getUnitBenchmark(r.channelId as ChannelId, getChannelObjectiveId(r.channelId as ChannelId));
        return b ? { label: `${r.channelLabel} — ${r.objectiveLabel}`, source: b.source, tier: b.tier } : null;
      })
      .filter((s): s is { label: string; source: string; tier: 1 | 2 | 3 | 4 | 5 } => s != null),
  ];

  /** Objective picker (for channels that offer one) + the funnel/non-funnel panel body, shared across Google/Meta/LinkedIn tabs. */
  function renderChannelBody(channelId: ChannelId) {
    const objectives = getChannelObjectives(channelId);
    const currentObjectiveId = getChannelObjectiveId(channelId);
    const objectiveDef = objectives.find((o) => o.id === currentObjectiveId);

    return (
      <>
        {objectives.length > 0 && (
          <label className="mb-3 flex max-w-sm flex-col gap-1 text-sm">
            <span className="text-xs text-foreground/60">Campaign objective</span>
            <select
              value={currentObjectiveId}
              onChange={(e) => setChannelObjectiveId(channelId, e.target.value as ChannelObjectiveId)}
              className="rounded border border-line bg-background px-2 py-1.5"
            >
              {objectives.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        )}
        {objectiveDef && objectiveDef.id !== "leads" ? (
          <ObjectiveChannelPanel
            channelId={channelId}
            objective={objectiveDef}
            spendInr={channelSpend[channelId]}
            costPerUnit={getObjectiveUnitCostValue(channelId)}
            onCostPerUnitChange={(v) => setObjectiveUnitCostVal(channelId, v)}
          />
        ) : (
          <ChannelPanel
            channelId={channelId}
            label={getChannel(channelId).label}
            group={industry.group}
            spendInr={channelSpend[channelId]}
            cpcValue={channelCpc[channelId].value}
            cpcValueClass={channelCpc[channelId].valueClass}
            onCpcChange={(v) => setCpcValue(channelId, v)}
            ctrValue={channelCtr[channelId].value}
            ctrValueClass={channelCtr[channelId].valueClass}
            onCtrChange={(v) => setCtrValue(channelId, v)}
            template={template}
            stageAssumptions={stageAssumptionsPlain}
            onStageRateChange={setStageValue}
            targetCacInr={targetCacInr}
            revenuePerCustomerInr={economics.revenuePerCustomerInr}
            variableCostPerCustomerInr={economics.variableCostPerCustomerInr}
            contributionMarginPct={economics.contributionMarginPct}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <BusinessSetupPanel
        industries={INDUSTRIES}
        industryId={industryId}
        onIndustryChange={handleIndustryChange}
        platform={platform}
        onPlatformChange={handlePlatformChange}
        audienceStrategy={audienceStrategy}
        onAudienceStrategyChange={handleAudienceStrategyChange}
        availableGoals={availableGoals}
        goalId={goalId}
        onGoalChange={handleGoalChange}
        planMode={planMode}
        onPlanModeChange={setPlanMode}
        cadence={cadence}
        onCadenceChange={setCadence}
        budgetInputValue={budgetInputValue}
        onBudgetChange={setBudgetInputValue}
        monthlyBudgetInr={monthlyBudgetInr}
        targetConversionsInput={targetConversionsInput}
        onTargetConversionsChange={setTargetConversionsInput}
        computedBudgetInr={requiredBudgetInr}
        blendedCacInr={blendedCacInr}
        targetCacInput={targetCacInput}
        onTargetCacChange={setTargetCacInput}
        googlePct={googlePct}
        onGooglePctChange={setGooglePct}
        hasRevenue={template.hasRevenue}
        revenuePerCustomerInr={economics.revenuePerCustomerInr}
        onRevenueChange={(v) => setEconomics((prev) => ({ ...prev, revenuePerCustomerInr: v }))}
        variableCostPerCustomerInr={economics.variableCostPerCustomerInr}
        onVariableCostChange={(v) => setEconomics((prev) => ({ ...prev, variableCostPerCustomerInr: v }))}
        contributionMarginPct={economics.contributionMarginPct}
        onContributionMarginChange={(v) => setEconomics((prev) => ({ ...prev, contributionMarginPct: v }))}
        valueLabel={template.valueLabel}
      />

      <AudienceCard persona={audience} onChange={setAudience} monthlyImpressions={totalMonthlyImpressions} />

      <div className="flex gap-1 border-b border-line">
        {visibleTabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`border-b-2 px-3 py-2 text-sm font-medium ${
              activeTab === tab
                ? "border-brand text-brand-dark"
                : "border-transparent text-foreground/60 hover:text-foreground"
            }`}
          >
            {TAB_LABEL[tab]}
          </button>
        ))}
      </div>

      {activeTab === "google" && (
        <div className="flex flex-col gap-6">
          {isGoogleUacGoal(goalId) && (
            <div className="flex items-center gap-3 rounded-lg border border-line bg-surface p-3">
              <span className="text-xs text-foreground/60">Buying app installs on Google as</span>
              <div className="flex rounded-full border border-line p-0.5 text-xs">
                <button
                  type="button"
                  onClick={() => setPreferSplitForApp(false)}
                  className={`rounded-full px-3 py-1 ${!preferSplitForApp ? "bg-brand text-brand-contrast" : "text-foreground/60"}`}
                >
                  One blended App Campaign
                </button>
                <button
                  type="button"
                  onClick={() => setPreferSplitForApp(true)}
                  className={`rounded-full px-3 py-1 ${preferSplitForApp ? "bg-brand text-brand-contrast" : "text-foreground/60"}`}
                >
                  Search / Display / YouTube separately
                </button>
              </div>
            </div>
          )}
          {usesGoogleUac ? (
            <>
              <p className="text-sm text-foreground/70">
                Google sells app-acquisition and re-engagement campaigns as one blended <strong>App Campaign</strong>{" "}
                (formerly Universal App Campaigns) — it auto-places across Search, Display, YouTube and Discover
                rather than being bought separately, so there&apos;s one channel here instead of three by default.
                Prefer to manage them as separate line items? Switch above.
              </p>
              <ChannelPanel
                channelId="google-uac"
                label={getChannel("google-uac").label}
                group={industry.group}
                spendInr={channelSpend["google-uac"]}
                cpcValue={channelCpc["google-uac"].value}
                cpcValueClass={channelCpc["google-uac"].valueClass}
                onCpcChange={(v) => setCpcValue("google-uac", v)}
                ctrValue={channelCtr["google-uac"].value}
                ctrValueClass={channelCtr["google-uac"].valueClass}
                onCtrChange={(v) => setCtrValue("google-uac", v)}
                template={template}
                stageAssumptions={stageAssumptionsPlain}
                onStageRateChange={setStageValue}
                targetCacInr={targetCacInr}
                revenuePerCustomerInr={economics.revenuePerCustomerInr}
                variableCostPerCustomerInr={economics.variableCostPerCustomerInr}
                contributionMarginPct={economics.contributionMarginPct}
              />
            </>
          ) : (
            <>
              <div className="rounded-lg border border-line bg-surface p-4">
                <span className="text-xs text-foreground/60">
                  Split of the {formatInrCompact(googleBudget)}/month Google budget — turn off any channel you
                  don&apos;t want to run; its share goes to the ones still on.
                </span>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <SubSplitField
                    label="Search"
                    value={searchPct}
                    onChange={setSearchPct}
                    budget={searchBudget}
                    enabled={isChannelEnabled("google-search")}
                    onToggleEnabled={() => toggleChannelEnabled("google-search")}
                  />
                  <SubSplitField
                    label="Display"
                    value={displayPct}
                    onChange={setDisplayPct}
                    budget={displayBudget}
                    enabled={isChannelEnabled("google-display")}
                    onToggleEnabled={() => toggleChannelEnabled("google-display")}
                  />
                  <SubSplitField
                    label="YouTube"
                    value={youtubePct}
                    onChange={setYoutubePct}
                    budget={youtubeBudget}
                    enabled={isChannelEnabled("youtube")}
                    onToggleEnabled={() => toggleChannelEnabled("youtube")}
                  />
                </div>
              </div>
              {(["google-search", "google-display", "youtube"] as ChannelId[]).map((channelId) =>
                isChannelEnabled(channelId) ? (
                  <div key={channelId} className="border-t border-line pt-6 first:border-0 first:pt-0">
                    <h3 className="font-display text-base font-semibold text-foreground">{getChannel(channelId).label}</h3>
                    <div className="mt-3">{renderChannelBody(channelId)}</div>
                  </div>
                ) : (
                  <DisabledChannelNote
                    key={channelId}
                    label={getChannel(channelId).label}
                    onEnable={() => toggleChannelEnabled(channelId)}
                  />
                )
              )}
            </>
          )}
        </div>
      )}

      {activeTab === "meta" && (
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-line bg-surface p-4">
            <span className="text-xs text-foreground/60">
              Split of the {formatInrCompact(metaBudget)}/month Meta budget — turn off any channel you don&apos;t
              want to run; its share goes to the ones still on.
            </span>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <SubSplitField
                label="Facebook"
                value={facebookPct}
                onChange={setFacebookPct}
                budget={facebookBudget}
                enabled={isChannelEnabled("facebook")}
                onToggleEnabled={() => toggleChannelEnabled("facebook")}
              />
              <SubSplitField
                label="Instagram"
                value={100 - facebookPct}
                onChange={(v) => setFacebookPct(100 - v)}
                budget={instagramBudget}
                enabled={isChannelEnabled("instagram")}
                onToggleEnabled={() => toggleChannelEnabled("instagram")}
              />
            </div>
          </div>
          {(["facebook", "instagram"] as ChannelId[]).map((channelId) =>
            isChannelEnabled(channelId) ? (
              <div key={channelId} className="border-t border-line pt-6 first:border-0 first:pt-0">
                <h3 className="font-display text-base font-semibold text-foreground">{getChannel(channelId).label}</h3>
                <div className="mt-3">{renderChannelBody(channelId)}</div>
              </div>
            ) : (
              <DisabledChannelNote
                key={channelId}
                label={getChannel(channelId).label}
                onEnable={() => toggleChannelEnabled(channelId)}
              />
            )
          )}
        </div>
      )}

      {activeTab === "linkedin" && (
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-line bg-surface p-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-foreground/60">
                LinkedIn share of TOTAL monthly budget — taken off the top; Google and Meta split whatever&apos;s
                left, unchanged.
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0}
                  max={60}
                  value={linkedinPct}
                  onChange={(e) => setLinkedinPct(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="w-32 shrink-0 text-right text-sm font-semibold tabular-nums text-foreground">
                  {linkedinPct}% · {formatInrCompact(linkedinBudget)}/month
                </span>
              </div>
            </label>
            <p className="mt-2 text-xs text-foreground/50">
              LinkedIn CPC typically runs 5–15× Google/Meta&apos;s in India (₹150–650 vs. single/double digits) —
              only worth allocating here when your product sells to companies/professionals, not consumers.
            </p>
          </div>
          {linkedinPct === 0 ? (
            <div className="rounded-lg border border-dashed border-line bg-surface/50 px-4 py-6 text-center text-sm text-foreground/50">
              No budget allocated to LinkedIn yet — move the slider above to plan a LinkedIn campaign.
            </div>
          ) : (
            renderChannelBody("linkedin")
          )}
        </div>
      )}

      {activeTab === "seo" && (
        <OrganicChannelPanel
          channelId="seo"
          label="SEO"
          entryVolumeLabel="Estimated organic clicks"
          entryVolume={organic.seo.entryVolume}
          onEntryVolumeChange={(v) => setOrganicField("seo", "entryVolume", v)}
          investmentInr={organic.seo.investmentInr}
          onInvestmentChange={(v) => setOrganicField("seo", "investmentInr", v)}
          overrideEnabled={organic.seo.overrideEnabled}
          onOverrideEnabledChange={(v) => setOrganicField("seo", "overrideEnabled", v)}
          overrideRatePct={organic.seo.overrideRatePct}
          onOverrideRatePctChange={(v) => setOrganicField("seo", "overrideRatePct", v)}
          template={template}
          stageAssumptions={stageAssumptionsPlain}
          onStageRateChange={setStageValue}
          revenuePerCustomerInr={economics.revenuePerCustomerInr}
          variableCostPerCustomerInr={economics.variableCostPerCustomerInr}
          contributionMarginPct={economics.contributionMarginPct}
        />
      )}

      {activeTab === "aso" && (
        <OrganicChannelPanel
          channelId="aso"
          label="ASO"
          entryVolumeLabel="Estimated organic store listing visits"
          entryVolume={organic.aso.entryVolume}
          onEntryVolumeChange={(v) => setOrganicField("aso", "entryVolume", v)}
          investmentInr={organic.aso.investmentInr}
          onInvestmentChange={(v) => setOrganicField("aso", "investmentInr", v)}
          overrideEnabled={organic.aso.overrideEnabled}
          onOverrideEnabledChange={(v) => setOrganicField("aso", "overrideEnabled", v)}
          overrideRatePct={organic.aso.overrideRatePct}
          onOverrideRatePctChange={(v) => setOrganicField("aso", "overrideRatePct", v)}
          template={template}
          stageAssumptions={stageAssumptionsPlain}
          onStageRateChange={setStageValue}
          revenuePerCustomerInr={economics.revenuePerCustomerInr}
          variableCostPerCustomerInr={economics.variableCostPerCustomerInr}
          contributionMarginPct={economics.contributionMarginPct}
        />
      )}

      {activeTab === "summary" && (
        <SummaryPanel
          totalSpendInr={totalAllSpendInr}
          totalConversions={totals.conversions}
          blendedCacInr={totals.cac}
          totalRevenueInr={totals.revenue}
          totalContributionInr={totals.contribution}
          gei={totals.gei}
          hasRevenue={template.hasRevenue}
          valueLabel={template.valueLabel}
          targetCacInr={targetCacInr}
          constraints={constraints}
          bottleneck={bottleneck}
          efficiencyRows={efficiencyRows}
          benchmarkRows={benchmarkRows}
          sources={sources}
          mediaSplit={mediaSplit}
          scenarioConversionTotals={scenarioConversionTotals}
          objectiveResults={objectiveResults}
        />
      )}

      <p className="border-t border-line pt-4 text-xs text-foreground/50">
        Deterministic model — every figure above is either your input, a benchmark from the library, or a
        calculation from the two. Post-click funnel assumptions are shared across every channel; only CPC
        and volume are channel-specific. This is a planning simulator, not a guarantee of outcomes.
      </p>
    </div>
  );
}

function SubSplitField({
  label,
  value,
  onChange,
  budget,
  enabled = true,
  onToggleEnabled,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  budget: number;
  enabled?: boolean;
  onToggleEnabled?: () => void;
}) {
  return (
    <label className={`flex flex-col gap-1 text-sm ${enabled ? "" : "opacity-50"}`}>
      <span className="flex items-center justify-between text-xs text-foreground/60">
        <span>
          {label} ({value}%)
        </span>
        {onToggleEnabled && (
          <button
            type="button"
            onClick={onToggleEnabled}
            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              enabled ? "bg-brand/10 text-brand-dark" : "bg-neutral-200 text-foreground/50"
            }`}
          >
            {enabled ? "On" : "Off"}
          </button>
        )}
      </span>
      <input
        type="number"
        value={value}
        disabled={!enabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded border border-line bg-background px-2 py-1 tabular-nums disabled:cursor-not-allowed"
      />
      <span className="text-xs text-foreground/50">
        {enabled ? `${formatInrCompact(budget)}/month` : "Not running — budget redistributed"}
      </span>
    </label>
  );
}

/** Compact stand-in for a channel's full panel when it's switched off. */
function DisabledChannelNote({ label, onEnable }: { label: string; onEnable: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-dashed border-line bg-surface/50 px-4 py-3 text-sm text-foreground/50">
      <span>{label} is turned off — no budget allocated, not counted in this plan.</span>
      <button type="button" onClick={onEnable} className="font-semibold text-brand hover:underline">
        Turn back on
      </button>
    </div>
  );
}
