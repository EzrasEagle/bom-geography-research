/**
 * Multi-path travel model (not single static edges).
 *
 * Each PATH is a sequence of waypoints that can:
 * - state an intended destination vs actual end
 * - share a trunk with another path then diverge
 * - carry unknown distance/time
 * - later snap waypoints to real contours (Terrain Lab)
 *
 * Why not one edge “Zarahemla–Desolation” only?
 * Because Limhi’s party intended Zarahemla (or Nephi region search),
 * traveled wilderness shared with Nephi corridor, then ended at Desolation.
 * That is a branch narrative — two paths, shared trunk.
 */

export type Waypoint = {
  /** Map feature id when known; or free label for intermediate “branch” nodes */
  featureId?: string;
  /** Display label if no feature (e.g. "divergence / lost") */
  label?: string;
  /** Abstract canvas position override (model space). If omitted, use layout[featureId] or control point. */
  x?: number;
  y?: number;
  /** Role of this point on the journey */
  role?: "start" | "via" | "intended" | "actual" | "branch" | "end";
};

export type TravelPath = {
  id: string;
  name: string;
  /** Scripture / historical label */
  sourceRefs: string[];
  summary: string;
  /** What they meant to reach */
  intendedDestinationId?: string;
  /** Where the narrative actually ends */
  actualDestinationId?: string;
  waypoints: Waypoint[];
  /** Paths that share the initial corridor (same direction leaving Zarahemla) */
  sharesTrunkWith?: string[];
  distance: { quality: "unknown" | "approximate" | "stated"; value?: string; note?: string };
  time: { quality: "unknown" | "approximate" | "stated"; value?: string; note?: string };
  /** Visual style */
  style: "solid" | "dashed" | "dotted";
  color: string;
  /** Soft wilderness corridor vs hard road */
  corridor?: "wilderness" | "coast" | "river" | "unknown";
  tags?: string[];
};

/**
 * Seed paths — Nephi–Zarahemla corridor + Limhi lost party branch to Desolation.
 *
 * Visual intent:
 * - Path A: Mosiah / Omni — Nephi → wilderness → down → Zarahemla (or reverse)
 * - Path B: Limhi search — Zarahemla → same wilderness bearing toward Nephi → DIVERGE → Desolation
 * Shared trunk: Zarahemla leaving into wilderness in Nephi-ward direction.
 */
export const travelPaths: TravelPath[] = [
  {
    id: "path-omni-mosiah-to-zarahemla",
    name: "Mosiah: Nephi → wilderness → Zarahemla",
    sourceRefs: ["Omni 1:12–13"],
    summary:
      "Flee land of Nephi into the wilderness; led through wilderness; came down into Zarahemla. Distance/time unknown.",
    intendedDestinationId: "zarahemla",
    actualDestinationId: "zarahemla",
    waypoints: [
      { featureId: "nephi", role: "start" },
      { featureId: "wilderness", role: "via", label: "wilderness corridor" },
      { featureId: "zarahemla", role: "end" },
    ],
    sharesTrunkWith: ["path-limhi-lost-to-desolation", "path-omni-return-toward-nephi"],
    distance: { quality: "unknown", note: "Not stated Omni 1:12–13" },
    time: { quality: "unknown" },
    style: "solid",
    color: "#9a3412",
    corridor: "wilderness",
    tags: ["came down", "wilderness"],
  },
  {
    id: "path-omni-return-toward-nephi",
    name: "Omni party: toward Nephi (up into wilderness)",
    sourceRefs: ["Omni 1:27–28"],
    summary:
      "Leave Zarahemla-ward settlement; go up into wilderness to return to land of Nephi; many slain; remnant returns to Zarahemla. Shows reverse bearing on same corridor family.",
    intendedDestinationId: "nephi",
    actualDestinationId: "zarahemla",
    waypoints: [
      { featureId: "zarahemla", role: "start" },
      { featureId: "wilderness", role: "via" },
      // intended but not reached as permanent end for the survivors who return
      { featureId: "nephi", role: "intended", label: "intended: land of Nephi" },
      { featureId: "zarahemla", role: "actual", label: "survivors return" },
    ],
    sharesTrunkWith: ["path-omni-mosiah-to-zarahemla", "path-limhi-lost-to-desolation"],
    distance: { quality: "unknown" },
    time: { quality: "unknown" },
    style: "dashed",
    color: "#b45309",
    corridor: "wilderness",
    tags: ["went up", "failed permanent settlement"],
  },
  {
    id: "path-limhi-lost-to-desolation",
    name: "Limhi search party: intended Zarahemla / Nephi-ward → lost → Desolation",
    sourceRefs: ["Mosiah 8:7–11", "Mosiah 21:25–27"],
    summary:
      "Party sent from land of Nephi (Limhi) to find Zarahemla; lost in the wilderness; discovered land of many waters / dry bones / plates — land of Desolation association in tradition. Best modeled as: start Nephi → wilderness trunk shared with Zarahemla route → branch away from Zarahemla → Desolation. Intended ≠ actual.",
    intendedDestinationId: "zarahemla",
    actualDestinationId: "desolation",
    waypoints: [
      { featureId: "nephi", role: "start", label: "from Limhi / land of Nephi" },
      { featureId: "wilderness", role: "via", label: "lost in the wilderness" },
      // Branch control point: still “toward” Zarahemla then peels north to Desolation
      {
        label: "divergence (lost)",
        role: "branch",
        // Between wilderness and zarahemla, then offset toward desolation — abstract
        x: 250,
        y: 140,
      },
      { featureId: "desolation", role: "actual", label: "actual: Desolation / bones / records" },
      // Ghost intended
      { featureId: "zarahemla", role: "intended", label: "intended: Zarahemla (not found)" },
    ],
    sharesTrunkWith: ["path-omni-mosiah-to-zarahemla"],
    distance: {
      quality: "unknown",
      note: "Long enough / complex enough to become lost; no mile count",
    },
    time: { quality: "unknown", note: "Many days implied by lost expedition motif" },
    style: "dotted",
    color: "#0369a1",
    corridor: "wilderness",
    tags: ["lost_party", "intended_vs_actual", "desolation"],
  },
  {
    id: "path-zarahemla-to-nephi-generic",
    name: "Generic Zarahemla ↔ Nephi wilderness trunk",
    sourceRefs: ["Omni 1:12–13", "Mosiah 7", "Mosiah 22"],
    summary:
      "Abstract trunk used by multiple narratives. Not a single historical march — a corridor family for branching real routes later.",
    intendedDestinationId: "nephi",
    actualDestinationId: "nephi",
    waypoints: [
      { featureId: "zarahemla", role: "start" },
      { featureId: "wilderness", role: "via" },
      { featureId: "nephi", role: "end" },
    ],
    sharesTrunkWith: ["path-limhi-lost-to-desolation", "path-omni-return-toward-nephi"],
    distance: { quality: "unknown" },
    time: { quality: "unknown" },
    style: "dashed",
    color: "#a8a29e",
    corridor: "wilderness",
    tags: ["trunk", "multi-narrative"],
  },
];

export function pathsForFeature(featureId: string): TravelPath[] {
  return travelPaths.filter(
    (p) =>
      p.intendedDestinationId === featureId ||
      p.actualDestinationId === featureId ||
      p.waypoints.some((w) => w.featureId === featureId),
  );
}

export function allTravelPaths() {
  return travelPaths;
}
