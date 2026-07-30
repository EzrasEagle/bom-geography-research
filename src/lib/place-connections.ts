/**
 * Geographic objects as a graph: each place id is a node; connections are
 * edges, related features, scriptures, assumptions, corpus hits, relations,
 * and spheres of influence.
 */

import { assumptions, constraints, places, type GeoConstraint } from "@/data/catalog";
import { allPlaces } from "@/lib/user-places";
import { getPlaceDossier } from "@/data/place-scripture";
import { layerOf, taxonomyFor, type ObjectLayer } from "@/data/object-taxonomy";
import {
  elevationLinksFor,
  pathMentionsFor,
  sphereOf,
  type PlaceRelation,
} from "@/data/place-relations";
import { versesForFeature, type CorpusVerse } from "@/data/scripture-corpus";

export type PlaceConnectionBundle = {
  id: string;
  name: string;
  kind: string;
  layer: ObjectLayer;
  elevationBand?: string;
  edgesIn: GeoConstraint[];
  edgesOut: GeoConstraint[];
  neighborIds: string[];
  relatedFeatureIds: string[];
  assumptionIds: string[];
  scriptureCount: number;
  corpusVerses: CorpusVerse[];
  summary?: string;
  /** Soft graph: mentions, affected_by, along, up/down */
  relations: PlaceRelation[];
  sphereMemberIds: string[];
  elevationLinks: PlaceRelation[];
  /** If this is a river, places that mention/along it */
  pathMentions: PlaceRelation[];
};

export function getPlaceConnectionBundle(placeId: string): PlaceConnectionBundle | null {
  const place = allPlaces().find((p) => p.id === placeId);
  if (!place) return null;
  const d = getPlaceDossier(placeId);
  const tax = taxonomyFor(placeId);
  const { relations, memberIds } = sphereOf(placeId);

  const edgesOut = constraints.filter((c) => c.from === placeId);
  const edgesIn = constraints.filter((c) => c.to === placeId);
  const neighborIds = [
    ...new Set([
      ...edgesOut.map((e) => e.to),
      ...edgesIn.map((e) => e.from),
      ...(d?.relatedFeatureIds ?? []),
      ...memberIds,
    ]),
  ].filter((id) => id !== placeId);

  return {
    id: placeId,
    name: place.name,
    kind: place.kind,
    layer: tax.layer,
    elevationBand: tax.elevationBand,
    edgesIn,
    edgesOut,
    neighborIds,
    relatedFeatureIds: d?.relatedFeatureIds ?? [],
    assumptionIds: d?.assumptionIds ?? [],
    scriptureCount: d?.scriptures.length ?? 0,
    corpusVerses: versesForFeature(placeId),
    summary: d?.summary,
    relations,
    sphereMemberIds: memberIds,
    elevationLinks: elevationLinksFor(placeId),
    pathMentions: pathMentionsFor(placeId),
  };
}

export function assumptionsForIds(ids: string[]) {
  return assumptions.filter((a) => ids.includes(a.id));
}

export function placeLabel(id: string) {
  return allPlaces().find((p) => p.id === id)?.name ?? id;
}

export function placesInLayers(layers: ObjectLayer[]) {
  const set = new Set(layers);
  return allPlaces().filter((p) => set.has(layerOf(p.id)));
}
