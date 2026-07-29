import type { Point } from "@/lib/model-map-state";
import {
  DEFAULT_DAY_PIXELS,
  type ProximityLink,
} from "@/data/soft-regions";

/**
 * Build a soft-region polygon:
 * - For each linked place, add a circle of radius = proximityDays * dayPixels
 * - Take convex hull of sampled circle points (+ optional region centroid)
 * Result: blob that "stretches" near all linked places.
 */
export function softRegionHull(
  links: ProximityLink[],
  layout: Record<string, Point>,
  dayPixels: number = DEFAULT_DAY_PIXELS,
  samplesPerCircle = 12,
): Point[] {
  const ring: Point[] = [];
  for (const link of links) {
    const c = layout[link.placeId];
    if (!c) continue;
    const r = Math.max(8, link.proximityDays * dayPixels);
    for (let i = 0; i < samplesPerCircle; i++) {
      const a = (i / samplesPerCircle) * Math.PI * 2;
      ring.push({ x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) });
    }
    // also include the place center so hull touches inward
    ring.push({ x: c.x, y: c.y });
  }
  if (ring.length < 3) return ring;
  return convexHull(ring);
}

function convexHull(points: Point[]): Point[] {
  const pts = [...points].sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
  if (pts.length <= 1) return pts;

  const cross = (o: Point, a: Point, b: Point) =>
    (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);

  const lower: Point[] = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2]!, lower[lower.length - 1]!, p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }
  const upper: Point[] = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i]!;
    while (upper.length >= 2 && cross(upper[upper.length - 2]!, upper[upper.length - 1]!, p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }
  lower.pop();
  upper.pop();
  return lower.concat(upper);
}

export function hullToSvgPath(hull: Point[]): string {
  if (hull.length === 0) return "";
  if (hull.length === 1) {
    const p = hull[0]!;
    return `M ${p.x - 20} ${p.y} a 20 20 0 1 0 40 0 a 20 20 0 1 0 -40 0`;
  }
  let d = `M ${hull[0]!.x} ${hull[0]!.y}`;
  for (let i = 1; i < hull.length; i++) {
    d += ` L ${hull[i]!.x} ${hull[i]!.y}`;
  }
  return d + " Z";
}

/** Transform hull points with same macro as places */
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
