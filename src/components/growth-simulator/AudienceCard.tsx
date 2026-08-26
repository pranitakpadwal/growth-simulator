import type { AudiencePersona } from "@/lib/growth-simulator/audience";

/**
 * "Who are you targeting?" — the step between reach and cost that a plan
 * built purely from funnel percentages tends to skip. Descriptive, not
 * (yet) wired into the calculations — see the tier-5 note in audience.ts.
 */
export default function AudienceCard({ persona }: { persona: AudiencePersona }) {
  return (
    <div className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-base font-semibold text-foreground">Who you&apos;re targeting</h3>
        <span className="rounded-full bg-neutral-200 px-2 py-0.5 text-[10px] font-semibold text-neutral-700">
          STRATEGY-DESK ESTIMATE
        </span>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm sm:grid-cols-4">
        <Field label="Age">{persona.ageRange}</Field>
        <Field label="Income">{persona.incomeBand}</Field>
        <Field label="Employment">{persona.employment}</Field>
        <Field label="Geography">{persona.geographySplit}</Field>
      </dl>
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
      <dd className="mt-0.5 text-foreground">{children}</dd>
    </div>
  );
}
