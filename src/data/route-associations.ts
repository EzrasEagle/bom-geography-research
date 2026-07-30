/**
 * Editable route associations: path + span + narrative flags.
 * Wilderness soft-region shape is derived from enabled routes' endpoints.
 */

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
      if (!byId.has(d.id)) byId.set(d.id, d);
    }
    return [...byId.values()];
  } catch {
    return structuredClone(defaultRouteAssociations);
  }
}

export function saveRouteAssociations(rows: RouteAssociation[]) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}
