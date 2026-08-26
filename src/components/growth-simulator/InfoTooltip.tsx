"use client";

import { useState } from "react";
import { GLOSSARY } from "@/lib/growth-simulator/glossary";

/**
 * A small (i) that reveals a plain-language definition on click — the
 * "glossary in a popup on mouseover" ask, click-based rather than
 * hover-only so it also works on touch devices. Pull from GLOSSARY by
 * `term` key, or pass `definition` directly for a one-off explanation.
 */
export default function InfoTooltip({ term, definition }: { term?: keyof typeof GLOSSARY | string; definition?: string }) {
  const [open, setOpen] = useState(false);
  const text = definition ?? (term ? GLOSSARY[term] : undefined);
  if (!text) return null;

  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="What does this mean?"
        className="ml-1 inline-flex h-3.5 w-3.5 items-center justify-center rounded-full border border-foreground/30 text-[9px] font-semibold text-foreground/50 hover:border-brand hover:text-brand-dark"
      >
        i
      </button>
      {open && (
        <span className="absolute left-0 top-5 z-30 block w-60 rounded-lg border border-line bg-surface p-2.5 text-left text-xs font-normal normal-case leading-snug text-foreground/80 shadow-lg">
          {text}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-1.5 top-1.5 text-foreground/30 hover:text-foreground"
            aria-label="Close"
          >
            ✕
          </button>
        </span>
      )}
    </span>
  );
}
