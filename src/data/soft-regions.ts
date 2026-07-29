/**
 * Soft regions (wilderness, climate spheres): not city pins.
 * Geometry = proximity envelope around anchor places + day-walk radius.
 */

export type ProximityLink = {
  /** Soft region feature id (e.g. wilderness) */
  regionId: string;
  /** Place that should sit near / inside the region */
  placeId: string;
  /** How near — default 1 day */
  proximityDays: number;
  /** Strength of the claim */
  strength: "soft" | "hard";
  sourceRefs?: string[];
  note?: string;
};

/** Default: wilderness near Nephi, Zarahemla, Desolation at 1 day each */
export const softRegionProximities: ProximityLink[] = [
  {
    regionId: "wilderness",
    placeId: "nephi",
    proximityDays: 1,
    strength: "hard",
    sourceRefs: ["Omni 1:12–13"],
    note: "Flee into the wilderness from land of Nephi — corridor abuts Nephi",
  },
  {
    regionId: "wilderness",
    placeId: "zarahemla",
    proximityDays: 1,
    strength: "hard",
    sourceRefs: ["Omni 1:13"],
    note: "Came down through wilderness into Zarahemla — corridor reaches Zarahemla",
  },
  {
    regionId: "wilderness",
    placeId: "desolation",
    proximityDays: 1,
    strength: "soft",
    sourceRefs: ["Mosiah 8:7–11", "Alma 22:30–31"],
    note: "Lost party / Desolation association — wilderness can reach Desolation vicinity",
  },
];

export function proximitiesForRegion(regionId: string): ProximityLink[] {
  return softRegionProximities.filter((p) => p.regionId === regionId);
}

export function isSoftRegionFeature(id: string, kind?: string): boolean {
  if (id === "wilderness") return true;
  if (id.startsWith("climate-")) return true;
  if (kind === "wilderness") return true;
  return false;
}

/** Pixel scale: abstract map — 1 day ≈ this many canvas units (tuned to 520×360 map). */
export const DEFAULT_DAY_PIXELS = 28;
