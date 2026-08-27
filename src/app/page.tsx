import Link from "next/link";

export const metadata = {
  title: "Growth Strategy Simulator — plan your India marketing spend",
};

const STEPS = [
  {
    title: "How much to spend",
    body:
      "Enter a monthly or daily budget — or flip it around and tell the tool how many leads, installs, or registrations you need, and it back-solves the budget required.",
  },
  {
    title: "Where to spend it",
    body:
      "See the split across Google Search, Display, YouTube (or Google App Campaigns for app goals), Meta — Facebook and Instagram — plus what SEO and ASO can carry organically.",
  },
  {
    title: "What you get back",
    body:
      "A full funnel from impression to paying customer: cost per click, per lead, per install, all the way to your blended CAC — with Conservative / Base / Upside scenarios, not one falsely precise number.",
  },
];

const INDUSTRIES = [
  "Personal Loans",
  "EMI Calculators",
  "EPF",
  "Credit Cards",
  "Investments",
  "News Apps",
  "Social Apps",
  "Business Apps",
  "Travel",
  "Events / Ticketing",
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
          <span className="text-xs font-medium uppercase tracking-wide text-brand">
            Growth Strategy Simulator · India
          </span>
          <nav className="flex items-center gap-4 text-xs text-foreground/60">
            <Link href="/glossary" className="hover:text-brand">
              Glossary
            </Link>
            <Link href="/methodology" className="hover:text-brand">
              Methodology &amp; sources
            </Link>
            <Link
              href="/simulator"
              className="rounded-full bg-brand px-3 py-1.5 font-semibold text-white hover:opacity-90"
            >
              Try the tool
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-14 sm:px-8 sm:py-20">
            <h1 className="font-display max-w-3xl text-3xl font-semibold tracking-tight text-foreground sm:text-5xl">
              How much should you spend, where, and what will you actually get back?
            </h1>
            <p className="max-w-2xl text-base text-foreground/70 sm:text-lg">
              Pick your industry and your goal — lead generation, app installs, website registrations — and
              this tool turns a rupee budget into a full India performance marketing plan: channel split,
              cost per click through to cost per customer, and a Conservative / Base / Upside forecast.
              Built on named, cited benchmarks from Google, Meta, AppsFlyer, SensorTower and other
              recognised sources — never a guess dressed up as a number.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/simulator"
                className="rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                Try the simulator — no signup needed
              </Link>
              <a
                href="#talk-to-us"
                className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-foreground hover:bg-background"
              >
                Need help building the strategy?
              </a>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">How it works</h2>
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <div key={step.title} className="rounded-lg border border-line bg-surface p-5">
                <span className="text-xs font-semibold uppercase tracking-wide text-brand">
                  Step {i + 1}
                </span>
                <h3 className="mt-1 font-display text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-foreground/70">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Channel estimate preview */}
        <section className="border-y border-line bg-surface">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Check estimates by channel before you commit budget
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-foreground/70">
              Every channel gets its own CPC/CPI benchmark, its own share of the budget, and its own
              contribution to the funnel — so you can see, before spending a rupee, whether Google Search
              or Meta or organic SEO/ASO is doing the heavy lifting for your target CAC.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {["Google Search", "Google Display", "YouTube", "Facebook", "Instagram", "SEO / ASO"].map(
                (ch) => (
                  <div
                    key={ch}
                    className="rounded-lg border border-line bg-background px-3 py-4 text-center text-sm font-medium text-foreground/80"
                  >
                    {ch}
                  </div>
                )
              )}
            </div>
            <Link
              href="/simulator"
              className="mt-6 inline-block text-sm font-semibold text-brand hover:underline"
            >
              See your channel-by-channel estimate →
            </Link>
          </div>
        </section>

        {/* Industries */}
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-8">
          <h2 className="font-display text-2xl font-semibold text-foreground">
            Built for the industries you actually plan for
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-foreground/70">
            Each industry carries its own funnel shape, audience, and benchmark set — not one generic
            template stretched across every vertical.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {INDUSTRIES.map((ind) => (
              <span
                key={ind}
                className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-foreground/80"
              >
                {ind}
              </span>
            ))}
          </div>
        </section>

        {/* Talk to us */}
        <section id="talk-to-us" className="border-t border-line bg-surface">
          <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-14 sm:px-8">
            <h2 className="font-display text-2xl font-semibold text-foreground">
              Need help building the strategy? Talk to us.
            </h2>
            <p className="max-w-2xl text-sm text-foreground/70">
              This tool gets you a well-sourced starting plan in minutes. If you want it turned into a
              real, funded strategy — client-specific data, channel execution, ongoing optimisation — we
              build that too.
            </p>
            <div>
              <a
                href="mailto:strategy@appstudiox.com?subject=Growth%20strategy%20help"
                className="inline-block rounded-full bg-brand px-6 py-3 text-sm font-semibold text-white shadow-sm hover:opacity-90"
              >
                Email strategy@appstudiox.com
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-4 py-6 text-center text-xs text-foreground/40 sm:px-8">
        Growth Strategy Simulator — a planning tool, not a guarantee of outcomes. See{" "}
        <Link href="/methodology" className="underline hover:text-foreground/60">
          methodology &amp; sources
        </Link>
        .
      </footer>
    </div>
  );
}
