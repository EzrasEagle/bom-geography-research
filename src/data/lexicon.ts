/**
 * Historical sense of BoM vocabulary: 1820s English (Webster 1828)
 * + KJV usage notes. Prefer text's own phrase as the tag label.
 */

export type LexiconEntry = {
  /** Prefer exact BoM phrase as lemma when possible */
  term: string;
  aliases?: string[];
  webster1828: string;
  kjvNotes: string;
  ambiguity: string;
  /** Suggested map feature kinds / soft layers */
  mapHints: string[];
  relatedTerms?: string[];
  sources: { label: string; url?: string }[];
};

export const lexicon: LexiconEntry[] = [
  {
    term: "wilderness",
    aliases: ["the wilderness", "into the wilderness"],
    webster1828:
      "A desert; a tract of land or region uncultivated and uninhabited by human beings, whether a forest or a wide barren plain. In scripture, often a desolate or uncultivated region (not necessarily sand desert).",
    kjvNotes:
      "Hebrew midbar / Greek eremos: pasture, steppe, desert, uninhabited country — ranges from arid desert (Israel’s wandering) to sparsely settled wild land. KJV “wilderness” is not a single biome; context decides forest vs scrub vs desert.",
    ambiguity:
      "Ambiguous for climate models: can be forest, scrub, desert, or political “outside settlement.” Treat as soft-boundary corridors that can recur in many places — not one unique polygon unless the text forces it.",
    mapHints: ["soft-region", "corridor", "many-instances"],
    relatedTerms: ["desert", "forest", "borders of the wilderness"],
    sources: [
      {
        label: "Webster 1828 — wilderness",
        url: "https://webstersdictionary1828.com/Dictionary/wilderness",
      },
      { label: "KJV concordance usage (midbar/eremos)" },
    ],
  },
  {
    term: "narrow neck of land",
    aliases: ["small neck of land", "narrow neck"],
    webster1828: "Neck: a narrow tract connecting two larger portions (as of land or sea).",
    kjvNotes: "Not a KJV set phrase for isthmus; sense is ordinary English geography.",
    ambiguity: "Keep distinct from “narrow pass” — may or may not be the same feature.",
    mapHints: ["corridor", "specific-candidate"],
    relatedTerms: ["narrow pass", "narrow passage"],
    sources: [{ label: "Webster 1828 — neck" }],
  },
  {
    term: "narrow pass",
    aliases: ["narrow passage", "narrow pass which led"],
    webster1828: "Pass: a passage; a road; a narrow way between hills or mountains.",
    kjvNotes: "KJV uses pass for mountain passes and fords; military choke-point sense is natural.",
    ambiguity:
      "Phraseology differs from “narrow neck of land.” Tag with the exact phrase; only merge if a model argues identity.",
    mapHints: ["corridor", "specific-or-type"],
    relatedTerms: ["narrow neck of land", "pass"],
    sources: [{ label: "Webster 1828 — pass" }],
  },
  {
    term: "sea east",
    aliases: ["east sea", "sea on the east"],
    webster1828: "Sea: a large body of water; in older English also large lakes sometimes called seas.",
    kjvNotes: "KJV “sea” includes Mediterranean, Red Sea, and Galilee (“sea of”). Size is not fixed.",
    ambiguity: "Could be ocean or large lake depending on model; keep phrase “sea east.”",
    mapHints: ["coast_sea"],
    relatedTerms: ["sea west", "great waters"],
    sources: [{ label: "Webster 1828 — sea" }],
  },
  {
    term: "came down",
    aliases: ["come down", "went down", "down into the land"],
    webster1828: "Down: from a higher to a lower place; also figuratively.",
    kjvNotes: "KJV often pairs go up to Jerusalem (elevation/cultic) with go down to Egypt — mixed elevation and idiom.",
    ambiguity: "May encode elevation, prestige, or convention. Tag as elevation-down but mark soft.",
    mapHints: ["elevation", "soft"],
    relatedTerms: ["went up", "up to the land of Nephi"],
    sources: [{ label: "Webster 1828 — down" }],
  },
  {
    term: "went up",
    aliases: ["go up", "up into the wilderness", "up to the land"],
    webster1828: "Up: to a higher place; toward the interior or capital in some usages.",
    kjvNotes: "“Go up to Jerusalem” is classic KJV elevation/cultic language.",
    ambiguity: "Soft elevation signal unless reinforced by other topography.",
    mapHints: ["elevation", "soft"],
    relatedTerms: ["came down"],
    sources: [{ label: "Webster 1828 — up" }],
  },
  {
    term: "land of Nephi",
    aliases: ["land of Lehi-Nephi"],
    webster1828: "Land: country; region; district.",
    kjvNotes: "KJV “land of” = territory of a people or region.",
    ambiguity: "Region may contain cities; boundaries soft unless specified.",
    mapHints: ["region"],
    relatedTerms: ["land of Zarahemla", "wilderness"],
    sources: [],
  },
  {
    term: "whirlwind",
    aliases: ["tempest"],
    webster1828: "A violent wind moving in a circle, or rather in a spiral form, as if moving round an axis.",
    kjvNotes: "KJV whirlwind often divine storm theophany (Job, Nahum, 2 Kings Elijah) — meteorological and theological.",
    ambiguity: "May be local storm track; sphere of affected cities is the right map object, not one pin only.",
    mapHints: ["climate", "soft-region", "many-instances"],
    relatedTerms: ["tempest", "storm"],
    sources: [{ label: "Webster 1828 — whirlwind" }],
  },
];

export function lookupLexicon(word: string): LexiconEntry | undefined {
  const q = word.trim().toLowerCase();
  if (!q) return undefined;
  return lexicon.find(
    (e) =>
      e.term.toLowerCase() === q ||
      e.aliases?.some((a) => a.toLowerCase() === q) ||
      e.term.toLowerCase().includes(q) ||
      e.aliases?.some((a) => a.toLowerCase().includes(q)) ||
      q.includes(e.term.toLowerCase()),
  );
}

export function lexiconHitsInText(text: string): LexiconEntry[] {
  const lower = text.toLowerCase();
  return lexicon.filter(
    (e) =>
      lower.includes(e.term.toLowerCase()) ||
      e.aliases?.some((a) => lower.includes(a.toLowerCase())),
  );
}
