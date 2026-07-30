/**
 * One tag set per verse — no duplicate rows per phrase.
 */

export type VerseTagSet = {
  /** book|chapter|verse */
  key: string;
  book: string;
  chapter: number;
  verse: number;
  /** Unique phrases from the text (or accepted suggestions) */
  phrases: string[];
  featureIds: string[];
  note?: string;
  updatedAt: string;
};

const KEY = "bom-atlas-reader-tags-v4";
const LEGACY = "bom-atlas-reader-tags-v3";

export function verseKey(book: string, chapter: number, verse: number) {
  return `${book}|${chapter}|${verse}`;
}

export function loadTagSets(): VerseTagSet[] {
  try {
    const v4 = localStorage.getItem(KEY);
    if (v4) return JSON.parse(v4) as VerseTagSet[];

    // Migrate v3 rows → one set per verse
    const v3 = localStorage.getItem(LEGACY);
    if (!v3) return [];
    type Old = {
      book: string;
      chapter: number;
      verse: number;
      wordPhrase?: string;
      tags: string[];
      featureIds: string[];
      note?: string;
    };
    const old = JSON.parse(v3) as Old[];
    const map = new Map<string, VerseTagSet>();
    for (const row of old) {
      const k = verseKey(row.book, row.chapter, row.verse);
      const cur = map.get(k) ?? {
        key: k,
        book: row.book,
        chapter: row.chapter,
        verse: row.verse,
        phrases: [],
        featureIds: [],
        updatedAt: new Date().toISOString(),
      };
      const add = [
        ...(row.wordPhrase ? [row.wordPhrase] : []),
        ...row.tags.filter(
          (t) =>
            ![
              "path",
              "proximity",
              "contains",
              "time-unknown",
              "time-stated",
              "distance-unknown",
              "high-signal",
              "conflict-candidate",
            ].includes(t) && !t.startsWith("time-") && !t.startsWith("distance-"),
        ),
      ];
      for (const p of add) {
        if (!cur.phrases.some((x) => x.toLowerCase() === p.toLowerCase())) {
          cur.phrases.push(p);
        }
      }
      for (const f of row.featureIds ?? []) {
        if (!cur.featureIds.includes(f)) cur.featureIds.push(f);
      }
      map.set(k, cur);
    }
    const migrated = [...map.values()];
    localStorage.setItem(KEY, JSON.stringify(migrated));
    return migrated;
  } catch {
    return [];
  }
}

export function saveTagSets(rows: VerseTagSet[]) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function upsertPhrases(
  rows: VerseTagSet[],
  book: string,
  chapter: number,
  verse: number,
  phrases: string[],
  featureIds: string[] = [],
): VerseTagSet[] {
  const k = verseKey(book, chapter, verse);
  const idx = rows.findIndex((r) => r.key === k);
  const base: VerseTagSet =
    idx >= 0
      ? { ...rows[idx]! }
      : {
          key: k,
          book,
          chapter,
          verse,
          phrases: [],
          featureIds: [],
          updatedAt: new Date().toISOString(),
        };
  for (const p of phrases) {
    const t = p.trim();
    if (!t) continue;
    if (!base.phrases.some((x) => x.toLowerCase() === t.toLowerCase())) {
      base.phrases.push(t);
    }
  }
  for (const f of featureIds) {
    if (!base.featureIds.includes(f)) base.featureIds.push(f);
  }
  base.updatedAt = new Date().toISOString();
  if (idx >= 0) {
    const next = [...rows];
    next[idx] = base;
    return next;
  }
  return [base, ...rows];
}

export function removePhrase(
  rows: VerseTagSet[],
  key: string,
  phrase: string,
): VerseTagSet[] {
  return rows
    .map((r) => {
      if (r.key !== key) return r;
      return {
        ...r,
        phrases: r.phrases.filter((p) => p.toLowerCase() !== phrase.toLowerCase()),
        updatedAt: new Date().toISOString(),
      };
    })
    .filter((r) => r.phrases.length > 0);
}

export function removeTagSet(rows: VerseTagSet[], key: string): VerseTagSet[] {
  return rows.filter((r) => r.key !== key);
}
