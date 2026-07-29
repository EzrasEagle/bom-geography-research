import type { TravelPath, Waypoint } from "@/data/travel-paths";
import type { Point } from "@/lib/model-map-state";

export type ResolvedPoint = Point & { role?: string; label: string; featureId?: string };

export function resolveWaypoints(
  path: TravelPath,
  layout: Record<string, Point>,
): ResolvedPoint[] {
  const pts: ResolvedPoint[] = [];
  for (const w of path.waypoints) {
    if (w.role === "intended" && path.actualDestinationId && w.featureId === path.intendedDestinationId) {
      // Draw intended as a ghost spur from branch/last real point — still include
    }
    if (typeof w.x === "number" && typeof w.y === "number") {
      pts.push({
        x: w.x,
        y: w.y,
        role: w.role,
        label: w.label ?? w.featureId ?? "point",
        featureId: w.featureId,
      });
      continue;
    }
    if (w.featureId && layout[w.featureId]) {
      pts.push({
        x: layout[w.featureId].x,
        y: layout[w.featureId].y,
        role: w.role,
        label: w.label ?? w.featureId,
        featureId: w.featureId,
      });
    }
  }
  return pts;
}

/** Build SVG path: smooth curves through waypoints; intended as separate ghost line */
export function pathToSvgD(points: ResolvedPoint[], mode: "main" | "intended_ghost"): string {
  const pts =
    mode === "main"
      ? points.filter((p) => p.role !== "intended")
      : points.filter((p) => p.role === "intended" || p.role === "branch" || p.role === "via");

  if (mode === "intended_ghost") {
    // From branch (or second-to-last main) to intended
    const intended = points.filter((p) => p.role === "intended");
    const branch = points.find((p) => p.role === "branch") ?? points[Math.max(0, points.length - 2)];
    if (!intended.length || !branch) return "";
    const a = branch;
    const b = intended[0]!;
    return `M ${a.x} ${a.y} Q ${(a.x + b.x) / 2} ${(a.y + b.y) / 2 - 30} ${b.x} ${b.y}`;
  }

  if (pts.length < 2) return "";
  if (pts.length === 2) {
    return `M ${pts[0]!.x} ${pts[0]!.y} L ${pts[1]!.x} ${pts[1]!.y}`;
  }
  // Catmull-ish quadratic chain
  let d = `M ${pts[0]!.x} ${pts[0]!.y}`;
  for (let i = 1; i < pts.length; i++) {
    const prev = pts[i - 1]!;
    const cur = pts[i]!;
    const cpx = (prev.x + cur.x) / 2;
    const cpy = (prev.y + cur.y) / 2;
    // bend wilderness paths slightly
    const bend = i % 2 === 0 ? 18 : -18;
    d += ` Q ${cpx + bend} ${cpy + bend} ${cur.x} ${cur.y}`;
  }
  return d;
}
