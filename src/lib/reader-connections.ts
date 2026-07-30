/**
 * Seed path suggestions + user associations for the left Connections panel.
 */

import {
  associationSuggestions,
  type AssociationSuggestion,
} from "@/data/suggested-associations";
import type { UserAssociation } from "@/lib/user-associations";
import { allPlaces } from "@/lib/user-places";

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
  /** Present when this row can be edited (user assoc or adopted seed) */
  userId?: string;
};

function placeName(id: string) {
  return allPlaces().find((p) => p.id === id)?.name ?? id;
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
      const user = userAssocs.find((u) => u.sourceSuggestionId === s.id);
      return {
        id: `seed-${s.id}`,
        source: "seed" as const,
        // Prefer user's edited title when adopted
        title: user?.title ?? s.title,
        summary: s.summary,
        book: s.book,
        chapter: s.chapter,
        verse: s.verse,
        ref: `${s.book} ${s.chapter}:${s.verse}`,
        steps: user ? stepsFromUser(user) : stepsFromSug(s),
        adopted: Boolean(user),
        seedId: s.id,
        userId: user?.id,
      };
    });

  // Yours that are NOT adopted seeds (custom-built)
  const seedIds = new Set(associationSuggestions.map((s) => s.id));
  const yours = userAssocs
    .filter(
      (a) =>
        a.book === book &&
        a.chapter === chapter &&
        (!a.sourceSuggestionId || !seedIds.has(a.sourceSuggestionId)),
    )
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

  return [...seeds, ...yours];
}

export function getSuggestionById(id: string): AssociationSuggestion | undefined {
  return associationSuggestions.find((s) => s.id === id);
}
