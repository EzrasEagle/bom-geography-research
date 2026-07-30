/**
 * User-accepted geographic associations (one-click from suggestions or manual).
 * Stored in localStorage; distance/time can be explicitly unknown OR stated.
 */

import type { AssociationKind, AssociationLeg, SpanQuality } from "@/data/suggested-associations";
import type { ChronologySpan } from "@/data/chronology";
import { chronologyForChapter, unknownChronology } from "@/data/chronology";
import type { ClosenessStrength, DistancePreset, DistanceSpec, SpatialPlacement } from "@/data/spatial-distance";
import { distanceSpecLabel, presetToDistanceSpec } from "@/data/spatial-distance";

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
  /** Structured distance for Map Lab (presets beat raw unknown) */
  spatialDistance?: DistanceSpec;
  /** When this association holds historically (chapter heading default) */
  chronology: ChronologySpan;
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
    const rows = JSON.parse(raw) as UserAssociation[];
    return rows.map((r) => ({
      ...r,
      chronology:
        r.chronology ??
        chronologyForChapter(r.book, r.chapter) ??
        unknownChronology(),
    }));
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
    chronology?: ChronologySpan;
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
    chronology:
      overrides?.chronology ??
      chronologyForChapter(sug.book, sug.chapter) ??
      unknownChronology(),
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

export function associationDistanceLabel(a: UserAssociation): string {
  if (a.spatialDistance) return distanceSpecLabel(a.spatialDistance);
  return spanLabel(a.pathDistance);
}

/** Convert user associations → lightweight map edges for layout/conflict */
export function associationsAsMapEdges(rows: UserAssociation[]): {
  id: string;
  from: string;
  to: string;
  type: "adjacent" | "days_travel" | "same_region" | "river_between";
  strength: "hard" | "soft";
  value?: string;
  sourceVerse?: string;
  maxDayFraction: number;
  placement?: SpatialPlacement;
  notes?: string;
}[] {
  const out: ReturnType<typeof associationsAsMapEdges> = [];
  for (const a of rows) {
    for (let i = 0; i < a.legs.length; i++) {
      const leg = a.legs[i]!;
      const spatial =
        a.spatialDistance ??
        (leg.distancePreset
          ? presetToDistanceSpec(leg.distancePreset, {
              closeness: leg.closeness,
              placement: leg.placement,
              maxDayFraction: leg.maxDayFraction,
              value: leg.distance.value,
              note: leg.distance.note,
            })
          : undefined);
      const closeness = spatial?.closeness ?? (leg.kind === "path" ? "soft" : "hard");
      const maxDay = spatial?.maxDayFraction ?? 1;
      const type =
        leg.kind === "river"
          ? "river_between"
          : leg.kind === "same_region"
            ? "same_region"
            : maxDay <= 1
              ? "adjacent"
              : "days_travel";
      out.push({
        id: `ua-${a.id}-${i}`,
        from: leg.fromFeatureId,
        to: leg.toFeatureId,
        type,
        strength: closeness === "hard" ? "hard" : "soft",
        value: spatial ? distanceSpecLabel(spatial) : leg.viaPhrase,
        sourceVerse: `${a.book} ${a.chapter}:${a.verse}`,
        maxDayFraction: maxDay,
        placement: spatial?.placement ?? leg.placement,
        notes: spatial?.note ?? a.notes,
      });
    }
  }
  return out;
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
