/**
 * User-created places (hills, cities, lands…) — first-class map features.
 * Separate from tags (tags = text phrases; places = gazetteer objects).
 */

import { places as seedPlaces, type PlaceNode } from "@/data/catalog";

export type UserPlace = PlaceNode & {
  createdAt: string;
  sourceVerse?: string;
  note?: string;
};

const KEY = "bom-atlas-user-places-v1";

export function loadUserPlaces(): UserPlace[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as UserPlace[];
  } catch {
    return [];
  }
}

export function saveUserPlaces(rows: UserPlace[]) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function slugPlaceId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/\b(hill|city|land|valley|river|mount|mountain)\s+/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || `place-${Date.now()}`;
}

/** Seed + user places (user overrides same id) */
export function allPlaces(): PlaceNode[] {
  const user = loadUserPlaces();
  const map = new Map<string, PlaceNode>();
  for (const p of seedPlaces) map.set(p.id, p);
  for (const p of user) map.set(p.id, p);
  return [...map.values()];
}

export function findPlaceByNameOrId(q: string): PlaceNode | undefined {
  const all = allPlaces();
  const k = q.trim().toLowerCase();
  return (
    all.find((p) => p.id === k) ||
    all.find((p) => p.name.toLowerCase() === k) ||
    all.find((p) => p.aliases?.some((a) => a.toLowerCase() === k)) ||
    all.find((p) => p.name.toLowerCase().includes(k) || k.includes(p.name.toLowerCase()))
  );
}

export function addUserPlace(input: {
  name: string;
  kind: PlaceNode["kind"];
  sizeTier?: PlaceNode["sizeTier"];
  parentId?: string;
  aliases?: string[];
  sourceVerse?: string;
  note?: string;
  id?: string;
}): { places: UserPlace[]; place: UserPlace; error?: string } {
  const name = input.name.trim();
  if (!name) return { places: loadUserPlaces(), place: null as unknown as UserPlace, error: "Name required" };

  const id = input.id || slugPlaceId(name);
  const rows = loadUserPlaces();
  if (seedPlaces.some((p) => p.id === id) || rows.some((p) => p.id === id)) {
    // allow update of user place only
    if (!rows.some((p) => p.id === id) && seedPlaces.some((p) => p.id === id)) {
      return {
        places: rows,
        place: null as unknown as UserPlace,
        error: `Id “${id}” already exists in seed gazetteer — pick another name or id`,
      };
    }
  }

  const place: UserPlace = {
    id,
    name,
    kind: input.kind,
    sizeTier: input.sizeTier,
    parentId: input.parentId,
    aliases: input.aliases ?? [name],
    createdAt: new Date().toISOString(),
    sourceVerse: input.sourceVerse,
    note: input.note,
  };

  const next = [place, ...rows.filter((r) => r.id !== id)];
  saveUserPlaces(next);
  return { places: next, place };
}

export function removeUserPlace(id: string): UserPlace[] {
  const next = loadUserPlaces().filter((p) => p.id !== id);
  saveUserPlaces(next);
  return next;
}
