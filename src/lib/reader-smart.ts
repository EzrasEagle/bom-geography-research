/**
 * Reader helpers: smart tag suggestions + time/distance phrase parse.
 */

import type { SpanQuality } from "@/data/suggested-associations";

export type SmartTagSuggestion = {
  phrase: string;
  /** How many prior tags used this phrase */
  priorCount: number;
  /** Feature ids commonly paired with this phrase */
  featureIds: string[];
  source: "your_tags" | "seed";
};

/** Known travel-time phrases → structured span */
const TIME_PATTERNS: { re: RegExp; value: string; quality: SpanQuality }[] = [
  { re: /\bspace of many days\b/i, value: "space of many days", quality: "stated" },
  { re: /\bmany days\b/i, value: "many days", quality: "approximate" },
  { re: /\beight years\b/i, value: "eight years", quality: "stated" },
  { re: /\bforty days\b/i, value: "forty days", quality: "stated" },
  { re: /\btwelve days\b/i, value: "twelve days", quality: "stated" },
  { re: /\beight days\b/i, value: "eight days", quality: "stated" },
  { re: /\bthree days(?:[’'] journey)?\b/i, value: "three days", quality: "stated" },
  { re: /\bday and a half\b/i, value: "day and a half", quality: "stated" },
  { re: /\bone day(?:[’']s)? journey\b/i, value: "one day’s journey", quality: "stated" },
  { re: /\bfor the space of\s+([\w\s]+?)(?:\.|,|;|$)/i, value: "space of …", quality: "stated" },
];

const DISTANCE_PATTERNS: { re: RegExp; value: string; quality: SpanQuality }[] = [
  { re: /\bnearly a south-southeast direction\b/i, value: "direction stated (SSE)", quality: "stated" },
  { re: /\bnearly eastward\b/i, value: "direction stated (eastward)", quality: "stated" },
  { re: /\bexceeding great distance\b/i, value: "exceeding great distance", quality: "approximate" },
  { re: /\bsmall neck of land\b/i, value: "small neck (width cue)", quality: "approximate" },
];

export function parseTimeSpan(text: string): {
  quality: SpanQuality;
  value?: string;
  note?: string;
} | null {
  for (const p of TIME_PATTERNS) {
    const m = text.match(p.re);
    if (m) {
      const value =
        p.value === "space of …" && m[1] ? `space of ${m[1].trim()}` : p.value;
      return { quality: p.quality, value, note: `Parsed from text: “${m[0]}”` };
    }
  }
  return null;
}

export function parseDistanceSpan(text: string): {
  quality: SpanQuality;
  value?: string;
  note?: string;
} | null {
  for (const p of DISTANCE_PATTERNS) {
    const m = text.match(p.re);
    if (m) {
      return { quality: p.quality, value: p.value, note: `Parsed from text: “${m[0]}”` };
    }
  }
  return null;
}

/** Seed phrases that should always suggest when present in verse text */
export const SEED_TAG_PHRASES = [
  "wilderness",
  "promised land",
  "land of promise",
  "land of Nephi",
  "land of Zarahemla",
  "came down",
  "went up",
  "narrow neck",
  "narrow pass",
  "sea east",
  "sea west",
  "river Sidon",
  "many waters",
  "forests",
  "beasts",
  "ore",
  "sailed",
  "space of many days",
  "pitch our tents",
];

type TagLike = {
  wordPhrase?: string;
  tags: string[];
  featureIds: string[];
};

/**
 * Suggest tags for a verse from (1) phrases already used in user's tags
 * and (2) seed phrases — when those phrases appear in the verse text.
 */
export function smartSuggestionsForVerse(
  verseText: string,
  allTags: TagLike[],
): SmartTagSuggestion[] {
  const lower = verseText.toLowerCase();
  const map = new Map<string, SmartTagSuggestion>();

  const bump = (
    phrase: string,
    featureIds: string[],
    source: SmartTagSuggestion["source"],
  ) => {
    const key = phrase.toLowerCase();
    if (key.length < 3) return;
    if (!lower.includes(key)) return;
    const prev = map.get(key);
    if (prev) {
      prev.priorCount += 1;
      prev.featureIds = [...new Set([...prev.featureIds, ...featureIds])];
      if (source === "your_tags") prev.source = "your_tags";
    } else {
      map.set(key, {
        phrase,
        priorCount: source === "your_tags" ? 1 : 0,
        featureIds: [...featureIds],
        source,
      });
    }
  };

  for (const t of allTags) {
    if (t.wordPhrase) bump(t.wordPhrase, t.featureIds, "your_tags");
    for (const tag of t.tags) {
      if (["proximity", "path", "high-signal", "conflict-candidate"].includes(tag))
        continue;
      bump(tag, t.featureIds, "your_tags");
    }
  }

  for (const seed of SEED_TAG_PHRASES) {
    bump(seed, guessFeaturesForPhrase(seed), "seed");
  }

  return [...map.values()].sort((a, b) => {
    if (b.priorCount !== a.priorCount) return b.priorCount - a.priorCount;
    return b.phrase.length - a.phrase.length;
  });
}

/** Map common text phrases → catalog feature ids */
export function guessFeaturesForPhrase(phrase: string): string[] {
  const p = phrase.toLowerCase();
  if (p.includes("wilderness")) return ["wilderness"];
  if (p.includes("promised land") || p.includes("land of promise"))
    return ["promised-land", "landing"];
  if (p.includes("nephi")) return ["nephi"];
  if (p.includes("zarahemla")) return ["zarahemla"];
  if (p.includes("sidon")) return ["sidon"];
  if (p.includes("desolation")) return ["desolation"];
  if (p.includes("bountiful")) return ["bountiful-nw"];
  if (p.includes("narrow neck") || p.includes("narrow pass")) return ["narrow-neck"];
  if (p.includes("sea east")) return ["sea-east"];
  if (p.includes("sea west")) return ["sea-west"];
  if (p.includes("forest")) return ["forests"];
  if (p.includes("beast")) return ["beasts"];
  if (p.includes("ore") || p.includes("gold") || p.includes("copper")) return ["ore"];
  if (p.includes("sail") || p.includes("voyage")) return ["voyage"];
  if (p.includes("came down") || p.includes("went up")) return [];
  return [];
}

export type ConnectionDraftNode = {
  id: string;
  label: string;
  /** catalog place id if known */
  featureId?: string;
  /** verse ref where this node was picked */
  ref?: string;
  kind: "place" | "phrase" | "time" | "resource";
};

export function classifyNode(label: string, featureId?: string): ConnectionDraftNode["kind"] {
  if (parseTimeSpan(label)) return "time";
  if (featureId === "forests" || featureId === "beasts" || featureId === "ore")
    return "resource";
  if (featureId) return "place";
  const feats = guessFeaturesForPhrase(label);
  if (feats.some((f) => ["forests", "beasts", "ore"].includes(f))) return "resource";
  if (feats.length) return "place";
  return "phrase";
}
