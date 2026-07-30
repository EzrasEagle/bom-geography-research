/**
 * One-click association suggestions from high-signal verses.
 * Distance/time may be "unknown" — still create the corridor link.
 */

export type SpanQuality = "unknown" | "approximate" | "stated";

export type AssociationKind =
  | "proximity"
  | "contains"
  | "path"
  | "same_region"
  | "river"
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
  /** Spatial distance preset (Map Lab + model tests) */
  distancePreset?: import("./spatial-distance").DistancePreset;
  placement?: import("./spatial-distance").SpatialPlacement;
  /** hard = model should not separate these by foreign land/mountain without accounting for text */
  closeness?: import("./spatial-distance").ClosenessStrength;
  /** Max day-walk fraction for layout / conflict */
  maxDayFraction?: number;
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

  {
    id: "sug-alma-50-east-sea-cluster",
    book: "Alma",
    chapter: 50,
    verse: 13,
    title: "East-sea cities: same region (not a path)",
    summary:
      "Cities built / contested on the east seashore (Lehi, Morianton, etc.) form a coastal cluster. Use same_region — peer places in one theater — not a journey path unless the text narrates travel between them.",
    tags: ["same_region", "sea east", "east-sea-cluster"],
    legs: [
      {
        fromFeatureId: "lehi-city",
        toFeatureId: "morianton",
        viaPhrase: "east seashore cities",
        kind: "same_region",
        distance: { quality: "unknown" },
        time: { quality: "unknown" },
      },
      {
        fromFeatureId: "morianton",
        toFeatureId: "mulek",
        viaPhrase: "east sea theater",
        kind: "same_region",
        distance: { quality: "unknown" },
        time: { quality: "unknown" },
      },
    ],
    relatedRefs: [
      { ref: "Alma 50:13–15", note: "Cities by the east sea" },
      { ref: "Alma 51:26", note: "Many cities on the east" },
      { ref: "Alma 52:22–27", note: "Mulek / east operations" },
    ],
  },
  {

  {
    id: "sug-alma-2-amlicite-minon",
    book: "Alma",
    chapter: 2,
    verse: 24,
    title: "Amlicites: Amnihu → Minon (above Zarahemla, course of Nephi)",
    summary:
      "Camp moves from the Amnihu battle theater toward Minon, above Zarahemla, in the course of the land of Nephi. Distance unknown; path is clear.",
    tags: ["path", "amnihu", "minon", "above", "nephi"],
    legs: [
      {
        fromFeatureId: "amnihu",
        toFeatureId: "minon",
        viaPhrase: "followed the camp … in the land of Minon",
        kind: "path",
        distance: { quality: "unknown", note: "Travel distance not stated" },
        time: { quality: "unknown" },
        distancePreset: "unknown",
        closeness: "soft",
        maxDayFraction: 2,
      },
      {
        fromFeatureId: "minon",
        toFeatureId: "zarahemla-land",
        viaPhrase: "above the land of Zarahemla",
        kind: "proximity",
        distance: { quality: "approximate", value: "above (elevation/direction)" },
        time: { quality: "unknown" },
        distancePreset: "across_feature",
        placement: "unspecified",
        closeness: "hard",
        maxDayFraction: 0.5,
        elevation: "up",
      },
      {
        fromFeatureId: "minon",
        toFeatureId: "nephi",
        viaPhrase: "in the course of the land of Nephi",
        kind: "same_region",
        distance: { quality: "approximate", value: "in the course of" },
        time: { quality: "unknown" },
        distancePreset: "same_scene",
        closeness: "soft",
        maxDayFraction: 1,
      },
    ],
    relatedRefs: [
      { ref: "Alma 2:15–19", note: "Battle on hill Amnihu" },
      { ref: "Alma 2:24", note: "Minon above Zarahemla, course of Nephi" },
    ],
  },

    id: "sug-alma-2-amnihu",
    book: "Alma",
    chapter: 2,
    verse: 15,
    title: "Hill Amnihu east of Sidon, by Zarahemla",
    summary:
      "Amnihu is a hill east of Sidon; Sidon ran by the land of Zarahemla. Relational language: “east of” + “ran by”.",
    tags: ["amnihu", "sidon", "zarahemla", "east of", "by"],
    legs: [
      {
        fromFeatureId: "amnihu",
        toFeatureId: "sidon",
        viaPhrase: "east of the river Sidon",
        kind: "proximity",
        distance: {
          quality: "approximate",
          value: "across Sidon (east bank)",
          note: "Directional: east of river — same theater, river between",
        },
        time: { quality: "unknown" },
        distancePreset: "across_feature",
        placement: "east_of",
        closeness: "hard",
        maxDayFraction: 0.5,
      },
      {
        fromFeatureId: "sidon",
        toFeatureId: "zarahemla-land",
        viaPhrase: "which ran by the land of Zarahemla",
        kind: "river",
        distance: {
          quality: "approximate",
          value: "by (adjacent)",
          note: "Sidon bounds/runs by land of Zarahemla",
        },
        time: { quality: "unknown" },
        distancePreset: "by_adjacent",
        placement: "by",
        closeness: "hard",
        maxDayFraction: 0.25,
      },
      {
        fromFeatureId: "amnihu",
        toFeatureId: "zarahemla-land",
        viaPhrase: "battle locale by Zarahemla / east of Sidon",
        kind: "proximity",
        distance: {
          quality: "approximate",
          value: "border of land of Zarahemla (same scene)",
          note: "Co-mentioned battle with Sidon by Zarahemla — Amnihu must sit at/near Zarahemla land on east bank; models that put Amnihu far outside Zarahemla theater fail this hard constraint.",
        },
        time: { quality: "unknown" },
        distancePreset: "border_adjacent",
        placement: "on_border",
        closeness: "hard",
        maxDayFraction: 0.35,
      },
    ],
    relatedRefs: [
      { ref: "Alma 2:15", note: "Hill Amnihu east of Sidon; Sidon by Zarahemla" },
      { ref: "Alma 2:17–19", note: "Battle on hill Amnihu — same scene" },
    ],
  },
  {
    id: "sug-alma-2-sidon-banks",
    book: "Alma",
    chapter: 2,
    verse: 15,
    title: "Sidon: Zarahemla / Gideon river relation",
    summary:
      "Hill Amnihu east of Sidon; river ran by land of Zarahemla. Model as river association (bank/placement), not a path.",
    tags: ["river", "sidon", "zarahemla", "gideon"],
    legs: [
      {
        fromFeatureId: "sidon",
        toFeatureId: "zarahemla",
        viaPhrase: "river Sidon, which ran by the land of Zarahemla",
        kind: "river",
        distance: { quality: "unknown" },
        time: { quality: "unknown" },
      },
      {
        fromFeatureId: "sidon",
        toFeatureId: "gideon",
        viaPhrase: "east of the river Sidon",
        kind: "river",
        distance: { quality: "unknown" },
        time: { quality: "unknown" },
      },
    ],
    relatedRefs: [
      { ref: "Alma 2:15", note: "Amnihu east of Sidon" },
      { ref: "Alma 2:34", note: "Cleared waters of Sidon" },
      { ref: "Alma 6:7", note: "Valley of Gideon east of Sidon" },
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
