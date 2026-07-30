/**
 * One-click association suggestions from high-signal verses.
 * Distance/time may be "unknown" — still create the corridor link.
 */

export type SpanQuality = "unknown" | "approximate" | "stated";

export type AssociationKind =
  | "proximity"
  | "path"
  | "distance"
  | "time"
  | "elevation"
  | "lost_party";

export type AssociationLeg = {
  fromFeatureId: string;
  toFeatureId: string;
  /** Exact text phrase that licenses this leg */
  viaPhrase?: string;
  kind: AssociationKind;
  distance: { quality: SpanQuality; value?: string; note?: string };
  time: { quality: SpanQuality; value?: string; note?: string };
  elevation?: "up" | "down" | "level" | "unknown";
};

export type AssociationSuggestion = {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  title: string;
  summary: string;
  legs: AssociationLeg[];
  /** Other verses that speak to the same corridor / travel */
  relatedRefs: { ref: string; note: string; book?: string; chapter?: number; verse?: number }[];
  tags: string[];
};

/** Seed suggestions — expand while indexing */
export const associationSuggestions: AssociationSuggestion[] = [

  {
    id: "sug-1ne-18-23-voyage",
    book: "1 Nephi",
    chapter: 18,
    verse: 23,
    title: "Sailed many days → promised land",
    summary:
      "Voyage ends at the promised land after “the space of many days.” Time is stated as many days; absolute distance unknown.",
    tags: ["sailed", "space of many days", "promised land", "path"],
    legs: [
      {
        fromFeatureId: "voyage",
        toFeatureId: "promised-land",
        viaPhrase: "sailed for the space of many days … arrive at the promised land",
        kind: "path",
        distance: { quality: "unknown", note: "Ocean crossing — absolute distance not stated" },
        time: { quality: "stated", value: "space of many days" },
        elevation: "unknown",
      },
    ],
    relatedRefs: [
      { ref: "1 Nephi 18:22–23", note: "Sailing to promised land" },
      { ref: "1 Nephi 18:25", note: "Wilderness, forests, beasts, ore in land of promise" },
    ],
  },
  {
    id: "sug-1ne-18-25-resources",
    book: "1 Nephi",
    chapter: 18,
    verse: 25,
    title: "Promised land → wilderness / forests / beasts / ore",
    summary:
      "In the land of promise, as they journeyed in the wilderness: beasts in forests of every kind; ore of gold, silver, copper. Model as hub (promised land) with contained/proximity resources — not separate cities.",
    tags: ["promised land", "wilderness", "forests", "beasts", "ore", "proximity"],
    legs: [
      {
        fromFeatureId: "promised-land",
        toFeatureId: "wilderness",
        viaPhrase: "journeyed in the wilderness",
        kind: "proximity",
        distance: { quality: "unknown" },
        time: { quality: "unknown" },
      },
      {
        fromFeatureId: "promised-land",
        toFeatureId: "forests",
        viaPhrase: "beasts in the forests of every kind",
        kind: "proximity",
        distance: { quality: "unknown" },
        time: { quality: "unknown" },
      },
      {
        fromFeatureId: "promised-land",
        toFeatureId: "ore",
        viaPhrase: "all manner of ore, both of gold, and of silver, and of copper",
        kind: "proximity",
        distance: { quality: "unknown" },
        time: { quality: "unknown" },
      },
    ],
    relatedRefs: [
      { ref: "1 Nephi 18:23", note: "Landing / naming promised land" },
      { ref: "1 Nephi 18:24", note: "Seeds grew exceedingly" },
      { ref: "2 Nephi 5:15", note: "Later ore/metal working in Nephi" },
    ],
  },
  {
    id: "sug-limhi-lost",
    book: "Mosiah",
    chapter: 8,
    verse: 8,
    title: "Limhi party: intended Zarahemla → lost → Desolation (branch path)",
    summary:
      "Search for Zarahemla; lost in wilderness; find dry bones / records in land associated with Desolation. Model as multi-path: shares Nephi–Zarahemla wilderness trunk then diverges. Distance/time unknown. See Map Lab travel path path-limhi-lost-to-desolation.",
    tags: ["lost_party", "wilderness", "land of Desolation", "intended_vs_actual"],
    legs: [
      {
        fromFeatureId: "nephi",
        toFeatureId: "wilderness",
        viaPhrase: "lost in the wilderness",
        kind: "path",
        distance: { quality: "unknown" },
        time: { quality: "unknown" },
        elevation: "unknown",
      },
      {
        fromFeatureId: "wilderness",
        toFeatureId: "desolation",
        viaPhrase: "discovered a land of many waters / bones (Desolation association)",
        kind: "lost_party",
        distance: { quality: "unknown", note: "Branch away from Zarahemla-bound trunk" },
        time: { quality: "unknown" },
        elevation: "unknown",
      },
    ],
    relatedRefs: [
      { ref: "Mosiah 8:7–11", note: "Full lost expedition report" },
      { ref: "Mosiah 21:25–27", note: "Parallel account" },
      { ref: "Omni 1:12–13", note: "Main Nephi–Zarahemla wilderness trunk (shared corridor family)" },
      { ref: "Alma 22:30–31", note: "Desolation / bones of people who had been destroyed" },
    ],
  },

  {
    id: "sug-omni-1-13-path",
    book: "Omni",
    chapter: 1,
    verse: 13,
    title: "Nephi → wilderness → down to Zarahemla",
    summary:
      "Mosiah’s party departs into the wilderness and is led through it until they come down into the land of Zarahemla. Corridor is real; distance and duration are not stated here.",
    tags: ["wilderness", "came down", "land of Nephi", "land of Zarahemla", "proximity"],
    legs: [
      {
        fromFeatureId: "nephi",
        toFeatureId: "wilderness",
        viaPhrase: "into the wilderness",
        kind: "path",
        distance: { quality: "unknown", note: "Not stated in Omni 1:12–13" },
        time: { quality: "unknown", note: "Not stated in Omni 1:12–13" },
        elevation: "unknown",
      },
      {
        fromFeatureId: "wilderness",
        toFeatureId: "zarahemla",
        viaPhrase: "through the wilderness until they came down into the land … Zarahemla",
        kind: "path",
        distance: { quality: "unknown", note: "Corridor exists; length unknown from this verse" },
        time: { quality: "unknown", note: "Duration unknown from this verse" },
        elevation: "down",
      },
    ],
    relatedRefs: [
      {
        ref: "Omni 1:12",
        note: "Flee out of the land of Nephi … into the wilderness",
        book: "Omni",
        chapter: 1,
        verse: 12,
      },
      {
        ref: "Omni 1:27–28",
        note: "Later party goes up into the wilderness toward Nephi; many slain; some return to Zarahemla",
        book: "Omni",
        chapter: 1,
        verse: 27,
      },
      {
        ref: "Mosiah 7:1–6",
        note: "Expedition from Zarahemla up toward land of Nephi (time/distance still sparse)",
        book: "Mosiah",
        chapter: 7,
        verse: 1,
      },
      {
        ref: "Mosiah 8:7–8",
        note: "Limhi’s party sent to find Zarahemla; lost in the wilderness; found dry bones / records",
        book: "Mosiah",
        chapter: 8,
        verse: 7,
      },
      {
        ref: "Mosiah 21:25–26",
        note: "Same lost expedition motif — failed to find Zarahemla",
        book: "Mosiah",
        chapter: 21,
        verse: 25,
      },
      {
        ref: "Mosiah 22:11–13",
        note: "Limhi’s people escape; travel in wilderness; arrive in Zarahemla (path again; span not quantified here)",
      },
    ],
  },
  {
    id: "sug-omni-1-12-flee",
    book: "Omni",
    chapter: 1,
    verse: 12,
    title: "Land of Nephi → into the wilderness",
    summary: "Command to flee the land of Nephi into the wilderness. Distance/time unknown.",
    tags: ["land of Nephi", "wilderness", "proximity"],
    legs: [
      {
        fromFeatureId: "nephi",
        toFeatureId: "wilderness",
        viaPhrase: "flee out of the land of Nephi … into the wilderness",
        kind: "proximity",
        distance: { quality: "unknown" },
        time: { quality: "unknown" },
        elevation: "unknown",
      },
    ],
    relatedRefs: [
      { ref: "Omni 1:13", note: "Completes path down to Zarahemla", book: "Omni", chapter: 1, verse: 13 },
    ],
  },
  {
    id: "sug-omni-1-27-up",
    book: "Omni",
    chapter: 1,
    verse: 27,
    title: "Zarahemla side → up into wilderness → toward Nephi",
    summary: "A number go up into the wilderness to return to the land of Nephi. Elevation ‘up’; distance unknown.",
    tags: ["went up", "wilderness", "land of Nephi"],
    legs: [
      {
        fromFeatureId: "zarahemla",
        toFeatureId: "wilderness",
        viaPhrase: "went up into the wilderness",
        kind: "path",
        distance: { quality: "unknown" },
        time: { quality: "unknown" },
        elevation: "up",
      },
      {
        fromFeatureId: "wilderness",
        toFeatureId: "nephi",
        viaPhrase: "to return to the land of Nephi",
        kind: "path",
        distance: { quality: "unknown" },
        time: { quality: "unknown" },
        elevation: "up",
      },
    ],
    relatedRefs: [
      {
        ref: "Omni 1:28",
        note: "Contention; many slain in the wilderness; survivors return to Zarahemla",
        book: "Omni",
        chapter: 1,
        verse: 28,
      },
      { ref: "Omni 1:13", note: "Inverse corridor (down to Zarahemla)", book: "Omni", chapter: 1, verse: 13 },
    ],
  },
];

export function suggestionsForVerse(
  book: string,
  chapter: number,
  verse: number,
): AssociationSuggestion[] {
  return associationSuggestions.filter(
    (s) => s.book === book && s.chapter === chapter && s.verse === verse,
  );
}

/** Cross-references that inform Nephi–Zarahemla travel uncertainty */
export const NEPHI_ZARAHEMLA_TRAVEL_NOTES = [
  {
    id: "nz-unknown-omni",
    claim: "Omni flight: path via wilderness + down; distance/time unknown",
    refs: ["Omni 1:12–13"],
  },
  {
    id: "nz-lost-limhi",
    claim: "Limhi search party lost in wilderness; did not find Zarahemla — corridor is hazardous / large enough to lose people",
    refs: ["Mosiah 8:7–8", "Mosiah 21:25–26"],
  },
  {
    id: "nz-return-up",
    claim: "Attempts to go up to Nephi through wilderness (failed party in Omni)",
    refs: ["Omni 1:27–28"],
  },
];
