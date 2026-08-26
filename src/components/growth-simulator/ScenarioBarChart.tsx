import type { ScenarioName } from "@/lib/growth-simulator/types";
import { formatNumber } from "@/lib/growth-simulator/format";

const SCENARIOS: ScenarioName[] = ["conservative", "base", "upside"];
const SCENARIO_LABEL: Record<ScenarioName, string> = {
  conservative: "Conservative",
  base: "Base",
  upside: "Upside",
};
// Conservative -> Upside is a magnitude ladder (low to high), not three
// unrelated identities, so this is sequential (one hue, light to dark),
// same brand-color convention as the funnel chart — not a 3-way categorical
// comparison.
const OPACITY: Record<ScenarioName, number> = { conservative: 0.4, base: 0.7, upside: 1 };
const BAR_AREA_HEIGHT_PX = 96;

export default function ScenarioBarChart({
  values,
  valueLabel,
}: {
  values: Record<ScenarioName, number>;
  valueLabel: string;
}) {
  const max = Math.max(...SCENARIOS.map((s) => values[s]), 1);

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <h3 className="font-display text-base font-semibold text-foreground">{valueLabel} by scenario</h3>
      <div className="mt-3 flex items-end gap-4">
        {SCENARIOS.map((s) => {
          // Pixel height, not a percentage — a percentage height only resolves
          // against an ancestor with an explicit height, and threading that
          // through a flex chain is fragile. Pixels sidestep it entirely.
          const barHeightPx = Math.max((values[s] / max) * BAR_AREA_HEIGHT_PX, 4);
          return (
            <div key={s} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-xs font-semibold tabular-nums text-foreground">{formatNumber(values[s])}</span>
              <div className="flex w-full items-end" style={{ height: BAR_AREA_HEIGHT_PX }}>
                <div
                  className="w-full rounded-t-sm"
                  style={{ height: barHeightPx, backgroundColor: "var(--brand)", opacity: OPACITY[s] }}
                />
              </div>
              <span className="text-xs text-foreground/60">{SCENARIO_LABEL[s]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
