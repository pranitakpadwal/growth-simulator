/**
 * Brand mark — three descending bars forming a funnel silhouette, the same
 * shape the app's own Funnel Chart and Cost Ladder use everywhere inside
 * the tool. Tied to what the product actually visualizes rather than a
 * generic up-and-to-the-right arrow (the single most overused "growth"
 * glyph there is) or an abstract blob/hexagon.
 */
export function LogoMark({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" aria-hidden="true">
      <rect x="3" y="4" width="18" height="3.5" rx="1" fill="currentColor" />
      <rect x="7" y="10.25" width="10" height="3.5" rx="1" fill="currentColor" />
      <rect x="11" y="16.5" width="2" height="3.5" rx="1" fill="currentColor" />
    </svg>
  );
}

export default function Logo({ wordmark = true, className = "" }: { wordmark?: boolean; className?: string }) {
  return (
    <span className={`flex items-center gap-2 ${className}`}>
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-brand text-brand-contrast">
        <LogoMark className="h-3.5 w-3.5" />
      </span>
      {wordmark && <span className="text-sm font-semibold tracking-tight text-foreground">Growth Simulator</span>}
    </span>
  );
}
