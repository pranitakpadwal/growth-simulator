"use client";

import { useMemo, useState } from "react";
import type { ChannelId, ChannelTabId, GoalId, IndustryId, Platform, ValueClass } from "@/lib/growth-simulator/types";
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
import { formatInrCompact } from "@/lib/growth-simulator/format";
import type { BenchmarkRow } from "./BenchmarkTable";
import BusinessSetupPanel, { type PlanMode } from "./BusinessSetupPanel";
import AudienceCard from "./AudienceCard";
import ChannelPanel from "./ChannelPanel";
import OrganicChannelPanel from "./OrganicChannelPanel";
import SummaryPanel from "./SummaryPanel";

const PAID_CHANNEL_IDS: ChannelId[] = ["google-search", "google-display", "youtube", "google-uac", "facebook", "instagram"];

function initialCpcMap(group: "finance" | "app"): Record<ChannelId, { value: number; valueClass: ValueClass }> {
  const map = {} as Record<ChannelId, { value: number; valueClass: ValueClass }>;
  for (const id of PAID_CHANNEL_IDS) {
    map[id] = { value: getChannelBenchmark(group, id).cpc, valueClass: "benchmark" };
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
  seo: "SEO",
  aso: "ASO",
  summary: "Summary",
};

export default function GrowthSimulator() {
  const [industryId, setIndustryId] = useState<IndustryId>("personal-loans");
  const [platform, setPlatform] = useState<Platform>(getIndustry("personal-loans").defaultPlatform);
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
  const [activeTab, setActiveTab] = useState<ChannelTabId | "summary">("google");

  const initialTemplate = useMemo(() => resolveFunnelTemplate(industryId, goalId), [industryId, goalId]);
  const [channelCpc, setChannelCpc] = useState(() => initialCpcMap(getIndustry(industryId).group));
  const [stageAssumptions, setStageAssumptions] = useState(() =>
    initialStageMap(initialTemplate.id, initialTemplate.stages)
  );
  const [economics, setEconomics] = useState<EconomicsDefaults>(() => defaultEconomics(industryId, goalId));
  const [organic, setOrganic] = useState<{ seo: OrganicState; aso: OrganicState }>({
    seo: { entryVolume: 20000, investmentInr: 0, overrideEnabled: false, overrideRatePct: 5 },
    aso: { entryVolume: 5000, investmentInr: 0, overrideEnabled: false, overrideRatePct: 8 },
  });
  const [audience, setAudience] = useState<AudiencePersona>(() => getAudiencePersona(industryId));

  const industry = useMemo(() => getIndustry(industryId), [industryId]);
  const availableGoals = useMemo(() => goalsForPlatform(industry, platform), [industry, platform]);
  const template = useMemo(() => resolveFunnelTemplate(industryId, goalId), [industryId, goalId]);
  const usesGoogleUac = isGoogleUacGoal(goalId);
  const visibleChannels = useMemo(() => channelsForGoal(goalId), [goalId]);
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
    setEconomics(defaultEconomics(nextIndustry.id, nextGoalId));
    setAudience(getAudiencePersona(nextIndustry.id));
    setChannelCpc(initialCpcMap(nextIndustry.group));
    setStageAssumptions(initialStageMap(nextTemplate.id, nextTemplate.stages));
    setActiveTab(channelsForGoal(nextGoalId)[0]?.tab ?? "summary");
  }

  function handlePlatformChange(next: Platform) {
    const nextGoalId = goalsForPlatform(industry, next)[0].id;
    const nextTemplate = resolveFunnelTemplate(industryId, nextGoalId);
    setPlatform(next);
    setGoalId(nextGoalId);
    setEconomics(defaultEconomics(industryId, nextGoalId));
    setStageAssumptions(initialStageMap(nextTemplate.id, nextTemplate.stages));
    setActiveTab(channelsForGoal(nextGoalId)[0]?.tab ?? "summary");
  }

  function handleGoalChange(id: string) {
    const nextTemplate = resolveFunnelTemplate(industryId, id);
    setGoalId(id as GoalId);
    setEconomics(defaultEconomics(industryId, id as GoalId));
    setStageAssumptions(initialStageMap(nextTemplate.id, nextTemplate.stages));
    setActiveTab(channelsForGoal(id)[0]?.tab ?? "summary");
  }

  function setStageValue(metricId: string, value: number) {
    setStageAssumptions((prev) => ({ ...prev, [metricId]: { value, valueClass: "actual" } }));
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

  const googleSubSplitSum = searchPct + displayPct + youtubePct || 1;
  const channelWeights: PaidChannelWeight[] = [
    {
      channelId: "google-search",
      cpc: channelCpc["google-search"].value,
      sharePct: usesGoogleUac ? 0 : googlePct * (searchPct / googleSubSplitSum),
    },
    {
      channelId: "google-display",
      cpc: channelCpc["google-display"].value,
      sharePct: usesGoogleUac ? 0 : googlePct * (displayPct / googleSubSplitSum),
    },
    {
      channelId: "youtube",
      cpc: channelCpc.youtube.value,
      sharePct: usesGoogleUac ? 0 : googlePct * (youtubePct / googleSubSplitSum),
    },
    { channelId: "google-uac", cpc: channelCpc["google-uac"].value, sharePct: usesGoogleUac ? googlePct : 0 },
    { channelId: "facebook", cpc: channelCpc.facebook.value, sharePct: (100 - googlePct) * (facebookPct / 100) },
    {
      channelId: "instagram",
      cpc: channelCpc.instagram.value,
      sharePct: (100 - googlePct) * ((100 - facebookPct) / 100),
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
    ]
  );

  const monthlyBudgetInr =
    planMode === "goal" ? requiredBudgetInr : cadence === "daily" ? budgetInputValue * 30 : budgetInputValue;

  const googleBudget = monthlyBudgetInr * (googlePct / 100);
  const metaBudget = monthlyBudgetInr * ((100 - googlePct) / 100);
  const searchBudget = usesGoogleUac ? 0 : googleBudget * (searchPct / googleSubSplitSum);
  const displayBudget = usesGoogleUac ? 0 : googleBudget * (displayPct / googleSubSplitSum);
  const youtubeBudget = usesGoogleUac ? 0 : googleBudget * (youtubePct / googleSubSplitSum);
  const uacBudget = usesGoogleUac ? googleBudget : 0;
  const facebookBudget = metaBudget * (facebookPct / 100);
  const instagramBudget = metaBudget * ((100 - facebookPct) / 100);

  const channelSpend: Record<ChannelId, number> = useMemo(
    () => ({
      "google-search": searchBudget,
      "google-display": displayBudget,
      youtube: youtubeBudget,
      "google-uac": uacBudget,
      facebook: facebookBudget,
      instagram: instagramBudget,
      seo: organic.seo.investmentInr,
      aso: organic.aso.investmentInr,
    }),
    [searchBudget, displayBudget, youtubeBudget, uacBudget, facebookBudget, instagramBudget, organic]
  );

  const allForecasts = useMemo(() => {
    const map: Partial<Record<ChannelId, Record<ScenarioName, ChannelForecast>>> = {};
    for (const channel of visibleChannels) {
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
  }, [visibleChannels, channelSpend, organic, channelCpc, template, stageAssumptionsPlain, economics]);

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
          .filter((c) => baseForecasts[c.id])
          .map((c) => ({ channelId: c.id, isOrganic: c.isOrganic, forecast: baseForecasts[c.id]! }))
      ),
    [visibleChannels, baseForecasts]
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
      .filter((c) => !c.isOrganic)
      .map((c) => {
        const b = getChannelBenchmark(industry.group, c.id);
        return { label: `${c.label} CPC/CTR`, source: b.source, tier: b.tier };
      }),
  ];

  return (
    <div className="flex flex-col gap-6">
      <BusinessSetupPanel
        industries={INDUSTRIES}
        industryId={industryId}
        onIndustryChange={handleIndustryChange}
        platform={platform}
        onPlatformChange={handlePlatformChange}
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

      <AudienceCard persona={audience} onChange={setAudience} />

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
          {usesGoogleUac ? (
            <>
              <p className="text-sm text-foreground/70">
                Google sells app-acquisition and re-engagement campaigns as one blended <strong>App Campaign</strong>{" "}
                (formerly Universal App Campaigns) — it auto-places across Search, Display, YouTube and Discover
                rather than being bought separately, so there&apos;s one channel here instead of three.
              </p>
              <ChannelPanel
                channelId="google-uac"
                label={getChannel("google-uac").label}
                group={industry.group}
                spendInr={channelSpend["google-uac"]}
                cpcValue={channelCpc["google-uac"].value}
                cpcValueClass={channelCpc["google-uac"].valueClass}
                onCpcChange={(v) => setCpcValue("google-uac", v)}
                template={template}
                stageAssumptions={stageAssumptionsPlain}
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
                  Split of the {formatInrCompact(googleBudget)}/month Google budget
                </span>
                <div className="mt-2 grid grid-cols-3 gap-3">
                  <SubSplitField label="Search" value={searchPct} onChange={setSearchPct} budget={searchBudget} />
                  <SubSplitField label="Display" value={displayPct} onChange={setDisplayPct} budget={displayBudget} />
                  <SubSplitField label="YouTube" value={youtubePct} onChange={setYoutubePct} budget={youtubeBudget} />
                </div>
              </div>
              {(["google-search", "google-display", "youtube"] as ChannelId[]).map((channelId) => (
                <div key={channelId} className="border-t border-line pt-6 first:border-0 first:pt-0">
                  <h3 className="font-display text-base font-semibold text-foreground">{getChannel(channelId).label}</h3>
                  <div className="mt-3">
                    <ChannelPanel
                      channelId={channelId}
                      label={getChannel(channelId).label}
                      group={industry.group}
                      spendInr={channelSpend[channelId]}
                      cpcValue={channelCpc[channelId].value}
                      cpcValueClass={channelCpc[channelId].valueClass}
                      onCpcChange={(v) => setCpcValue(channelId, v)}
                      template={template}
                      stageAssumptions={stageAssumptionsPlain}
                      targetCacInr={targetCacInr}
                      revenuePerCustomerInr={economics.revenuePerCustomerInr}
                      variableCostPerCustomerInr={economics.variableCostPerCustomerInr}
                      contributionMarginPct={economics.contributionMarginPct}
                    />
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {activeTab === "meta" && (
        <div className="flex flex-col gap-6">
          <div className="rounded-lg border border-line bg-surface p-4">
            <span className="text-xs text-foreground/60">
              Split of the {formatInrCompact(metaBudget)}/month Meta budget
            </span>
            <div className="mt-2 grid grid-cols-2 gap-3">
              <SubSplitField label="Facebook" value={facebookPct} onChange={setFacebookPct} budget={facebookBudget} />
              <SubSplitField
                label="Instagram"
                value={100 - facebookPct}
                onChange={(v) => setFacebookPct(100 - v)}
                budget={instagramBudget}
              />
            </div>
          </div>
          {(["facebook", "instagram"] as ChannelId[]).map((channelId) => (
            <div key={channelId} className="border-t border-line pt-6 first:border-0 first:pt-0">
              <h3 className="font-display text-base font-semibold text-foreground">{getChannel(channelId).label}</h3>
              <div className="mt-3">
                <ChannelPanel
                  channelId={channelId}
                  label={getChannel(channelId).label}
                  group={industry.group}
                  spendInr={channelSpend[channelId]}
                  cpcValue={channelCpc[channelId].value}
                  cpcValueClass={channelCpc[channelId].valueClass}
                  onCpcChange={(v) => setCpcValue(channelId, v)}
                  template={template}
                  stageAssumptions={stageAssumptionsPlain}
                  targetCacInr={targetCacInr}
                  revenuePerCustomerInr={economics.revenuePerCustomerInr}
                  variableCostPerCustomerInr={economics.variableCostPerCustomerInr}
                  contributionMarginPct={economics.contributionMarginPct}
                />
              </div>
            </div>
          ))}
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
          revenuePerCustomerInr={economics.revenuePerCustomerInr}
          variableCostPerCustomerInr={economics.variableCostPerCustomerInr}
          contributionMarginPct={economics.contributionMarginPct}
        />
      )}

      {activeTab === "summary" && (
        <SummaryPanel
          totalSpendInr={totals.spend}
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
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  budget: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs text-foreground/60">
        {label} ({value}%)
      </span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded border border-line bg-background px-2 py-1 tabular-nums"
      />
      <span className="text-xs text-foreground/50">{formatInrCompact(budget)}/month</span>
    </label>
  );
}
