import Link from "next/link";
import GrowthSimulator from "@/components/growth-simulator/GrowthSimulator";
import SiteHeader from "@/components/growth-simulator/SiteHeader";

export const metadata = {
  title: "Simulator",
};

export default function SimulatorPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader active="simulator" />
      <div className="border-b border-line">
        <div className="mx-auto flex max-w-3xl flex-col gap-2 px-4 py-8 sm:px-8">
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Plan your Google, Meta &amp; LinkedIn performance marketing before you spend the money
          </h1>
          <p className="text-sm text-foreground/70 sm:text-base">
            Pick an industry and a goal — lead generation, app installs, website registrations — and get a
            full India performance marketing plan: who you&apos;re reaching, what it costs at every stage
            from a click to a paying customer, and where the next rupee should go. Every benchmark sourced,
            every conversion rate explained.
          </p>
        </div>
      </div>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">
        <GrowthSimulator />
      </main>
      <footer className="border-t border-line px-4 py-6 text-center text-xs text-foreground/40 sm:px-8">
        Growth Strategy Simulator — a planning tool, not a guarantee of outcomes. Every benchmark is
        sourced — see the{" "}
        <Link href="/methodology" className="underline hover:text-foreground/60">
          methodology &amp; sources
        </Link>{" "}
        page.
      </footer>
    </div>
  );
}
