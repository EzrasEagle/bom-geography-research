/**
 * Hebrew / Semitic (and related) onomastic notes for BoM words & names.
 *
 * IMPORTANT: Most Book of Mormon *proper names* have no proven etymology.
 * Entries below mix (1) clear biblical Hebrew/KJV parallels and (2) published
 * or common *speculative* proposals. Always surface confidence so users do not
 * treat guesses as facts.
 */

export type EtymologyConfidence =
  | "biblical" // clearly attested in Hebrew Bible / standard lexica
  | "plausible" // reasonable Semitic morphology, not proven for BoM use
  | "speculative" // onomastic proposal only — label as such
  | "unknown"; // no responsible proposal

export type SemiticEtymology = {
  term: string;
  aliases?: string[];
  /** Script / language family focus */
  language: string;
  /** Proposed root or lemma (transliteration) */
  root?: string;
  /** Gloss of root if known */
  rootGloss?: string;
  /** Readable summary for the Dictionary panel */
  meaning: string;
  confidence: EtymologyConfidence;
  /** Why confidence is set this way */
  caveat: string;
  /** Optional alternate proposals */
  alternatives?: string[];
  sources: { label: string; url?: string }[];
};

export const SEMITIC_ETYMOLOGY: SemiticEtymology[] = [
  {
    term: "Sidon",
    aliases: ["river Sidon", "waters of Sidon", "Sidon"],
    language: "Hebrew / Phoenician (biblical place-name parallel)",
    root: "ṣydn / ṣyd",
    rootGloss: "often linked to ‘to hunt’ / fishery; place-name Ṣīdōn",
    meaning:
      "In the Bible, Sidon (Heb. Ṣīdōn) is the major Phoenician coastal city (north of Tyre). The name is widely connected with fishing/hunting (root ṣwd/ṣyd ‘hunt’). The BoM river name may (a) intentionally echo that famous Near Eastern name, (b) share a Semitic root idea, or (c) be independent. None of that is proven for the New World hydronym.",
    confidence: "plausible",
    caveat:
      "Biblical Sidon is certain as a KJV/Hebrew place name. Applying that etymology to the BoM river is a parallel, not a demonstration. Treat as suggestive only.",
    alternatives: [
      "Pure coincidence of form with biblical Sidon",
      "Egyptian or other non-Hebrew source (more speculative)",
    ],
    sources: [
      {
        label: "Strong’s H6721 — Ṣīdōn (Sidon)",
        url: "https://www.blueletterbible.org/lexicon/h6721/kjv/wlc/0-1/",
      },
      {
        label: "BDB / standard lexica on ṣyd ‘hunt’ (background)",
        url: "https://biblehub.com/hebrew/6679.htm",
      },
    ],
  },
  {
    term: "Amnihu",
    aliases: ["hill Amnihu", "Amnihu"],
    language: "Proposed Hebrew / Semitic segments (highly uncertain)",
    root: "ʔmn + ? / ʿam + nīḥû ?",
    rootGloss: "no consensus segmentation",
    meaning:
      "No secure ancient attestation of “Amnihu.” Speculative cuts sometimes offered in LDS onomastic discussion include pieces like ʾmn (firm/faithful; cf. amen) or ʿam (“people”) plus a second element—but these are guesses, not dictionary facts. Use only as a reminder that the name *looks* Near Eastern-ish to some readers, not as a translation of the hill.",
    confidence: "speculative",
    caveat:
      "There is no clear Hebrew or Egyptian dictionary entry for Amnihu. Any gloss is speculative and must be labeled as such. Prefer geographic relations (east of Sidon) over etymology for mapping.",
    alternatives: [
      "Unanalyzable proper name in the current evidence",
      "Possible scribal/transmission shape unrelated to Hebrew roots",
    ],
    sources: [
      {
        label: "Book of Mormon Onomasticon (BYU) — search Amnihu if listed",
        url: "https://onoma.lib.byu.edu/",
      },
    ],
  },
  {
    term: "Zarahemla",
    aliases: ["land of Zarahemla", "city of Zarahemla"],
    language: "Proposed Hebrew / Semitic compounds (speculative)",
    root: "zeraʿ + ḥmlh / ḥml ?",
    rootGloss: "seed/offspring + compassion/sparing? (proposed only)",
    meaning:
      "Popular speculative analyses treat Zarahemla as a Hebrew-style compound (e.g. ideas around zeraʿ ‘seed’ and a second element sometimes linked to mercy/sparing). These are onomastic proposals, not established lexicon. The text itself never defines the name.",
    confidence: "speculative",
    caveat:
      "No proven etymology. Useful only as “could be Semitic-shaped,” not as a translation key for geography.",
    alternatives: ["Unanalyzed proper name", "Mulekite/other language origin"],
    sources: [
      {
        label: "Book of Mormon Onomasticon — Zarahemla",
        url: "https://onoma.lib.byu.edu/",
      },
    ],
  },
  {
    term: "Nephi",
    aliases: ["land of Nephi", "city of Nephi", "Nephi"],
    language: "Egyptian / Semitic discussions (debated)",
    root: "nfr / nfy ? (proposed)",
    rootGloss: "often compared to Egyptian nfr ‘good/beautiful’ in popular discussion",
    meaning:
      "Nephi is not a standard biblical Hebrew personal name. Speculative comparisons include Egyptian nfr (“good, fair”) and other Near Eastern forms. None is demonstrated; treat as onomastic background only.",
    confidence: "speculative",
    caveat:
      "Egyptian nfr comparison is common in secondary literature but remains unproven for the BoM figure.",
    sources: [
      {
        label: "Book of Mormon Onomasticon — Nephi",
        url: "https://onoma.lib.byu.edu/",
      },
    ],
  },
  {
    term: "Manti",
    aliases: ["land of Manti", "city of Manti"],
    language: "Uncertain; occasional Egyptian/Semitic guesses",
    meaning:
      "No secure etymology. Speculative notes exist in onomastic literature; do not use meaning to place the city—use Alma travel and Sidon-head narratives instead.",
    confidence: "unknown",
    caveat: "Prefer geographic constraints over name meaning.",
    sources: [
      {
        label: "Book of Mormon Onomasticon — Manti",
        url: "https://onoma.lib.byu.edu/",
      },
    ],
  },
  {
    term: "Gideon",
    aliases: ["valley of Gideon", "land of Gideon", "Gideon"],
    language: "Hebrew (biblical name)",
    root: "gidʿôn",
    rootGloss: "often ‘hewer’ / related to gādaʿ ‘cut down’",
    meaning:
      "Gideon is a well-attested Hebrew personal name (Judges). In the BoM it is also a valley/land name. The biblical etymology is real for the Israelite judge; whether the BoM place deliberately reuses that name-sense is a literary question, not a map proof.",
    confidence: "biblical",
    caveat:
      "Hebrew name is solid in the Bible. Mapping still depends on Sidon-east relations, not the gloss ‘hewer.’",
    sources: [
      {
        label: "Strong’s H1439 — Gidʿôn",
        url: "https://www.blueletterbible.org/lexicon/h1439/kjv/wlc/0-1/",
      },
    ],
  },
  {
    term: "Mulek",
    aliases: ["city of Mulek", "Mulek"],
    language: "Proposed West Semitic / royal nickname theories (speculative)",
    root: "mlk ?",
    rootGloss: "king (mlk) — proposed element only",
    meaning:
      "Often discussed in connection with mlk ‘king’ and the narrative claim of a son of Zedekiah. That historical identification is debated; the name-shape is only a possible Semitic echo.",
    confidence: "speculative",
    caveat: "Do not treat ‘king’ as proven gloss of the city name.",
    sources: [
      {
        label: "Book of Mormon Onomasticon — Mulek",
        url: "https://onoma.lib.byu.edu/",
      },
    ],
  },
  {
    term: "Jershon",
    aliases: ["land of Jershon"],
    language: "Proposed Hebrew (speculative)",
    root: "yrš ?",
    rootGloss: "inherit / take possession (proposed)",
    meaning:
      "Sometimes linked to Hebrew yrš ‘to inherit/possess,’ fitting the land given to the people of Anti-Nephi-Lehi—but this is a speculative onomastic fit, not a stated translation.",
    confidence: "speculative",
    caveat: "Geography of Jershon should rest on Alma 27–43 constraints, not the proposed root alone.",
    sources: [
      {
        label: "Book of Mormon Onomasticon — Jershon",
        url: "https://onoma.lib.byu.edu/",
      },
    ],
  },
  {
    term: "wilderness",
    aliases: ["the wilderness"],
    language: "Hebrew midbār / Greek erēmos (via KJV)",
    root: "midbār (מדבר)",
    rootGloss: "uninhabited/pastoral land; not only ‘desert sand’",
    meaning:
      "KJV ‘wilderness’ translates Hebrew midbār (range: steppe, pasture, sparsely settled land, desert) and Greek erēmos. BoM wilderness inherits that wide sense—corridor, wild land, not a single biome.",
    confidence: "biblical",
    caveat: "Sense is lexical; local climate still model-dependent.",
    sources: [
      {
        label: "Strong’s H4057 — midbār",
        url: "https://www.blueletterbible.org/lexicon/h4057/kjv/wlc/0-1/",
      },
    ],
  },
  {
    term: "came down",
    aliases: ["went down", "down into"],
    language: "Hebrew narrative yrd (ירד) pattern via KJV",
    root: "yrd",
    rootGloss: "to go down",
    meaning:
      "KJV ‘go down / come down’ often reflects Hebrew yārad—elevation, status, or journey ‘down’ to a place (e.g. down to Egypt). In BoM geography it is a strong elevation/travel cue when paired with lands (down to Zarahemla).",
    confidence: "biblical",
    caveat: "Metaphorical ‘down’ is possible, but repeated land pairs support real elevation language.",
    sources: [
      {
        label: "Strong’s H3381 — yārad",
        url: "https://www.blueletterbible.org/lexicon/h3381/kjv/wlc/0-1/",
      },
    ],
  },
  {
    term: "went up",
    aliases: ["go up", "up to"],
    language: "Hebrew ʿālâ (עלה) pattern via KJV",
    root: "ʿlh",
    rootGloss: "to go up",
    meaning:
      "KJV ‘go up’ often reflects ʿālâ—ascent to highland, sanctuary, or capital. BoM ‘up to the land of Nephi’ is classically read as elevation.",
    confidence: "biblical",
    caveat: "Confirm with multiple passages; not every ‘up’ is topographic.",
    sources: [
      {
        label: "Strong’s H5927 — ʿālâ",
        url: "https://www.blueletterbible.org/lexicon/h5927/kjv/wlc/0-1/",
      },
    ],
  },
  {
    term: "sea",
    aliases: ["sea east", "sea west", "great sea"],
    language: "Hebrew yām (ים)",
    root: "yām",
    rootGloss: "sea; also west (direction) in some contexts",
    meaning:
      "Hebrew yām is ‘sea’ and can imply the western sea from an Israelite vantage. BoM ‘sea east / sea west’ is directional geography; do not force Mediterranean semantics onto the New World without argument.",
    confidence: "biblical",
    caveat: "Lexical ‘sea’ is clear; which real bodies of water is model-dependent.",
    sources: [
      {
        label: "Strong’s H3220 — yām",
        url: "https://www.blueletterbible.org/lexicon/h3220/kjv/wlc/0-1/",
      },
    ],
  },
  {
    term: "river",
    aliases: ["river Sidon", "the river"],
    language: "Hebrew nāhār / nāḥal",
    root: "nāhār / nāḥal",
    rootGloss: "river / seasonal wadi",
    meaning:
      "Hebrew distinguishes larger rivers (nāhār) and often seasonal watercourses (nāḥal). KJV collapses many into ‘river.’ Sidon’s regime (perennial vs seasonal) is not fixed by the English word alone.",
    confidence: "biblical",
    caveat: "Hydrology must come from narrative (fords, battles, head), not the English gloss.",
    sources: [
      {
        label: "Strong’s H5104 — nāhār",
        url: "https://www.blueletterbible.org/lexicon/h5104/kjv/wlc/0-1/",
      },
    ],
  },
  {
    term: "hill",
    aliases: ["hill Amnihu"],
    language: "Hebrew gibʿâ / har (via KJV ‘hill’)",
    root: "gibʿâ / har",
    rootGloss: "hill / mountain",
    meaning:
      "KJV ‘hill’ covers a range of elevations. A ‘hill’ usable as a battle overlook (Amnihu) implies local relief near the river, not a specific height in feet.",
    confidence: "biblical",
    caveat: "Scale is relative to surrounding land.",
    sources: [
      {
        label: "Strong’s H1389 — gibʿâ",
        url: "https://www.blueletterbible.org/lexicon/h1389/kjv/wlc/0-1/",
      },
    ],
  },
];

export function lookupSemitic(raw: string): SemiticEtymology | null {
  const q = raw.trim().toLowerCase().replace(/\s+/g, " ");
  if (!q) return null;

  const exact = SEMITIC_ETYMOLOGY.find(
    (e) =>
      e.term.toLowerCase() === q ||
      e.aliases?.some((a) => a.toLowerCase() === q),
  );
  if (exact) return exact;

  // Prefer longer alias/term contained in query or vice versa
  const scored = SEMITIC_ETYMOLOGY.map((e) => {
    const keys = [e.term, ...(e.aliases ?? [])].map((k) => k.toLowerCase());
    let score = 0;
    for (const k of keys) {
      if (q === k) score = Math.max(score, 100);
      else if (q.includes(k) && k.length >= 4) score = Math.max(score, 50 + k.length);
      else if (k.includes(q) && q.length >= 4) score = Math.max(score, 40 + q.length);
    }
    return { e, score };
  })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);

  return scored[0]?.e ?? null;
}

export function confidenceLabel(c: EtymologyConfidence): string {
  switch (c) {
    case "biblical":
      return "Biblical / lexical (secure)";
    case "plausible":
      return "Plausible parallel (not proven for BoM)";
    case "speculative":
      return "Speculative only";
    case "unknown":
      return "Unknown / no clear proposal";
  }
}
