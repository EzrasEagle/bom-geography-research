/**
 * Soft taxonomy for geographic objects.
 *
 * Principle: categories organize UX and filters; they do NOT block cross-links.
 * A whirlwind can still connect to Zarahemla; Sidon can still touch Manti.
 * Use layers for "what am I looking at?" — not hard partitions of the graph.
 */

export type ObjectLayer =
  | "settlement"
  | "region"
  | "hydro"
  | "coast_sea"
  | "corridor"
  | "topo"
  | "climate"
  | "season"
  | "other";

export type ObjectRole =
  | "city"
  | "land"
  | "river"
  | "sea"
  | "hill"
  | "pass"
  | "hazard"
  | "seasonal"
  | "agriculture"
  | "elevation_ref"
  | "wilderness"
  | "other";

export const LAYER_META: Record<
  ObjectLayer,
  { label: string; description: string; color: string }
> = {
  settlement: {
    label: "Settlements",
    description: "Cities and named inhabited places",
    color: "#9a3412",
  },
  region: {
    label: "Lands / regions",
    description: "Broader lands (Nephi, Bountiful, Desolation…)",
    color: "#b45309",
  },
  hydro: {
    label: "Rivers & waters",
    description: "Sidon and other watercourses — path drawn from mention-sphere",
    color: "#1e3a5f",
  },
  coast_sea: {
    label: "Seas & coasts",
    description: "Sea east/west and seashore geometry",
    color: "#0f766e",
  },
  corridor: {
    label: "Corridors / necks",
    description: "Narrow neck, passes, travel funnels",
    color: "#57534e",
  },
  topo: {
    label: "Topography / elevation",
    description: "Hills, up/down markers, elevation bands",
    color: "#78716c",
  },
  climate: {
    label: "Climate & hazards",
    description: "Storms, whirlwinds — sphere = places mentioned with them",
    color: "#0369a1",
  },
  season: {
    label: "Seasons & agriculture",
    description: "Seasonal timing, grain, famine, campaign pauses",
    color: "#15803d",
  },
  other: {
    label: "Other",
    description: "Landing and unclassified",
    color: "#a8a29e",
  },
};

/** Map place id → layer + role (soft; extend freely). */
export const placeTaxonomy: Record<
  string,
  { layer: ObjectLayer; role: ObjectRole; elevationBand?: "highland" | "lowland" | "coastal" | "unknown" }
> = {
  nephi: { layer: "region", role: "land", elevationBand: "highland" },
  zarahemla: { layer: "settlement", role: "city", elevationBand: "lowland" },
  "zarahemla-land": { layer: "region", role: "land", elevationBand: "lowland" },
  "city-nephi": { layer: "settlement", role: "city", elevationBand: "highland" },
  amnihu: { layer: "topo", role: "hill", elevationBand: "lowland" },
  "east-sea-cluster": { layer: "region", role: "land", elevationBand: "coastal" },
  sidon: { layer: "hydro", role: "river", elevationBand: "unknown" },
  "bountiful-nw": { layer: "region", role: "land", elevationBand: "unknown" },
  desolation: { layer: "region", role: "land", elevationBand: "unknown" },
  "narrow-neck": { layer: "corridor", role: "pass", elevationBand: "unknown" },
  manti: { layer: "settlement", role: "city", elevationBand: "highland" },
  jershon: { layer: "region", role: "land", elevationBand: "coastal" },
  cumorah: { layer: "topo", role: "hill", elevationBand: "unknown" },
  landing: { layer: "other", role: "other", elevationBand: "coastal" },
  "sea-east": { layer: "coast_sea", role: "sea", elevationBand: "coastal" },
  "sea-west": { layer: "coast_sea", role: "sea", elevationBand: "coastal" },
  "climate-whirlwind": { layer: "climate", role: "hazard" },
  "climate-storms": { layer: "climate", role: "hazard" },
  "climate-seasons": { layer: "season", role: "seasonal" },
  "climate-agriculture": { layer: "season", role: "agriculture" },
  wilderness: { layer: "region", role: "wilderness", elevationBand: "unknown" },
  ammonihah: { layer: "settlement", role: "city", elevationBand: "lowland" },
  gideon: { layer: "settlement", role: "city", elevationBand: "lowland" },
  melek: { layer: "region", role: "land", elevationBand: "lowland" },
  minon: { layer: "region", role: "land", elevationBand: "unknown" },
  antionum: { layer: "region", role: "land", elevationBand: "unknown" },
  morianton: { layer: "settlement", role: "city", elevationBand: "coastal" },
  "lehi-city": { layer: "settlement", role: "city", elevationBand: "coastal" },
  mulek: { layer: "settlement", role: "city", elevationBand: "coastal" },
  joshua: { layer: "region", role: "land", elevationBand: "coastal" },
  helam: { layer: "region", role: "land", elevationBand: "unknown" },
  shemlon: { layer: "region", role: "land", elevationBand: "highland" },
  shilom: { layer: "region", role: "land", elevationBand: "highland" },
};

export function taxonomyFor(id: string) {
  return (
    placeTaxonomy[id] ?? {
      layer: "other" as ObjectLayer,
      role: "other" as ObjectRole,
      elevationBand: "unknown" as const,
    }
  );
}

export function layerOf(id: string): ObjectLayer {
  return taxonomyFor(id).layer;
}

/** Layers shown by default in the object picker (settlements first). */
export const DEFAULT_VISIBLE_LAYERS: ObjectLayer[] = [
  "settlement",
  "region",
  "hydro",
  "coast_sea",
  "corridor",
  "topo",
];

export const ALL_LAYERS = Object.keys(LAYER_META) as ObjectLayer[];
