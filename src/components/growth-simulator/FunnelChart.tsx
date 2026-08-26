import { formatNumber, formatSignedPct } from "@/lib/growth-simulator/format";

export interface FunnelStagePoint {
  label: string;
  count: number;
  isValueStage?: boolean;
}

/**
 * Impressions → Clicks → ... → value stage, as a horizontal funnel. This is
 * the direct answer to "give me the data from impressions to clicks to
 * installs" — every number the cost ladder and scenario table already
 * compute, shown as a shape instead of a table.
 *
 * Sequential encoding (one hue — the brand color — light to dark) since the
 * job here is magnitude, not identity: every bar is the same "thing"
 * (people) at a different stage, not a different series. The value stage
 * renders at full brand strength to match the emphasis already used in the
 * cost ladder ("= Your CAC").
 *
 * Bar width uses log(count) rather than count directly. A real media funnel
 * commonly spans 3+ orders of magnitude between impressions and a funded
 * customer — a linear scale collapses every stage past "clicks" to the same
 * sliver, which defeats the point of drawing a shape at all. Log keeps every
 * stage visually distinguishable while staying monotonic (still narrows at
 * every real drop-off); it trades exact area-proportionality for
 * legibility, which is the right trade here since the exact counts are
 * already printed beside each bar.
 */
export default function FunnelChart({ stages }: { stages: FunnelStagePoint[] }) {
  const max = stages[0]?.count || 1;
  const logMax = Math.log1p(max);
  const minOpacity = 0.28;
  const maxOpacity = 1;

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <h3 className="font-display text-base font-semibold text-foreground">Funnel</h3>
      <div className="mt-3 flex flex-col gap-2">
        {stages.map((stage, i) => {
          const widthPct = logMax > 0 ? Math.max((Math.log1p(stage.count) / logMax) * 100, 4) : 4;
          const opacity = minOpacity + (maxOpacity - minOpacity) * (i / Math.max(stages.length - 1, 1));
          const prev = stages[i - 1];
          const dropPct = prev && prev.count > 0 ? ((stage.count - prev.count) / prev.count) * 100 : null;
          return (
            <div key={stage.label} className="flex items-center gap-3">
              <span className="w-36 shrink-0 text-xs text-foreground/60">
                {stage.label}
                {stage.isValueStage && (
                  <span className="ml-1 rounded-full bg-brand px-1.5 py-0.5 text-[9px] font-semibold uppercase text-white">
                    Goal
                  </span>
                )}
              </span>
              <div className="h-6 flex-1 rounded-sm bg-background">
                <div
                  className="h-6 rounded-sm"
                  style={{ width: `${widthPct}%`, backgroundColor: "var(--brand)", opacity }}
                />
              </div>
              <span className="w-20 shrink-0 text-right text-xs font-semibold tabular-nums text-foreground">
                {formatNumber(stage.count)}
              </span>
              <span className="w-14 shrink-0 text-right text-xs text-foreground/40">
                {dropPct != null ? formatSignedPct(dropPct, 0) : ""}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
