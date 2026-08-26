import type { CostLadderRung } from "@/lib/growth-simulator/engine";
import { formatInrCompact, formatPct } from "@/lib/growth-simulator/format";

/**
 * "₹4.50 is your CPC, not your CPI" — the single clearest idea from the
 * reference planning sheet. Cost compounds at every drop-off between a
 * click and an actual customer; this makes that compounding visible
 * instead of leaving CPC to imply a cost it doesn't represent.
 */
export default function CostLadder({ rungs, cpc }: { rungs: CostLadderRung[]; cpc: number }) {
  const valueRung = rungs.find((r) => r.isValueStage);

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <h3 className="font-display text-base font-semibold text-foreground">Cost ladder</h3>
      {valueRung && (
        <p className="mt-1 text-sm text-foreground/70">
          <strong className="text-foreground">{formatInrCompact(cpc)} is your CPC — not your cost per{" "}
          {valueRung.label.toLowerCase()}.</strong> Cost compounds at every drop-off below.
        </p>
      )}
      <div className="mt-3 flex flex-col">
        <LadderRow label="Click" costInr={cpc} isFirst />
        {rungs.map((rung) => (
          <LadderRow
            key={rung.stageId}
            label={rung.label}
            costInr={rung.cumulativeCostInr}
            rate={rung.rate}
            highlight={rung.isValueStage}
          />
        ))}
      </div>
    </div>
  );
}

function LadderRow({
  label,
  costInr,
  rate,
  highlight,
  isFirst,
}: {
  label: string;
  costInr: number;
  rate?: number;
  highlight?: boolean;
  isFirst?: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-1.5">
      {!isFirst && <span className="w-8 shrink-0 text-center text-foreground/30">↓</span>}
      {isFirst && <span className="w-8 shrink-0" />}
      <div
        className={`flex flex-1 items-center justify-between rounded-md border px-3 py-1.5 text-sm ${
          highlight ? "border-brand bg-brand-soft/50" : "border-line bg-background"
        }`}
      >
        <span className={highlight ? "font-semibold text-brand-dark" : "text-foreground/80"}>
          Cost per {label.toLowerCase()}
          {rate != null && <span className="ml-2 text-xs text-foreground/40">({formatPct(rate)} of prior stage)</span>}
        </span>
        <span className={`tabular-nums font-semibold ${highlight ? "text-brand-dark" : "text-foreground"}`}>
          {costInr > 0 ? formatInrCompact(costInr) : "—"}
        </span>
      </div>
    </div>
  );
}
