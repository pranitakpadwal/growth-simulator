import Link from "next/link";
import Logo from "@/components/growth-simulator/Logo";
import SiteHeader from "@/components/growth-simulator/SiteHeader";

export const metadata = {
  title: "Growth Strategy Simulator — plan your India marketing spend",
};

const CHANNELS_PREVIEW = ["Google Search", "Google Display", "YouTube", "Facebook", "Instagram", "LinkedIn", "SEO", "ASO"];

const WHATS_INSIDE = [
  {
    title: "Simulator",
    body:
      "Pick an industry, a goal, a budget — get a full channel split, funnel, and Conservative/Base/Upside forecast in minutes.",
    href: "/simulator",
    cta: "Open the simulator",
  },
  {
    title: "Methodology & sources",
    body:
      "Every benchmark traces to a named source and a shown derivation — the actual math, not just a citation.",
    href: "/methodology",
    cta: "Read the methodology",
  },
  {
    title: "Glossary",
    body: "CAC, CPI, GEI, blended CAC — every term the simulator uses, defined in plain language.",
    href: "/glossary",
    cta: "Browse the glossary",
  },
];

const PLAN_CHECKS = [
  "Industry-specific funnel, not one template stretched across every vertical",
  "Every paid channel split individually — turn off any one you don't want to run",
  "Campaign objectives beyond leads: Views, Traffic, Engagement, Messages, Awareness",
  "Goal-first mode: tell it the outcome, it back-solves the budget",
];

const CONSTRAINT_CHECKS = [
  "Every funnel stage compared against its own benchmark range, not eyeballed",
  "The single biggest constraint flagged automatically — not the whole funnel treated as broken",
  "Click any benchmark for the full derivation: which source, which adjustment, why",
  "Replace any benchmark with your own first-party number the moment you have it",
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader active="home" />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-line">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-8 sm:py-24 lg:grid-cols-2">
            <div className="flex flex-col gap-6">
              <span className="w-fit rounded-full border border-line px-3 py-1 text-xs font-medium uppercase tracking-wide text-foreground/60">
                India · Google &amp; Meta &amp; LinkedIn media planning
              </span>
              <h1 className="font-display max-w-xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Know exactly where your budget goes, before you spend it
              </h1>
              <p className="max-w-lg text-base text-foreground/60 sm:text-lg">
                Pick your industry and goal. Get a channel split, a funnel from click to customer, and a
                Conservative / Base / Upside forecast — every number sourced, every rate explained.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/simulator"
                  className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-brand-contrast shadow-sm hover:opacity-85"
                >
                  Try the simulator — free, no signup
                </Link>
                <a
                  href="#talk-to-us"
                  className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-foreground hover:bg-brand-soft"
                >
                  Need help building the strategy?
                </a>
              </div>
            </div>

            <PreviewCard />
          </div>
        </section>

        {/* What's inside */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
          <h2 className="font-display text-center text-2xl font-semibold text-foreground sm:text-3xl">
            One tool, three ways to use it
          </h2>
          <p className="mx-auto mt-2 max-w-md text-center text-sm text-foreground/60">
            Plan a spend, understand the reasoning behind it, or learn the terms — free to use, no account.
          </p>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {WHATS_INSIDE.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group flex flex-col gap-3 rounded-xl border border-line p-6 transition hover:border-foreground/30"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-foreground">
                  <MiniIcon title={item.title} />
                </span>
                <span className="font-display text-lg font-semibold text-foreground">{item.title}</span>
                <span className="text-sm text-foreground/60">{item.body}</span>
                <span className="mt-1 text-sm font-semibold text-foreground group-hover:underline">
                  {item.cta} →
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Plan your channel mix — checklist + preview */}
        <section className="border-y border-line">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-4 py-16 sm:px-8 sm:py-20 lg:grid-cols-2">
            <ChannelMixPreview />
            <div className="flex flex-col gap-4">
              <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                Plan your channel mix, channel by channel
              </h2>
              <p className="text-sm text-foreground/60">
                Every paid channel — Search, Display, YouTube, Facebook, Instagram, LinkedIn — gets its own
                CPC/CTR benchmark and its own switch. Not every campaign is a lead-gen funnel either: pick
                Views, Traffic, Engagement, or Messages where that&apos;s what you&apos;re actually buying.
              </p>
              <ul className="mt-2 flex flex-col gap-3">
                {PLAN_CHECKS.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Know why a number moved — checklist + preview */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
            <div className="flex flex-col gap-4 lg:order-1">
              <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                Know why a number moved, not just that it did
              </h2>
              <p className="text-sm text-foreground/60">
                The simulator doesn&apos;t just show a percentage — it shows the actual chain from a named,
                published source to that specific number, and flags the one funnel stage actually worth
                fixing before you spend more media budget.
              </p>
              <ul className="mt-2 flex flex-col gap-3">
                {CONSTRAINT_CHECKS.map((c) => (
                  <li key={c} className="flex items-start gap-2 text-sm text-foreground/80">
                    <Check />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:order-2">
              <DerivationPreview />
            </div>
          </div>
        </section>

        {/* Explore further */}
        <section className="border-t border-line">
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-8 sm:py-20">
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">Explore further</h2>
            <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
              <ExploreCard
                href="/methodology"
                label="Methodology"
                title="The five-tier benchmark hierarchy"
                body="How company data, platform reports, and strategy-desk estimates rank against each other — and when each one gets used."
              />
              <ExploreCard
                href="/glossary"
                label="Reference"
                title="Every metric, defined"
                body="CAC vs. blended CAC, CPI vs. CPC, GEI — the glossary behind every tooltip in the tool."
              />
              <ExploreCard
                href="/simulator"
                label="Tool"
                title="10 India industries, ready to plan"
                body="Personal loans to event ticketing — each with its own funnel, audience, and sourced benchmarks."
              />
            </div>
          </div>
        </section>

        {/* Talk to us / CTA band */}
        <section id="talk-to-us" className="bg-brand text-brand-contrast">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-16 text-center sm:px-8 sm:py-20">
            <h2 className="font-display text-2xl font-semibold sm:text-3xl">
              Need help building the strategy? Talk to us.
            </h2>
            <p className="max-w-lg text-sm opacity-70">
              This tool gets you a well-sourced starting plan in minutes. If you want it turned into a real,
              funded strategy — client-specific data, channel execution, ongoing optimisation — we build
              that too.
            </p>
            <a
              href="mailto:strategy@appstudiox.com?subject=Growth%20strategy%20help"
              className="mt-2 inline-block rounded-full bg-brand-contrast px-6 py-3 text-sm font-semibold text-brand hover:opacity-85"
            >
              Email strategy@appstudiox.com
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm sm:flex-row sm:items-start sm:justify-between sm:px-8">
          <div className="flex flex-col gap-2">
            <Logo />
            <p className="max-w-xs text-foreground/50">
              A planning tool, not a guarantee of outcomes — India Google, Meta &amp; LinkedIn media planning.
            </p>
          </div>
          <div className="flex gap-16">
            <div className="flex flex-col gap-2 text-foreground/60">
              <span className="text-xs font-semibold uppercase tracking-wide text-foreground/40">Product</span>
              <Link href="/simulator" className="hover:text-foreground">
                Simulator
              </Link>
              <Link href="/glossary" className="hover:text-foreground">
                Glossary
              </Link>
              <Link href="/methodology" className="hover:text-foreground">
                Methodology
              </Link>
            </div>
            <div className="flex flex-col gap-2 text-foreground/60">
              <span className="text-xs font-semibold uppercase tracking-wide text-foreground/40">Company</span>
              <a href="#talk-to-us" className="hover:text-foreground">
                Talk to us
              </a>
            </div>
          </div>
        </div>
        <div className="border-t border-line px-4 py-4 text-center text-xs text-foreground/40 sm:px-8">
          Growth Strategy Simulator — a planning tool, not a guarantee of outcomes.
        </div>
      </footer>
    </div>
  );
}

function Check() {
  return (
    <svg viewBox="0 0 20 20" className="mt-0.5 h-4 w-4 shrink-0 text-foreground" fill="none">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.3" opacity="0.25" />
      <path d="M6 10.2l2.4 2.4L14 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MiniIcon({ title }: { title: string }) {
  if (title === "Simulator")
    return (
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
        <path d="M4 15V9M10 15V5M16 15v-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  if (title === "Methodology & sources")
    return (
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
        <path d="M4 4h9l3 3v9H4V4z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        <path d="M7 9h6M7 12h6" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none">
      <path d="M10 3l6 3.2v7.6L10 17l-6-3.2V6.2L10 3z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M10 10v7M4 6.2l6 3.8 6-3.8" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
    </svg>
  );
}

/** Hero's product-preview widget — a stylised, illustrative stand-in for the Summary tab, not a literal screenshot. */
function PreviewCard() {
  const bars = [58, 82, 45, 90, 34, 70];
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between text-xs text-foreground/50">
        <span className="font-semibold text-foreground">Summary</span>
        <span>Base scenario</span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-3">
        <MiniStat label="Budget" value="₹5.0L" />
        <MiniStat label="Blended CAC" value="₹1.4K" />
        <MiniStat label="Leads" value="358" />
      </div>
      <div className="mt-5 flex h-24 items-end gap-2">
        {bars.map((h, i) => (
          <div key={i} className="flex-1 rounded-t bg-brand-soft" style={{ height: `${h}%` }}>
            <div className="h-full w-full rounded-t bg-brand" style={{ opacity: 0.15 + i * 0.13 }} />
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between text-[11px] text-foreground/40">
        <span>Google Search</span>
        <span>LinkedIn</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-line p-2.5">
      <div className="text-[10px] uppercase tracking-wide text-foreground/40">{label}</div>
      <div className="font-display mt-0.5 text-base font-semibold text-foreground">{value}</div>
    </div>
  );
}

function ChannelMixPreview() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <div className="text-xs font-semibold text-foreground/60">Google &amp; Meta &amp; LinkedIn budget</div>
      <div className="mt-3 flex h-5 overflow-hidden rounded-full">
        <div className="bg-brand" style={{ width: "39%" }} />
        <div className="bg-foreground/60" style={{ width: "14%" }} />
        <div className="bg-foreground/40" style={{ width: "18%" }} />
        <div className="bg-foreground/25" style={{ width: "17%" }} />
        <div className="bg-foreground/15" style={{ width: "12%" }} />
      </div>
      <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-xs text-foreground/60 sm:grid-cols-4">
        {CHANNELS_PREVIEW.map((c) => (
          <div key={c} className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-foreground/40" />
            {c}
          </div>
        ))}
      </div>
    </div>
  );
}

function DerivationPreview() {
  return (
    <div className="rounded-2xl border border-line bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">Qualification Rate</span>
        <span className="rounded-full bg-brand-soft px-2 py-0.5 text-[10px] font-semibold text-foreground/70">
          Tier 5 · Benchmark
        </span>
      </div>
      <div className="mt-3 text-2xl font-semibold text-foreground">68%</div>
      <div className="mt-1 text-xs text-foreground/50">Market range 55%–80%</div>
      <div className="mt-4 border-t border-line pt-3">
        <div className="text-xs font-semibold text-foreground/70">How this was derived</div>
        <p className="mt-1 text-xs text-foreground/50">
          No lender publishes a lead-qualification rate. Reverse-solved from RBI&apos;s digital-lending
          screening data and Fintel Connect&apos;s approval/disbursal benchmarks so the full funnel&apos;s
          math holds together end to end.
        </p>
      </div>
    </div>
  );
}

function ExploreCard({
  href,
  label,
  title,
  body,
}: {
  href: string;
  label: string;
  title: string;
  body: string;
}) {
  return (
    <Link href={href} className="group flex flex-col gap-2 rounded-xl border border-line p-5 hover:border-foreground/30">
      <span className="text-xs font-semibold uppercase tracking-wide text-foreground/40">{label}</span>
      <span className="font-display text-base font-semibold text-foreground group-hover:underline">{title}</span>
      <span className="text-sm text-foreground/60">{body}</span>
    </Link>
  );
}
