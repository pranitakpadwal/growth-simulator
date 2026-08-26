export interface SourceEntry {
  label: string;
  source: string;
  tier: number;
  sourceUrl?: string;
}

const TIER_LABEL: Record<number, string> = {
  1: "Your data",
  2: "Platform data",
  3: "Third-party benchmark dataset",
  4: "Industry research",
  5: "Strategy-desk estimate",
};

/**
 * PRD §5/§84 made visible in one place: every distinct source backing the
 * current plan, not just the one or two a user happens to click into.
 * Dedupes by source string so a benchmark reused across stages only shows
 * once.
 */
export default function SourceList({ entries }: { entries: SourceEntry[] }) {
  const seen = new Map<string, SourceEntry>();
  for (const e of entries) if (!seen.has(e.source)) seen.set(e.source, e);
  const unique = Array.from(seen.values()).sort((a, b) => a.tier - b.tier);

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <h3 className="font-display text-base font-semibold text-foreground">Sources behind this plan</h3>
      <p className="mt-1 text-sm text-foreground/60">
        Every rate and cost in this plan traces to one of these — click any source badge in the tables
        above for the full breakdown per metric.
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        {unique.map((e) => (
          <li key={e.source} className="flex flex-col gap-0.5 border-b border-line pb-2 last:border-0">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">
                Tier {e.tier} · {TIER_LABEL[e.tier]}
              </span>
              <span className="text-xs text-foreground/50">{e.label}</span>
            </div>
            <span className="text-foreground/80">{e.source}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
