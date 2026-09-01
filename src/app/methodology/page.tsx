import SiteHeader from "@/components/growth-simulator/SiteHeader";

export const metadata = {
  title: "Methodology & sources",
  description: "Where every benchmark in the Growth Strategy Simulator comes from, and how it's scored.",
};

const TIERS: { tier: number; label: string; description: string }[] = [
  {
    tier: 1,
    label: "Company first-party data",
    description:
      "A client's own historical performance — always overrides everything below it when it exists. The simulator ships without this by design; it's the first thing a real engagement replaces.",
  },
  {
    tier: 2,
    label: "Platform data",
    description:
      "Raw exports and benchmark reports published directly by the ad platforms and measurement partners that carry the spend: Google Ads / Google App Campaigns (UAC), YouTube, Meta Ads (Facebook & Instagram), Google Analytics 4.",
  },
  {
    tier: 3,
    label: "Large third-party benchmark datasets",
    description:
      "Aggregated, cross-advertiser benchmark reports from recognised measurement and analytics vendors: AppsFlyer, Adjust, SensorTower App Intelligence, WordStream, Fintel Connect.",
  },
  {
    tier: 4,
    label: "Industry research",
    description:
      "Regulator data and category research: RBI (digital lending trends), NSDL/CDSL (demat account growth), SEBI (KYC commentary), RedSeer (fintech consumer research), Think with Google (India consumer-journey research).",
  },
  {
    tier: 5,
    label: "Strategy-desk estimate",
    description:
      "Where no published India-specific benchmark exists at the needed granularity, an estimate built from past engagement patterns and triangulated against the closest available Tier 2–4 data — always labelled as an estimate, never presented as a hard number.",
  },
];

const DERIVATION_STEPS = [
  {
    n: 1,
    title: "Start from a real, published number",
    body: "Never a blank guess. Every benchmark starts from at least one number a real platform, vendor, or regulator actually published — a WordStream CVR report, an AppsFlyer funnel benchmark, an RBI lending trend note, a SensorTower category estimate.",
  },
  {
    n: 2,
    title: "State the gap",
    body: "A published number is almost never an exact match — wrong geography (US, not India), wrong category (all finance & insurance, not lending specifically), or a step nobody publishes at all. This gap is named explicitly, not glossed over.",
  },
  {
    n: 3,
    title: "Bridge it, with a stated method",
    body: (
      <>
        Three named methods: <strong>direct read</strong> (already matches — used as-is), <strong>scaled</strong>{" "}
        (an explicit multiplier, reason stated), or <strong>reverse-solved</strong> (an unpublished stage sized so
        the funnel&apos;s compounded math matches a trustworthy end-to-end number).
      </>
    ),
  },
  {
    n: 4,
    title: "Show the work, per metric",
    body: (
      <>
        Click any <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-amber-800">Benchmark</span> badge
        in the simulator — every one opens to &quot;How this was derived&quot; with the actual chain, not just a
        source name.
      </>
    ),
  },
];

const SOURCES: { name: string; usedFor: string }[] = [
  { name: "Google Ads / Google App Campaigns (UAC) benchmark reports", usedFor: "Search, Display, YouTube, and app-install-campaign CPC/CTR benchmarks" },
  { name: "Meta Ads benchmark reports (Foresight)", usedFor: "Facebook and Instagram CPC/CTR and engagement benchmarks" },
  { name: "Google Analytics 4 (GA4)", usedFor: "On-site/on-page engagement-rate benchmarks" },
  { name: "AppsFlyer", usedFor: "App-install funnel benchmarks — click-to-install, install-to-first-open, channel-level CPI" },
  { name: "Adjust", usedFor: "App onboarding and re-engagement/session-return benchmarks" },
  { name: "SensorTower App Intelligence", usedFor: "Cross-checks store-conversion, CPI-by-channel, retention, and category revenue benchmarks against AppsFlyer/Adjust figures" },
  { name: "WordStream", usedFor: "Google Ads and Google Display Network CVR/CPC benchmarks (finance & insurance)" },
  { name: "Fintel Connect", usedFor: "Financial services CPA benchmarking (2025 guide)" },
  { name: "RBI (Reserve Bank of India)", usedFor: "Digital lending trend data" },
  { name: "NSDL / CDSL", usedFor: "Demat account growth data" },
  { name: "SEBI", usedFor: "KYC-completion commentary" },
  { name: "RedSeer", usedFor: "Fintech consumer research" },
  { name: "Think with Google", usedFor: "India consumer-journey and ecommerce benchmark commentary" },
];

export default function MethodologyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader active="methodology" />
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-8 sm:px-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Methodology &amp; sources
          </h1>
          <p className="text-sm text-foreground/70">
            No number without provenance. Every benchmark shown in the simulator — every CPC, click-through
            rate, funnel conversion rate — is tagged with a source, a confidence score, and an
            applicability score, and traces back to one of five tiers below.
          </p>
        </div>
      </div>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-8">
        <section>
          <h2 className="font-display text-lg font-semibold text-foreground">The five-tier hierarchy</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Highest-quality source available wins. A benchmark is only pushed down a tier when nothing
            better exists at the granularity the simulator needs (e.g. India-specific, this industry,
            this funnel stage).
          </p>

          <TierBar />

          <ol className="mt-5 flex flex-col gap-3">
            {TIERS.map((t) => (
              <li key={t.tier} className="flex gap-3 rounded-lg border border-line p-4">
                <span
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-brand-contrast"
                  style={{ backgroundColor: "var(--foreground)", opacity: 1 - (t.tier - 1) * 0.14 }}
                >
                  {t.tier}
                </span>
                <div>
                  <div className="font-display text-sm font-semibold text-foreground">{t.label}</div>
                  <p className="mt-0.5 text-sm text-foreground/70">{t.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-lg font-semibold text-foreground">
            How a conversion-rate benchmark is actually derived
          </h2>
          <p className="mt-1 text-sm text-foreground/60">
            The tier tells you <em>who</em> published the underlying data. It doesn&apos;t tell you the
            arithmetic that turned their number into ours — that&apos;s the question that comes up most, so
            here&apos;s the method in full, with a real example from the funnel library.
          </p>

          <DerivationFlow />

          <div className="mt-8 rounded-lg border border-line p-5">
            <div className="font-display text-sm font-semibold text-foreground">
              Worked example — Personal Loans &quot;Qualification Rate&quot; (68%)
            </div>
            <p className="mt-2 text-sm text-foreground/70">
              No lender publishes &quot;what % of leads pass basic eligibility.&quot; So instead of a guess: RBI&apos;s
              digital lending report notes a large share of digital leads fail basic income/CIBIL screening at
              first pass, consistent with a 55–80% pass-through band. Separately, Fintel Connect&apos;s CPA
              benchmarking guide reports the approval rate and disbursal rate stages directly (35% and 60%
              median, both Tier 4 — real advertiser-network data). For the funnel&apos;s overall click-to-funded
              rate to land where Fintel Connect&apos;s own cost-per-approval pricing implies it should, the
              missing qualification-rate stage has to sit in that same 55–80% band. That&apos;s the 68% median —
              not measured directly, but the number the rest of the (measured) funnel requires. Labelled Tier 5,
              confidence 45/100, precisely because it&apos;s solved, not observed — and replaced instantly the
              day a lender&apos;s own CRM has the real figure.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-lg font-semibold text-foreground">Every source used</h2>
          <p className="mt-1 text-sm text-foreground/60">
            Third-party datasets and platform reports the benchmark library draws on. Where a figure isn&apos;t
            available at India-specific granularity, it&apos;s cross-checked against a second independent
            source (most commonly SensorTower App Intelligence for app metrics) before it&apos;s used.
          </p>
          <div className="mt-4 overflow-x-auto rounded-lg border border-line">
            <table className="w-full min-w-[480px] text-left text-sm">
              <thead className="bg-brand-soft text-xs uppercase tracking-wide text-foreground/50">
                <tr>
                  <th className="px-4 py-2">Source</th>
                  <th className="px-4 py-2">Used for</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {SOURCES.map((s) => (
                  <tr key={s.name}>
                    <td className="whitespace-nowrap px-4 py-2.5 font-medium text-foreground">
                      <span className="mr-2 inline-block h-1.5 w-1.5 rounded-full bg-foreground/40 align-middle" />
                      {s.name}
                    </td>
                    <td className="px-4 py-2.5 text-foreground/70">{s.usedFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12 rounded-lg border border-line p-5">
          <h2 className="font-display text-base font-semibold text-foreground">
            Confidence &amp; applicability scores
          </h2>
          <p className="mt-1 text-sm text-foreground/70">
            Beyond the tier, each benchmark carries a 0–100 confidence score (source quality, sample size,
            recency, geographic match) and a 0–100 applicability score (how well it fits an India business
            in this specific vertical and funnel stage). Lower-confidence or lower-applicability figures
            are shown as wider p25–p75 ranges rather than a single confident number — the simulator would
            rather show you an honest range than a precise-looking guess.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="font-display text-base font-semibold text-foreground">What this tool isn&apos;t</h2>
          <p className="mt-1 text-sm text-foreground/70">
            A forecast, not a promise. Benchmarks describe what&apos;s typical across many advertisers in a
            category — your actual creative, offer, audience quality, and business process (KYC,
            underwriting, checkout) will move you above or below them. The moment first-party data exists
            for a client, it replaces every Tier 2–5 estimate here.
          </p>
        </section>
      </main>
      <footer className="border-t border-line px-4 py-6 text-center text-xs text-foreground/40 sm:px-8">
        Growth Strategy Simulator — a planning tool, not a guarantee of outcomes.
      </footer>
    </div>
  );
}

/** Five bars, narrowing and lightening left to right — trust narrows as you move down the tiers. */
function TierBar() {
  return (
    <div className="mt-4 flex h-9 gap-1">
      {TIERS.map((t, i) => (
        <div
          key={t.tier}
          className="flex items-center justify-center rounded text-xs font-semibold text-brand-contrast"
          style={{
            flex: 5 - i,
            backgroundColor: "var(--foreground)",
            opacity: 1 - i * 0.18,
          }}
          title={t.label}
        >
          T{t.tier}
        </div>
      ))}
    </div>
  );
}

/** Connected numbered steps — desktop: a horizontal line through 4 nodes; mobile: stacks. */
function DerivationFlow() {
  return (
    <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-4 sm:gap-3">
      {DERIVATION_STEPS.map((step, i) => (
        <div key={step.n} className="relative flex flex-col gap-2 rounded-lg border border-line p-4">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-semibold text-brand-contrast">
              {step.n}
            </span>
            {i < DERIVATION_STEPS.length - 1 && (
              <span className="hidden h-px flex-1 bg-line sm:block" aria-hidden="true" />
            )}
          </div>
          <div className="font-display text-sm font-semibold text-foreground">{step.title}</div>
          <p className="text-xs text-foreground/60">{step.body}</p>
        </div>
      ))}
    </div>
  );
}
