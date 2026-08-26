import type { ChannelId } from "@/lib/growth-simulator/types";

/**
 * Validated categorical palette (dataviz skill reference instance) — fixed
 * hue order, not re-derived per chart. Each channel gets a STABLE slot so
 * its color never changes when the channel's rank changes (e.g. resorting
 * the efficiency table never repaints which color means "Instagram").
 */
export const CATEGORICAL_SLOTS = {
  1: { light: "#2a78d6", dark: "#3987e5" }, // blue
  2: { light: "#eb6834", dark: "#d95926" }, // orange
  3: { light: "#1baf7a", dark: "#199e70" }, // aqua
  4: { light: "#eda100", dark: "#c98500" }, // yellow
  5: { light: "#e87ba4", dark: "#d55181" }, // magenta
  6: { light: "#008300", dark: "#008300" }, // green
  7: { light: "#4a3aa7", dark: "#9085e9" }, // violet
  8: { light: "#e34948", dark: "#e66767" }, // red
} as const;

/**
 * 8 channels, all 8 slots — but Google buys either Search/Display/YouTube
 * OR the single App Campaigns (UAC) channel, never both, and ASO only
 * shows for app-acquisition goals, so at most 6 (website) or 5 (app) of
 * these ever render together. Both concurrent sets were validated
 * (adjacent pairs pass CVD/contrast; the contrast WARN is mitigated by
 * every chart's legend/labels staying in ink color, never the series hue).
 */
export const CHANNEL_COLOR_SLOT: Record<ChannelId, keyof typeof CATEGORICAL_SLOTS> = {
  "google-search": 1,
  "google-display": 2,
  youtube: 3,
  "google-uac": 5,
  facebook: 4,
  instagram: 6,
  seo: 7,
  aso: 8,
};

export function channelColor(channelId: ChannelId, mode: "light" | "dark" = "light"): string {
  return CATEGORICAL_SLOTS[CHANNEL_COLOR_SLOT[channelId]][mode];
}
