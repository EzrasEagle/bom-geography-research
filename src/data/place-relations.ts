/**
 * Cross-object relations beyond hard travel constraints:
 * - mentions: verse/text associates A with B (city mentions river, storm hits city)
 * - elevation: up_to / down_to between lands (soft, from idiom + geography)
 *
 * Spheres of influence = all objects that mention or are mentioned with a focus object.
 */

export type RelationKind =
  | "mentions"
  | "affected_by"
  | "along"
  | "up_to"
  | "down_to"
  | "near";

export type PlaceRelation = {
  id: string;
  from: string;
  to: string;
  kind: RelationKind;
  sourceVerse?: string;
  note?: string;
  strength: "soft" | "hard";
};

/**
 * Seed relations. Expand while indexing.
 * Direction: from = subject that "has" the relation toward to.
 * For rivers: cities → along → sidon; for hazards: cities → affected_by → whirlwind.
 */
export const placeRelations: PlaceRelation[] = [
  // River Sidon path candidates (cities/lands that mention Sidon)
  {
    id: "r-zara-sidon",
    from: "zarahemla",
    to: "sidon",
    kind: "along",
    sourceVerse: "Alma 2:15",
    note: "Sidon runs by land of Zarahemla",
    strength: "hard",
  },
  {
    id: "r-manti-sidon",
    from: "manti",
    to: "sidon",
    kind: "along",
    sourceVerse: "Alma 16:6–7 / Alma 22",
    note: "Near head / upstream Sidon narratives",
    strength: "soft",
  },
  {
    id: "r-nephi-sidon",
    from: "nephi",
    to: "sidon",
    kind: "mentions",
    sourceVerse: "Alma 22:27",
    note: "Land description includes Sidon system context",
    strength: "soft",
  },
  // Whirlwind / storm sphere (places named in destruction / hazard context)
  {
    id: "r-zara-whirl",
    from: "zarahemla",
    to: "climate-whirlwind",
    kind: "affected_by",
    sourceVerse: "3 Nephi 8:8",
    note: "City of Zarahemla did take fire in great storm/tempest narrative",
    strength: "hard",
  },
  {
    id: "r-zara-storm",
    from: "zarahemla",
    to: "climate-storms",
    kind: "affected_by",
    sourceVerse: "3 Nephi 8:5–8",
    note: "Great storm associated with Zarahemla destruction",
    strength: "hard",
  },
  // Elevation up / down
  {
    id: "r-zara-up-nephi",
    from: "zarahemla",
    to: "nephi",
    kind: "up_to",
    sourceVerse: "Mosiah 7:1–6",
    note: "Go up to the land of Nephi (elevation and/or idiom)",
    strength: "soft",
  },
  {
    id: "r-nephi-down-zara",
    from: "nephi",
    to: "zarahemla",
    kind: "down_to",
    sourceVerse: "Omni 1:12–13",
    note: "Flee / go down toward Zarahemla in many readings",
    strength: "soft",
  },
  {
    id: "r-manti-elev",
    from: "manti",
    to: "nephi",
    kind: "near",
    sourceVerse: "Alma 16 / 22",
    note: "Southern highlands association (model-dependent)",
    strength: "soft",
  },
  // Seas mention spheres
  {
    id: "r-jershon-sea",
    from: "jershon",
    to: "sea-east",
    kind: "along",
    sourceVerse: "Alma 27:22",
    note: "Jershon on the east by the sea",
    strength: "hard",
  },
  {
    id: "r-neck-seas",
    from: "narrow-neck",
    to: "sea-east",
    kind: "near",
    sourceVerse: "Alma 22:32",
    note: "Neck geometry with seas",
    strength: "hard",
  },
  {
    id: "r-neck-seaw",
    from: "narrow-neck",
    to: "sea-west",
    kind: "near",
    sourceVerse: "Alma 22:32",
    strength: "hard",
  },
  // Agriculture
  {
    id: "r-landing-ag",
    from: "landing",
    to: "climate-agriculture",
    kind: "mentions",
    sourceVerse: "1 Nephi 18:24",
    note: "Seeds grow exceedingly at landing",
    strength: "hard",
  },
  {
    id: "r-nephi-ag",
    from: "nephi",
    to: "climate-agriculture",
    kind: "mentions",
    sourceVerse: "Enos 1:21",
    note: "Till land; grain and fruit",
    strength: "soft",
  },
];

/** All objects in the sphere of focusId (mentions either direction + affected_by). */
export function sphereOf(focusId: string): {
  relations: PlaceRelation[];
  memberIds: string[];
} {
  const relations = placeRelations.filter(
    (r) => r.from === focusId || r.to === focusId,
  );
  const memberIds = [
    ...new Set(
      relations.flatMap((r) => [r.from, r.to]).filter((id) => id !== focusId),
    ),
  ];
  return { relations, memberIds };
}

/** Ordered path hint for a river: places that `along` it, plus optional elevation sort later. */
export function pathMentionsFor(hydroId: string): PlaceRelation[] {
  return placeRelations.filter(
    (r) => r.to === hydroId && (r.kind === "along" || r.kind === "mentions"),
  );
}

export function elevationLinksFor(placeId: string): PlaceRelation[] {
  return placeRelations.filter(
    (r) =>
      (r.from === placeId || r.to === placeId) &&
      (r.kind === "up_to" || r.kind === "down_to"),
  );
}
