import {
  MESOAMERICA_META,
  mesoamericaAssumptions,
  mesoamericaConstraints,
  mesoamericaPlaces,
  mesoamericaVerseClaims,
  mesoClaimStats,
  getPassA,
  getPassB,
  getPassC,
  getPassD,
  mesoMapCorrespondences,
} from "@/data/models/mesoamerica-pack";

/** Typed mirror of data/catalog + research frontmatter. Keep in sync when cataloging. */

export type PlateSource =
  | "small_plates"
  | "large_plates_abridgment"
  | "mormon_words"
  | "moroni"
  | "ether"
  | "unknown";

export type ModelClaim = {
  modelId: string;
  claim: string;
  why: string;
  confidence: "high" | "medium" | "low" | "speculative" | "unspecified";
  sources: string[];
};

export type Clue = {
  type: string;
  summary: string;
  rawTerms: string[];
};

export type VerseRecord = {
  id: string;
  book: string;
  chapter: number;
  verseStart: number;
  verseEnd: number;
  textExcerpt: string;
  plateSource: PlateSource;
  speaker: string;
  tags: string[];
  clues: Clue[];
  modelClaims: ModelClaim[];
  insightIds: string[];
  crossRefs: string[];
  ourNotes: string;
};

export type ModelProfile = {
  id: string;
  name: string;
  category: string;
  status: string;
  summary: string;
  coreMap: Record<string, string>;
  keyClaims: string[];
  strengths: string[];
  criticisms: string[];
};

export type Insight = {
  id: string;
  title: string;
  category: string;
  summary: string;
  confidence: string;
  body: string;
  relatedVerses: string[];
  relevanceToModels: string[];
};

export const models: ModelProfile[] = [
  {
    id: "mesoamerica",
    name: "Limited Mesoamerica (Sorenson-style)",
    category: "mesoamerica",
    // grade G3 — see mesoamerica-pack
    status: "active",
    summary:
      "Places events primarily in southern Mexico and Guatemala with a limited geography. Isthmus of Tehuantepec is a common narrow-neck candidate.",
    coreMap: {
      landSouthward: "Highland Guatemala / southern Mexico",
      landNorthward: "Areas north of the isthmus",
      narrowNeck: "Isthmus of Tehuantepec",
      sidon: "Grijalva (or Usumacinta variants)",
      landing: "Pacific Mesoamerica (debated)",
      cumorah: "Southern Mexico (many versions)",
    },
    keyClaims: [
      "Limited distances fit the text",
      "Complex societies and writing align with Mesoamerica",
      "Highland/lowland topography maps to up/down idiom",
    ],
    strengths: ["Archaeological complexity", "Isthmus geography", "Population scale debates favor urban societies"],
    criticisms: ["NY Cumorah tradition tension", "Directional conventions", "River correlations contested"],
  },
  {
    id: "heartland",
    name: "Heartland (North American Midwest)",
    category: "heartland",
    status: "active",
    summary:
      "Locates primary lands in the central/eastern United States, often with the Mississippi as Sidon and New York Cumorah as the final battle region.",
    coreMap: {
      landSouthward: "Southeastern US / lower Mississippi",
      landNorthward: "Great Lakes / upper Midwest",
      narrowNeck: "Great Lakes / Niagara corridor (variants)",
      sidon: "Mississippi River",
      landing: "Gulf or Atlantic approaches (variants)",
      cumorah: "New York",
    },
    keyClaims: [
      "Cumorah in New York matches modern tradition",
      "Prophetic ‘this land’ language tied to the United States",
      "Hopewell horizon used as external correlation",
    ],
    strengths: ["Cumorah tradition alignment", "Major river systems"],
    criticisms: ["Urban complexity", "Seas and narrow neck fit", "Climate/crop timing debates"],
  },
  {
    id: "baja",
    name: "Baja California Peninsula",
    category: "baja",
    status: "active",
    summary:
      "Emphasizes Mediterranean/arid climate match for Jerusalem seeds, dual seas, and peninsular narrow geography on Baja California.",
    coreMap: {
      landSouthward: "Southern Baja",
      landNorthward: "Northern Baja / toward Alta California",
      narrowNeck: "Narrow peninsular sections",
      sidon: "Seasonal drainages (debated)",
      landing: "NW Baja Mediterranean zone",
      cumorah: "Northern peninsula highlands (model-specific)",
    },
    keyClaims: [
      "Seeds growing exceedingly implies Levant-like climate",
      "Peninsula provides seas east and west",
      "Limited geography without requiring Mesoamerican density",
    ],
    strengths: ["Climate/seed argument", "Dual seas", "Wilderness motifs"],
    criticisms: ["Large-city descriptions", "Jaredite archaeology on Baja", "Major river Sidon"],
  },
  {
    id: "meso-highland",
    name: "Mesoamerican Highland-emphasis variants",
    category: "mesoamerica",
    status: "active",
    summary:
      "Limited Mesoamerican theater with stronger highland emphasis for the Nephite core (often highland Guatemala). Indexed as a diff pack against Sorenson-style mappings to test micro place swaps.",
    coreMap: {
      landSouthward: "Highland-emphasized southern highlands",
      landNorthward: "Still Mesoamerican north-of-neck candidates",
      narrowNeck: "Often Tehuantepec (confirm per author)",
      sidon: "Variant within Mesoamerican rivers",
      landing: "Pacific Mesoamerica candidates",
      cumorah: "Southern limited-model candidates",
    },
    keyClaims: [
      "Elevation readings of up/down are stronger",
      "Nephi core is highland ecology",
      "Still limited, not Heartland",
    ],
    strengths: ["Fine-grained elevation fit", "Clear micro-diff test case vs Sorenson-style"],
    criticisms: ["Not a single unified book brand", "Must attach specific authors as harvested"],
  },
  {
    id: "south-america",
    name: "South America / Chile–Peru variants",
    category: "south_america",
    status: "historical",
    summary:
      "Family of models with Chilean landing (~30–33°S climate analogy) and Andean or hemispheric extensions.",
    coreMap: {
      landing: "Chilean coast",
      narrowNeck: "Panama (hemispheric variants)",
      landSouthward: "Andean corridor (variable)",
      landNorthward: "Variable",
      sidon: "Variable",
      cumorah: "Variable",
    },
    keyClaims: ["Southern Mediterranean climate band", "Early secondary landing notes"],
    strengths: ["Climate analogy at ~32°S"],
    criticisms: ["High internal variance", "Distance/scale issues in hemispheric forms"],
  },
  {
    id: "malay",
    name: "Malay Peninsula",
    category: "malay",
    status: "speculative",
    summary: "Minority model placing the narrative in Southeast Asia with maritime emphasis.",
    coreMap: {
      landing: "SE Asia coasts (model-specific)",
      narrowNeck: "Peninsular narrows",
      landSouthward: "Variable",
      landNorthward: "Variable",
      sidon: "Variable",
      cumorah: "Variable",
    },
    keyClaims: ["Maritime culture", "Narrow necks", "Old World adjacency"],
    strengths: ["Coastal/maritime reading"],
    criticisms: ["Americas land-of-promise tradition", "Minority evidence base"],
  },
  {
    id: "internal",
    name: "Internal Geography Only",
    category: "internal",
    status: "active",
    summary:
      "Relational map from the text alone—distances, directions, and place graph—without committing to modern coordinates.",
    coreMap: {
      method: "Constraint graph from text",
      landSouthward: "Relative only",
      landNorthward: "Relative only",
      narrowNeck: "Relative only",
      sidon: "Relative only",
      landing: "Coastal promised land (text)",
      cumorah: "Relative to final war narrative",
    },
    keyClaims: ["Extract constraints first", "Test external models against the graph"],
    strengths: ["Neutral baseline", "Reusable by all models"],
    criticisms: ["Does not by itself answer modern location"],
  },
];

export const verses: VerseRecord[] = [
  {
    id: "1ne-17-5",
    book: "1 Nephi",
    chapter: 17,
    verseStart: 5,
    verseEnd: 5,
    textExcerpt:
      "And we did come to the land which we called Bountiful, because of its much fruit and also wild honey; and all these things were prepared of the Lord that we might not perish...",
    plateSource: "small_plates",
    speaker: "Nephi",
    tags: ["bountiful-old-world", "flora", "small-plates", "high-signal", "ship"],
    clues: [
      {
        type: "flora",
        summary: "Coastal fertile Bountiful with fruit and wild honey",
        rawTerms: ["Bountiful", "much fruit", "wild honey"],
      },
    ],
    modelClaims: [
      {
        modelId: "internal",
        claim: "Old World coastal locus with fruit, honey, and nearby shipbuilding resources",
        why: "Textual requirements for staging before the ocean voyage",
        confidence: "high",
        sources: ["1 Nephi 17 internal reading"],
      },
    ],
    insightIds: [],
    crossRefs: ["1ne-18-1"],
    ourNotes: "Keep Old World Bountiful separate from New World Bountiful in Alma/Helaman.",
  },
  {
    id: "1ne-18-23",
    book: "1 Nephi",
    chapter: 18,
    verseStart: 23,
    verseEnd: 23,
    textExcerpt:
      "And it came to pass that after we had sailed for the space of many days we did arrive at the promised land; and we went forth upon the land, and did pitch our tents; and we did call it the promised land.",
    plateSource: "small_plates",
    speaker: "Nephi",
    tags: ["landing", "voyage", "promised-land", "small-plates", "high-signal", "travel-time"],
    clues: [
      {
        type: "travel_time",
        summary: "Ocean voyage described as many days (non-numeric)",
        rawTerms: ["sailed", "many days", "promised land"],
      },
      {
        type: "settlement",
        summary: "Immediate tenting upon arrival",
        rawTerms: ["pitch our tents"],
      },
    ],
    modelClaims: [
      {
        modelId: "baja",
        claim: "Landing in Baja / Mediterranean NW Mexico–SW California band",
        why: "Pairs with seed success and dual-sea/peninsula arguments",
        confidence: "medium",
        sources: ["Rosenvall Baja model materials"],
      },
      {
        modelId: "mesoamerica",
        claim: "Pacific coast of Mesoamerica (beach varies by author)",
        why: "Access to limited Mesoamerican stage",
        confidence: "medium",
        sources: ["Sorenson-style limited geography tradition"],
      },
      {
        modelId: "heartland",
        claim: "Gulf/Atlantic approach toward North American interior",
        why: "Path into Heartland river systems (variant-dependent)",
        confidence: "medium",
        sources: ["Heartland model literature"],
      },
      {
        modelId: "south-america",
        claim: "Chilean coast near ~30–33°S",
        why: "Early secondary statements + southern Mediterranean climate",
        confidence: "low",
        sources: ["Historical Chile-landing tradition"],
      },
    ],
    insightIds: ["insight-levantine-crops-baja-socal"],
    crossRefs: ["1ne-18-24"],
    ourNotes: "Do not treat ‘promised land’ alone as a coordinate.",
  },
  {
    id: "1ne-18-24",
    book: "1 Nephi",
    chapter: 18,
    verseStart: 24,
    verseEnd: 24,
    textExcerpt:
      "And it came to pass that we did begin to till the earth, and we began to plant seeds; yea, we did put all our seeds into the earth, which we had brought from the land of Jerusalem. And it came to pass that they did grow exceedingly; wherefore, we were blessed in abundance.",
    plateSource: "small_plates",
    speaker: "Nephi",
    tags: ["seed-grow", "climate", "landing", "small-plates", "high-signal", "botanical"],
    clues: [
      {
        type: "climate",
        summary: "Jerusalem-origin seeds grow exceedingly at landing region",
        rawTerms: ["seeds", "Jerusalem", "grow exceedingly"],
      },
    ],
    modelClaims: [
      {
        modelId: "baja",
        claim: "Strong support for Mediterranean/arid SW North America",
        why: "Latitude/climate analogous to Levant; modern crop viability in Baja & SoCal",
        confidence: "high",
        sources: ["Baja seed-climate arguments", "Modern agronomy data"],
      },
      {
        modelId: "south-america",
        claim: "Chilean Mediterranean zone also matches seed climate",
        why: "~32°S climate analogy",
        confidence: "medium",
        sources: ["Chile-landing climate arguments"],
      },
      {
        modelId: "mesoamerica",
        claim: "Seeds can succeed with management and microclimates",
        why: "‘Exceedingly’ is qualitative; elevation bands exist",
        confidence: "medium",
        sources: ["Mesoamerican model responses to seed critique"],
      },
      {
        modelId: "heartland",
        claim: "Near Eastern grains viable in temperate North America",
        why: "Seasonal agriculture possible; arrival season matters",
        confidence: "medium",
        sources: ["Heartland agricultural arguments"],
      },
    ],
    insightIds: ["insight-levantine-crops-baja-socal"],
    crossRefs: ["1ne-18-23", "1ne-8-1"],
    ourNotes: "Highest-signal botanical verse for landing-climate debates.",
  },
];

export const insights: Insight[] = [
  {
    id: "insight-baja-gulf-foot-route",
    title: "On-foot route from Baja California to the Gulf of Mexico",
    category: "travel",
    summary:
      "Natural-topography corridor analysis and 18th-century travel-time estimates for the Baja → Colorado Delta → Rio Grande → Gulf path.",
    confidence: "probable",
    relatedVerses: [],
    relevanceToModels: ["baja", "heartland", "mesoamerica"],
    body: `Baja is a peninsula. Continuous foot travel to the Gulf of Mexico requires the northern land bridge via the Colorado River Delta into mainland Sonora—not a crossing of the Gulf of California.

Preferred natural corridor: northern Baja → Colorado Delta → Sonoran Desert (tinajas/arroyos/sky islands; optional Gila corridor) → Chihuahuan basin-and-range → Rio Grande downstream to the Gulf mouth. Mexican-only variant uses northern Sierra Madre Occidental passes and the Rio Conchos.

Realistic path length often 1,500–2,500+ miles. For 18th-century mounted parties under ideal cool-season conditions: about 4–5 months; pure foot typically longer. See research/insights/travel/baja-to-gulf-foot-route.md for sources.`,
  },
  {
    id: "insight-levantine-crops-baja-socal",
    title: "Levantine crop viability in Baja & Southern California",
    category: "flora",
    summary:
      "Where date palms, olives, grapes, figs and related Near Eastern crops cultivate successfully; relevance to 1 Nephi 18:24.",
    confidence: "established",
    relatedVerses: ["1ne-18-24", "1ne-18-23"],
    relevanceToModels: ["baja", "south-america", "mesoamerica", "heartland"],
    body: `Date palms thrive commercially in Coachella Valley (CA), Mexicali Valley (Baja), and San Luis Río Colorado (Sonora), with historical Jesuit oasis plantings across Baja. They prefer hot arid summers with irrigation.

Olives, grapes, figs, and related Mediterranean crops thrive in coastal southern California and NW Baja (e.g. Valle de Guadalupe). Chilean ~32°S is another Mediterranean analog used by South America landing arguments.

Humid Gulf of Mexico coasts are a weaker match for premium arid-climate date production. Always distinguish modern irrigation agriculture from ancient practice in notes.`,
  },
];

export const frameworkSections = [
  {
    id: "composition",
    title: "Textual composition layers",
    body: `Do not conflate two events ~1,400 years apart.

In ~A.D. 385–400, Mormon abridged the large plates and—finding the small plates of Nephi—included them with his record for a wise purpose (Words of Mormon 1:3–7). 1 Nephi–Omni thus preserve Nephi’s and successors’ records with minimal re-narration; Words of Mormon is Mormon’s bridge.

In 1828, Joseph Smith’s manuscript of Mormon’s abridgment of the early large-plate material (Book of Lehi)—about 116 pages—was lost. The small plates, already on the plates from Mormon’s ancient editorial choice, supply that historical span in the published book. Mormon did not insert the small plates “because of” the modern loss.

Geography signal: early travel, Old World Bountiful, voyage, landing, and seed-planting remain high-signal first-person data on the small plates. Mormon’s abridgment (Mosiah–Mormon) and Moroni/Ether add relative place graphs, wars, narrow neck, and Cumorah/Ramah.`,
  },
  {
    id: "dual-track",
    title: "Dual-track method",
    body: `Track A — Models: every major geography model’s claim on each verse, with why and citations.

Track B — Insights: independent research (travel, climate, flora, hydrology, history) that is not owned by a single model.

Readers weigh both. Core data stays comparative; advocacy, if any, is labeled in book prose.`,
  },
  {
    id: "catalog",
    title: "How the catalog works",
    body: `Each geographic unit is Book / Chapter / Verse(s), with optional word-span. Records carry clues, tags, plate source, model claims, insight links, and placement hints (main text / footnote / appendix).

Markdown under research/verses is the narrative form; data/catalog/*.csv is the spreadsheet mirror; this app reads the typed catalog mirror.`,
  },
];



export type Assumption = {
  id: string;
  modelId: string;
  statement: string;
  category: string;
  status: "core" | "optional" | "experimental" | "rejected_by_user";
  notes?: string;
};

export type PlaceNode = {
  id: string;
  name: string;
  kind: "city" | "land" | "river" | "hill" | "sea" | "wilderness" | "other";
  /** Optional explicit size tier (defaults from kind) */
  sizeTier?:
    | "point"
    | "settlement_small"
    | "settlement_city"
    | "land_local"
    | "land_region"
    | "land_greater"
    | "wilderness_band"
    | "sea";
  /** Parent land/region id for city-in-land grouping */
  parentId?: string;
  /** Text phrase variants (land of X / city of X) */
  aliases?: string[];
};

export type GeoConstraint = {
  id: string;
  from: string;
  to: string;
  type: "days_travel" | "direction" | "adjacent" | "river_between" | "narrow_feature" | "same_region";
  value?: string | number;
  sourceVerse?: string;
  notes?: string;
  /** soft | hard — hard conflicts paint red in Map Lab */
  strength: "soft" | "hard";
};

/** Seed assumptions for published models (editable when forked in My Models). */
export const assumptions: Assumption[] = [
  { id: "meso-neck-tehuantepec", modelId: "mesoamerica", statement: "Narrow neck ≈ Isthmus of Tehuantepec", category: "narrow_neck", status: "core" },
  { id: "meso-sidon-grijalva", modelId: "mesoamerica", statement: "River Sidon ≈ Grijalva (some authors: Usumacinta)", category: "hydrology", status: "core" },
  { id: "meso-limited", modelId: "mesoamerica", statement: "Narrative stage is limited (~few hundred miles), not hemispheric", category: "distance_scale", status: "core" },
  { id: "meso-cumorah-south", modelId: "mesoamerica", statement: "Final Cumorah of the text is in southern Mexico region (NY hill may be repository only in some versions)", category: "cumorah", status: "core" },
  { id: "heart-sidon-miss", modelId: "heartland", statement: "River Sidon ≈ Mississippi River", category: "hydrology", status: "core" },
  { id: "heart-cumorah-ny", modelId: "heartland", statement: "Hill Cumorah of the final battle = New York hill of modern tradition", category: "cumorah", status: "core" },
  { id: "heart-hopewell", modelId: "heartland", statement: "Hopewell cultural horizon is a primary external correlation window", category: "archaeology", status: "core" },
  { id: "baja-seed-climate", modelId: "baja", statement: "Jerusalem seeds growing exceedingly requires Levant-like Mediterranean/arid climate near landing", category: "climate", status: "core" },
  { id: "baja-peninsula", modelId: "baja", statement: "Primary lands lie on the Baja California peninsula (seas east and west)", category: "place_identification", status: "core" },
  { id: "baja-neck-peninsula", modelId: "baja", statement: "Narrow neck / narrow areas map to peninsular constrictions", category: "narrow_neck", status: "core" },
  { id: "highland-nephi-core", modelId: "meso-highland", statement: "Nephite core landscape is highland-emphasized (e.g. highland Guatemala)", category: "place_identification", status: "core" },
  { id: "sa-chile-landing", modelId: "south-america", statement: "Landing near Chilean coast ~30–33°S (climate analogy)", category: "landing", status: "core" },
  { id: "internal-no-gps", modelId: "internal", statement: "No modern lat/lng required; only relative constraints from the text", category: "distance_scale", status: "core" },
  { id: "day-march-15-20", modelId: "internal", statement: "Default working band: 1 day journey ≈ 15–20 miles on open terrain (user-adjustable)", category: "distance_scale", status: "optional", notes: "Change this assumption in Map Lab / My Models to stress-test distance graphs." },
];

/** Minimal internal gazetteer for Map Lab v0 */
export const places: PlaceNode[] = [
  {
    id: "nephi",
    name: "Land of Nephi",
    kind: "land",
    sizeTier: "land_region",
    aliases: ["land of Nephi", "land of Lehi-Nephi"],
  },
  {
    id: "city-nephi",
    name: "City of Nephi",
    kind: "city",
    sizeTier: "settlement_city",
    parentId: "nephi",
    aliases: ["city of Nephi", "Nephi"],
  },
  {
    id: "zarahemla-land",
    name: "Land of Zarahemla",
    kind: "land",
    sizeTier: "land_region",
    aliases: ["land of Zarahemla"],
  },
  {
    id: "zarahemla",
    name: "City of Zarahemla",
    kind: "city",
    sizeTier: "settlement_city",
    parentId: "zarahemla-land",
    aliases: ["Zarahemla", "city of Zarahemla"],
  },
  {
    id: "east-sea-cluster",
    name: "East-sea cities (cluster)",
    kind: "land",
    sizeTier: "land_greater",
    aliases: ["cities on the east sea", "east wilderness seashore"],
  },
  { id: "sidon", name: "River Sidon", kind: "river", sizeTier: "point", aliases: ["river Sidon", "waters of Sidon"] },
  { id: "bountiful-nw", name: "Bountiful (New World)", kind: "land" },
  { id: "desolation", name: "Desolation", kind: "land" },
  { id: "narrow-neck", name: "Narrow neck / pass", kind: "other" },
  { id: "manti", name: "Manti", kind: "city", sizeTier: "settlement_city", aliases: ["land of Manti", "city of Manti"] },
  { id: "jershon", name: "Jershon", kind: "land", sizeTier: "land_local", parentId: "east-sea-cluster" },
  { id: "cumorah", name: "Cumorah / Ramah", kind: "hill" },
  { id: "landing", name: "Landing region", kind: "other" },
  { id: "sea-east", name: "Sea east", kind: "sea" },
  { id: "sea-west", name: "Sea west", kind: "sea" },
  { id: "climate-whirlwind", name: "Whirlwinds / tempests", kind: "other" },
  { id: "climate-storms", name: "Storms / great storm", kind: "other" },
  { id: "climate-seasons", name: "Seasons / seasonal timing", kind: "other" },
  { id: "climate-agriculture", name: "Agriculture / grain / famine", kind: "other" },
  { id: "wilderness", name: "Wilderness (soft region / corridor)", kind: "wilderness" },
  { id: "voyage", name: "Sea voyage / sailing (soft feature)", kind: "other" },
  { id: "ore", name: "Ore / metals (soft feature)", kind: "other" },
  { id: "beasts", name: "Beasts / animals (soft feature)", kind: "other" },
  { id: "forests", name: "Forests (soft feature)", kind: "other" },
  { id: "promised-land", name: "Promised land / land of promise", kind: "land" },
  { id: "ammonihah", name: "Ammonihah", kind: "city" },
  { id: "gideon", name: "Gideon", kind: "city", sizeTier: "settlement_city", parentId: "zarahemla-land", aliases: ["valley of Gideon", "land of Gideon"] },
  { id: "melek", name: "Melek", kind: "land", sizeTier: "land_local", parentId: "zarahemla-land" },
  { id: "minon", name: "Minon", kind: "land", sizeTier: "land_local", parentId: "zarahemla-land" },
  { id: "antionum", name: "Antionum", kind: "land" },
  { id: "morianton", name: "Morianton", kind: "city", sizeTier: "settlement_city", parentId: "east-sea-cluster" },
  { id: "lehi-city", name: "City of Lehi", kind: "city", sizeTier: "settlement_city", parentId: "east-sea-cluster" },
  { id: "mulek", name: "Mulek", kind: "city", sizeTier: "settlement_city", parentId: "east-sea-cluster" },
  { id: "joshua", name: "Land of Joshua", kind: "land" },
  { id: "helam", name: "Helam", kind: "land" },
  { id: "shemlon", name: "Shemlon", kind: "land" },
  { id: "shilom", name: "Shilom", kind: "land" },
];

/** Seed constraints (internal). Conflicts intentionally possible when day-scale changes. */
export const constraints: GeoConstraint[] = [
  { id: "c-east-sea-lehi-morianton", from: "lehi-city", to: "morianton", type: "same_region", value: "east-sea city chain", sourceVerse: "Alma 50–51", strength: "soft" },
  { id: "c-east-sea-morianton-mulek", from: "morianton", to: "mulek", type: "same_region", value: "east-sea city chain", sourceVerse: "Alma 50–52", strength: "soft" },
  { id: "c-city-land-nephi", from: "city-nephi", to: "nephi", type: "adjacent", value: "city within land of Nephi", sourceVerse: "Mosiah 7–22", strength: "soft" },

  { id: "c1", from: "nephi", to: "zarahemla", type: "direction", value: "northish (down from Nephi highlands in many readings)", sourceVerse: "Omni/Mosiah narrative", strength: "soft" },
  { id: "c2", from: "zarahemla", to: "sidon", type: "adjacent", value: "city by / oriented to Sidon", sourceVerse: "Alma 2+", strength: "hard" },
  { id: "c3", from: "manti", to: "sidon", type: "adjacent", value: "near head/upstream narratives", sourceVerse: "Alma 22/43 region", strength: "soft" },
  { id: "c4", from: "zarahemla", to: "bountiful-nw", type: "direction", value: "toward north", sourceVerse: "Alma 22:29–33", strength: "soft" },
  { id: "c5", from: "bountiful-nw", to: "desolation", type: "adjacent", value: "meet at narrow neck area", sourceVerse: "Alma 22:31–32", strength: "hard" },
  { id: "c6", from: "narrow-neck", to: "bountiful-nw", type: "adjacent", value: "day and a half journey motif (model-dependent)", sourceVerse: "Alma 22:32", strength: "hard" },
  { id: "c7", from: "jershon", to: "sea-east", type: "adjacent", value: "by the east sea in common readings", sourceVerse: "Alma 27:22", strength: "soft" },
  { id: "c8", from: "landing", to: "nephi", type: "days_travel", value: "many days (unspecified)", sourceVerse: "1 Ne 18–2 Ne 5", strength: "soft" },
  { id: "c9", from: "cumorah", to: "desolation", type: "same_region", value: "land of many waters / northward association (model-dependent)", sourceVerse: "Morm 6 / Ether 15", strength: "soft" },
  { id: "c10", from: "sea-west", to: "sea-east", type: "narrow_feature", value: "narrow neck between seas (Alma 22)", sourceVerse: "Alma 22:32", strength: "hard" },
];

export const evidenceDomains = [
  { id: "textual_geography", label: "Textual geography", caution: "Relative vs absolute readings" },
  { id: "climate_botany", label: "Climate & botany", caution: "Modern farms ≠ ancient practice" },
  { id: "hydrology_topo", label: "Hydrology & topography", caution: "Courses and coasts change" },
  { id: "archaeology_artifacts", label: "Archaeology & artifacts", caution: "Dating & attribution debates" },
  { id: "language_onomastics", label: "Language & names", caution: "Speculative etymologies common" },
  { id: "genetics", label: "Genetics", caution: "Sampling bias; high uncertainty" },
  { id: "historical_routes", label: "Historical routes", caution: "Analogy only for 600 BC" },
  { id: "paleoclimate", label: "Paleoclimate", caution: "Sparse resolution" },
];

export function getModel(id: string) {
  return models.find((m) => m.id === id);
}

export function getVerse(id: string) {
  return verses.find((v) => v.id === id);
}

export function getInsight(id: string) {
  return insights.find((i) => i.id === id);
}

export const stats = {
  verseCount: verses.length,
  modelCount: models.length,
  insightCount: insights.length,
  claimCount: verses.reduce((n, v) => n + v.modelClaims.length, 0) + mesoamericaVerseClaims.length,
};


/** Full Sorenson-style pack (G3) for model detail + Map Lab */
export function getMesoamericaPack() {
  const passA = getPassA();
  return {
    meta: MESOAMERICA_META,
    places: mesoamericaPlaces,
    verseClaims: mesoamericaVerseClaims,
    assumptions: mesoamericaAssumptions,
    constraints: mesoamericaConstraints,
    stats: mesoClaimStats(),
    passA,
    passB: getPassB(),
    passC: getPassC(),
    passD: getPassD(),
    mapCorrespondences: mesoMapCorrespondences,
  };
}

export function versesForModel(modelId: string) {
  if (modelId === "mesoamerica") {
    // Synthesize verse records from pack for model page
    return mesoamericaVerseClaims.map((c) => ({
      id: `${c.book.toLowerCase().replace(/\s+/g, "")}-${c.chapter}-${c.verse}`.replace("1nephi", "1ne").replace("2nephi", "2ne").replace("3nephi", "3ne"),
      book: c.book,
      chapter: c.chapter,
      verseStart: c.verse,
      verseEnd: c.verse,
      textExcerpt: c.claim.slice(0, 160),
      tags: c.tags,
      signal: c.confidence === "high" ? "high" : "medium",
      modelClaims: [
        {
          modelId: "mesoamerica",
          claim: c.claim,
          why: c.source,
          confidence: c.confidence,
          sources: [c.source],
        },
      ],
      insightIds: [] as string[],
    }));
  }
  return verses.filter((v) => v.modelClaims.some((c) => c.modelId === modelId));
}

export function assumptionsForModel(modelId: string) {
  if (modelId === "mesoamerica") {
    return mesoamericaAssumptions.map((a) => ({
      id: a.id,
      modelId: "mesoamerica",
      statement: a.statement,
      category: a.category,
      status: a.status,
      impact: a.impact,
    }));
  }
  return assumptions.filter((a) => a.modelId === modelId || (a as { models?: string[] }).models?.includes(modelId));
}
