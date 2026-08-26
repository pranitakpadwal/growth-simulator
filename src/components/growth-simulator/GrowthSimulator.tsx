"use client";

import { useMemo, useState } from "react";
import type { FunnelInputs, ValueClass } from "@/lib/growth-simulator/types";
import { PERSONAL_LOAN_GROWTH_CHANNELS, getBenchmark } from "@/lib/growth-simulator/benchmarks";
import { assessConstraints, computeGEI, computeNextRupee, runThreeCaseForecast } from "@/lib/growth-simulator/engine";
import { formatInr, formatInrCompact, formatNumber } from "@/lib/growth-simulator/format";
import BenchmarkTable, { type BenchmarkRow } from "./BenchmarkTable";
import ScenarioTable from "./ScenarioTable";
import ConstraintCard from "./ConstraintCard";
import NextRupeeTable from "./NextRupeeTable";

const BENCHMARKED_FIELDS = [
  "cpc",
  "ctr",
  "landingCvr",
  "qualificationRate",
  "approvalRate",
  "disbursalRate",
] as const;
type BenchmarkedField = (typeof BENCHMARKED_FIELDS)[number];

const COST_METRICS = new Set<BenchmarkedField>(["cpc"]);

function defaultInputs(): FunnelInputs {
  return {
    budgetInr: 5 * 1e7, // ₹5 Cr
    cpc: getBenchmark("cpc").median,
    ctr: getBenchmark("ctr").median,
    addressableImpressions: 8_000_000,
    landingCvr: getBenchmark("landingCvr").median,
    qualificationRate: getBenchmark("qualificationRate").median,
    approvalRate: getBenchmark("approvalRate").median,
    disbursalRate: getBenchmark("disbursalRate").median,
    revenuePerCustomerInr: 6000,
    variableCostPerCustomerInr: 400,
    contributionMarginPct: 70,
  };
}

export default function GrowthSimulator() {
  const [inputs, setInputs] = useState<FunnelInputs>(defaultInputs);
  const [valueClasses, setValueClasses] = useState<Record<BenchmarkedField, ValueClass>>({
    cpc: "benchmark",
    ctr: "benchmark",
    landingCvr: "benchmark",
    qualificationRate: "benchmark",
    approvalRate: "benchmark",
    disbursalRate: "benchmark",
  });

  function setField<K extends keyof FunnelInputs>(field: K, value: number) {
    setInputs((prev) => ({ ...prev, [field]: value }));
    if ((BENCHMARKED_FIELDS as readonly string[]).includes(field as string)) {
      setValueClasses((prev) => ({ ...prev, [field as BenchmarkedField]: "actual" }));
    }
  }

  const forecasts = useMemo(() => runThreeCaseForecast(inputs), [inputs]);
  const { constraints, bottleneck } = useMemo(() => assessConstraints(inputs), [inputs]);
  const nextRupee = useMemo(() => computeNextRupee(PERSONAL_LOAN_GROWTH_CHANNELS), []);
  const gei = useMemo(
    () => computeGEI(forecasts.base.contributionInr, forecasts.base.spendInr),
    [forecasts]
  );

  const modelQuality = useMemo(() => {
    const overridden = BENCHMARKED_FIELDS.filter((f) => valueClasses[f] === "actual").length;
    const actualPct = Math.round((overridden / BENCHMARKED_FIELDS.length) * 100);
    return { actualPct, benchmarkPct: 100 - actualPct };
  }, [valueClasses]);

  const benchmarkRows: BenchmarkRow[] = BENCHMARKED_FIELDS.map((field) => ({
    benchmark: getBenchmark(field),
    value: inputs[field],
    valueClass: valueClasses[field],
    onChange: (v) => setField(field, v),
    isCostMetric: COST_METRICS.has(field),
  }));

  return (
    <div className="flex flex-col gap-8">
      {/* CXO summary strip — PRD §24 */}
      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <SummaryStat label="Investment" value={formatInrCompact(inputs.budgetInr)} />
        <SummaryStat
          label="Forecast customers"
          value={`${formatNumber(forecasts.conservative.fundedCustomers)}–${formatNumber(
            forecasts.upside.fundedCustomers
          )}`}
          sub={`Base: ${formatNumber(forecasts.base.fundedCustomers)}`}
        />
        <SummaryStat label="Forecast CAC" value={formatInrCompact(forecasts.base.cacInr)} />
        <SummaryStat label="Business value" value={formatInrCompact(forecasts.base.contributionInr)} sub="Contribution, base case" />
        <SummaryStat label="GEI" value={gei.toFixed(2)} sub="Contribution ₹ per ₹ spent" />
        <SummaryStat label="Model quality" value={`${modelQuality.actualPct}%`} sub="Inputs from your data" />
      </section>

      {/* Business inputs — PRD §42 minimum required inputs */}
      <section className="rounded-lg border border-line bg-surface p-4">
        <h2 className="font-display text-lg font-semibold text-foreground">Business inputs</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Everything else fills in from the Personal Loans — India benchmark library until you override it.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          <NumberField
            label="Budget (₹ Cr)"
            value={inputs.budgetInr / 1e7}
            onChange={(v) => setField("budgetInr", v * 1e7)}
            step={0.5}
          />
          <NumberField
            label="Addressable impressions"
            value={inputs.addressableImpressions}
            onChange={(v) => setField("addressableImpressions", v)}
            step={100000}
          />
          <NumberField
            label="Revenue / customer (₹)"
            value={inputs.revenuePerCustomerInr}
            onChange={(v) => setField("revenuePerCustomerInr", v)}
            step={100}
          />
          <NumberField
            label="Variable cost / customer (₹)"
            value={inputs.variableCostPerCustomerInr}
            onChange={(v) => setField("variableCostPerCustomerInr", v)}
            step={50}
          />
          <NumberField
            label="Contribution margin (%)"
            value={inputs.contributionMarginPct}
            onChange={(v) => setField("contributionMarginPct", v)}
            step={1}
          />
        </div>
      </section>

      {/* Benchmark position — PRD §10 */}
      <section>
        <h2 className="font-display text-lg font-semibold text-foreground">
          Benchmark position — Personal Loans, India
        </h2>
        <p className="mt-1 text-sm text-foreground/60">
          Edit any value to use your own data — it becomes &ldquo;Actual&rdquo; and the benchmark stays
          visible for comparison, not overwritten. Click a source badge for full provenance.
        </p>
        <div className="mt-3">
          <BenchmarkTable rows={benchmarkRows} />
        </div>
      </section>

      {/* Three-case forecast — PRD §27 */}
      <section>
        <h2 className="font-display text-lg font-semibold text-foreground">Growth forecast</h2>
        <p className="mt-1 text-sm text-foreground/60">
          Conservative / Base / Upside — never a single-point number for a boardroom decision.
        </p>
        <div className="mt-3">
          <ScenarioTable forecasts={forecasts} />
        </div>
      </section>

      {/* Constraint + Next Rupee — PRD §20 / §18 */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <ConstraintCard constraints={constraints} bottleneck={bottleneck} />
        <div>
          <h3 className="font-display text-lg font-semibold text-foreground">Where should the next rupee go?</h3>
          <p className="mt-1 text-sm text-foreground/70">
            Marginal return per channel, accounting for diminishing returns at current allocation — not
            historical CAC.
          </p>
          <div className="mt-3">
            <NextRupeeTable results={nextRupee} />
          </div>
        </div>
      </section>

      <p className="border-t border-line pt-4 text-xs text-foreground/50">
        Deterministic model — every figure above is either your input, a benchmark from the library
        (Personal Loans, India), or a calculation from the two. Total spend today: {formatInr(inputs.budgetInr)}.
        This is a planning simulator, not a guarantee of outcomes.
      </p>
    </div>
  );
}

function SummaryStat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-3">
      <div className="text-xs uppercase tracking-wide text-foreground/50">{label}</div>
      <div className="mt-1 font-display text-xl font-semibold text-foreground">{value}</div>
      {sub && <div className="mt-0.5 text-xs text-foreground/50">{sub}</div>}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-xs text-foreground/60">{label}</span>
      <input
        type="number"
        value={Number.isFinite(value) ? Number(value.toFixed(4)) : 0}
        onChange={(e) => onChange(Number(e.target.value))}
        step={step ?? "any"}
        className="rounded border border-line bg-background px-2 py-1.5 tabular-nums"
      />
    </label>
  );
}
