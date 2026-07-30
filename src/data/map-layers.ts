/**
 * Map Lab overlay layers — toggles for what to draw.
 * Object layers (settlement, hydro…) filter *places*;
 * these overlay layers filter *draw modes* (edges, campaigns, dates…).
 */

export type MapOverlayId =
  | "places"
  | "labels"
  | "constraint_edges"
  | "user_associations"
  | "hard_near_only"
  | "paths_corridors"
  | "soft_wilderness"
  | "campaigns"
  | "elevation"
  | "day_rings"
  | "climate"
  | "seas"
  | "hydro_graph"
  /** Chronology filter — only show places/edges active in window */
  | "chrono_filter"
  | "conflicts";

export type MapOverlayDef = {
  id: MapOverlayId;
  label: string;
  group: "base" | "connections" | "movement" | "environment" | "analysis" | "time";
  description: string;
  /** Available now in Map Lab */
  ready: boolean;
  /** Default on */
  defaultOn: boolean;
};

export const MAP_OVERLAYS: MapOverlayDef[] = [
  {
    id: "places",
    label: "Places",
    group: "base",
    description: "Cities, lands, hills, rivers as pins",
    ready: true,
    defaultOn: true,
  },
  {
    id: "labels",
    label: "Labels",
    group: "base",
    description: "Place names (respects auto/hover/all)",
    ready: true,
    defaultOn: true,
  },
  {
    id: "seas",
    label: "Seas / coasts",
    group: "base",
    description: "Sea east / sea west strips and pins",
    ready: true,
    defaultOn: true,
  },
  {
    id: "constraint_edges",
    label: "Seed constraints",
    group: "connections",
    description: "Model pack adjacency / travel edges",
    ready: true,
    defaultOn: true,
  },
  {
    id: "user_associations",
    label: "Your associations",
    group: "connections",
    description: "Links saved from the Reader chain",
    ready: true,
    defaultOn: true,
  },
  {
    id: "hard_near_only",
    label: "Hard-near only",
    group: "connections",
    description: "Only hard closeness edges (filter)",
    ready: true,
    defaultOn: false,
  },
  {
    id: "hydro_graph",
    label: "River graph (Sidon…)",
    group: "connections",
    description: "Bank / through / head relations",
    ready: true,
    defaultOn: true,
  },
  {
    id: "paths_corridors",
    label: "Path corridors",
    group: "movement",
    description: "Route associations (Nephi–Zarahemla spine etc.)",
    ready: true,
    defaultOn: true,
  },
  {
    id: "soft_wilderness",
    label: "Wilderness bands",
    group: "movement",
    description: "Soft corridor along routes",
    ready: true,
    defaultOn: true,
  },
  {
    id: "campaigns",
    label: "Campaigns / armies",
    group: "movement",
    description: "Amlicites, Limhi party, flex progressions",
    ready: true,
    defaultOn: true,
  },
  {
    id: "elevation",
    label: "Elevation signals",
    group: "environment",
    description: "↑ down / came down markers on routes & edges",
    ready: true,
    defaultOn: true,
  },
  {
    id: "day_rings",
    label: "Day-walk rings",
    group: "environment",
    description: "Macro pace rings (when relevant place selected)",
    ready: true,
    defaultOn: false,
  },
  {
    id: "climate",
    label: "Climate / seasons",
    group: "environment",
    description: "Whirlwinds, storms, agricultural cues",
    ready: true,
    defaultOn: false,
  },
  {
    id: "chrono_filter",
    label: "Filter by date",
    group: "time",
    description: "Show only places/edges in a chronology window",
    ready: true,
    defaultOn: false,
  },
  {
    id: "conflicts",
    label: "Constraint conflicts",
    group: "analysis",
    description: "Highlight stretched hard-near edges",
    ready: true,
    defaultOn: true,
  },
];

/** Planned layers — documented for UI “coming” section */
export const PLANNED_OVERLAYS: { label: string; description: string }[] = [
  {
    label: "Real basemap (topo / DEM)",
    description: "USGS / SRTM underlay once projection exists",
  },
  {
    label: "Polity control (time-sliced)",
    description: "Nephite vs Lamanite spheres by year",
  },
  {
    label: "Land polygons (flex borders)",
    description: "Borders snap to rivers/ridges",
  },
  {
    label: "Visibility / line-of-sight",
    description: "Hill Amnihu overlooks",
  },
  {
    label: "Model comparison overlay",
    description: "Sorenson vs Heartland pin offsets",
  },
  {
    label: "Evidence heat (verse density)",
    description: "How many refs support each place",
  },
];

export const OVERLAY_GROUPS: {
  id: MapOverlayDef["group"];
  label: string;
}[] = [
  { id: "base", label: "Base" },
  { id: "connections", label: "Connections" },
  { id: "movement", label: "Movement" },
  { id: "environment", label: "Environment" },
  { id: "time", label: "Time" },
  { id: "analysis", label: "Analysis" },
];

export function defaultOverlayState(): Record<MapOverlayId, boolean> {
  const o = {} as Record<MapOverlayId, boolean>;
  for (const d of MAP_OVERLAYS) o[d.id] = d.defaultOn;
  return o;
}

export type ChronoWindow =
  | "all"
  | "small_plates"
  | "mosiah_alma"
  | "helaman_3ne"
  | "mormon_moroni";

export const CHRONO_WINDOWS: {
  id: ChronoWindow;
  label: string;
  /** Rough heading-era filter string match */
  match: RegExp;
}[] = [
  { id: "all", label: "All periods", match: /.*/ },
  {
    id: "small_plates",
    label: "Small plates (~600–130 BC)",
    match: /600|592|588|570|544|421|399|361|323|317|279|130|Nephi|Jacob|Enos|Jarom|Omni|Mosiah 1/i,
  },
  {
    id: "mosiah_alma",
    label: "Mosiah–Alma (~130–50 BC)",
    match: /130|124|121|100|92|87|81|74|73|72|67|66|65|64|63|62|61|60|55|50|Mosiah|Alma/i,
  },
  {
    id: "helaman_3ne",
    label: "Helaman–3 Nephi (~50 BC–AD 35)",
    match: /52|39|30|6|1 BC|AD 1|AD 16|AD 34|Helaman|3 Nephi|Third Nephi/i,
  },
  {
    id: "mormon_moroni",
    label: "Mormon–Moroni (~AD 300–421)",
    match: /300|321|327|345|350|360|375|385|400|421|Mormon|Moroni|Ether/i,
  },
];
