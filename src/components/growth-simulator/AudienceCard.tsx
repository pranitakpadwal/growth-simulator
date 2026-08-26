"use client";

import type { AudiencePersona } from "@/lib/growth-simulator/audience";

/**
 * "Who are you targeting?" — the step between reach and cost that a plan
 * built purely from funnel percentages tends to skip. Age and the metro
 * vs. tier-2/3 split are editable (a real desk tightens these per client);
 * income band and employment are free text for the same reason. Reach and
 * notes stay narrative — see the tier-5 disclosure in audience.ts.
 */
export default function AudienceCard({
  persona,
  onChange,
}: {
  persona: AudiencePersona;
  onChange: (next: AudiencePersona) => void;
}) {
  function set<K extends keyof AudiencePersona>(key: K, value: AudiencePersona[K]) {
    onChange({ ...persona, [key]: value });
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-foreground">Who you&apos;re targeting</h3>
        <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">
          STRATEGY-DESK ESTIMATE · EDITABLE
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-4">
        <Field label="Age range">
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              value={persona.ageMin}
              onChange={(e) => set("ageMin", Number(e.target.value))}
              className="w-14 rounded border border-line bg-background px-1.5 py-1 tabular-nums"
            />
            <span className="text-foreground/40">–</span>
            <input
              type="number"
              value={persona.ageMax}
              onChange={(e) => set("ageMax", Number(e.target.value))}
              className="w-14 rounded border border-line bg-background px-1.5 py-1 tabular-nums"
            />
          </div>
        </Field>
        <Field label="Income">
          <input
            type="text"
            value={persona.incomeBand}
            onChange={(e) => set("incomeBand", e.target.value)}
            className="w-full rounded border border-line bg-background px-1.5 py-1"
          />
        </Field>
        <Field label="Employment">
          <input
            type="text"
            value={persona.employment}
            onChange={(e) => set("employment", e.target.value)}
            className="w-full rounded border border-line bg-background px-1.5 py-1"
          />
        </Field>
        <Field label="Geography">
          <div className="flex items-center gap-1.5">
            <input
              type="number"
              min={0}
              max={100}
              value={persona.tier1Pct}
              onChange={(e) => set("tier1Pct", Math.max(0, Math.min(100, Number(e.target.value))))}
              className="w-14 rounded border border-line bg-background px-1.5 py-1 tabular-nums"
            />
            <span className="text-xs text-foreground/60">% Tier 1</span>
            <span className="text-xs text-foreground/40">· {100 - persona.tier1Pct}% Tier 2/3</span>
          </div>
        </Field>
      </div>
      <p className="mt-3 text-sm text-foreground/70">
        <strong className="text-foreground">Reach: </strong>
        {persona.reachEstimate}.
      </p>
      <p className="mt-1 text-xs text-foreground/50">{persona.notes}</p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs text-foreground/50">{label}</dt>
      <dd className="mt-1">{children}</dd>
    </div>
  );
}
