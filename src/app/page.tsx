import GrowthSimulator from "@/components/growth-simulator/GrowthSimulator";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 sm:px-8">
          <span className="text-xs font-medium uppercase tracking-wide text-brand">
            Growth Strategy Simulator · India
          </span>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Plan your Google &amp; Meta performance marketing before you spend the money
          </h1>
          <p className="max-w-2xl text-sm text-foreground/70 sm:text-base">
            Pick an industry and a goal — lead generation, app installs, website registrations — and get
            a full India performance marketing plan: who you&apos;re reaching, what it costs at every
            stage from a click to a paying customer, what budget a target number of leads or installs
            actually needs, and where across Google Search, Display, YouTube, Meta, SEO and ASO the next
            rupee should go. Built for India benchmarks and an India audience throughout — not a global
            average with an India label on it.
          </p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">
        <GrowthSimulator />
      </main>
      <footer className="border-t border-line px-4 py-6 text-center text-xs text-foreground/40 sm:px-8">
        Growth Strategy Simulator — a planning tool, not a guarantee of outcomes.
      </footer>
    </div>
  );
}
