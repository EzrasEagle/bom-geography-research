/**
 * User-accepted geographic associations (one-click from suggestions or manual).
 * Stored in localStorage; distance/time can be explicitly unknown.
 */

import type { AssociationKind, AssociationLeg, SpanQuality } from "@/data/suggested-associations";

export type UserAssociation = {
  id: string;
  sourceSuggestionId?: string;
  book: string;
  chapter: number;
  verse: number;
  title: string;
  legs: AssociationLeg[];
  /** Overall path distance if set on the whole association */
  pathDistance: { quality: SpanQuality; value?: string; note?: string };
  pathTime: { quality: SpanQuality; value?: string; note?: string };
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
    pathDistance?: UserAssociation["pathDistance"];
    pathTime?: UserAssociation["pathTime"];
    notes?: string;
  },
): UserAssociation {
  return {
    id: `assoc-${Date.now()}`,
    sourceSuggestionId: sug.id,
    book: sug.book,
    chapter: sug.chapter,
    verse: sug.verse,
    title: sug.title,
    legs: sug.legs,
    pathDistance:
      overrides?.pathDistance ??
      sug.legs[0]?.distance ?? { quality: "unknown" as SpanQuality },
    pathTime:
      overrides?.pathTime ?? sug.legs[0]?.time ?? { quality: "unknown" as SpanQuality },
    relatedRefs: sug.relatedRefs,
    tags: sug.tags,
    createdAt: new Date().toISOString(),
    notes: overrides?.notes,
  };
}

export function spanLabel(s: { quality: SpanQuality; value?: string; note?: string }) {
  if (s.quality === "unknown") return "Unknown";
  if (s.value) return s.value;
  return s.quality;
}
