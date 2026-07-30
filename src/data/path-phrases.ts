/**
 * Reusable path objects / phrases for associations.
 * Prefer BoM wording. Places are separate map features; these are narrative beads on a route.
 */
export const PATH_PHRASE_SUGGESTIONS = [
  "land of Nephi",
  "land of Zarahemla",
  "wilderness",
  "into the wilderness",
  "through the wilderness",
  "went up",
  "go up",
  "came down",
  "come down",
  "down into the land",
  "up into the wilderness",
  "lost",
  "many days",
  "borders",
  "narrow neck of land",
  "narrow pass",
  "sea east",
  "sea west",
  "river Sidon",
  "head of Sidon",
  "land of Desolation",
  "land of Bountiful",
] as const;

export type PathObjectKind = "place" | "phrase" | "elevation" | "event" | "other";

export type PathObject = {
  id: string;
  /** Prefer exact text phrase */
  label: string;
  kind: PathObjectKind;
  /** Optional position along route 0–1 for map marker */
  t?: number;
  placeId?: string;
  note?: string;
};
