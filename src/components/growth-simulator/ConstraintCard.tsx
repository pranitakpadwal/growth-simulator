import type { ConstraintAssessment } from "@/lib/growth-simulator/types";
import { formatSignedPct } from "@/lib/growth-simulator/format";

// Every stage starts equal to its benchmark median (gap = 0%), so with no
// overrides yet every gap ties at zero and the reduce in assessConstraints
// picks a stage by array order, not by an actual problem. Below this
// threshold there's nothing to flag — telling the user to "fix" a stage
// that's sitting exactly on benchmark would be a false alarm.
const NO_CONSTRAINT_THRESHOLD = -1;

/** PRD §20 Constraint Engine — "Do not scale this yet." */
export default function ConstraintCard({
  constraints,
  bottleneck,
}: {
  constraints: ConstraintAssessment[];
  bottleneck: ConstraintAssessment;
}) {
  const hasRealConstraint = bottleneck.gapPct < NO_CONSTRAINT_THRESHOLD;

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <h3 className="font-display text-lg font-semibold text-foreground">Biggest constraint</h3>
      {hasRealConstraint ? (
        <>
          <p className="mt-1 text-sm text-foreground/70">
            <strong className="text-foreground">{bottleneck.label}</strong> is{" "}
            {formatSignedPct(bottleneck.gapPct)} vs. the benchmark median — the largest gap in the funnel.
            Increasing media spend before fixing this is unlikely to be the highest-return move.
          </p>
          <p className="mt-2 text-sm font-medium text-brand-dark">
            Recommended: improve {bottleneck.label.toLowerCase()} before scaling acquisition spend.
          </p>
        </>
      ) : (
        <p className="mt-1 text-sm text-foreground/70">
          Every funnel stage is at or above its benchmark median — no clear bottleneck yet. Edit a value
          in the benchmark table with your actual data to see where you really stand.
        </p>
      )}
      <ul className="mt-4 space-y-1.5 text-xs text-foreground/60">
        {constraints
          .slice()
          .sort((a, b) => a.gapPct - b.gapPct)
          .map((c) => (
            <li key={c.metricId} className="flex items-center justify-between gap-3">
              <span className={c.isBottleneck ? "font-semibold text-foreground" : ""}>{c.label}</span>
              <span className={`tabular-nums ${c.gapPct < 0 ? "text-red-700" : "text-brand-dark"}`}>
                {formatSignedPct(c.gapPct)}
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
