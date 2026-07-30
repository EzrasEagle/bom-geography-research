/**
 * Distance / closeness for geographic associations.
 * Most spans are unknown in miles; presets capture what the TEXT actually gives
 * so Map Lab can draw short edges and flag model projections that stretch them.
 */

import type { SpanQuality } from "@/data/suggested-associations";

/** How tight the places must be (model-testable) */
export type ClosenessStrength = "hard" | "soft" | "speculative";

/**
 * Presets — pick from text, not invent miles unless stated.
 * Map Lab uses maxDayFraction of a default day-walk as soft layout pull.
 */
export type DistancePreset =
  | "unknown"
  /** Same battle / scene — co-mentioned as one action locale */
  | "same_scene"
  /** On the border / edge of a land */
  | "border_adjacent"
  /** "by" / "ran by" — immediately adjacent */
  | "by_adjacent"
  /** East/west/north/south of a river or feature — same theater, river-separated */
  | "across_feature"
  /** Inside the same land */
  | "within_land"
  /** About a day's journey or less (soft) */
  | "day_or_less"
  /** Multi-day (still approximate) */
  | "days_journey"
  /** Explicit stated distance in text */
  | "stated";

export type SpatialPlacement =
  | "unspecified"
  | "east_of"
  | "west_of"
  | "north_of"
  | "south_of"
  | "on_border"
  | "by"
  | "at_river"
  | "across_river"
  | "within";

export type DistanceSpec = {
  quality: SpanQuality;
  preset: DistancePreset;
  /** Free text e.g. "border of land of Zarahemla, east of Sidon" */
  value?: string;
  note?: string;
  /** Max fraction of one open-terrain day-walk (Map Lab layout hint) */
  maxDayFraction?: number;
  closeness: ClosenessStrength;
  placement: SpatialPlacement;
};

export const DISTANCE_PRESETS: {
  id: DistancePreset;
  label: string;
  description: string;
  quality: SpanQuality;
  maxDayFraction: number;
  defaultCloseness: ClosenessStrength;
}[] = [
  {
    id: "unknown",
    label: "Unknown",
    description: "No distance claim — still link for topology",
    quality: "unknown",
    maxDayFraction: 3,
    defaultCloseness: "speculative",
  },
  {
    id: "same_scene",
    label: "Same scene / battlefield",
    description: "One narrative locale (battle, camp). Very tight.",
    quality: "approximate",
    maxDayFraction: 0.15,
    defaultCloseness: "hard",
  },
  {
    id: "by_adjacent",
    label: "By / ran by (adjacent)",
    description: "“By the land…” = immediate adjacency",
    quality: "approximate",
    maxDayFraction: 0.25,
    defaultCloseness: "hard",
  },
  {
    id: "border_adjacent",
    label: "Border / edge of land",
    description: "At or on the border of a land (e.g. hill on edge of Zarahemla)",
    quality: "approximate",
    maxDayFraction: 0.35,
    defaultCloseness: "hard",
  },
  {
    id: "across_feature",
    label: "Across river/feature (same theater)",
    description: "East/west of Sidon etc. — near, but feature between",
    quality: "approximate",
    maxDayFraction: 0.5,
    defaultCloseness: "hard",
  },
  {
    id: "within_land",
    label: "Within same land",
    description: "City/hill inside a land’s sphere",
    quality: "approximate",
    maxDayFraction: 0.75,
    defaultCloseness: "soft",
  },
  {
    id: "day_or_less",
    label: "≤ 1 day journey",
    description: "Soft upper bound from travel language",
    quality: "approximate",
    maxDayFraction: 1,
    defaultCloseness: "soft",
  },
  {
    id: "days_journey",
    label: "Multi-day journey",
    description: "Longer corridor; still approximate",
    quality: "approximate",
    maxDayFraction: 4,
    defaultCloseness: "soft",
  },
  {
    id: "stated",
    label: "Stated in text",
    description: "Explicit measure — put value in the box",
    quality: "stated",
    maxDayFraction: 1,
    defaultCloseness: "hard",
  },
];

export function presetToDistanceSpec(
  preset: DistancePreset,
  overrides?: Partial<DistanceSpec>,
): DistanceSpec {
  const p = DISTANCE_PRESETS.find((x) => x.id === preset) ?? DISTANCE_PRESETS[0]!;
  return {
    quality: p.quality,
    preset,
    maxDayFraction: p.maxDayFraction,
    closeness: p.defaultCloseness,
    placement: "unspecified",
    value: p.id === "unknown" ? undefined : p.label,
    ...overrides,
  };
}

/** Co-mention in same verse ⇒ at least soft hard-neighborhood claim */
export function coMentionDistance(
  placement: SpatialPlacement = "unspecified",
): DistanceSpec {
  return presetToDistanceSpec("same_scene", {
    note: "Co-mentioned in same verse/scene — models that separate them by another polity/land without the river feature should fail.",
    closeness: "hard",
    placement,
    value: "same narrative scene (co-mention)",
  });
}

export function distanceSpecLabel(d: DistanceSpec): string {
  if (d.preset === "stated" && d.value) return d.value;
  if (d.value) return d.value;
  return DISTANCE_PRESETS.find((p) => p.id === d.preset)?.label ?? d.preset;
}

/** Infer preset from relation words */
export function presetFromRelation(
  relation: string,
): { preset: DistancePreset; placement: SpatialPlacement } {
  const r = relation.toLowerCase();
  if (r.includes("east")) return { preset: "across_feature", placement: "east_of" };
  if (r.includes("west")) return { preset: "across_feature", placement: "west_of" };
  if (r.includes("north")) return { preset: "across_feature", placement: "north_of" };
  if (r.includes("south")) return { preset: "across_feature", placement: "south_of" };
  if (r.includes("border")) return { preset: "border_adjacent", placement: "on_border" };
  if (r === "by" || r.includes("ran by")) return { preset: "by_adjacent", placement: "by" };
  if (r.includes("near")) return { preset: "border_adjacent", placement: "by" };
  if (r === "in" || r.includes("within")) return { preset: "within_land", placement: "within" };
  return { preset: "same_scene", placement: "unspecified" };
}
