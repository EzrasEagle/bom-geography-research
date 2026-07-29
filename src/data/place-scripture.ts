/**
 * Scripture & source dossiers for map features (places) and connections (edges).
 * Expand as model index packs grow. Links open official study pages in a new tab.
 */

export type ScriptureRef = {
  /** Display citation e.g. Alma 22:32 */
  ref: string;
  /** Short note on why this verse matters for the feature */
  note: string;
  /** Official study URL (modern edition) */
  studyUrl: string;
  /** Our catalog verse id when we have a full record */
  catalogId?: string;
  /** Tags for filtering */
  tags?: string[];
};

export type RelatedLink = {
  label: string;
  href: string;
  kind: "catalog_verse" | "model" | "insight" | "external" | "feature" | "index";
};

export type FeatureDossier = {
  id: string;
  name: string;
  kind: string;
  summary: string;
  /** Primary scriptural undergirding */
  scriptures: ScriptureRef[];
  /** Other features often discussed with this one */
  relatedFeatureIds: string[];
  /** Constraint / edge ids that touch this place */
  edgeIds: string[];
  /** Assumption ids often tied to this place */
  assumptionIds: string[];
  related: RelatedLink[];
};

function bom(
  book: string,
  chapter: number,
  verseHint: string,
  note: string,
  opts?: { catalogId?: string; tags?: string[]; verseAnchor?: string },
): ScriptureRef {
  const bookSlug = book
    .toLowerCase()
    .replace(/^1 /, "1-")
    .replace(/^2 /, "2-")
    .replace(/^3 /, "3-")
    .replace(/^4 /, "4-")
    .replace(/ /g, "-");
  // Church URL pattern: /study/scriptures/bofm/alma/22
  const pathBook = bookSlug
    .replace("1-nephi", "1-ne")
    .replace("2-nephi", "2-ne")
    .replace("3-nephi", "3-ne")
    .replace("4-nephi", "4-ne")
    .replace("words-of-mormon", "w-of-m")
    .replace("helaman", "hel")
    .replace("mormon", "morm")
    .replace("moroni", "moro")
    .replace("mosiah", "mosiah")
    .replace("alma", "alma")
    .replace("enose", "enos")
    .replace("jarom", "jarom")
    .replace("omni", "omni")
    .replace("jacob", "jacob")
    .replace("ether", "ether");
  // Fix enos
  const pb = pathBook.replace("enose", "enos");
  const anchor = opts?.verseAnchor ? `&id=p${opts.verseAnchor}#p${opts.verseAnchor}` : "";
  return {
    ref: `${book} ${chapter}:${verseHint}`,
    note,
    studyUrl: `https://www.churchofjesuschrist.org/study/scriptures/bofm/${pb}/${chapter}?lang=eng${anchor}`,
    catalogId: opts?.catalogId,
    tags: opts?.tags,
  };
}

/** Edge-level scripture bundles (connection between places). */
export type EdgeDossier = {
  edgeId: string;
  from: string;
  to: string;
  summary: string;
  scriptures: ScriptureRef[];
  related: RelatedLink[];
};

export const placeDossiers: Record<string, FeatureDossier> = {
  "sea-east": {
    id: "sea-east",
    name: "Sea east",
    kind: "sea",
    summary:
      "The “sea east” (and east seashore) frames Lamanite/Nephite borders, Jershon, and the narrow-neck geometry in Alma 22 and war narratives.",
    scriptures: [
      bom("Alma", 22, "27", "Lamanite king’s land borders: sea east and sea west mentioned in land description.", {
        verseAnchor: "27",
        tags: ["border", "sea", "alma-22"],
      }),
      bom("Alma", 22, "32–33", "Narrow neck between the land northward and southward; seas on east and west motif.", {
        verseAnchor: "32",
        tags: ["narrow-neck", "sea", "alma-22"],
      }),
      bom("Alma", 27, "22", "Jershon given by the sea east (common reading).", {
        verseAnchor: "22",
        tags: ["jershon", "sea"],
      }),
      bom("Alma", 50, "8–9", "East wilderness / seashore settlement themes in fortification era.", {
        verseAnchor: "8",
        tags: ["seashore", "east"],
      }),
      bom("Alma", 50, "34", "Narrow pass by the sea (east/west context in campaign).", {
        verseAnchor: "34",
        tags: ["narrow-pass", "sea"],
      }),
      bom("Helaman", 3, "8", "They spread from sea west to sea east (northward expansion language).", {
        verseAnchor: "8",
        tags: ["sea", "northward"],
      }),
    ],
    relatedFeatureIds: ["sea-west", "jershon", "narrow-neck", "bountiful-nw"],
    edgeIds: ["c7", "c10"],
    assumptionIds: ["meso-neck-tehuantepec", "baja-dual-seas", "heart-sidon-miss"],
    related: [
      { label: "Alma 22 cluster (priority harvest)", href: "/verses", kind: "catalog_verse" },
      { label: "Internal index pack", href: "/models/indexes", kind: "index" },
    ],
  },
  "sea-west": {
    id: "sea-west",
    name: "Sea west",
    kind: "sea",
    summary: "West sea appears with east sea in Alma 22 land description and Helaman expansion language.",
    scriptures: [
      bom("Alma", 22, "27", "Borders by the sea west in the land-description passage.", {
        verseAnchor: "27",
        tags: ["border", "sea", "alma-22"],
      }),
      bom("Alma", 22, "32–33", "Day-and-a-half / neck between seas east and west.", {
        verseAnchor: "32",
        tags: ["narrow-neck", "sea"],
      }),
      bom("Helaman", 3, "8", "From the sea west to the sea east.", {
        verseAnchor: "8",
        tags: ["sea"],
      }),
      bom("Alma", 53, "8–22", "West sea / coastal fortification motifs in war chapters (see full chapters).", {
        verseAnchor: "8",
        tags: ["war", "west-sea"],
      }),
    ],
    relatedFeatureIds: ["sea-east", "narrow-neck", "bountiful-nw", "desolation"],
    edgeIds: ["c10"],
    assumptionIds: ["meso-neck-tehuantepec", "baja-dual-seas"],
    related: [{ label: "Map Lab", href: "/map-lab", kind: "feature" }],
  },
  "narrow-neck": {
    id: "narrow-neck",
    name: "Narrow neck / pass",
    kind: "other",
    summary:
      "Central constraint for almost every external model: day-and-a-half journey, seas on both sides, Bountiful–Desolation junction.",
    scriptures: [
      bom("Alma", 22, "32", "Day and a half’s journey for a Nephite on the line Bountiful/Desolation; small neck of land.", {
        verseAnchor: "32",
        tags: ["narrow-neck", "days", "high-signal"],
      }),
      bom("Alma", 50, "34", "Narrow pass which led by the sea into the land northward.", {
        verseAnchor: "34",
        tags: ["narrow-pass"],
      }),
      bom("Alma", 52, "9", "Keep the narrow pass which led into the land northward.", {
        verseAnchor: "9",
        tags: ["narrow-pass", "northward"],
      }),
      bom("Alma", 63, "5", "Hagoth builds ships by the narrow neck (near west sea in text).", {
        verseAnchor: "5",
        tags: ["hagoth", "ships"],
      }),
      bom("Helaman", 4, "7", "Fortify from the west sea to the east (line of defense near neck narratives).", {
        verseAnchor: "7",
        tags: ["fortify"],
      }),
    ],
    relatedFeatureIds: ["bountiful-nw", "desolation", "sea-east", "sea-west"],
    edgeIds: ["c5", "c6", "c10"],
    assumptionIds: ["meso-neck-tehuantepec", "baja-neck-peninsula", "meso-limited"],
    related: [
      { label: "Mesoamerica model", href: "/models/mesoamerica", kind: "model" },
      { label: "Baja model", href: "/models/baja", kind: "model" },
      { label: "Heartland model", href: "/models/heartland", kind: "model" },
    ],
  },
  zarahemla: {
    id: "zarahemla",
    name: "Zarahemla",
    kind: "city",
    summary: "Capital of the land of Zarahemla; oriented to Sidon in war narratives; destination of Mosiah’s people.",
    scriptures: [
      bom("Omni", 1, "12–19", "Mosiah discovers people of Zarahemla; language and genealogy notes.", {
        verseAnchor: "12",
        tags: ["mulekite", "migration"],
      }),
      bom("Mosiah", 1, "1", "King Benjamin in Zarahemla frame.", { verseAnchor: "1", tags: ["capital"] }),
      bom("Alma", 2, "15", "Battle by the river Sidon, near Zarahemla.", {
        verseAnchor: "15",
        tags: ["sidon", "war"],
      }),
      bom("Alma", 5, "1–3", "Alma begins teaching in Zarahemla.", { verseAnchor: "1", tags: ["ministry"] }),
      bom("Helaman", 1, "18–27", "Capture and recovery of Zarahemla (strategic center).", {
        verseAnchor: "18",
        tags: ["war"],
      }),
    ],
    relatedFeatureIds: ["sidon", "nephi", "manti", "bountiful-nw"],
    edgeIds: ["c1", "c2", "c4"],
    assumptionIds: ["meso-sidon-grijalva", "heart-sidon-miss"],
    related: [],
  },
  nephi: {
    id: "nephi",
    name: "Land/City of Nephi",
    kind: "land",
    summary: "Early Nephite homeland after separation; often “up” relative to Zarahemla; Zeniff/Limhi narratives.",
    scriptures: [
      bom("2 Nephi", 5, "7–17", "Nephi’s people establish land of Nephi; buildings, temple.", {
        verseAnchor: "7",
        tags: ["settlement"],
      }),
      bom("Omni", 1, "12–13", "Mosiah flees land of Nephi to Zarahemla.", {
        verseAnchor: "12",
        tags: ["migration"],
      }),
      bom("Mosiah", 7, "1–6", "Expedition from Zarahemla toward land of Nephi.", {
        verseAnchor: "1",
        tags: ["travel"],
      }),
      bom("Mosiah", 9, "1–9", "Zeniff returns to possess land of Nephi.", {
        verseAnchor: "1",
        tags: ["zeniff"],
      }),
      bom("Alma", 22, "28", "Lamanites in land of Nephi bordering wilderness strip.", {
        verseAnchor: "28",
        tags: ["alma-22"],
      }),
    ],
    relatedFeatureIds: ["zarahemla", "landing", "manti", "sidon"],
    edgeIds: ["c1", "c8"],
    assumptionIds: ["highland-nephi-core"],
    related: [{ label: "Highland model", href: "/models/meso-highland", kind: "model" }],
  },
  sidon: {
    id: "sidon",
    name: "River Sidon",
    kind: "river",
    summary: "Primary river of Nephite war geography; battles west of Sidon; headwaters near Manti region in Alma.",
    scriptures: [
      bom("Alma", 2, "15–37", "Amlicite war by Sidon.", { verseAnchor: "15", tags: ["war", "sidon"] }),
      bom("Alma", 16, "6–7", "Wilderness and Sidon head context.", { verseAnchor: "6", tags: ["head"] }),
      bom("Alma", 22, "27–29", "Sidon in land description / wilderness borders.", {
        verseAnchor: "27",
        tags: ["alma-22"],
      }),
      bom("Alma", 43, "27–54", "Zerahemnah war; armies by Sidon.", { verseAnchor: "27", tags: ["war"] }),
      bom("Alma", 56, "25", "Manti / Sidon region travel (stripling warriors cycle).", {
        verseAnchor: "25",
        tags: ["manti"],
      }),
    ],
    relatedFeatureIds: ["zarahemla", "manti", "nephi"],
    edgeIds: ["c2", "c3"],
    assumptionIds: ["meso-sidon-grijalva", "heart-sidon-miss"],
    related: [],
  },
  "bountiful-nw": {
    id: "bountiful-nw",
    name: "Bountiful (New World)",
    kind: "land",
    summary: "Nephite Bountiful near the narrow neck; distinct from Old World Bountiful in 1 Nephi 17.",
    scriptures: [
      bom("Alma", 22, "29–33", "Bountiful filled from east to west; joins Desolation at neck.", {
        verseAnchor: "29",
        tags: ["bountiful", "alma-22"],
      }),
      bom("Alma", 27, "22", "Jershon south of Bountiful by east sea (relative).", {
        verseAnchor: "22",
        tags: ["jershon"],
      }),
      bom("Alma", 51, "26–32", "Cities by seashore; Bountiful as strategic land.", {
        verseAnchor: "26",
        tags: ["war"],
      }),
      bom("Alma", 52, "9–18", "Teancum / Moroni operations involving Bountiful.", {
        verseAnchor: "9",
        tags: ["war"],
      }),
      bom("3 Nephi", 11, "1", "Christ appears at temple in Bountiful.", {
        verseAnchor: "1",
        tags: ["christ", "temple"],
      }),
    ],
    relatedFeatureIds: ["desolation", "narrow-neck", "jershon", "sea-east"],
    edgeIds: ["c4", "c5", "c6"],
    assumptionIds: [],
    related: [
      {
        label: "Old World Bountiful (catalog)",
        href: "/verses/1ne-17-5",
        kind: "catalog_verse",
      },
    ],
  },
  desolation: {
    id: "desolation",
    name: "Desolation",
    kind: "land",
    summary: "Land northward of the narrow neck line; Jaredite bones / desolation motifs; gateway northward.",
    scriptures: [
      bom("Alma", 22, "30–32", "Desolation so far northward; bones; joins Bountiful.", {
        verseAnchor: "30",
        tags: ["desolation", "alma-22"],
      }),
      bom("Alma", 50, "34", "Narrow pass into land northward by sea.", {
        verseAnchor: "34",
        tags: ["northward"],
      }),
      bom("Helaman", 3, "3–6", "Many depart into land northward / Desolation region language.", {
        verseAnchor: "3",
        tags: ["northward"],
      }),
      bom("Mormon", 3, "5–7", "Nephites gather to Desolation in final wars.", {
        verseAnchor: "5",
        tags: ["final-war"],
      }),
    ],
    relatedFeatureIds: ["bountiful-nw", "narrow-neck", "cumorah"],
    edgeIds: ["c5", "c9"],
    assumptionIds: [],
    related: [],
  },
  cumorah: {
    id: "cumorah",
    name: "Cumorah / Ramah",
    kind: "hill",
    summary: "Final Nephite gathering/battle (Mormon 6); Jaredite Ramah (Ether 15). Major model discriminator (NY vs Mesoamerica).",
    scriptures: [
      bom("Mormon", 6, "1–15", "Gather to land of Cumorah; final battle.", {
        verseAnchor: "2",
        tags: ["cumorah", "high-signal"],
      }),
      bom("Mormon", 8, "2–3", "Moroni after the fall at Cumorah.", {
        verseAnchor: "2",
        tags: ["moroni"],
      }),
      bom("Ether", 15, "11", "Hill Ramah — same as Cumorah in traditional reading.", {
        verseAnchor: "11",
        tags: ["ramah", "jaredite"],
      }),
      bom("Mormon", 1, "1–7", "Northward / land of many waters context before Cumorah arc.", {
        verseAnchor: "1",
        tags: ["northward"],
      }),
    ],
    relatedFeatureIds: ["desolation"],
    edgeIds: ["c9"],
    assumptionIds: ["meso-cumorah-south", "heart-cumorah-ny"],
    related: [
      { label: "Heartland (NY Cumorah)", href: "/models/heartland", kind: "model" },
      { label: "Mesoamerica (southern Cumorah)", href: "/models/mesoamerica", kind: "model" },
    ],
  },
  landing: {
    id: "landing",
    name: "Landing region",
    kind: "other",
    summary: "Lehi party arrives in promised land after ocean voyage; seeds planted; animals and ore noted.",
    scriptures: [
      bom("1 Nephi", 18, "23", "Arrive at promised land; pitch tents.", {
        catalogId: "1ne-18-23",
        verseAnchor: "23",
        tags: ["landing", "voyage"],
      }),
      bom("1 Nephi", 18, "24", "Plant Jerusalem seeds; grow exceedingly.", {
        catalogId: "1ne-18-24",
        verseAnchor: "24",
        tags: ["climate", "seeds"],
      }),
      bom("1 Nephi", 18, "25", "Beasts, forests, ore of gold/silver/copper.", {
        verseAnchor: "25",
        tags: ["ore", "animals"],
      }),
      bom("1 Nephi", 17, "5", "Old World Bountiful (contrast — not New World landing).", {
        catalogId: "1ne-17-5",
        verseAnchor: "5",
        tags: ["bountiful-old-world"],
      }),
    ],
    relatedFeatureIds: ["nephi", "sea-west"],
    edgeIds: ["c8"],
    assumptionIds: ["baja-seed-climate", "sa-chile-landing"],
    related: [
      { label: "1 Ne 18:23 catalog", href: "/verses/1ne-18-23", kind: "catalog_verse" },
      { label: "1 Ne 18:24 catalog", href: "/verses/1ne-18-24", kind: "catalog_verse" },
      { label: "Levantine crops insight", href: "/insights/insight-levantine-crops-baja-socal", kind: "insight" },
    ],
  },
  jershon: {
    id: "jershon",
    name: "Jershon",
    kind: "land",
    summary: "Land given to Anti-Nephi-Lehies; by the east sea south of Bountiful in common readings.",
    scriptures: [
      bom("Alma", 27, "22–24", "Jershon on the east by the sea.", {
        verseAnchor: "22",
        tags: ["jershon", "sea-east"],
      }),
      bom("Alma", 28, "1", "Battle in Jershon.", { verseAnchor: "1", tags: ["war"] }),
      bom("Alma", 35, "13", "People of Ammon in Jershon.", { verseAnchor: "13", tags: ["ammon"] }),
    ],
    relatedFeatureIds: ["sea-east", "bountiful-nw"],
    edgeIds: ["c7"],
    assumptionIds: [],
    related: [],
  },
  manti: {
    id: "manti",
    name: "Manti",
    kind: "city",
    summary: "Southern strategic city; near head of Sidon; heavy in Alma 56–58 war travel.",
    scriptures: [
      bom("Alma", 16, "6–7", "Near head of Sidon / wilderness path.", {
        verseAnchor: "6",
        tags: ["sidon"],
      }),
      bom("Alma", 22, "27", "Land description includes Manti region context.", {
        verseAnchor: "27",
        tags: ["alma-22"],
      }),
      bom("Alma", 56, "13–57", "Stripling warriors; Manti campaign (read chapter).", {
        verseAnchor: "13",
        tags: ["war", "travel"],
      }),
      bom("Alma", 58, "13–41", "Retaking Manti; march narratives.", {
        verseAnchor: "13",
        tags: ["war"],
      }),
    ],
    relatedFeatureIds: ["sidon", "nephi", "zarahemla"],
    edgeIds: ["c3"],
    assumptionIds: [],
    related: [],
  },


  wilderness: {
    id: "wilderness",
    name: "Wilderness",
    kind: "wilderness",
    summary:
      "Soft-boundary, multi-instance corridor/region (uncultivated or uninhabited land). Omni 1:12–13: out of the land of Nephi into the wilderness, then down into Zarahemla. Not a single fixed polygon by default — many wildernesses may exist.",
    scriptures: [
      bom("Omni", 1, "12–13", "Flee Nephi into the wilderness; through the wilderness down to Zarahemla.", {
        verseAnchor: "12",
        tags: ["wilderness", "nephi", "zarahemla"],
      }),
      bom("Omni", 1, "27–29", "Went up into the wilderness to return to Nephi.", {
        verseAnchor: "27",
        tags: ["wilderness", "up"],
      }),
    ],
    relatedFeatureIds: ["nephi", "zarahemla"],
    edgeIds: [],
    assumptionIds: [],
    related: [
      { label: "Reader Omni 1", href: "/reader?book=Omni&chapter=1&verse=13&q=wilderness&feature=wilderness", kind: "catalog_verse" },
    ],
  },
  "climate-whirlwind": {
    id: "climate-whirlwind",
    name: "Whirlwinds / tempests",
    kind: "climate",
    summary:
      "Whirlwind and tempest language (esp. 3 Nephi 8 destruction narrative; Helaman imagery). Tag regions where models place affected cities (e.g. Zarahemla burned) to test climate/hazard assumptions.",
    scriptures: [
      bom("3 Nephi", 8, "5–19", "Great storm, tempest, whirlwind; cities destroyed.", {
        verseAnchor: "5",
        tags: ["whirlwind", "storm", "climate"],
      }),
      bom("Helaman", 5, "12", "Whirlwind imagery (spiritual metaphor — still climate-tagged).", {
        verseAnchor: "12",
        tags: ["whirlwind"],
      }),
    ],
    relatedFeatureIds: ["zarahemla", "climate-storms", "climate-seasons"],
    edgeIds: [],
    assumptionIds: ["baja-seed-climate"],
    related: [
      { label: "Open whirlwind verses in Reader", href: "/reader?q=whirlwind&feature=climate-whirlwind", kind: "catalog_verse" },
    ],
  },
  "climate-storms": {
    id: "climate-storms",
    name: "Storms / great storm",
    kind: "climate",
    summary: "Great storm / tempest at Christ’s death (3 Nephi 8). Associate with areas where destroyed cities are mapped.",
    scriptures: [
      bom("3 Nephi", 8, "5–7", "Great storm and tempest.", { verseAnchor: "5", tags: ["storm", "climate"] }),
    ],
    relatedFeatureIds: ["climate-whirlwind", "zarahemla"],
    edgeIds: [],
    assumptionIds: [],
    related: [
      { label: "Reader: storm", href: "/reader?q=storm&feature=climate-storms", kind: "catalog_verse" },
    ],
  },
  "climate-seasons": {
    id: "climate-seasons",
    name: "Seasons / seasonal timing",
    kind: "climate",
    summary:
      "Seasonal fevers (Alma 46:40), agricultural cycles, and war-year timing. Use to ask whether campaigns pause for winter/harvest — text is often subtle; tag carefully.",
    scriptures: [
      bom("Alma", 46, "40", "Fevers at some seasons of the year.", {
        verseAnchor: "40",
        tags: ["seasons", "climate"],
      }),
      bom("Enos", 1, "21", "Till the land; grain and fruit.", { verseAnchor: "21", tags: ["agriculture"] }),
    ],
    relatedFeatureIds: ["climate-agriculture", "zarahemla", "nephi"],
    edgeIds: [],
    assumptionIds: ["day-march-15-20"],
    related: [
      { label: "Reader: seasons", href: "/reader?q=seasons&feature=climate-seasons", kind: "catalog_verse" },
    ],
  },
  "climate-agriculture": {
    id: "climate-agriculture",
    name: "Agriculture / grain / famine",
    kind: "climate",
    summary:
      "Grain, tillage, famine, timber scarcity. Landing seed success (1 Ne 18:24) and later agriculture constrain climate models.",
    scriptures: [
      bom("1 Nephi", 18, "24", "Jerusalem seeds grow exceedingly.", {
        catalogId: "1ne-18-24",
        verseAnchor: "24",
        tags: ["seeds", "climate"],
      }),
      bom("Enos", 1, "21", "Grain and fruit.", { verseAnchor: "21", tags: ["agriculture"] }),
      bom("Helaman", 3, "10", "Timber scarce in land northward.", {
        verseAnchor: "10",
        tags: ["timber", "northward"],
      }),
    ],
    relatedFeatureIds: ["landing", "nephi", "climate-seasons"],
    edgeIds: [],
    assumptionIds: ["baja-seed-climate", "sa-chile-landing"],
    related: [
      { label: "Levantine crops insight", href: "/insights/insight-levantine-crops-baja-socal", kind: "insight" },
      { label: "Reader: grain", href: "/reader?q=grain&feature=climate-agriculture", kind: "catalog_verse" },
    ],
  },
};

/** Build edge dossiers from constraints + place scriptures that touch both ends. */
export function buildEdgeDossier(
  edgeId: string,
  from: string,
  to: string,
  value: string | number | undefined,
  sourceVerse?: string,
): EdgeDossier {
  const fromD = placeDossiers[from];
  const toD = placeDossiers[to];
  const scriptures: ScriptureRef[] = [];
  if (sourceVerse) {
    scriptures.push({
      ref: sourceVerse,
      note: "Cited on this constraint edge in the catalog.",
      studyUrl: guessStudyUrl(sourceVerse),
      tags: ["edge-source"],
    });
  }
  // Add high-signal scriptures from both places that share alma-22 / travel tags
  for (const d of [fromD, toD]) {
    if (!d) continue;
    for (const s of d.scriptures) {
      if (s.tags?.includes("alma-22") || s.tags?.includes("high-signal") || s.tags?.includes("narrow-neck")) {
        if (!scriptures.some((x) => x.ref === s.ref)) scriptures.push(s);
      }
    }
  }
  return {
    edgeId,
    from,
    to,
    summary: String(value ?? `${from} → ${to}`),
    scriptures,
    related: [
      { label: fromD?.name ?? from, href: `/map-lab/feature/${from}`, kind: "feature" },
      { label: toD?.name ?? to, href: `/map-lab/feature/${to}`, kind: "feature" },
    ],
  };
}

function guessStudyUrl(ref: string): string {
  // Best-effort parse "Alma 22:32" or "Alma 22:29–33" or "1 Ne 18:23"
  const m = ref.match(/(\d?\s*[A-Za-z.]+)\s+(\d+)/);
  if (!m) return "https://www.churchofjesuschrist.org/study/scriptures/bofm?lang=eng";
  const bookRaw = m[1].replace(/\./g, "").trim();
  const chapter = m[2];
  const map: Record<string, string> = {
    Alma: "alma",
    Helaman: "hel",
    Hel: "hel",
    Mormon: "morm",
    Morm: "morm",
    Mosiah: "mosiah",
    Omni: "omni",
    Ether: "ether",
    "1 Ne": "1-ne",
    "1 Nephi": "1-ne",
    "2 Ne": "2-ne",
    "2 Nephi": "2-ne",
    "3 Ne": "3-ne",
    "3 Nephi": "3-ne",
  };
  const slug = map[bookRaw] ?? bookRaw.toLowerCase().replace(/\s+/g, "-");
  return `https://www.churchofjesuschrist.org/study/scriptures/bofm/${slug}/${chapter}?lang=eng`;
}

export function getPlaceDossier(id: string): FeatureDossier | undefined {
  return placeDossiers[id];
}

export function allFeatureIds(): string[] {
  return Object.keys(placeDossiers);
}
