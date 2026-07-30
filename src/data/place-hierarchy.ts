/**
 * Land / city hierarchy & size tiers (internal graph).
 * Models map these ids to real-world polygons later; hierarchy stays model-neutral.
 */

export type PlaceSizeTier =
  | "point" // hill, pass, soft feature
  | "settlement_small"
  | "settlement_city"
  | "land_local" // city-land / small land
  | "land_region" // Land of Nephi / Zarahemla
  | "land_greater" // Lamanite lands sphere
  | "wilderness_band"
  | "sea";

export type HierarchyLink = {
  childId: string;
  parentId: string;
  relation: "city_in_land" | "land_in_greater" | "part_of";
  note?: string;
};

/** Default size tier by kind */
export const DEFAULT_SIZE: Record<string, PlaceSizeTier> = {
  city: "settlement_city",
  land: "land_region",
  river: "point",
  hill: "point",
  sea: "sea",
  wilderness: "wilderness_band",
  other: "point",
};

/** Radius hint for Map Lab (abstract units; later → km) */
export const SIZE_RADIUS: Record<PlaceSizeTier, number> = {
  point: 8,
  settlement_small: 14,
  settlement_city: 22,
  land_local: 40,
  land_region: 70,
  land_greater: 110,
  wilderness_band: 50,
  sea: 90,
};

export const hierarchyLinks: HierarchyLink[] = [
  { childId: "city-nephi", parentId: "nephi", relation: "city_in_land", note: "City of Nephi within land of Nephi" },
  { childId: "shilom", parentId: "nephi", relation: "city_in_land" },
  { childId: "shemlon", parentId: "nephi", relation: "land_in_greater", note: "Near Nephi complex (Lamanite side often)" },
  { childId: "city-zarahemla", parentId: "zarahemla-land", relation: "city_in_land" },
  { childId: "gideon", parentId: "zarahemla-land", relation: "city_in_land", note: "East of Sidon, Zarahemla sphere" },
  { childId: "melek", parentId: "zarahemla-land", relation: "land_in_greater" },
  { childId: "minon", parentId: "zarahemla-land", relation: "land_in_greater" },
  { childId: "lehi-city", parentId: "east-sea-cluster", relation: "city_in_land", note: "East-sea city chain (Alma 50–51)" },
  { childId: "morianton", parentId: "east-sea-cluster", relation: "city_in_land" },
  { childId: "mulek", parentId: "east-sea-cluster", relation: "city_in_land" },
  { childId: "jershon", parentId: "east-sea-cluster", relation: "land_in_greater" },
];

export function childrenOf(parentId: string) {
  return hierarchyLinks.filter((h) => h.parentId === parentId);
}

export function parentOf(childId: string) {
  return hierarchyLinks.find((h) => h.childId === childId);
}
