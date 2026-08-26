"use client";

import { useState } from "react";
import type { BenchmarkMetric, ValueClass } from "@/lib/growth-simulator/types";
import { benchmarkFreshness } from "@/lib/growth-simulator/benchmarks";
import { formatInrCompact, formatPct } from "@/lib/growth-simulator/format";

const CLASS_LABEL: Record<ValueClass, string> = {
  actual: "Actual",
  benchmark: "Benchmark",
  assumption: "Assumption",
  forecast: "Forecast",
  target: "Target",
};

const CLASS_COLOR: Record<ValueClass, string> = {
  actual: "bg-brand-soft text-brand-dark",
  benchmark: "bg-amber-100 text-amber-800",
  assumption: "bg-neutral-200 text-neutral-700",
  forecast: "bg-blue-100 text-blue-800",
  target: "bg-purple-100 text-purple-800",
};

const FRESHNESS_COLOR: Record<string, string> = {
  Fresh: "text-brand",
  Usable: "text-amber-700",
  Aging: "text-orange-700",
  Historical: "text-red-700",
};

/**
 * PRD §84 "No number without provenance" and §26 "Challenge the Model" —
 * every important figure gets a click target that discloses where it came
 * from, how it compares, and how confident we are in it.
 */
export default function ProvenanceBadge({
  valueClass,
  benchmark,
  companyValue,
}: {
  valueClass: ValueClass;
  benchmark: BenchmarkMetric;
  companyValue: number;
}) {
  const [open, setOpen] = useState(false);
  const freshness = benchmarkFreshness(benchmark.lastVerified);
  const fmt = (v: number) => (benchmark.unit === "inr" ? formatInrCompact(v) : formatPct(v));

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`rounded-full px-2 py-0.5 text-xs font-medium ${CLASS_COLOR[valueClass]} hover:opacity-80`}
      >
        {CLASS_LABEL[valueClass]}
      </button>
      {open && (
        <div className="absolute left-0 z-20 mt-2 w-72 rounded-lg border border-line bg-surface p-3 text-xs shadow-lg">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">{benchmark.label}</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-foreground/40 hover:text-foreground"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <dl className="mt-2 space-y-1 text-foreground/80">
            <Row label="Using">{fmt(companyValue)}</Row>
            <Row label="Market range">
              {fmt(benchmark.p25)} – {fmt(benchmark.p75)} (median {fmt(benchmark.median)})
            </Row>
            <Row label="Best in class">{fmt(benchmark.bestInClass)}</Row>
            <Row label="Geography">{benchmark.geography}</Row>
            <Row label="Source">{benchmark.source}</Row>
            <Row label="Source tier">Tier {benchmark.tier} of 5</Row>
            <Row label="Confidence">{benchmark.confidenceScore}/100</Row>
            <Row label="Applicability (India)">{benchmark.applicabilityScore}/100</Row>
            <Row label="Freshness">
              <span className={FRESHNESS_COLOR[freshness]}>{freshness}</span> · verified{" "}
              {new Date(benchmark.lastVerified).toLocaleDateString("en-IN", {
                month: "short",
                year: "numeric",
              })}
            </Row>
          </dl>
          <p className="mt-2 border-t border-line pt-2 text-foreground/60">{benchmark.notes}</p>
        </div>
      )}
    </span>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="shrink-0 text-foreground/50">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}
