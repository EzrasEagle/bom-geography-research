/**
 * Named progressions (armies, scouts, migrations) — not just place↔place edges.
 * On a real topo overlay, these routes FLEX around obstacles while keeping
 * ordered waypoints and constraints (start, end, "above X", east of river…).
 */

export type CampaignKind =
  | "army"
  | "scout"
  | "migration"
  | "mission"
  | "lost_party"
  | "other";

export type CampaignWaypoint = {
  placeId?: string;
  label: string;
  /** 0–1 along nominal path before flex */
  t?: number;
  note?: string;
  /** Relational constraint at this stop */
  relation?: string;
};

export type Campaign = {
  id: string;
  name: string;
  /** e.g. "Amlicite army" */
  actor: string;
  kind: CampaignKind;
  /** Ordered narrative waypoints (may be soft / approximate) */
  waypoints: CampaignWaypoint[];
  sourceRefs: string[];
  summary: string;
  /** Distance usually unknown */
  distanceQuality: "unknown" | "approximate" | "stated";
  timeQuality: "unknown" | "approximate" | "stated";
  /** When overlaid on real terrain, path may detour around enemy holds etc. */
  flexAroundObstacles: boolean;
  /** Place ids that path should prefer to avoid (until model says otherwise) */
  avoidPlaceIds?: string[];
  enabled: boolean;
  color: string;
  style: "solid" | "dashed" | "dotted";
};

export const defaultCampaigns: Campaign[] = [
  {
    id: "camp-amlicite-amnihu-minon",
    name: "Amlicite camp: Amnihu → Minon",
    actor: "Amlicite army",
    kind: "army",
    waypoints: [
      { placeId: "amnihu", label: "Hill Amnihu", t: 0, note: "Battle / muster theater" },
      {
        placeId: "minon",
        label: "Land of Minon",
        t: 1,
        relation: "above land of Zarahemla; in course of land of Nephi",
        note: "Above Zarahemla; on the Nephi-ward approach",
      },
    ],
    sourceRefs: ["Alma 2:15–24"],
    summary:
      "After Amnihu, the Amlicite camp is found in Minon above Zarahemla, in the course of the land of Nephi. Exact trail unknown — must remain a flexible route that can bend around Nephite positions once projected on real terrain.",
    distanceQuality: "unknown",
    timeQuality: "unknown",
    flexAroundObstacles: true,
    avoidPlaceIds: ["zarahemla"],
    enabled: true,
    color: "#b91c1c",
    style: "dashed",
  },
  {
    id: "camp-limhi-lost",
    name: "Limhi party (lost) seeking Nephi",
    actor: "Limhi’s search party",
    kind: "lost_party",
    waypoints: [
      { placeId: "zarahemla", label: "Zarahemla", t: 0 },
      { placeId: "desolation", label: "Land of Desolation", t: 1, note: "Actual arrival (lost)" },
    ],
    sourceRefs: ["Mosiah 8:7–11", "Mosiah 21:25–27"],
    summary: "Intended Nephi; found desolation / remains of Jaredite destruction.",
    distanceQuality: "unknown",
    timeQuality: "unknown",
    flexAroundObstacles: true,
    enabled: true,
    color: "#7c3aed",
    style: "dotted",
  },
];

const KEY = "bom-atlas-campaigns-v1";

export function loadCampaigns(): Campaign[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultCampaigns.map((c) => ({ ...c }));
    const parsed = JSON.parse(raw) as Campaign[];
    // merge new defaults by id
    const map = new Map(parsed.map((c) => [c.id, c]));
    for (const d of defaultCampaigns) {
      if (!map.has(d.id)) map.set(d.id, d);
    }
    return [...map.values()];
  } catch {
    return defaultCampaigns.map((c) => ({ ...c }));
  }
}

export function saveCampaigns(rows: Campaign[]) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}
