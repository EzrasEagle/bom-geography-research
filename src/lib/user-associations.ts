/**
 * User-accepted geographic associations (one-click from suggestions or manual).
 * Stored in localStorage; distance/time can be explicitly unknown OR stated.
 */

import type { AssociationKind, AssociationLeg, SpanQuality } from "@/data/suggested-associations";

export type SpanField = { quality: SpanQuality; value?: string; note?: string };

export type UserAssociation = {
  id: string;
  sourceSuggestionId?: string;
  book: string;
  chapter: number;
  verse: number;
  title: string;
  legs: AssociationLeg[];
  pathDistance: SpanField;
  pathTime: SpanField;
  relatedRefs: { ref: string; note: string }[];
  tags: string[];
  createdAt: string;
  notes?: string;
};

const KEY = "bom-atlas-user-associations-v1";

export function loadAssociations(): UserAssociation[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UserAssociation[];
  } catch {
    return [];
  }
}

export function saveAssociations(rows: UserAssociation[]) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}

/** Prefer best non-unknown span across legs (stated > approximate > unknown) */
export function bestSpanFromLegs(
  legs: AssociationLeg[],
  field: "distance" | "time",
): SpanField {
  const rank = (q: SpanQuality) =>
    q === "stated" ? 3 : q === "approximate" ? 2 : 1;
  let best: SpanField = { quality: "unknown" };
  for (const leg of legs) {
    const s = field === "distance" ? leg.distance : leg.time;
    if (!s) continue;
    if (rank(s.quality) > rank(best.quality)) best = { ...s };
    else if (
      rank(s.quality) === rank(best.quality) &&
      s.value &&
      !best.value
    ) {
      best = { ...s };
    }
  }
  return best;
}

export function acceptSuggestion(
  sug: {
    id: string;
    book: string;
    chapter: number;
    verse: number;
    title: string;
    legs: AssociationLeg[];
    relatedRefs: { ref: string; note: string }[];
    tags: string[];
  },
  overrides?: {
    pathDistance?: SpanField;
    pathTime?: SpanField;
    notes?: string;
  },
): UserAssociation {
  const fromLegsDist = bestSpanFromLegs(sug.legs, "distance");
  const fromLegsTime = bestSpanFromLegs(sug.legs, "time");

  const pathDistance = overrides?.pathDistance ?? fromLegsDist;
  const pathTime = overrides?.pathTime ?? fromLegsTime;

  const tags = [...sug.tags];
  // Reflect actual quality in tags (don't force unknown)
  if (pathTime.quality === "unknown") {
    if (!tags.includes("time-unknown")) tags.push("time-unknown");
  } else if (!tags.includes("time-stated") && !tags.includes("time-approximate")) {
    tags.push(pathTime.quality === "stated" ? "time-stated" : "time-approximate");
  }
  if (pathDistance.quality === "unknown") {
    if (!tags.includes("distance-unknown")) tags.push("distance-unknown");
  } else if (!tags.includes("distance-stated") && !tags.includes("distance-approximate")) {
    tags.push(
      pathDistance.quality === "stated" ? "distance-stated" : "distance-approximate",
    );
  }

  return {
    id: `assoc-${Date.now()}`,
    sourceSuggestionId: sug.id,
    book: sug.book,
    chapter: sug.chapter,
    verse: sug.verse,
    title: sug.title,
    legs: sug.legs,
    pathDistance,
    pathTime,
    relatedRefs: sug.relatedRefs,
    tags,
    createdAt: new Date().toISOString(),
    notes: overrides?.notes,
  };
}

export function spanLabel(s: { quality: SpanQuality; value?: string; note?: string }) {
  if (s.quality === "unknown") return "Unknown";
  if (s.value) return s.value;
  if (s.quality === "stated") return "Stated";
  if (s.quality === "approximate") return "Approximate";
  return s.quality;
}

export function updateAssociation(
  rows: UserAssociation[],
  id: string,
  patch: Partial<UserAssociation>,
): UserAssociation[] {
  return rows.map((r) => (r.id === id ? { ...r, ...patch } : r));
}

export function removeAssociation(rows: UserAssociation[], id: string): UserAssociation[] {
  return rows.filter((r) => r.id !== id);
}

export function removeLeg(
  rows: UserAssociation[],
  assocId: string,
  legIndex: number,
): UserAssociation[] {
  return rows.map((r) => {
    if (r.id !== assocId) return r;
    const legs = r.legs.filter((_, i) => i !== legIndex);
    return {
      ...r,
      legs,
      pathDistance: bestSpanFromLegs(legs, "distance"),
      pathTime: bestSpanFromLegs(legs, "time"),
    };
  });
}
