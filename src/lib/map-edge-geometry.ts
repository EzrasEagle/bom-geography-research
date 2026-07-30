/**
 * Geometry helpers for Map Lab: multi-edge fan-out, marker sizes, elev glyphs.
 */

export type Pt = { x: number; y: number };

export function placeMarkerRadius(kind: string, sizeTier?: string): number {
  if (kind === "sea") return 6;
  if (kind === "river") return 3.5;
  if (kind === "hill") return 4;
  if (kind === "wilderness") return 4;
  if (kind === "land" || sizeTier === "land_local" || sizeTier === "land_regional") return 5;
  if (kind === "city" || sizeTier === "settlement_city") return 3.75;
  return 4;
}

/** Quadratic curve control point offset for the n-th edge between same endpoints */
export function multiEdgeControl(
  a: Pt,
  b: Pt,
  index: number,
  total: number,
  baseOffset = 18,
): Pt {
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const len = Math.hypot(dx, dy) || 1;
  // perpendicular unit
  const px = -dy / len;
  const py = dx / len;
  // center the fan
  const mid = (total - 1) / 2;
  const k = (index - mid) * baseOffset;
  return { x: mx + px * k, y: my + py * k };
}

export function quadPath(a: Pt, b: Pt, c: Pt): string {
  return `M ${a.x} ${a.y} Q ${c.x} ${c.y} ${b.x} ${b.y}`;
}

export function midOfQuad(a: Pt, b: Pt, c: Pt): Pt {
  // approx at t=0.5: 0.25a + 0.5c + 0.25b
  return {
    x: 0.25 * a.x + 0.5 * c.x + 0.25 * b.x,
    y: 0.25 * a.y + 0.5 * c.y + 0.25 * b.y,
  };
}

export type ElevGlyph = "up" | "down" | "level" | "none";

export function elevFromEdgeNotes(
  value?: string,
  notes?: string,
  placement?: string,
): ElevGlyph {
  const s = `${value ?? ""} ${notes ?? ""} ${placement ?? ""}`.toLowerCase();
  if (/\babove\b|\bup\b|went up|go up/.test(s)) return "up";
  if (/\bbelow\b|\bdown\b|came down|went down/.test(s)) return "down";
  if (/\blevel\b|same elevation/.test(s)) return "level";
  return "none";
}
