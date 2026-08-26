"use client";

import { estimateReach, type AudiencePersona } from "@/lib/growth-simulator/audience";

/** Google/Meta ads' own standard age-bracket cutoffs — matches how you'd actually set age targeting. */
const AGE_BRACKETS = [13, 18, 21, 25, 30, 35, 40, 45, 50, 55, 60, 65];

/**
 * "Who are you targeting?" — the step between reach and cost that a plan
 * built purely from funnel percentages tends to skip. Age is a dropdown of
 * standard ad-platform brackets (not free text — this is targeting, not a
 * demographic essay); the metro vs. tier-2/3 split is a drag slider,
 * matching the Google/Meta budget-split control elsewhere in the tool.
 * Reach recomputes live from the age range — see estimateReach().
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

  const reach = estimateReach(persona);

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
            <select
              value={persona.ageMin}
              onChange={(e) => {
                const next = Number(e.target.value);
                set("ageMin", next);
                if (next >= persona.ageMax) set("ageMax", AGE_BRACKETS.find((a) => a > next) ?? next + 5);
              }}
              className="rounded border border-line bg-background px-1.5 py-1 tabular-nums"
            >
              {AGE_BRACKETS.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
            <span className="text-foreground/40">–</span>
            <select
              value={persona.ageMax}
              onChange={(e) => set("ageMax", Number(e.target.value))}
              className="rounded border border-line bg-background px-1.5 py-1 tabular-nums"
            >
              {AGE_BRACKETS.filter((a) => a > persona.ageMin).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
              <option value={65}>65+</option>
            </select>
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
          <div className="flex items-center gap-2">
            <input
              type="range"
              min={0}
              max={100}
              value={persona.tier1Pct}
              onChange={(e) => set("tier1Pct", Number(e.target.value))}
              className="flex-1"
            />
            <span className="w-28 shrink-0 text-xs text-foreground/60">
              {persona.tier1Pct}% Tier 1 · {100 - persona.tier1Pct}% Tier 2/3
            </span>
          </div>
        </Field>
      </div>
      <p className="mt-3 text-sm text-foreground/70">
        <strong className="text-foreground">Reach: </strong>
        ~{reach.lowM}–{reach.highM}M {persona.reachLabel}
        {(persona.ageMin !== persona.referenceAgeMin || persona.ageMax !== persona.referenceAgeMax) && (
          <span className="text-foreground/50"> (scaled from your {persona.ageMin}–{persona.ageMax} age range)</span>
        )}
        .
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
