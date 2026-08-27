import Link from "next/link";
import { GLOSSARY } from "@/lib/growth-simulator/glossary";

export const metadata = {
  title: "Glossary",
  description: "Plain-language definitions for every metric the Growth Strategy Simulator uses.",
};

const TERM_LABELS: Record<string, string> = {
  cac: "CAC (Customer Acquisition Cost)",
  blendedCac: "Blended CAC",
  cpc: "CPC (Cost Per Click)",
  cpi: "CPI (Cost Per Install)",
  ctr: "CTR (Click-Through Rate)",
  cvr: "CVR (Conversion Rate)",
  targetCac: "Target CAC",
  revenuePerConversion: "Revenue per conversion",
  variableCost: "Variable cost",
  contributionMargin: "Contribution margin",
  contribution: "Contribution",
  gei: "GEI (Growth Efficiency Index)",
  costLadder: "Cost ladder",
  aso: "ASO (App Store Optimization)",
  seo: "SEO (Search Engine Optimization)",
  organic: "Organic",
  budgetCadence: "Budget cadence",
  planByGoal: "Plan by target",
};

export default function GlossaryPage() {
  const entries = Object.entries(GLOSSARY);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-6 sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-medium uppercase tracking-wide text-brand">
              Growth Strategy Simulator · India
            </span>
            <nav className="flex gap-4 text-xs text-foreground/60">
              <Link href="/" className="hover:text-brand">
                Home
              </Link>
              <Link href="/simulator" className="hover:text-brand">
                Try the simulator
              </Link>
              <Link href="/methodology" className="hover:text-brand">
                Methodology &amp; sources
              </Link>
            </nav>
          </div>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Glossary
          </h1>
          <p className="max-w-2xl text-sm text-foreground/70">
            Every metric shown in the simulator, in plain language. These are the same definitions behind
            the little <span className="rounded-full border border-line px-1.5 text-xs">i</span> icons
            throughout the tool.
          </p>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-8 sm:px-8">
        <dl className="flex flex-col divide-y divide-line rounded-lg border border-line bg-surface">
          {entries.map(([key, definition]) => (
            <div key={key} id={key} className="px-4 py-4 sm:px-6">
              <dt className="font-display text-base font-semibold text-foreground">
                {TERM_LABELS[key] ?? key}
              </dt>
              <dd className="mt-1 text-sm text-foreground/70">{definition}</dd>
            </div>
          ))}
        </dl>
      </main>
      <footer className="border-t border-line px-4 py-6 text-center text-xs text-foreground/40 sm:px-8">
        Growth Strategy Simulator — a planning tool, not a guarantee of outcomes.
      </footer>
    </div>
  );
}
