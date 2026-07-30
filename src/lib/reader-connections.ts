/**
 * Seed path suggestions + user associations for the left Connections panel.
 */

import {
  associationSuggestions,
  type AssociationSuggestion,
} from "@/data/suggested-associations";
import type { UserAssociation } from "@/lib/user-associations";
import { places } from "@/data/catalog";

export type ConnectionListItem = {
  id: string;
  source: "seed" | "yours";
  title: string;
  summary?: string;
  book: string;
  chapter: number;
  verse: number;
  ref: string;
  steps: string[];
  adopted?: boolean;
  seedId?: string;
  userId?: string;
};

function placeName(id: string) {
  return places.find((p) => p.id === id)?.name ?? id;
}

function stepsFromSug(s: AssociationSuggestion): string[] {
  const ids: string[] = [];
  for (const leg of s.legs) {
    if (!ids.includes(leg.fromFeatureId)) ids.push(leg.fromFeatureId);
    if (!ids.includes(leg.toFeatureId)) ids.push(leg.toFeatureId);
  }
  return ids.map(placeName);
}

function stepsFromUser(a: UserAssociation): string[] {
  const ids: string[] = [];
  for (const leg of a.legs) {
    if (!ids.includes(leg.fromFeatureId)) ids.push(leg.fromFeatureId);
    if (!ids.includes(leg.toFeatureId)) ids.push(leg.toFeatureId);
  }
  return ids.map(placeName);
}

export function listConnectionsForChapter(
  book: string,
  chapter: number,
  userAssocs: UserAssociation[],
): ConnectionListItem[] {
  const seeds = associationSuggestions
    .filter((s) => s.book === book && s.chapter === chapter)
    .map((s) => {
      const adopted = userAssocs.some((u) => u.sourceSuggestionId === s.id);
      return {
        id: `seed-${s.id}`,
        source: "seed" as const,
        title: s.title,
        summary: s.summary,
        book: s.book,
        chapter: s.chapter,
        verse: s.verse,
        ref: `${s.book} ${s.chapter}:${s.verse}`,
        steps: stepsFromSug(s),
        adopted,
        seedId: s.id,
      };
    });

  const yours = userAssocs
    .filter((a) => a.book === book && a.chapter === chapter)
    .map((a) => ({
      id: `user-${a.id}`,
      source: "yours" as const,
      title: a.title,
      book: a.book,
      chapter: a.chapter,
      verse: a.verse,
      ref: `${a.book} ${a.chapter}:${a.verse}`,
      steps: stepsFromUser(a),
      userId: a.id,
      seedId: a.sourceSuggestionId,
    }));

  // Prefer listing seeds first, then yours not already mirrored as seed-adopted
  const seedAdopted = new Set(
    yours.filter((y) => y.seedId).map((y) => y.seedId),
  );
  return [
    ...seeds,
    ...yours.filter((y) => !y.seedId || !seedAdopted.has(y.seedId)),
  ];
}

export function getSuggestionById(id: string): AssociationSuggestion | undefined {
  return associationSuggestions.find((s) => s.id === id);
}
