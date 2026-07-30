/**
 * River / geological feature relations (model-neutral internal graph).
 * Used to draw Sidon-like polylines through associated places and to store
 * bank / flow / through-land constraints for real-world overlay later.
 */

export type RiverBank = "east" | "west" | "north" | "south" | "either" | "unknown";
export type RiverPlacement =
  | "on_bank"
  | "flows_through"
  | "headwaters_near"
  | "mouth_near"
  | "across"
  | "unknown";

export type HydroPlaceLink = {
  id: string;
  riverId: string;
  placeId: string;
  bank: RiverBank;
  placement: RiverPlacement;
  /** Order along river from headwaters (0) toward mouth — user/model adjustable */
  orderIndex?: number;
  verseRefs: string[];
  note?: string;
  strength: "hard" | "soft" | "speculative";
};

export type RiverFeature = {
  id: string;
  name: string;
  /** Internal: head → mouth direction claim */
  flowDirection: "south_to_north" | "north_to_south" | "east_to_west" | "west_to_east" | "unknown";
  flowNote?: string;
  placeLinks: HydroPlaceLink[];
};

/** Seed Sidon package from high-signal Alma geography */
export const rivers: RiverFeature[] = [
  {
    id: "sidon",
    name: "River Sidon",
    flowDirection: "south_to_north",
    flowNote:
      "Common limited-model reading: flows past Manti region toward Zarahemla then lowlands (contestable; store as assumption).",
    placeLinks: [
      {
        id: "sidon-manti",
        riverId: "sidon",
        placeId: "manti",
        bank: "unknown",
        placement: "headwaters_near",
        orderIndex: 0,
        verseRefs: ["Alma 22:27", "Alma 43:22", "Alma 16:6–7"],
        note: "Near head of Sidon / south wilderness narratives",
        strength: "soft",
      },
      {
        id: "sidon-minon",
        riverId: "sidon",
        placeId: "minon",
        bank: "west",
        placement: "on_bank",
        orderIndex: 1,
        verseRefs: ["Alma 2:24"],
        note: "Above Zarahemla in the course of Sidon (west of Sidon in some readings)",
        strength: "soft",
      },
      {
        id: "sidon-gideon",
        riverId: "sidon",
        placeId: "gideon",
        bank: "east",
        placement: "on_bank",
        orderIndex: 2,
        verseRefs: ["Alma 2:15", "Alma 6:7"],
        note: "Valley of Gideon east of Sidon / river ran by Zarahemla",
        strength: "hard",
      },
      {
        id: "sidon-zarahemla",
        riverId: "sidon",
        placeId: "zarahemla",
        bank: "west",
        placement: "flows_through",
        orderIndex: 3,
        verseRefs: ["Alma 2:15", "Alma 2:34", "Alma 6:7"],
        note: "Sidon ran by the land of Zarahemla; battles at river",
        strength: "hard",
      },
      {
        id: "sidon-melek",
        riverId: "sidon",
        placeId: "melek",
        bank: "west",
        placement: "on_bank",
        orderIndex: 4,
        verseRefs: ["Alma 8:3"],
        note: "West of Sidon by the borders of the wilderness",
        strength: "soft",
      },
    ],
  },
];

export function riverById(id: string) {
  return rivers.find((r) => r.id === id);
}

export function linksForRiver(riverId: string) {
  return riverById(riverId)?.placeLinks.slice().sort(
    (a, b) => (a.orderIndex ?? 99) - (b.orderIndex ?? 99),
  ) ?? [];
}

export function linksForPlace(placeId: string) {
  return rivers.flatMap((r) => r.placeLinks.filter((l) => l.placeId === placeId));
}
