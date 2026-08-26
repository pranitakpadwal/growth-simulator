import type { ChannelId } from "@/lib/growth-simulator/types";
import { getChannel } from "@/lib/growth-simulator/catalog";
import { formatInrCompact, formatPct } from "@/lib/growth-simulator/format";
import { channelColor } from "./chartColors";

export interface MediaSplitSlice {
  channelId: ChannelId;
  spendInr: number;
}

/**
 * Budget split across channels — part-to-whole. A single segmented bar
 * rather than a pie: same information, easier to compare segment sizes at
 * a glance and to label without wedge-angle guesswork (dataviz skill's
 * "part-to-whole" guidance). Categorical color, fixed per-channel slot —
 * see chartColors.ts — so a channel's color never changes when the split
 * changes.
 */
export default function MediaSplitBar({ slices }: { slices: MediaSplitSlice[] }) {
  const total = slices.reduce((sum, s) => sum + s.spendInr, 0);
  const withShare = slices.filter((s) => s.spendInr > 0).map((s) => ({ ...s, pct: total > 0 ? (s.spendInr / total) * 100 : 0 }));

  if (withShare.length === 0) {
    return (
      <div className="rounded-lg border border-line bg-surface p-4 text-sm text-foreground/50">
        No budget allocated to any channel yet.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <h3 className="font-display text-base font-semibold text-foreground">Budget split</h3>
      <div className="mt-3 flex h-6 overflow-hidden rounded-sm">
        {withShare.map((s, i) => (
          <div
            key={s.channelId}
            style={{
              width: `${s.pct}%`,
              backgroundColor: channelColor(s.channelId),
              marginLeft: i > 0 ? 2 : 0,
            }}
            title={`${getChannel(s.channelId).label}: ${formatPct(s.pct, 0)}`}
          />
        ))}
      </div>
      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs">
        {withShare.map((s) => (
          <li key={s.channelId} className="flex items-center gap-1.5">
            <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: channelColor(s.channelId) }} />
            <span className="text-foreground/80">{getChannel(s.channelId).label}</span>
            <span className="tabular-nums text-foreground/50">
              {formatPct(s.pct, 0)} · {formatInrCompact(s.spendInr)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
