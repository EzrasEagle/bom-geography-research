/**
 * Editable route associations: path + span + narrative flags.
 * Wilderness soft-region shape is derived from enabled routes' endpoints.
 */

export type ElevationKind = "level" | "up" | "down" | "unknown";

/** Ordered elevation along the route (0–1 along spine). */
export type ElevationSegment = {
  id: string;
  /** Start of segment along spine (0–1) */
  t0: number;
  /** End of segment along spine (0–1) */
  t1: number;
  kind: ElevationKind;
  /** Text phrase if any */
  phrase?: string;
  note?: string;
};

export type SpanField = {
  quality: "unknown" | "approximate" | "stated";
  value?: string;
  note?: string;
};

export type RouteAssociation = {
  id: string;
  name: string;
  /** Ordered endpoints / via place ids (spine of the route) */
  placeIds: string[];
  /** Narrative objects/phrases for this association */
  objects: string[];
  sourceRefs: string[];
  summary: string;
  distance: SpanField;
  time: SpanField;
  /** Lost / failed to reach intended */
  lost?: boolean;
  intendedDestinationId?: string;
  actualDestinationId?: string;
  /** Branch joins this route id's wilderness trunk */
  branchesFromRouteId?: string;
  /** 0–1 along parent spine where branch splits (inside wilderness) */
  branchT?: number;
  corridor: "wilderness" | "open" | "coast" | "unknown";
  enabled: boolean;
  color: string;
  style: "solid" | "dashed" | "dotted";
  /** Elevation profile along the route (sequence) */
  elevation?: ElevationSegment[];
};


export const defaultRouteAssociations: RouteAssociation[] = [
  {
    id: "route-nephi-zarahemla-omni",
    name: "Mosiah: Nephi → wilderness → down → Zarahemla",
    placeIds: ["nephi", "zarahemla"],
    objects: ["land of Nephi", "wilderness", "came down", "land of Zarahemla"],
    sourceRefs: ["Omni 1:12–13"],
    summary:
      "Entire journey through wilderness until they came down into Zarahemla. Distance/time unknown.",
    distance: { quality: "unknown", note: "Not stated" },
    time: { quality: "unknown", note: "Not stated" },
    intendedDestinationId: "zarahemla",
    actualDestinationId: "zarahemla",
    corridor: "wilderness",
    enabled: true,
    color: "#9a3412",
    style: "solid",
    elevation: [
      {
        id: "elev-nephi-wild-level",
        t0: 0,
        t1: 0.82,
        kind: "level",
        phrase: "through the wilderness",
        note: "No elevation change stated until arrival at Zarahemla",
      },
      {
        id: "elev-down-zara",
        t0: 0.82,
        t1: 1,
        kind: "down",
        phrase: "came down into the land of Zarahemla",
        note: "Down signal at approach/entry to Zarahemla (Omni 1:13)",
      },
    ],
  },
  {
    id: "route-limhi-lost-desolation",
    name: "Limhi party: intended Zarahemla → lost → Desolation",
    placeIds: ["nephi", "desolation"],
    objects: ["land of Nephi", "wilderness", "lost", "land of Desolation", "Zarahemla (intended)"],
    sourceRefs: ["Mosiah 8:7–11", "Mosiah 21:25–27"],
    summary:
      "Shares Nephi–Zarahemla wilderness trunk; splits inside wilderness toward Desolation. Intended ≠ actual.",
    distance: { quality: "unknown", note: "Large enough to get lost" },
    time: { quality: "unknown" },
    lost: true,
    intendedDestinationId: "zarahemla",
    actualDestinationId: "desolation",
    branchesFromRouteId: "route-nephi-zarahemla-omni",
    branchT: 0.55,
    corridor: "wilderness",
    enabled: true,
    color: "#0369a1",
    style: "dotted",
  },
  {
    id: "route-omni-return-nephi",
    name: "Omni: up into wilderness toward Nephi",
    placeIds: ["zarahemla", "nephi"],
    objects: ["land of Zarahemla", "wilderness", "went up", "land of Nephi"],
    sourceRefs: ["Omni 1:27–28"],
    summary: "Go up into wilderness to return to Nephi; many slain; survivors to Zarahemla.",
    distance: { quality: "unknown" },
    time: { quality: "unknown" },
    intendedDestinationId: "nephi",
    actualDestinationId: "zarahemla",
    corridor: "wilderness",
    enabled: false,
    color: "#b45309",
    style: "dashed",
    elevation: [
      {
        id: "elev-up-from-zara",
        t0: 0,
        t1: 0.2,
        kind: "up",
        phrase: "went up into the wilderness",
        note: "Up leaving Zarahemla toward Nephi (Omni 1:27–28)",
      },
      {
        id: "elev-wild-level-return",
        t0: 0.2,
        t1: 1,
        kind: "level",
        phrase: "into the wilderness … land of Nephi",
        note: "Thereafter wilderness toward Nephi; no further elev stated here",
      },
    ],
  },
];

const KEY = "bom-atlas-route-associations-v1";

export function loadRouteAssociations(): RouteAssociation[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(defaultRouteAssociations);
    const parsed = JSON.parse(raw) as RouteAssociation[];
    // merge new defaults by id
    const byId = new Map(parsed.map((r) => [r.id, r]));
    for (const d of defaultRouteAssociations) {
      if (!byId.has(d.id)) {
        byId.set(d.id, d);
      } else {
        const cur = byId.get(d.id)!;
        // fill new fields (e.g. elevation profile) if missing on saved copy
        if (!cur.elevation && d.elevation) {
          byId.set(d.id, { ...d, ...cur, elevation: d.elevation });
        }
      }
    }
    return [...byId.values()];
  } catch {
    return structuredClone(defaultRouteAssociations);
  }
}

export function saveRouteAssociations(rows: RouteAssociation[]) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}
