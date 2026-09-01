import Link from "next/link";
import Logo from "./Logo";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/simulator", label: "Simulator" },
  { href: "/glossary", label: "Glossary" },
  { href: "/methodology", label: "Methodology" },
] as const;

/**
 * The same nav shell on every page — home, simulator, glossary, methodology
 * — so the site reads as one product instead of four differently-styled
 * pages bolted together.
 */
export default function SiteHeader({ active }: { active: "home" | "simulator" | "glossary" | "methodology" }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-8">
        <Link href="/">
          <Logo />
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`hidden sm:inline ${
                active === link.href.replace("/", "") || (active === "home" && link.href === "/")
                  ? "font-semibold text-foreground"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/simulator"
            className="rounded-full bg-brand px-4 py-2 text-sm font-semibold text-brand-contrast hover:opacity-85"
          >
            Try the simulator
          </Link>
        </nav>
      </div>
    </header>
  );
}
