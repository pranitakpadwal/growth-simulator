import type { ChannelId } from "@/lib/growth-simulator/types";

/**
 * Validated categorical palette (dataviz skill reference instance) — fixed
 * hue order, not re-derived per chart. Each channel gets a STABLE slot so
 * its color never changes when the channel's rank changes (e.g. resorting
 * the efficiency table never repaints which color means "Meta").
 */
export const CATEGORICAL_SLOTS = {
  1: { light: "#2a78d6", dark: "#3987e5" }, // blue
  2: { light: "#eb6834", dark: "#d95926" }, // orange
  3: { light: "#1baf7a", dark: "#199e70" }, // aqua
  4: { light: "#eda100", dark: "#c98500" }, // yellow
  6: { light: "#008300", dark: "#008300" }, // green
  7: { light: "#4a3aa7", dark: "#9085e9" }, // violet
} as const;

/** Slot 5 (magenta) and slot 8 (red) are reserved — skipped here to keep every
 * channel's label readable without relying on the "relief rule" fallback. */
export const CHANNEL_COLOR_SLOT: Record<ChannelId, keyof typeof CATEGORICAL_SLOTS> = {
  "google-search": 1,
  "google-display": 2,
  youtube: 3,
  meta: 4,
  seo: 6,
  aso: 7,
};

export function channelColor(channelId: ChannelId, mode: "light" | "dark" = "light"): string {
  return CATEGORICAL_SLOTS[CHANNEL_COLOR_SLOT[channelId]][mode];
}
