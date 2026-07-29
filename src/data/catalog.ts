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
    body: `The Small Plates of Nephi (1 Nephi–Omni, plus Words of Mormon as bridge) were inserted largely intact after the 116-page loss. They preserve first-person and near-contemporary records—especially valuable for the Old World journey, voyage, landing, and first planting.

Mormon’s abridgment (Mosiah–Mormon bulk) compresses centuries of large-plate history: rich for relative place graphs, sometimes schematic on distance.

Moroni finishes the record and abridges Ether; Jaredite geography and final Cumorah/Ramah statements are critical for model tests.`,
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

export function getModel(id: string) {
  return models.find((m) => m.id === id);
}

export function getVerse(id: string) {
  return verses.find((v) => v.id === id);
}

export function getInsight(id: string) {
  return insights.find((i) => i.id === id);
}

export function versesForModel(modelId: string) {
  return verses.filter((v) => v.modelClaims.some((c) => c.modelId === modelId));
}

export const stats = {
  verseCount: verses.length,
  modelCount: models.length,
  insightCount: insights.length,
  claimCount: verses.reduce((n, v) => n + v.modelClaims.length, 0),
};
