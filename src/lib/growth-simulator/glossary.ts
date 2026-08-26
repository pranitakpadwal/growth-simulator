/**
 * Plain-language definitions for the jargon this tool uses. Every term
 * shown with an InfoTooltip pulls from here — one source of truth instead
 * of copy drifting across components.
 */
export const GLOSSARY: Record<string, string> = {
  cac: "Customer Acquisition Cost — total spend divided by the number of customers (or leads/installs, depending on the stage) it produced. The single most important cost number in this tool.",
  blendedCac: "The CAC across every channel combined, weighted by how much each channel actually spent and produced — not a simple average of each channel's individual CAC.",
  cpc: "Cost Per Click — what you pay each time someone clicks your ad. This is a media-buying cost, not the same as CAC (which is cost per customer, much further down the funnel).",
  cpi: "Cost Per Install — CPC divided by your click-to-install rate. What one app install actually costs once you account for people who click but don't install.",
  ctr: "Click-Through Rate — the % of people who see your ad (an impression) and click it.",
  cvr: "Conversion Rate — the % of people at one funnel stage who make it to the next (e.g. click → lead).",
  targetCac: "The most you're willing to pay to acquire one customer/lead/install. Set this and the tool tells you the max CPC each channel can afford while staying under it.",
  revenuePerConversion: "What one conversion (a funded customer, a lead, an install — whatever this goal's value stage is) is worth to the business in revenue, before costs. This is your input, not a benchmark — use your own P&L.",
  variableCost: "The cost that scales with each conversion, separate from media spend — e.g. loan processing cost, customer support, payment gateway fees. Subtracted from revenue to get contribution.",
  contributionMargin: "The % of revenue left after direct costs of goods/service (before marketing spend and the variable cost above). Multiplying revenue by this gives gross contribution, which media spend and variable cost are then subtracted from.",
  contribution: "What's actually left over after revenue, contribution margin, media spend, and variable cost are all accounted for. The real profitability number — not just revenue.",
  gei: "Growth Efficiency Index — contribution generated per rupee spent (Contribution ÷ Spend). Above 1 means the spend is profitable after all costs; below 1 means it isn't yet.",
  costLadder: "The cascade of cost from a click to an actual customer — CPC compounds at every funnel drop-off, so cost-per-lead, cost-per-approval, and cost-per-funded-customer are each higher than the one before.",
  aso: "App Store Optimization — improving your app's store listing (title, screenshots, keywords, ratings) to increase organic (unpaid) installs.",
  seo: "Search Engine Optimization — improving your website's organic (unpaid) search ranking to drive free traffic.",
  organic: "Traffic or installs you didn't pay media budget for directly — driven by search ranking, app store ranking, referrals, or brand recall instead.",
  budgetCadence: "Whether the number you type is a daily or monthly budget — the tool converts it to a monthly figure internally either way.",
  planByGoal: "Instead of entering a budget and seeing what it produces, tell the tool how many leads/installs you need and it works backward to the budget required, using your current CPC and conversion rates.",
};

export function glossaryTerm(key: keyof typeof GLOSSARY | string): string | undefined {
  return GLOSSARY[key];
}
