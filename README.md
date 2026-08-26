# Growth Strategy Simulator

A CXO-grade Google & Meta performance marketing planning tool for the
**India market**: pick an industry and a goal, and it benchmarks your funnel
against sourced India market data, shows the real cost ladder from a click to
a paying customer, back-solves budget from a target (or forecasts outcome
from a budget), models conservative/base/upside scenarios, and shows where
the next rupee should go across Google Search, Display, YouTube, Meta, SEO
and ASO.

Ships with four industries today — Personal Loans, EMI Calculator,
Investments, and News/Content App (installs) — each with its own funnel
shape (lending lead-gen, investment lead-gen, app install, or website
registration/click) and India-specific benchmarks. More industry packs
follow the same benchmark + forecast + scenario architecture.

## What's in here

- `src/lib/growth-simulator/benchmarks.ts` — a hand-curated Personal Loans /
  India benchmark library (CPC, CTR, landing CVR, qualification/approval/
  disbursal rates, CAC, retention), each with source, tier (1–5), confidence
  score, applicability score, and freshness — click any source badge in the
  app to see the full provenance.
- `src/lib/growth-simulator/engine.ts` — the deterministic calculation layer
  (no LLM in the loop): the funnel forecast model, conservative/base/upside
  scenarios, the constraint/bottleneck engine, the "Next Rupee" marginal
  return engine, and GEI.
- `src/components/growth-simulator/*` — the interactive UI: CXO summary
  strip, editable benchmark table, scenario table, constraint card, Next
  Rupee table.

## Running locally

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

## Deploying on Railway

This repo deploys on Railway with no extra setup — `railway.json` pins the
Nixpacks builder and start command, and `package.json` declares
`engines.node`.

1. In the [Railway dashboard](https://railway.com/new), choose **Deploy from
   GitHub repo** and select `pranitakpadwal/growth-simulator`.
2. Railway auto-detects Next.js, runs `npm install && npm run build`, and
   starts it with `npm run start -- -p $PORT`.
3. Once the deploy finishes, generate a public domain under the service's
   **Settings → Networking → Generate Domain** — that URL is what you share
   with the team.

No environment variables are required for this MVP; everything runs from the
in-repo benchmark library and deterministic engine.
