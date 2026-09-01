import type { ChannelEfficiency } from "@/lib/growth-simulator/engine";
import { getChannel } from "@/lib/growth-simulator/catalog";
import { formatInrCompact, formatNumber } from "@/lib/growth-simulator/format";

/**
 * PRD §18 "Next Rupee" idea, grounded in this plan's actual per-channel
 * spend and contribution (see `rankChannelEfficiency`) rather than an
 * illustrative decay curve — ranked by contribution ₹ produced per ₹
 * spent this period, not historical CAC.
 */
export default function ChannelEfficiencyTable({
  rows,
  hasRevenue,
}: {
  rows: ChannelEfficiency[];
  hasRevenue: boolean;
}) {
  const topPaid = rows.find((r) => !r.isOrganic && r.efficiency !== null);

  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line bg-brand-soft/40 text-left text-xs uppercase tracking-wide text-foreground/60">
              <th className="px-3 py-2 font-medium">Channel</th>
              <th className="px-3 py-2 text-right font-medium">Spend</th>
              <th className="px-3 py-2 text-right font-medium">Conversions</th>
              <th className="px-3 py-2 text-right font-medium">CAC</th>
              {hasRevenue && <th className="px-3 py-2 text-right font-medium">Contribution</th>}
              <th className="px-3 py-2 text-right font-medium">₹ contribution / ₹ spent</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const channel = getChannel(r.channelId);
              return (
                <tr
                  key={r.channelId}
                  className={`border-b border-line last:border-0 ${
                    topPaid && r.channelId === topPaid.channelId ? "bg-brand-soft/30" : ""
                  }`}
                >
                  <td className="px-3 py-2 font-medium text-foreground">
                    {channel.label}
                    {topPaid && r.channelId === topPaid.channelId && (
                      <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-brand-contrast">
                        NEXT RUPEE
                      </span>
                    )}
                    {r.isOrganic && (
                      <span className="ml-2 rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">
                        ORGANIC
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground/70">
                    {r.spendInr > 0 ? formatInrCompact(r.spendInr) : "No media spend"}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground/70">
                    {formatNumber(r.valueCount)}
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums text-foreground/70">
                    {r.cacInr > 0 ? formatInrCompact(r.cacInr) : "—"}
                  </td>
                  {hasRevenue && (
                    <td className="px-3 py-2 text-right tabular-nums text-foreground/70">
                      {formatInrCompact(r.contributionInr)}
                    </td>
                  )}
                  <td className="px-3 py-2 text-right font-semibold tabular-nums text-foreground">
                    {r.efficiency !== null ? `₹${r.efficiency.toFixed(2)}` : "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {topPaid && (
        <p className="mt-2 text-sm text-foreground/70">
          The next rupee should not automatically go to the channel with the lowest historical CAC.
          Based on this plan&apos;s current inputs,{" "}
          <strong className="text-foreground">{getChannel(topPaid.channelId).label}</strong> is producing
          the most contribution per rupee spent among your paid channels.
        </p>
      )}
    </div>
  );
}
