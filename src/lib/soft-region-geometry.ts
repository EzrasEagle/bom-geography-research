import type { Point } from "@/lib/model-map-state";
import type { RouteAssociation } from "@/data/route-associations";

/** Interpolate along polyline at t∈[0,1] */
export function pointAlongPolyline(pts: Point[], t: number): Point {
  if (pts.length === 0) return { x: 0, y: 0 };
  if (pts.length === 1) return { ...pts[0]! };
  const clamped = Math.min(1, Math.max(0, t));
  // cumulative lengths
  const segs: number[] = [];
  let total = 0;
  for (let i = 1; i < pts.length; i++) {
    const d = Math.hypot(pts[i]!.x - pts[i - 1]!.x, pts[i]!.y - pts[i - 1]!.y);
    segs.push(d);
    total += d;
  }
  if (total < 1e-6) return { ...pts[0]! };
  let dist = clamped * total;
  for (let i = 0; i < segs.length; i++) {
    if (dist <= segs[i]!) {
      const a = pts[i]!;
      const b = pts[i + 1]!;
      const u = segs[i]! < 1e-6 ? 0 : dist / segs[i]!;
      return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
    }
    dist -= segs[i]!;
  }
  return { ...pts[pts.length - 1]! };
}

/**
 * Full-route band along waypoints with half-width perimeter.
 * endGapPx keeps band from covering city pin centers.
 */
export function fullRouteBand(
  waypoints: Point[],
  halfWidthPx: number,
  endGapPx = 12,
): Point[] {
  if (waypoints.length < 2) return [];
  const left: Point[] = [];
  const right: Point[] = [];

  for (let i = 0; i < waypoints.length; i++) {
    const prev = waypoints[Math.max(0, i - 1)]!;
    const cur = waypoints[i]!;
    const next = waypoints[Math.min(waypoints.length - 1, i + 1)]!;
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
  return [...left, ...right.reverse()];
}

/**
 * Spine points for a route. Branch routes insert split point ON parent wilderness trunk.
 */
export function routeSpine(
  route: RouteAssociation,
  all: RouteAssociation[],
  layout: Record<string, Point>,
): Point[] {
  const resolve = (ids: string[]) =>
    ids.map((id) => layout[id]).filter((p): p is Point => !!p);

  if (route.branchesFromRouteId) {
    const parent = all.find((r) => r.id === route.branchesFromRouteId);
    if (parent) {
      const parentPts = resolve(parent.placeIds);
      if (parentPts.length >= 2) {
        const t = route.branchT ?? 0.5;
        const branchPt = pointAlongPolyline(parentPts, t);
        // start at first place of route if on parent, else use parent start direction
        const start = layout[route.placeIds[0]!];
        const end = layout[route.actualDestinationId ?? route.placeIds[route.placeIds.length - 1]!]
          ?? layout[route.placeIds[route.placeIds.length - 1]!];
        // Path: start (nephi) → along parent toward zara until branchT → to desolation
        // For Limhi: placeIds nephi, desolation; parent is nephi-zarahemla
        if (start && end && parentPts.length >= 2) {
          // Use start → branch (on trunk) → end
          // If start is parent[0], spine is parent[0]..branch..end
          return [start, branchPt, end];
        }
        return [branchPt, ...(end ? [end] : [])];
      }
    }
  }
  return resolve(route.placeIds);
}

/** All wilderness bands from enabled wilderness-corridor routes (multi-endpoint stretch). */
export function wildernessBandsFromRoutes(
  routes: RouteAssociation[],
  layout: Record<string, Point>,
  halfWidthPx: number,
): { id: string; points: Point[]; mid: Point; route: RouteAssociation; spine: Point[] }[] {
  const enabled = routes.filter((r) => r.enabled && r.corridor === "wilderness");
  const out: { id: string; points: Point[]; mid: Point; route: RouteAssociation; spine: Point[] }[] = [];
  for (const route of enabled) {
    const spine = routeSpine(route, routes, layout);
    if (spine.length < 2) continue;
    const points = fullRouteBand(spine, halfWidthPx);
    if (points.length < 3) continue;
    const mid = pointAlongPolyline(spine, 0.5);
    out.push({ id: route.id, points, mid, route, spine });
  }
  return out;
}

/** Unique endpoints touched by wilderness (for multi-end shape summary). */
export function wildernessEndpoints(routes: RouteAssociation[]): string[] {
  const s = new Set<string>();
  for (const r of routes) {
    if (!r.enabled || r.corridor !== "wilderness") continue;
    for (const id of r.placeIds) s.add(id);
    if (r.actualDestinationId) s.add(r.actualDestinationId);
    if (r.intendedDestinationId) s.add(r.intendedDestinationId);
  }
  return [...s];
}

export function dayLengthPixels(
  baseDayPixels: number,
  dayMilesOpen: number,
  dayMilesTerrain: number,
): number {
  const ratio = dayMilesTerrain / Math.max(1, dayMilesOpen);
  return baseDayPixels * ratio;
}

export function polyToSvgPath(pts: Point[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 1; i < pts.length; i++) d += ` L ${pts[i]!.x} ${pts[i]!.y}`;
  return d + " Z";
}

export function polylineToSvgD(pts: Point[]): string {
  if (pts.length < 2) return "";
  let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]!;
    const cur = pts[i]!;
    const cpx = (prev.x + cur.x) / 2;
    const cpy = (prev.y + cur.y) / 2;
    d += ` Q ${cpx} ${cpy} ${cur.x} ${cur.y}`;
  }
  return d;
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

// compat stubs
export function fullRouteBands() {
  return [] as { id: string; points: Point[]; mid: Point }[];
}
export const DEFAULT_FULL_WILDERNESS_ROUTES: never[] = [];
export function regionCorridorPaths() {
  return [] as { id: string; points: Point[] }[];
}
export function softRegionHull() {
  return [] as Point[];
}
export function hullToSvgPath() {
  return "";
}
export function corridorBandPolygon() {
  return [] as Point[];
}
export { DEFAULT_DAY_PIXELS } from "@/data/soft-regions";
