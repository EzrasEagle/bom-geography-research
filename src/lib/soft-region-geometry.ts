import type { Point } from "@/lib/model-map-state";
import type { CorridorAssociation } from "@/data/soft-regions";
import { DEFAULT_DAY_PIXELS } from "@/data/soft-regions";

/**
 * Corridor band: from place A toward place B, only for `proximityDays` of travel
 * along the segment — NOT a hull around both cities.
 *
 * offset: half-width of band in pixels (wilderness thickness).
 */
export function corridorBandPolygon(
  from: Point,
  toward: Point,
  /** Fraction of A→B length to cover, OR absolute length from day budget */
  lengthPx: number,
  halfWidthPx: number,
): Point[] {
  const dx = toward.x - from.x;
  const dy = toward.y - from.y;
  const dist = Math.hypot(dx, dy) || 1;
  // Unit direction A → B
  const ux = dx / dist;
  const uy = dy / dist;
  // How far along the route the wilderness extends from `from`
  const along = Math.min(lengthPx, dist * 0.92); // never quite reach the other city center
  // Start slightly outside the settlement (gap so we don't swallow the pin)
  const gap = Math.min(14, along * 0.15);
  if (along <= gap + 2) return [];

  const x0 = from.x + ux * gap;
  const y0 = from.y + uy * gap;
  const x1 = from.x + ux * along;
  const y1 = from.y + uy * along;

  // Perpendicular for band width
  const px = -uy * halfWidthPx;
  const py = ux * halfWidthPx;

  return [
    { x: x0 + px, y: y0 + py },
    { x: x1 + px, y: y1 + py },
    { x: x1 - px, y: y1 - py },
    { x: x0 - px, y: y0 - py },
  ];
}

/** Day length in pixels, adjusted for terrain cost (slower in wilderness → shorter ring). */
export function dayLengthPixels(
  baseDayPixels: number,
  dayMilesOpen: number,
  dayMilesTerrain: number,
): number {
  // If wilderness is slower, each day covers fewer map-miles → smaller ring for same "1 day"
  // baseDayPixels is calibrated to open ground; scale by terrain ratio
  const ratio = dayMilesTerrain / Math.max(1, dayMilesOpen);
  return baseDayPixels * ratio;
}

/**
 * Build all corridor quads for a region; merge as multipolygon paths.
 */
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

/** Contoured day-ring: ellipse-ish circle, radius = days * dayPixels (terrain-aware). */
export function dayRingRadius(
  days: number,
  dayPixels: number,
): number {
  return Math.max(6, days * dayPixels);
}

// Keep old hull API as thin wrappers so nothing else crashes
export function softRegionHull() {
  return [] as Point[];
}
export function hullToSvgPath() {
  return "";
}
