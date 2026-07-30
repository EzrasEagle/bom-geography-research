import type { Point } from "@/lib/model-map-state";
import type { CorridorAssociation } from "@/data/soft-regions";
import { DEFAULT_DAY_PIXELS } from "@/data/soft-regions";

/**
 * Full-route wilderness band: polygon along the entire path A → B
 * (or multi-waypoint polyline), with half-width = perimeter.
 * Ends leave a small gap so the band does not swallow city pins.
 */
export function fullRouteBand(
  waypoints: Point[],
  halfWidthPx: number,
  endGapPx = 12,
): Point[] {
  if (waypoints.length < 2) return [];
  // Build left and right offsets along the polyline
  const left: Point[] = [];
  const right: Point[] = [];

  for (let i = 0; i < waypoints.length; i++) {
    const prev = waypoints[Math.max(0, i - 1)]!;
    const cur = waypoints[i]!;
    const next = waypoints[Math.min(waypoints.length - 1, i + 1)]!;
    // Tangent: average of segments
    let tx = 0;
    let ty = 0;
    if (i === 0) {
      tx = next.x - cur.x;
      ty = next.y - cur.y;
    } else if (i === waypoints.length - 1) {
      tx = cur.x - prev.x;
      ty = cur.y - prev.y;
    } else {
      tx = next.x - prev.x;
      ty = next.y - prev.y;
    }
    const len = Math.hypot(tx, ty) || 1;
    const ux = tx / len;
    const uy = ty / len;
    const px = -uy * halfWidthPx;
    const py = ux * halfWidthPx;

    let x = cur.x;
    let y = cur.y;
    // Pull ends inward so wilderness approaches but does not cover city centers
    if (i === 0 && waypoints.length >= 2) {
      const d = Math.hypot(waypoints[1]!.x - cur.x, waypoints[1]!.y - cur.y) || 1;
      const g = Math.min(endGapPx, d * 0.2);
      x = cur.x + ((waypoints[1]!.x - cur.x) / d) * g;
      y = cur.y + ((waypoints[1]!.y - cur.y) / d) * g;
    }
    if (i === waypoints.length - 1 && waypoints.length >= 2) {
      const a = waypoints[waypoints.length - 2]!;
      const d = Math.hypot(cur.x - a.x, cur.y - a.y) || 1;
      const g = Math.min(endGapPx, d * 0.2);
      x = cur.x - ((cur.x - a.x) / d) * g;
      y = cur.y - ((cur.y - a.y) / d) * g;
    }

    left.push({ x: x + px, y: y + py });
    right.push({ x: x - px, y: y - py });
  }

  // Closed band: left forward + right reverse
  return [...left, ...right.reverse()];
}

/** Short stub from place toward other (legacy / optional partial association). */
export function corridorBandPolygon(
  from: Point,
  toward: Point,
  lengthPx: number,
  halfWidthPx: number,
): Point[] {
  const dx = toward.x - from.x;
  const dy = toward.y - from.y;
  const dist = Math.hypot(dx, dy) || 1;
  const ux = dx / dist;
  const uy = dy / dist;
  const along = Math.min(lengthPx, dist * 0.92);
  const gap = Math.min(14, along * 0.15);
  if (along <= gap + 2) return [];
  const x0 = from.x + ux * gap;
  const y0 = from.y + uy * gap;
  const x1 = from.x + ux * along;
  const y1 = from.y + uy * along;
  const px = -uy * halfWidthPx;
  const py = ux * halfWidthPx;
  return [
    { x: x0 + px, y: y0 + py },
    { x: x1 + px, y: y1 + py },
    { x: x1 - px, y: y1 - py },
    { x: x0 - px, y: y0 - py },
  ];
}

export function dayLengthPixels(
  baseDayPixels: number,
  dayMilesOpen: number,
  dayMilesTerrain: number,
): number {
  const ratio = dayMilesTerrain / Math.max(1, dayMilesOpen);
  return baseDayPixels * ratio;
}

/**
 * Full routes that use wilderness corridor for their entire length.
 * Keyed by route id → waypoint feature ids.
 */
export type FullWildernessRoute = {
  id: string;
  /** Ordered place ids defining the spine (wilderness via can be mid auto-point) */
  placeIds: string[];
  sourceRefs?: string[];
  note?: string;
};

export const DEFAULT_FULL_WILDERNESS_ROUTES: FullWildernessRoute[] = [
  {
    id: "route-nephi-zarahemla-omni",
    placeIds: ["nephi", "zarahemla"],
    sourceRefs: ["Omni 1:12–13"],
    note: "Mosiah party: entire journey through wilderness until down into Zarahemla",
  },
  {
    id: "route-nephi-desolation-limhi-branch",
    placeIds: ["nephi", "desolation"],
    sourceRefs: ["Mosiah 8:7–11"],
    note: "Lost-party branch corridor family (optional overlay)",
  },
];

export function fullRouteBands(
  routes: FullWildernessRoute[],
  layout: Record<string, Point>,
  halfWidthPx: number,
  /** which route ids are enabled */
  enabledIds?: Set<string>,
): { id: string; points: Point[]; mid: Point }[] {
  const out: { id: string; points: Point[]; mid: Point }[] = [];
  for (const route of routes) {
    if (enabledIds && !enabledIds.has(route.id)) continue;
    const pts = route.placeIds
      .map((id) => layout[id])
      .filter((p): p is Point => !!p);
    if (pts.length < 2) continue;
    const points = fullRouteBand(pts, halfWidthPx);
    if (points.length < 3) continue;
    // Midpoint of spine for diamond label
    const midIdx = Math.floor(pts.length / 2);
    const mid =
      pts.length === 2
        ? { x: (pts[0]!.x + pts[1]!.x) / 2, y: (pts[0]!.y + pts[1]!.y) / 2 }
        : { ...pts[midIdx]! };
    out.push({ id: route.id, points, mid });
  }
  return out;
}

/** Still support stub corridors for partial associations */
export function regionCorridorPaths(
  links: CorridorAssociation[],
  layout: Record<string, Point>,
  dayPixelsOpen: number,
  halfWidthPx = 16,
): { id: string; points: Point[] }[] {
  const out: { id: string; points: Point[] }[] = [];
  for (const link of links) {
    const a = layout[link.placeId];
    const b = layout[link.towardPlaceId];
    if (!a || !b) continue;
    const lengthPx = link.proximityDays * dayPixelsOpen;
    const poly = corridorBandPolygon(a, b, lengthPx, halfWidthPx);
    if (poly.length >= 3) out.push({ id: link.id, points: poly });
  }
  return out;
}

export function polyToSvgPath(pts: Point[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 1; i < pts.length; i++) d += ` L ${pts[i]!.x} ${pts[i]!.y}`;
  return d + " Z";
}

export function transformPoints(
  pts: Point[],
  transform: (layout: Record<string, Point>) => Record<string, Point>,
): Point[] {
  const keyed: Record<string, Point> = {};
  pts.forEach((p, i) => {
    keyed[`p${i}`] = p;
  });
  const out = transform(keyed);
  return pts.map((_, i) => out[`p${i}`]!);
}

export function dayRingRadius(days: number, dayPixels: number): number {
  return Math.max(6, days * dayPixels);
}

export function softRegionHull() {
  return [] as Point[];
}
export function hullToSvgPath() {
  return "";
}

export { DEFAULT_DAY_PIXELS };
