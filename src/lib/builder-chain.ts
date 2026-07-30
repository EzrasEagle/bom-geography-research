/**
 * Simplified association chain: steps with optional links between them.
 */

import type { AssociationKind } from "@/data/suggested-associations";
import type { DistancePreset } from "@/data/spatial-distance";
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

/** Always-visible connector chips */
export const CONNECTOR_CHIPS: { label: string; relation: LinkRelation; preset: DistancePreset }[] =
  [
    { label: "path to", relation: "path", preset: "unknown" },
    { label: "above", relation: "above", preset: "across_feature" },
    { label: "below / down", relation: "below", preset: "across_feature" },
    { label: "east of", relation: "east_of", preset: "across_feature" },
    { label: "west of", relation: "west_of", preset: "across_feature" },
    { label: "by", relation: "by", preset: "by_adjacent" },
    { label: "near", relation: "proximity", preset: "border_adjacent" },
    { label: "in / contains", relation: "contains", preset: "within_land" },
    { label: "in the course of", relation: "in_course_of", preset: "same_scene" },
  ];

type RelRule = {
  /** test full phrase */
  test: (t: string) => boolean;
  relation: LinkRelation;
  preset: DistancePreset;
};

const RELATION_RULES: RelRule[] = [
  {
    test: (t) => /\bcourse of\b/i.test(t),
    relation: "in_course_of",
    preset: "same_scene",
  },
  {
    test: (t) => /^(east of)\b/i.test(t) || /\beast of\b/i.test(t),
    relation: "east_of",
    preset: "across_feature",
  },
  {
    test: (t) => /^(west of)\b/i.test(t) || /\bwest of\b/i.test(t),
    relation: "west_of",
    preset: "across_feature",
  },
  {
    test: (t) =>
      /^(above|up above)$/i.test(t) ||
      /^above\b/i.test(t) ||
      /\babove the land\b/i.test(t),
    relation: "above",
    preset: "across_feature",
  },
  {
    test: (t) =>
      /^(below|down|came down|went down)$/i.test(t) ||
      /^(came down|went down)\b/i.test(t),
    relation: "below",
    preset: "across_feature",
  },
  {
    test: (t) => /^(by|ran by|near)$/i.test(t) || /^(ran by)\b/i.test(t),
    relation: "by",
    preset: "by_adjacent",
  },
  {
    test: (t) => /^(in|into|within)$/i.test(t),
    relation: "contains",
    preset: "within_land",
  },
  {
    test: (t) => /^(to|toward|unto|path to|path)$/i.test(t),
    relation: "path",
    preset: "unknown",
  },
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

/** True if this phrase is a connector, not a place to pin on the chain */
export function isRelationWord(label: string): boolean {
  return inferRelationFromPhrase(label) != null && !looksLikePlaceName(label);
}

function looksLikePlaceName(label: string): boolean {
  const t = label.trim();
  // "above the land of Zarahemla" is relation-ish; "land of Minon" is a place
  if (/^(land|city|hill|river|valley|sea)\s+of\b/i.test(t)) return true;
  if (/^(land|city|hill|river|valley)\s+[A-Z]/i.test(t)) return true;
  // has a known place feature id
  if (guessFeaturesForPhrase(t).length > 0 && !RELATION_RULES.some((r) => r.test(t))) {
    return true;
  }
  return false;
}

export function inferRelationFromPhrase(label: string): ChainLink | null {
  const t = label.trim();
  if (!t) return null;

  // Pure place names should not become connectors
  if (/^(land|city|hill|river|valley)\s+of\s+\w+/i.test(t) && !/\b(above|east of|west of|course of)\b/i.test(t)) {
    return null;
  }

  for (const r of RELATION_RULES) {
    if (r.test(t)) {
      // Prefer place if phrase is mostly a place with incidental word
      // e.g. "land of Nephi" should not match "in" rules
      if (r.relation === "contains" && t.split(/\s+/).length > 2) {
        continue;
      }
      return {
        relation: r.relation,
        viaPhrase: t,
        distancePreset: r.preset,
        closenessHard: r.preset !== "unknown",
      };
    }
  }
  return null;
}

export function makeConnectorLink(
  relation: LinkRelation,
  viaPhrase?: string,
  preset?: DistancePreset,
): ChainLink {
  const chip = CONNECTOR_CHIPS.find((c) => c.relation === relation);
  return {
    relation,
    viaPhrase: viaPhrase ?? chip?.label ?? relation,
    distancePreset: preset ?? chip?.preset ?? "unknown",
    closenessHard: (preset ?? chip?.preset ?? "unknown") !== "unknown",
  };
}

/**
 * Apply a connector to the chain.
 * - If 2+ steps: fill the last open (unknown) link, else the last link.
 * - If 1 step: return pending connector for the next place.
 * - If 0 steps: pending for after first place is added… still pending.
 */
export function applyConnectorToChain(
  steps: ConnectionDraftNode[],
  links: ChainLink[],
  connector: ChainLink,
): { links: ChainLink[]; pending: ChainLink | null; appliedIndex: number | null; message: string } {
  const L = ensureLinks(steps.length, links);

  if (steps.length >= 2) {
    // Prefer first unknown link; else last link
    let idx = L.findIndex((l) => l.relation === "unknown");
    if (idx < 0) idx = L.length - 1;
    const next = [...L];
    next[idx] = {
      ...connector,
      viaPhrase: connector.viaPhrase || next[idx]!.viaPhrase,
    };
    return {
      links: next,
      pending: null,
      appliedIndex: idx,
      message: `Connector set between ${steps[idx]!.label} and ${steps[idx + 1]!.label}`,
    };
  }

  if (steps.length === 1) {
    return {
      links: L,
      pending: connector,
      appliedIndex: null,
      message: `Connector “${connector.viaPhrase || connector.relation}” ready — add the next place`,
    };
  }

  return {
    links: L,
    pending: connector,
    appliedIndex: null,
    message: `Connector “${connector.viaPhrase || connector.relation}” ready — add places`,
  };
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
