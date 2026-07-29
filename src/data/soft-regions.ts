/**
 * Soft corridors (wilderness): drawn ALONG connections, not as hulls that
 * swallow cities. Each association is a leg: from place --(days into corridor)--> along route.
 *
 * Wilderness does NOT encompass Zarahemla; it approaches within proximityDays
 * of the contact point, then stops.
 */

export type CorridorAssociation = {
  id: string;
  regionId: string;
  /** Place the corridor touches (does not engulf) */
  placeId: string;
  /** Other end of this corridor segment (toward which wilderness stretches) */
  towardPlaceId: string;
  /**
   * How far FROM the place INTO the corridor the wilderness is attested
   * (default 1 day). Not the full Nephi–Zarahemla distance.
   */
  proximityDays: number;
  strength: "soft" | "hard";
  sourceRefs?: string[];
  note?: string;
};

/** Corridor legs: wilderness only along routes we have associations for */
export const corridorAssociations: CorridorAssociation[] = [
  {
    id: "wild-nephi-toward-zara",
    regionId: "wilderness",
    placeId: "nephi",
    towardPlaceId: "zarahemla",
    proximityDays: 1,
    strength: "hard",
    sourceRefs: ["Omni 1:12–13"],
    note: "Flee into wilderness from Nephi — corridor begins near Nephi, along path toward Zarahemla",
  },
  {
    id: "wild-zara-toward-nephi",
    regionId: "wilderness",
    placeId: "zarahemla",
    towardPlaceId: "nephi",
    proximityDays: 1,
    strength: "hard",
    sourceRefs: ["Omni 1:13"],
    note: "Arrive from wilderness into Zarahemla — corridor ends near Zarahemla, does not swallow the land",
  },
  {
    id: "wild-nephi-toward-desolation",
    regionId: "wilderness",
    placeId: "nephi",
    towardPlaceId: "desolation",
    proximityDays: 1,
    strength: "soft",
    sourceRefs: ["Mosiah 8:7–11"],
    note: "Lost-party branch: wilderness also along Nephi→Desolation family",
  },
  {
    id: "wild-desolation-toward-nephi",
    regionId: "wilderness",
    placeId: "desolation",
    towardPlaceId: "nephi",
    proximityDays: 1,
    strength: "soft",
    sourceRefs: ["Mosiah 8:7–11", "Alma 22:30–31"],
    note: "Desolation side of lost-party wilderness — approaches Desolation, does not fill the map",
  },
];

export function corridorsForRegion(regionId: string): CorridorAssociation[] {
  return corridorAssociations.filter((c) => c.regionId === regionId);
}

export function isSoftRegionFeature(id: string, kind?: string): boolean {
  if (id === "wilderness") return true;
  if (id.startsWith("climate-")) return true;
  if (kind === "wilderness") return true;
  return false;
}

/** Abstract canvas units for 1 day on OPEN ground (macro scales this). */
export const DEFAULT_DAY_PIXELS = 28;

/** @deprecated use corridorAssociations */
export const softRegionProximities = corridorAssociations.map((c) => ({
  regionId: c.regionId,
  placeId: c.placeId,
  proximityDays: c.proximityDays,
  strength: c.strength,
  sourceRefs: c.sourceRefs,
  note: c.note,
}));

export function proximitiesForRegion(regionId: string) {
  return softRegionProximities.filter((p) => p.regionId === regionId);
}
