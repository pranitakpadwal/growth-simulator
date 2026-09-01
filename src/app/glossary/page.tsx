import { GLOSSARY } from "@/lib/growth-simulator/glossary";
import SiteHeader from "@/components/growth-simulator/SiteHeader";
import { LogoMark } from "@/components/growth-simulator/Logo";

export const metadata = {
  title: "Glossary",
  description: "Plain-language definitions for every metric the Growth Strategy Simulator uses.",
};

const TERM_LABELS: Record<string, string> = {
  cac: "CAC",
  blendedCac: "Blended CAC",
  cpc: "CPC",
  cpi: "CPI",
  ctr: "CTR",
  cvr: "CVR",
  targetCac: "Target CAC",
  revenuePerConversion: "Revenue per conversion",
  variableCost: "Variable cost",
  contributionMargin: "Contribution margin",
  contribution: "Contribution",
  gei: "GEI",
  costLadder: "Cost ladder",
  aso: "ASO",
  seo: "SEO",
  organic: "Organic",
  budgetCadence: "Budget cadence",
  planByGoal: "Plan by target",
};

const TERM_EXPANSIONS: Record<string, string> = {
  cac: "Customer Acquisition Cost",
  cpc: "Cost Per Click",
  cpi: "Cost Per Install",
  ctr: "Click-Through Rate",
  cvr: "Conversion Rate",
  gei: "Growth Efficiency Index",
  aso: "App Store Optimization",
  seo: "Search Engine Optimization",
};

const CATEGORIES: { label: string; icon: "cost" | "rate" | "funnel" | "channel"; keys: string[] }[] = [
  { label: "Cost & revenue", icon: "cost", keys: ["cac", "blendedCac", "cpc", "cpi", "targetCac", "revenuePerConversion", "variableCost"] },
  { label: "Rates & efficiency", icon: "rate", keys: ["ctr", "cvr", "contributionMargin", "gei", "contribution"] },
  { label: "Planning & the funnel", icon: "funnel", keys: ["costLadder", "budgetCadence", "planByGoal"] },
  { label: "Channels", icon: "channel", keys: ["aso", "seo", "organic"] },
];

export default function GlossaryPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader active="glossary" />
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-8 sm:px-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Glossary
          </h1>
          <p className="text-sm text-foreground/70">
            Every metric shown in the simulator, in plain language — the same definitions behind the{" "}
            <InfoDot /> icons throughout the tool.
          </p>
        </div>
      </div>
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-8">
        <div className="flex flex-col gap-10">
          {CATEGORIES.map((cat) => (
            <section key={cat.label}>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-soft text-foreground">
                  <CategoryIcon icon={cat.icon} />
                </span>
                <h2 className="font-display text-base font-semibold text-foreground">{cat.label}</h2>
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {cat.keys.map((key) => (
                  <div key={key} id={key} className="rounded-xl border border-line p-4">
                    <dt className="flex items-baseline gap-1.5 font-display text-sm font-semibold text-foreground">
                      {TERM_LABELS[key] ?? key}
                      {TERM_EXPANSIONS[key] && (
                        <span className="text-xs font-normal text-foreground/40">{TERM_EXPANSIONS[key]}</span>
                      )}
                    </dt>
                    <dd className="mt-1.5 text-sm text-foreground/60">{GLOSSARY[key]}</dd>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
      <footer className="border-t border-line px-4 py-6 text-center text-xs text-foreground/40 sm:px-8">
        Growth Strategy Simulator — a planning tool, not a guarantee of outcomes.
      </footer>
    </div>
  );
}

function InfoDot() {
  return (
    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-line text-[10px] text-foreground/50">
      i
    </span>
  );
}

function CategoryIcon({ icon }: { icon: "cost" | "rate" | "funnel" | "channel" }) {
  if (icon === "funnel") return <LogoMark className="h-4 w-4" />;
  if (icon === "cost") return <span className="text-[15px] font-bold leading-none">₹</span>;
  if (icon === "rate")
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
        <circle cx="6" cy="6" r="2.2" stroke="currentColor" strokeWidth="1.4" />
        <circle cx="14" cy="14" r="2.2" stroke="currentColor" strokeWidth="1.4" />
        <path d="M15 5L5 15" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 10h14M10 3c2 2 2.5 4.5 2.5 7s-.5 5-2.5 7c-2-2-2.5-4.5-2.5-7s.5-5 2.5-7z" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}
