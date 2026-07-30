/**
 * Historical sense of BoM vocabulary: curated entries + dynamic external lookup.
 * Prefer the text’s own phrase as the tag label.
 */

export type LexiconEntry = {
  term: string;
  aliases?: string[];
  webster1828: string;
  kjvNotes: string;
  ambiguity: string;
  mapHints: string[];
  relatedTerms?: string[];
  sources: { label: string; url?: string }[];
  /** High-frequency geography/climate analysis terms */
  priority?: number;
};

/** Terms we surface by default in the lexicon strip */
export const PRIORITY_TERMS = [
  "wilderness",
  "came down",
  "went up",
  "narrow neck of land",
  "narrow pass",
  "sea east",
  "sea west",
  "land of Nephi",
  "land of Zarahemla",
  "whirlwind",
  "great waters",
] as const;

export const lexicon: LexiconEntry[] = [

  {
    term: "land of promise",
    aliases: ["promised land", "the promised land", "land of promise"],
    priority: 82,
    webster1828: "Promise: a declaration which binds the person who makes it. Land of promise: in scripture, the land promised to Abraham’s seed; by extension, a destined inheritance.",
    kjvNotes: "KJV “land of promise” (Hebrews 11:9) = Canaan as covenant inheritance. BoM uses the same covenant language for the New World landfall.",
    ambiguity: "Region of arrival/inheritance — not necessarily a single city pin.",
    mapHints: ["region", "landing"],
    relatedTerms: ["wilderness", "landing"],
    sources: [{ label: "Webster 1828 — promise", url: "https://webstersdictionary1828.com/Dictionary/promise" }],
  },
  {
    term: "sailed",
    aliases: ["sail", "sailing"],
    priority: 65,
    webster1828: "To pass on water in a vessel by the action of wind on sails; to move by water.",
    kjvNotes: "KJV sailing language in Acts (Paul’s voyages) — duration often “many days.”",
    ambiguity: "Travel mode on water; pair with time phrases for path span.",
    mapHints: ["path", "voyage"],
    relatedTerms: ["great waters", "space of many days"],
    sources: [{ label: "Webster 1828 — sail", url: "https://webstersdictionary1828.com/Dictionary/sail" }],
  },
  {
    term: "space of many days",
    aliases: ["many days", "for the space of many days"],
    priority: 70,
    webster1828: "Space: quantity of time. Many: numerous. Together: an indefinite but substantial duration.",
    kjvNotes: "KJV often uses “many days” for extended but uncounted periods (not a precise calendar).",
    ambiguity: "Stated time quality is approximate-duration, not a fixed mile count.",
    mapHints: ["time", "path"],
    relatedTerms: ["sailed", "days"],
    sources: [],
  },
  {
    term: "Zarahemla",
    aliases: ["land of Zarahemla", "city of Zarahemla"],
    priority: 80,
    webster1828: "Proper name in the Book of Mormon; treat as city/land complex.",
    kjvNotes: "N/A as KJV place name.",
    ambiguity: "City vs land of Zarahemla — text uses both.",
    mapHints: ["settlement", "region"],
    relatedTerms: ["land of Nephi", "Sidon"],
    sources: [],
  },
  {
    term: "Nephi",
    aliases: ["land of Nephi", "city of Nephi", "Lehi-Nephi"],
    priority: 80,
    webster1828: "Proper name; land/city of Nephi in the text.",
    kjvNotes: "N/A as KJV place.",
    ambiguity: "Highland/settlement complex in limited models; elevation language often pairs with “up to Nephi.”",
    mapHints: ["settlement", "region"],
    relatedTerms: ["land of Zarahemla", "wilderness"],
    sources: [],
  },
  {
    term: "journeyed",
    aliases: ["journey", "journeying"],
    priority: 60,
    webster1828: "To travel from place to place; a passage from one place to another.",
    kjvNotes: "KJV journey often day’s journey measures (Numbers, Jonah).",
    ambiguity: "Implies path; duration may be unstated.",
    mapHints: ["path"],
    relatedTerms: ["wilderness", "days"],
    sources: [{ label: "Webster 1828 — journey", url: "https://webstersdictionary1828.com/Dictionary/journey" }],
  },

  {
    term: "copper",
    aliases: ["ore", "gold", "silver"],
    priority: 55,
    webster1828:
      "Copper: a metal of a yellowish-red color, malleable and ductile. Ore: the compound of a metal and some other substance.",
    kjvNotes:
      "KJV mentions brass/copper (nechosheth) extensively; gold and silver as treasure metals. “Ore” is rarer in KJV than metal names.",
    ambiguity:
      "Presence of ore in a land is a resource claim, not a city pin. Soft feature attachable to a land hub.",
    mapHints: ["resource", "soft"],
    relatedTerms: ["gold", "silver", "brass"],
    sources: [
      { label: "Webster 1828 — copper", url: "https://webstersdictionary1828.com/Dictionary/copper" },
      { label: "Webster 1828 — ore", url: "https://webstersdictionary1828.com/Dictionary/ore" },
    ],
  },
  {
    term: "forest",
    aliases: ["forests", "wood", "woods"],
    priority: 55,
    webster1828: "An extensive wood; a large tract covered with trees.",
    kjvNotes: "KJV forest/wood for wooded wild land; can overlap “wilderness.”",
    ambiguity: "Soft land-cover feature near a land hub — not a settlement.",
    mapHints: ["resource", "soft-region"],
    relatedTerms: ["wilderness", "beasts"],
    sources: [{ label: "Webster 1828 — forest", url: "https://webstersdictionary1828.com/Dictionary/forest" }],
  },
  {
    term: "wilderness",
    aliases: ["the wilderness", "into the wilderness", "through the wilderness"],
    priority: 100,
    webster1828:
      "A desert; a tract of land or region uncultivated and uninhabited by human beings, whether a forest or a wide barren plain. In scripture, often a desolate or uncultivated region (not necessarily sand desert).",
    kjvNotes:
      "Hebrew midbar / Greek eremos: pasture, steppe, desert, uninhabited country — ranges from arid desert (Israel’s wandering) to sparsely settled wild land. KJV “wilderness” is not a single biome.",
    ambiguity:
      "Soft multi-instance corridor/region. Forest, scrub, desert, or “outside settlement” — context decides.",
    mapHints: ["soft-region", "corridor", "many-instances"],
    relatedTerms: ["desert", "forest", "borders of the wilderness"],
    sources: [
      { label: "Webster 1828 — wilderness", url: "https://webstersdictionary1828.com/Dictionary/wilderness" },
    ],
  },
  {
    term: "narrow neck of land",
    aliases: ["small neck of land", "narrow neck"],
    priority: 90,
    webster1828: "Neck: a narrow tract connecting two larger portions (as of land or sea).",
    kjvNotes: "Not a fixed KJV isthmus formula; ordinary English geography.",
    ambiguity: "Keep distinct from “narrow pass” until a model equates them.",
    mapHints: ["corridor", "specific-candidate"],
    relatedTerms: ["narrow pass", "narrow passage"],
    sources: [{ label: "Webster 1828 — neck", url: "https://webstersdictionary1828.com/Dictionary/neck" }],
  },
  {
    term: "narrow pass",
    aliases: ["narrow passage", "narrow pass which led"],
    priority: 90,
    webster1828: "Pass: a passage; a road; a narrow way between hills or mountains.",
    kjvNotes: "KJV “pass” for mountain passes and fords; military choke-point sense.",
    ambiguity: "Phraseology differs from “narrow neck of land.”",
    mapHints: ["corridor", "specific-or-type"],
    relatedTerms: ["narrow neck of land", "pass"],
    sources: [{ label: "Webster 1828 — pass", url: "https://webstersdictionary1828.com/Dictionary/pass" }],
  },
  {
    term: "sea east",
    aliases: ["east sea", "sea on the east"],
    priority: 85,
    webster1828: "Sea: a large body of water; older English sometimes includes large lakes.",
    kjvNotes: "KJV “sea” includes oceans and Galilee (“sea of”). Size not fixed.",
    ambiguity: "Ocean vs large lake is model-dependent; keep phrase “sea east.”",
    mapHints: ["coast_sea"],
    relatedTerms: ["sea west", "great waters"],
    sources: [{ label: "Webster 1828 — sea", url: "https://webstersdictionary1828.com/Dictionary/sea" }],
  },
  {
    term: "sea west",
    aliases: ["west sea", "sea on the west"],
    priority: 85,
    webster1828: "Sea: a large body of water; older English sometimes includes large lakes.",
    kjvNotes: "Same range as sea east in KJV usage.",
    ambiguity: "Pair with sea east for neck geometry; identity of water bodies is model-specific.",
    mapHints: ["coast_sea"],
    relatedTerms: ["sea east"],
    sources: [{ label: "Webster 1828 — sea", url: "https://webstersdictionary1828.com/Dictionary/sea" }],
  },
  {
    term: "came down",
    aliases: ["come down", "went down", "down into the land", "came down into"],
    priority: 88,
    webster1828: "Down: from a higher to a lower place; also figuratively.",
    kjvNotes: "KJV pairs go up to Jerusalem with go down to Egypt — elevation and idiom mixed.",
    ambiguity: "Soft elevation signal unless reinforced.",
    mapHints: ["elevation", "soft"],
    relatedTerms: ["went up"],
    sources: [{ label: "Webster 1828 — down", url: "https://webstersdictionary1828.com/Dictionary/down" }],
  },
  {
    term: "went up",
    aliases: ["go up", "up into the wilderness", "up to the land", "went up into"],
    priority: 88,
    webster1828: "Up: to a higher place; sometimes toward interior or capital.",
    kjvNotes: "“Go up to Jerusalem” is classic KJV elevation/cultic language.",
    ambiguity: "Soft elevation unless other topography supports it.",
    mapHints: ["elevation", "soft"],
    relatedTerms: ["came down"],
    sources: [{ label: "Webster 1828 — up", url: "https://webstersdictionary1828.com/Dictionary/up" }],
  },
  {
    term: "land of Nephi",
    aliases: ["land of Lehi-Nephi"],
    priority: 80,
    webster1828: "Land: country; region; district.",
    kjvNotes: "KJV “land of” = territory of a people or region.",
    ambiguity: "Region may contain cities; boundaries soft unless specified.",
    mapHints: ["region"],
    relatedTerms: ["land of Zarahemla", "wilderness"],
    sources: [],
  },
  {
    term: "land of Zarahemla",
    aliases: ["land of Zarahemla", "Zarahemla"],
    priority: 80,
    webster1828: "Proper name in the text; treat as region/city complex.",
    kjvNotes: "N/A as KJV place; compare “land of” constructions generally.",
    ambiguity: "City vs land of Zarahemla — text uses both; keep both senses open.",
    mapHints: ["settlement", "region"],
    relatedTerms: ["land of Nephi", "Sidon"],
    sources: [],
  },
  {
    term: "whirlwind",
    aliases: ["tempest"],
    priority: 75,
    webster1828: "A violent wind moving in a circle or spiral form.",
    kjvNotes: "KJV whirlwind often theophanic storm (Job, Elijah) — weather + theology.",
    ambiguity: "Sphere of affected places, not a single pin only.",
    mapHints: ["climate", "soft-region"],
    relatedTerms: ["tempest", "storm"],
    sources: [
      { label: "Webster 1828 — whirlwind", url: "https://webstersdictionary1828.com/Dictionary/whirlwind" },
    ],
  },
  {
    term: "great waters",
    aliases: ["across the great waters"],
    priority: 70,
    webster1828: "Waters: seas, rivers, floods — large bodies of water.",
    kjvNotes: "KJV “great waters” often seas or overwhelming floods (Psalms, Ezekiel).",
    ambiguity: "Ocean crossing vs large lake system is model-dependent.",
    mapHints: ["coast_sea", "hydro"],
    relatedTerms: ["sea east", "sea west"],
    sources: [{ label: "Webster 1828 — water", url: "https://webstersdictionary1828.com/Dictionary/water" }],
  },
  {
    term: "borders",
    aliases: ["border", "borders of the wilderness"],
    priority: 60,
    webster1828: "The outer edge or boundary of a country or district.",
    kjvNotes: "KJV borders = edges of territory; political/geographic fringe.",
    ambiguity: "Useful for adjacency constraints; not a place name itself.",
    mapHints: ["corridor", "soft"],
    relatedTerms: ["wilderness"],
    sources: [{ label: "Webster 1828 — border", url: "https://webstersdictionary1828.com/Dictionary/border" }],
  },
];

export type DynamicLexiconResult = {
  query: string;
  curated: LexiconEntry | null;
  /** External lookup links always available for any word */
  external: { label: string; url: string; kind: "webster1828" | "kjv" | "concordance" | "etymology" }[];
};

function slugWebster(word: string) {
  // Webster site uses capitalized path segment
  const w = word.trim().replace(/\s+/g, " ");
  return encodeURIComponent(w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

/** Build dynamic lookup for any selected word/phrase */
export function dynamicLexiconLookup(raw: string): DynamicLexiconResult {
  const query = raw.trim().replace(/\s+/g, " ");
  if (!query) {
    return { query: "", curated: null, external: [] };
  }
  const curated = lookupLexicon(query) ?? null;
  const q = encodeURIComponent(query.toLowerCase());
  const external: DynamicLexiconResult["external"] = [
    {
      label: `Webster 1828 — “${query}”`,
      url: `https://webstersdictionary1828.com/Dictionary/${slugWebster(query.split(/\s+/)[0]!)}`,
      kind: "webster1828",
    },
    {
      label: `Blue Letter Bible (KJV) — “${query}”`,
      url: `https://www.blueletterbible.org/search/search.cfm?Criteria=${q}&t=KJV`,
      kind: "kjv",
    },
    {
      label: `Bible Gateway KJV concordance-style search`,
      url: `https://www.biblegateway.com/quicksearch/?quicksearch=${q}&version=KJV`,
      kind: "concordance",
    },
    {
      label: `Church scripture search (BoM + Bible)`,
      url: `https://www.churchofjesuschrist.org/search?lang=eng&query=${q}&facet=scriptures`,
      kind: "concordance",
    },
  ];
  // Multi-word: also offer first-word Webster if different
  const first = query.split(/\s+/)[0]!;
  if (first.toLowerCase() !== query.toLowerCase()) {
    external.unshift({
      label: `Webster 1828 — “${first}” (headword)`,
      url: `https://webstersdictionary1828.com/Dictionary/${slugWebster(first)}`,
      kind: "webster1828",
    });
  }
  return { query, curated, external };
}

export function lookupLexicon(word: string): LexiconEntry | undefined {
  const q = word.trim().toLowerCase();
  if (!q) return undefined;
  // Exact / alias first
  const exact = lexicon.find(
    (e) =>
      e.term.toLowerCase() === q || e.aliases?.some((a) => a.toLowerCase() === q),
  );
  if (exact) return exact;
  // Phrase contains curated term (prefer longer terms)
  const byLen = [...lexicon].sort((a, b) => b.term.length - a.term.length);
  const contained = byLen.find(
    (e) =>
      q.includes(e.term.toLowerCase()) ||
      e.aliases?.some((a) => q.includes(a.toLowerCase()) || a.toLowerCase().includes(q)),
  );
  if (contained) return contained;
  // Single token match against term words
  return lexicon.find((e) => e.term.toLowerCase().split(/\s+/).includes(q));
}

export function lexiconHitsInText(text: string): LexiconEntry[] {
  const lower = text.toLowerCase();
  return lexicon
    .filter(
      (e) =>
        lower.includes(e.term.toLowerCase()) ||
        e.aliases?.some((a) => lower.includes(a.toLowerCase())),
    )
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}

export function priorityEntries(): LexiconEntry[] {
  return lexicon
    .filter((e) => (e.priority ?? 0) >= 70)
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));
}
