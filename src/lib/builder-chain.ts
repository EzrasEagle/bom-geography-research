/**
 * Simplified association chain: steps with optional links between them.
 */

import type { AssociationKind } from "@/data/suggested-associations";
import type { DistancePreset } from "@/data/spatial-distance";
import { presetFromRelation, presetToDistanceSpec } from "@/data/spatial-distance";
import type { ConnectionDraftNode } from "@/lib/reader-smart";
import { classifyNode, guessFeaturesForPhrase } from "@/lib/reader-smart";

export type LinkRelation =
  | "unknown"
  | "path"
  | "proximity"
  | "contains"
  | "same_region"
  | "river"
  | "above"
  | "below"
  | "east_of"
  | "west_of"
  | "by"
  | "in_course_of";

export type ChainLink = {
  relation: LinkRelation;
  viaPhrase: string;
  distancePreset: DistancePreset;
  closenessHard: boolean;
};

export const LINK_RELATIONS: { id: LinkRelation; label: string }[] = [
  { id: "unknown", label: "— (set relation)" },
  { id: "path", label: "path / traveled to" },
  { id: "proximity", label: "near" },
  { id: "contains", label: "in / contains" },
  { id: "same_region", label: "same region" },
  { id: "river", label: "river link" },
  { id: "above", label: "above" },
  { id: "below", label: "below / down to" },
  { id: "east_of", label: "east of" },
  { id: "west_of", label: "west of" },
  { id: "by", label: "by" },
  { id: "in_course_of", label: "in the course of" },
];

/** Words that are relation markers, not places */
const RELATION_WORDS: { re: RegExp; relation: LinkRelation; preset: DistancePreset }[] = [
  { re: /^(above|up above)$/i, relation: "above", preset: "across_feature" },
  { re: /^(below|down|came down|went down)$/i, relation: "below", preset: "across_feature" },
  { re: /^(east of)$/i, relation: "east_of", preset: "across_feature" },
  { re: /^(west of)$/i, relation: "west_of", preset: "across_feature" },
  { re: /^(by|ran by|near)$/i, relation: "by", preset: "by_adjacent" },
  { re: /^(in|into|within)$/i, relation: "contains", preset: "within_land" },
  { re: /course of/i, relation: "in_course_of", preset: "same_scene" },
  { re: /^(to|toward|unto)$/i, relation: "path", preset: "unknown" },
];

export function emptyLink(): ChainLink {
  return {
    relation: "unknown",
    viaPhrase: "",
    distancePreset: "unknown",
    closenessHard: false,
  };
}

export function ensureLinks(stepCount: number, links: ChainLink[]): ChainLink[] {
  const need = Math.max(0, stepCount - 1);
  const next = links.slice(0, need);
  while (next.length < need) next.push(emptyLink());
  return next;
}

export function isRelationWord(label: string): boolean {
  const t = label.trim();
  return RELATION_WORDS.some((r) => r.re.test(t));
}

export function inferRelationFromPhrase(label: string): ChainLink | null {
  const t = label.trim();
  for (const r of RELATION_WORDS) {
    if (r.re.test(t) || r.re.source.replace(/[\\^$]/g, "").length > 3 && new RegExp(r.re.source, "i").test(t)) {
      if (r.re.test(t) || t.toLowerCase().includes("course of")) {
        return {
          relation: r.relation,
          viaPhrase: t,
          distancePreset: r.preset,
          closenessHard: r.preset !== "unknown",
        };
      }
    }
  }
  // softer includes
  const low = t.toLowerCase();
  if (low.includes("course of")) {
    return {
      relation: "in_course_of",
      viaPhrase: t,
      distancePreset: "same_scene",
      closenessHard: true,
    };
  }
  if (low === "above" || low.includes("above the land")) {
    return { relation: "above", viaPhrase: t, distancePreset: "across_feature", closenessHard: true };
  }
  return null;
}

export function inferModeFromChain(
  steps: ConnectionDraftNode[],
  links: ChainLink[],
): AssociationKind {
  if (steps.length <= 1) return "proximity";
  if (links.some((l) => l.relation === "path")) return "path";
  if (links.every((l) => l.relation === "contains" || l.relation === "in_course_of"))
    return "contains";
  if (links.some((l) => l.relation === "river")) return "river";
  if (links.some((l) => l.relation === "same_region" || l.relation === "in_course_of"))
    return "same_region";
  if (steps.length >= 3) return "path";
  // default journey-ish if multiple places
  if (steps.filter((s) => s.kind === "place" || s.featureId).length >= 2) return "path";
  return "proximity";
}

export function linkToLegKind(rel: LinkRelation): AssociationKind {
  switch (rel) {
    case "path":
    case "below":
    case "above":
      return "path";
    case "contains":
    case "in_course_of":
      return "contains";
    case "river":
      return "river";
    case "same_region":
      return "same_region";
    case "east_of":
    case "west_of":
    case "by":
    case "proximity":
    case "unknown":
    default:
      return "proximity";
  }
}

export function suggestLinkBetween(
  from: ConnectionDraftNode,
  to: ConnectionDraftNode,
  viaHint?: string,
): ChainLink {
  if (viaHint) {
    const inf = inferRelationFromPhrase(viaHint);
    if (inf) return inf;
  }
  // elevation phrases in labels
  for (const label of [from.label, to.label]) {
    const inf = inferRelationFromPhrase(label);
    if (inf) return inf;
  }
  // both places → default path if we already have a chain feel, else proximity
  if ((from.featureId || from.kind === "place") && (to.featureId || to.kind === "place")) {
    return {
      relation: "path",
      viaPhrase: "",
      distancePreset: "unknown",
      closenessHard: false,
    };
  }
  return emptyLink();
}

export function makeStep(
  label: string,
  featureId?: string,
  ref?: string,
): ConnectionDraftNode {
  const fid = featureId ?? guessFeaturesForPhrase(label)[0];
  return {
    id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    label: label.trim(),
    featureId: fid,
    ref,
    kind: classifyNode(label, fid),
  };
}
