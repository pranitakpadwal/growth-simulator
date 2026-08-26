import type { NextRupeeResult } from "@/lib/growth-simulator/types";

const CATEGORY_LABEL: Record<NextRupeeResult["category"], string> = {
  capture: "Capture",
  build: "Build",
  improve: "Improve",
  retain: "Retain",
  defend: "Defend",
};

const CATEGORY_COLOR: Record<NextRupeeResult["category"], string> = {
  capture: "bg-blue-100 text-blue-800",
  build: "bg-purple-100 text-purple-800",
  improve: "bg-brand-soft text-brand-dark",
  retain: "bg-amber-100 text-amber-800",
  defend: "bg-neutral-200 text-neutral-700",
};

/**
 * PRD §18 "Next Rupee" engine — ranked by marginal return on the NEXT ₹1
 * crore, not historical CAC or cumulative ROAS (PRD §48 diminishing returns).
 */
export default function NextRupeeTable({ results }: { results: NextRupeeResult[] }) {
  const top = results[0];
  return (
    <div>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="border-b border-line bg-brand-soft/40 text-left text-xs uppercase tracking-wide text-foreground/60">
              <th className="px-3 py-2 font-medium">Channel</th>
              <th className="px-3 py-2 font-medium">Type</th>
              <th className="px-3 py-2 text-right font-medium">Current allocation</th>
              <th className="px-3 py-2 text-right font-medium">Next ₹1 Cr return</th>
              <th className="px-3 py-2 font-medium">Time to impact</th>
              <th className="px-3 py-2 font-medium">Confidence</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr
                key={r.id}
                className={`border-b border-line last:border-0 ${r.id === top.id ? "bg-brand-soft/30" : ""}`}
              >
                <td className="px-3 py-2 font-medium text-foreground">
                  {r.label}
                  {r.id === top.id && (
                    <span className="ml-2 rounded-full bg-brand px-2 py-0.5 text-[10px] font-semibold text-white">
                      NEXT RUPEE
                    </span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${CATEGORY_COLOR[r.category]}`}>
                    {CATEGORY_LABEL[r.category]}
                  </span>
                </td>
                <td className="px-3 py-2 text-right tabular-nums text-foreground/70">
                  ₹{r.currentAllocationCr.toFixed(1)} Cr
                </td>
                <td className="px-3 py-2 text-right font-semibold tabular-nums text-foreground">
                  {r.nextCroreMarginalValue > 0 ? `₹${r.nextCroreMarginalValue.toFixed(2)}` : "At capacity"}
                </td>
                <td className="px-3 py-2 text-foreground/70">{r.timeToImpact}</td>
                <td className="px-3 py-2 text-foreground/70">{r.confidence}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-sm text-foreground/70">
        The next ₹1 should not automatically go to the channel with the lowest historical CAC. Based on
        marginal return, <strong className="text-foreground">{top.label}</strong> currently produces the
        highest incremental value for the next crore invested.
      </p>
    </div>
  );
}
