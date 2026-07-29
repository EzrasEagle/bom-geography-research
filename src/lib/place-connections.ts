/**
 * Geographic objects as a graph: each place id is a node; connections are
 * edges, related features, scriptures, assumptions, corpus hits, and tags.
 *
 * Existing structures already support this view — this module only *assembles*
 * them. No schema rewrite required.
 */

import { assumptions, constraints, places, type GeoConstraint } from "@/data/catalog";
import { getPlaceDossier } from "@/data/place-scripture";
import { versesForFeature, type CorpusVerse } from "@/data/scripture-corpus";

export type PlaceConnectionBundle = {
  id: string;
  name: string;
  kind: string;
  /** Edges where this place is from or to */
  edgesIn: GeoConstraint[];
  edgesOut: GeoConstraint[];
  /** All unique neighbor place ids */
  neighborIds: string[];
  relatedFeatureIds: string[];
  assumptionIds: string[];
  scriptureCount: number;
  corpusVerses: CorpusVerse[];
  summary?: string;
};

export function getPlaceConnectionBundle(placeId: string): PlaceConnectionBundle | null {
  const place = places.find((p) => p.id === placeId);
  if (!place) return null;
  const d = getPlaceDossier(placeId);

  const edgesOut = constraints.filter((c) => c.from === placeId);
  const edgesIn = constraints.filter((c) => c.to === placeId);
  const neighborIds = [
    ...new Set([
      ...edgesOut.map((e) => e.to),
      ...edgesIn.map((e) => e.from),
      ...(d?.relatedFeatureIds ?? []),
    ]),
  ].filter((id) => id !== placeId);

  return {
    id: placeId,
    name: place.name,
    kind: place.kind,
    edgesIn,
    edgesOut,
    neighborIds,
    relatedFeatureIds: d?.relatedFeatureIds ?? [],
    assumptionIds: d?.assumptionIds ?? [],
    scriptureCount: d?.scriptures.length ?? 0,
    corpusVerses: versesForFeature(placeId),
    summary: d?.summary,
  };
}

export function assumptionsForIds(ids: string[]) {
  return assumptions.filter((a) => ids.includes(a.id));
}

export function placeLabel(id: string) {
  return places.find((p) => p.id === id)?.name ?? id;
}
