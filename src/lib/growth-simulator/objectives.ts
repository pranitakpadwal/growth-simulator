import type { ChannelId, ChannelObjectiveDefinition, ChannelObjectiveId, UnitCostBenchmark } from "./types";

/**
 * Not every campaign on YouTube, Meta, or LinkedIn is bought against a
 * lead/install funnel — the platforms sell several distinct bid objectives,
 * each with its own KPI and cost unit:
 *
 *   - YouTube: Video Views (CPV) alongside the lead/install-driving Video
 *     Action campaigns already modelled via the shared funnel.
 *   - Meta (Facebook/Instagram): Traffic (website clicks), Engagement
 *     (follower/page growth), and Messages (click-to-WhatsApp/Messenger)
 *     alongside Leads.
 *   - LinkedIn: Awareness (impressions) and Traffic alongside Leads.
 *
 * A View, a Follow, or a Message isn't a lead — there's no defensible way
 * to fold them into the click -> lead -> customer funnel or a CAC/revenue
 * number, so a non-funnel objective gets its own simple spend ÷
 * cost-per-unit -> volume calculation instead, kept clearly separate from
 * the funnel-driven totals (see GrowthSimulator's `objectiveForecasts`).
 *
 * Deliberately NOT modelled: YouTube "Subscribers" and "Live concurrent
 * viewers" aren't things a platform sells as a bid target — they're
 * downstream outcomes of a Views/Reach campaign that depend on content,
 * subscribe-CTA placement, and (for a livestream) premiere scheduling far
 * more than on media spend. No published benchmark ties ad spend directly
 * to either number, so rather than invent one, Views is offered with a
 * real CPV benchmark and a note pointing at why those two aren't separate
 * line items.
 */
export const CHANNEL_OBJECTIVES: Partial<Record<ChannelId, ChannelObjectiveDefinition[]>> = {
  youtube: [
    {
      id: "leads",
      label: "Leads / Installs (drives the funnel below)",
      unitLabel: "lead",
      description: "A Video Action campaign optimised for clicks through to your goal — the default, modelled like Search/Display.",
      feedsFunnel: true,
    },
    {
      id: "views",
      label: "Video Views",
      unitLabel: "view",
      description:
        "A Video Views campaign, bought on CPV — building awareness or watch time, not driving a click-through funnel. Subscribers and concurrent live viewers aren't sold as a separate bid target; they're a downstream outcome of a Views campaign that depends on your content and CTA, not on spend alone.",
      feedsFunnel: false,
    },
  ],
  facebook: [
    {
      id: "leads",
      label: "Leads / Installs (drives the funnel below)",
      unitLabel: "lead",
      description: "Website Conversions / Lead Gen objective — the default, modelled like Search.",
      feedsFunnel: true,
    },
    {
      id: "traffic",
      label: "Traffic (Website Clicks)",
      unitLabel: "click",
      description: "A Traffic campaign optimised purely for link clicks — cheaper per click than Leads, no conversion event tracked.",
      feedsFunnel: false,
    },
    {
      id: "engagement",
      label: "Engagement / Page Followers",
      unitLabel: "follow",
      description: "An Engagement campaign growing your Page's followers and post engagement — a brand-building lever, not a lead source.",
      feedsFunnel: false,
    },
    {
      id: "messages",
      label: "Messages (Click-to-WhatsApp / Messenger)",
      unitLabel: "conversation",
      description: "A Click-to-Message campaign that opens a WhatsApp or Messenger conversation — increasingly the default lead motion for India D2C/services.",
      feedsFunnel: false,
    },
  ],
  instagram: [
    {
      id: "leads",
      label: "Leads / Installs (drives the funnel below)",
      unitLabel: "lead",
      description: "Website Conversions / Lead Gen objective — the default, modelled like Search.",
      feedsFunnel: true,
    },
    {
      id: "traffic",
      label: "Traffic (Website Clicks)",
      unitLabel: "click",
      description: "A Traffic campaign optimised purely for link clicks — cheaper per click than Leads, no conversion event tracked.",
      feedsFunnel: false,
    },
    {
      id: "engagement",
      label: "Engagement / Followers",
      unitLabel: "follow",
      description: "An Engagement campaign growing your account's followers and post engagement — a brand-building lever, not a lead source.",
      feedsFunnel: false,
    },
    {
      id: "messages",
      label: "Messages (Click-to-WhatsApp / DM)",
      unitLabel: "conversation",
      description: "A Click-to-Message campaign that opens a WhatsApp or Instagram DM conversation.",
      feedsFunnel: false,
    },
  ],
  linkedin: [
    {
      id: "leads",
      label: "Leads (Lead Gen Forms / Website Conversions)",
      unitLabel: "lead",
      description: "Native Lead Gen Forms or website-conversion campaigns — the default, modelled like Search using LinkedIn's own CPC/CTR.",
      feedsFunnel: true,
    },
    {
      id: "traffic",
      label: "Traffic (Website Clicks)",
      unitLabel: "click",
      description: "A Website Visits campaign optimised for clicks, no conversion event tracked — LinkedIn's cheapest objective.",
      feedsFunnel: false,
    },
    {
      id: "awareness",
      label: "Awareness (Impressions)",
      unitLabel: "impression",
      description: "A Brand Awareness campaign bought on CPM — reach and impressions among a targeted professional audience, not clicks or leads.",
      feedsFunnel: false,
    },
  ],
};

export function getChannelObjectives(channelId: ChannelId): ChannelObjectiveDefinition[] {
  return CHANNEL_OBJECTIVES[channelId] ?? [];
}

export function getChannelObjective(channelId: ChannelId, objectiveId: ChannelObjectiveId): ChannelObjectiveDefinition | undefined {
  return CHANNEL_OBJECTIVES[channelId]?.find((o) => o.id === objectiveId);
}

/**
 * Cost-per-unit benchmarks for non-funnel objectives. India-specific where
 * the research supports it; global/directional figures are labelled tier 4
 * (industry research / vendor pricing guides) rather than tier 3, since
 * these are aggregated advertiser-reported guides rather than a platform's
 * own published report or a large third-party dataset.
 */
export const OBJECTIVE_UNIT_BENCHMARKS: Partial<Record<ChannelId, Partial<Record<ChannelObjectiveId, UnitCostBenchmark>>>> = {
  youtube: {
    views: {
      costPerUnit: 2,
      costPerUnitP25: 1.2,
      costPerUnitP75: 3,
      unitLabel: "view",
      source: "YouTube Ads India 2026 CPV pricing guides (Megadigital, AtomComm) — skippable in-stream placements",
      tier: 4,
      confidenceScore: 45,
      notes: "Shorts placements run far higher on a CPM basis (₹350–450 CPM) — treat this as an in-stream/in-feed skippable-ad estimate, not a blended figure across every YouTube ad format.",
    },
  },
  facebook: {
    traffic: {
      costPerUnit: 12,
      costPerUnitP25: 5,
      costPerUnitP75: 20,
      unitLabel: "click",
      source: "Facebook Ads India 2026 cost benchmarks (QTC Infotech, PaidMediaWorld) — Traffic objective CPC",
      tier: 4,
      confidenceScore: 42,
    },
    engagement: {
      costPerUnit: 9,
      costPerUnitP25: 5,
      costPerUnitP75: 15,
      unitLabel: "follow",
      source: "Strategy-desk estimate — Meta Engagement-objective CPC triangulated against typical engaged-click-to-follow rates; no platform-published cost-per-follow benchmark exists",
      tier: 5,
      confidenceScore: 30,
      notes: "Meta doesn't sell or report a direct \"cost per follower\" metric — this is derived, not observed. Treat as directional only.",
    },
    messages: {
      costPerUnit: 32,
      costPerUnitP25: 18,
      costPerUnitP75: 54,
      unitLabel: "conversation",
      source: "Click-to-WhatsApp Ads 2026 India/MENA benchmark report (getkanal.com) — cost per opened conversation",
      tier: 4,
      confidenceScore: 44,
      notes: "Meta charges nothing for template messages sent within the 72-hour window after a user opens the conversation — the real cost of nurturing a lead this way is lower than CPV alone suggests.",
    },
  },
  instagram: {
    traffic: {
      costPerUnit: 22,
      costPerUnitP25: 10,
      costPerUnitP75: 40,
      unitLabel: "click",
      source: "Instagram Ads India 2026 cost benchmarks (QTC Infotech, PaidMediaWorld) — Traffic objective CPC",
      tier: 4,
      confidenceScore: 40,
    },
    engagement: {
      costPerUnit: 11,
      costPerUnitP25: 6,
      costPerUnitP75: 18,
      unitLabel: "follow",
      source: "Strategy-desk estimate — Meta Engagement-objective CPC triangulated against typical engaged-click-to-follow rates; no platform-published cost-per-follow benchmark exists",
      tier: 5,
      confidenceScore: 30,
      notes: "Instagram doesn't sell or report a direct \"cost per follower\" metric — this is derived, not observed. Treat as directional only.",
    },
    messages: {
      costPerUnit: 30,
      costPerUnitP25: 16,
      costPerUnitP75: 50,
      unitLabel: "conversation",
      source: "Click-to-WhatsApp Ads 2026 India/MENA benchmark report (getkanal.com) — cost per opened conversation",
      tier: 4,
      confidenceScore: 44,
    },
  },
  linkedin: {
    traffic: {
      costPerUnit: 220,
      costPerUnitP25: 130,
      costPerUnitP75: 400,
      unitLabel: "click",
      source: "LinkedIn Ads India 2026 CPC benchmarks (upGrowth, get-ryze) — Website Visits objective",
      tier: 4,
      confidenceScore: 45,
      notes: "Cheaper than the Leads-objective CPC below — Website Visits campaigns aren't optimised for form-fill intent.",
    },
    awareness: {
      costPerUnit: 1.8,
      costPerUnitP25: 1,
      costPerUnitP75: 3.2,
      unitLabel: "impression (₹ CPM ÷ 1000)",
      source: "LinkedIn Ads India 2026 CPM benchmarks (upGrowth) — Brand Awareness objective, ₹500–₹3,500 CPM range",
      tier: 4,
      confidenceScore: 40,
    },
  },
};

export function getUnitBenchmark(channelId: ChannelId, objectiveId: ChannelObjectiveId): UnitCostBenchmark | undefined {
  return OBJECTIVE_UNIT_BENCHMARKS[channelId]?.[objectiveId];
}
