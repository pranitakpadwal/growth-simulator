"use client";

import { useMemo, useState } from "react";
import type { ChannelId, ChannelTabId, GoalId, IndustryId, ValueClass } from "@/lib/growth-simulator/types";
import { GOALS, INDUSTRIES, channelsForGoal, getChannel, getIndustry, resolveFunnelTemplate } from "@/lib/growth-simulator/catalog";
import { getChannelBenchmark, getFunnelBenchmark } from "@/lib/growth-simulator/benchmarks";
import { defaultEconomics, type EconomicsDefaults } from "@/lib/growth-simulator/defaults";
import {
  assessConstraints,
  rankChannelEfficiency,
  runThreeOrganicScenarios,
  runThreePaidScenarios,
  type ChannelEfficiency,
} from "@/lib/growth-simulator/engine";
import type { ChannelForecast, BudgetCadence } from "@/lib/growth-simulator/types";
import { formatInrCompact } from "@/lib/growth-simulator/format";
import type { BenchmarkRow } from "./BenchmarkTable";
import BusinessSetupPanel from "./BusinessSetupPanel";
import ChannelPanel from "./ChannelPanel";
import OrganicChannelPanel from "./OrganicChannelPanel";
import SummaryPanel from "./SummaryPanel";

const PAID_CHANNEL_IDS: ChannelId[] = ["google-search", "google-display", "youtube", "meta"];

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

const TAB_LABEL: Record<ChannelTabId | "summary", string> = {
  google: "Google",
  meta: "Meta",
  seo: "SEO",
  aso: "ASO",
  summary: "Summary",
};

export default function GrowthSimulator() {
  const [industryId, setIndustryId] = useState<IndustryId>("personal-loans");
  const [goalId, setGoalId] = useState<GoalId>(getIndustry("personal-loans").defaultGoalId);
  const [cadence, setCadence] = useState<BudgetCadence>("monthly");
  const [budgetInputValue, setBudgetInputValue] = useState(500000); // ₹5L
  const [targetCacInput, setTargetCacInput] = useState("");
  const [googlePct, setGooglePct] = useState(70);
  const [searchPct, setSearchPct] = useState(55);
  const [displayPct, setDisplayPct] = useState(20);
  const [youtubePct, setYoutubePct] = useState(25);
  const [activeTab, setActiveTab] = useState<ChannelTabId | "summary">("google");

  const initialTemplate = useMemo(() => resolveFunnelTemplate(industryId, goalId), [industryId, goalId]);
  const [channelCpc, setChannelCpc] = useState(() => initialCpcMap(getIndustry(industryId).group));
  const [stageAssumptions, setStageAssumptions] = useState(() =>
    initialStageMap(initialTemplate.id, initialTemplate.stages)
  );
  const [economics, setEconomics] = useState<EconomicsDefaults>(() => defaultEconomics(industryId));
  const [organic, setOrganic] = useState({
    seo: { entryVolume: 20000, investmentInr: 0 },
    aso: { entryVolume: 5000, investmentInr: 0 },
  });

  const industry = useMemo(() => getIndustry(industryId), [industryId]);
  const availableGoals = useMemo(() => industry.goalIds.map((id) => GOALS[id]), [industry]);
  const template = useMemo(() => resolveFunnelTemplate(industryId, goalId), [industryId, goalId]);
  const visibleChannels = useMemo(() => channelsForGoal(goalId), [goalId]);
  const visibleTabs = useMemo(() => {
    const tabs = Array.from(new Set(visibleChannels.map((c) => c.tab)));
    return [...tabs, "summary" as const];
  }, [visibleChannels]);

  function handleIndustryChange(id: string) {
    const nextIndustry = getIndustry(id);
    const nextGoalId = nextIndustry.defaultGoalId;
    const nextTemplate = resolveFunnelTemplate(id, nextGoalId);
    setIndustryId(nextIndustry.id);
    setGoalId(nextGoalId);
    setEconomics(defaultEconomics(nextIndustry.id));
    setChannelCpc(initialCpcMap(nextIndustry.group));
    setStageAssumptions(initialStageMap(nextTemplate.id, nextTemplate.stages));
    setActiveTab(channelsForGoal(nextGoalId)[0]?.tab ?? "summary");
  }

  function handleGoalChange(id: string) {
    const nextTemplate = resolveFunnelTemplate(industryId, id);
    setGoalId(id as GoalId);
    setStageAssumptions(initialStageMap(nextTemplate.id, nextTemplate.stages));
    setActiveTab(channelsForGoal(id)[0]?.tab ?? "summary");
  }

  function setStageValue(metricId: string, value: number) {
    setStageAssumptions((prev) => ({ ...prev, [metricId]: { value, valueClass: "actual" } }));
  }

  function setCpcValue(channelId: ChannelId, value: number) {
    setChannelCpc((prev) => ({ ...prev, [channelId]: { value, valueClass: "actual" } }));
  }

  const monthlyBudgetInr = cadence === "daily" ? budgetInputValue * 30 : budgetInputValue;
  const targetCacInr = targetCacInput.trim() === "" ? null : Number(targetCacInput);

  const googleBudget = monthlyBudgetInr * (googlePct / 100);
  const metaBudget = monthlyBudgetInr * ((100 - googlePct) / 100);
  const subSplitSum = searchPct + displayPct + youtubePct || 1;
  const searchBudget = googleBudget * (searchPct / subSplitSum);
  const displayBudget = googleBudget * (displayPct / subSplitSum);
  const youtubeBudget = googleBudget * (youtubePct / subSplitSum);

  const channelSpend: Record<ChannelId, number> = useMemo(
    () => ({
      "google-search": searchBudget,
      "google-display": displayBudget,
      youtube: youtubeBudget,
      meta: metaBudget,
      seo: organic.seo.investmentInr,
      aso: organic.aso.investmentInr,
    }),
    [searchBudget, displayBudget, youtubeBudget, metaBudget, organic]
  );

  const stageAssumptionsPlain = useMemo(() => {
    const plain: Record<string, number> = {};
    for (const [metricId, a] of Object.entries(stageAssumptions)) plain[metricId] = a.value;
    return plain;
  }, [stageAssumptions]);

  const baseForecasts = useMemo(() => {
    const map: Partial<Record<ChannelId, ChannelForecast>> = {};
    for (const channel of visibleChannels) {
      if (channel.isOrganic) {
        const entryVolume = channel.id === "seo" ? organic.seo.entryVolume : organic.aso.entryVolume;
        map[channel.id] = runThreeOrganicScenarios({
          channelId: channel.id,
          entryCount: entryVolume,
          spendInr: channelSpend[channel.id],
          template,
          stageAssumptions: stageAssumptionsPlain,
          revenuePerCustomerInr: economics.revenuePerCustomerInr,
          variableCostPerCustomerInr: economics.variableCostPerCustomerInr,
          contributionMarginPct: economics.contributionMarginPct,
        }).base;
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
        }).base;
      }
    }
    return map;
  }, [visibleChannels, channelSpend, organic, channelCpc, template, stageAssumptionsPlain, economics]);

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

  return (
    <div className="flex flex-col gap-6">
      <BusinessSetupPanel
        industries={INDUSTRIES}
        industryId={industryId}
        onIndustryChange={handleIndustryChange}
        availableGoals={availableGoals}
        goalId={goalId}
        onGoalChange={handleGoalChange}
        cadence={cadence}
        onCadenceChange={setCadence}
        budgetInputValue={budgetInputValue}
        onBudgetChange={setBudgetInputValue}
        monthlyBudgetInr={monthlyBudgetInr}
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
        </div>
      )}

      {activeTab === "meta" && (
        <ChannelPanel
          channelId="meta"
          label="Meta"
          group={industry.group}
          spendInr={channelSpend.meta}
          cpcValue={channelCpc.meta.value}
          cpcValueClass={channelCpc.meta.valueClass}
          onCpcChange={(v) => setCpcValue("meta", v)}
          template={template}
          stageAssumptions={stageAssumptionsPlain}
          targetCacInr={targetCacInr}
          revenuePerCustomerInr={economics.revenuePerCustomerInr}
          variableCostPerCustomerInr={economics.variableCostPerCustomerInr}
          contributionMarginPct={economics.contributionMarginPct}
        />
      )}

      {activeTab === "seo" && (
        <OrganicChannelPanel
          channelId="seo"
          label="SEO"
          entryVolumeLabel="Estimated organic clicks"
          entryVolume={organic.seo.entryVolume}
          onEntryVolumeChange={(v) => setOrganic((prev) => ({ ...prev, seo: { ...prev.seo, entryVolume: v } }))}
          investmentInr={organic.seo.investmentInr}
          onInvestmentChange={(v) => setOrganic((prev) => ({ ...prev, seo: { ...prev.seo, investmentInr: v } }))}
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
          onEntryVolumeChange={(v) => setOrganic((prev) => ({ ...prev, aso: { ...prev.aso, entryVolume: v } }))}
          investmentInr={organic.aso.investmentInr}
          onInvestmentChange={(v) => setOrganic((prev) => ({ ...prev, aso: { ...prev.aso, investmentInr: v } }))}
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
