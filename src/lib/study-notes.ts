/**
 * User study notes / clipped dictionary text, keyed by term.
 * Shown in Reader when the term appears in the chapter; collected under Insights.
 */

export type StudyNoteSource = {
  label: string;
  url?: string;
  kind?: "webster1828" | "kjv" | "concordance" | "curated" | "free_dictionary" | "user" | "other";
};

export type StudyNote = {
  id: string;
  /** Canonical term (display) */
  term: string;
  /** Normalized lowercase for matching */
  termKey: string;
  body: string;
  sources: StudyNoteSource[];
  /** Map feature ids this note attaches to when term is on the map */
  featureIds: string[];
  origin: "dictionary_clip" | "manual" | "curated";
  createdAt: string;
  updatedAt: string;
};

const KEY = "bom-atlas-study-notes-v1";

export function normalizeTermKey(term: string) {
  return term.trim().toLowerCase().replace(/\s+/g, " ");
}

export function loadStudyNotes(): StudyNote[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as StudyNote[];
  } catch {
    return [];
  }
}

export function saveStudyNotes(rows: StudyNote[]) {
  localStorage.setItem(KEY, JSON.stringify(rows));
}

export function upsertStudyNote(
  rows: StudyNote[],
  input: {
    term: string;
    body: string;
    sources?: StudyNoteSource[];
    featureIds?: string[];
    origin?: StudyNote["origin"];
    id?: string;
  },
): StudyNote[] {
  const termKey = normalizeTermKey(input.term);
  if (!termKey || !input.body.trim()) return rows;

  const now = new Date().toISOString();
  if (input.id) {
    return rows.map((r) =>
      r.id === input.id
        ? {
            ...r,
            term: input.term.trim(),
            termKey,
            body: input.body.trim(),
            sources: input.sources ?? r.sources,
            featureIds: input.featureIds ?? r.featureIds,
            updatedAt: now,
          }
        : r,
    );
  }

  // Merge into existing same term if present (replace body unless appending)
  const idx = rows.findIndex((r) => r.termKey === termKey);
  if (idx >= 0) {
    const prev = rows[idx]!;
    const next = [...rows];
    next[idx] = {
      ...prev,
      body: input.body.trim(),
      sources: input.sources?.length ? input.sources : prev.sources,
      featureIds: [
        ...new Set([...(prev.featureIds ?? []), ...(input.featureIds ?? [])]),
      ],
      updatedAt: now,
    };
    return next;
  }

  const row: StudyNote = {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    term: input.term.trim(),
    termKey,
    body: input.body.trim(),
    sources: input.sources ?? [],
    featureIds: input.featureIds ?? [],
    origin: input.origin ?? "manual",
    createdAt: now,
    updatedAt: now,
  };
  return [row, ...rows];
}

export function deleteStudyNote(rows: StudyNote[], id: string): StudyNote[] {
  return rows.filter((r) => r.id !== id);
}

/** Notes whose term appears as a whole-word/phrase in text */
export function notesMatchingText(rows: StudyNote[], text: string): StudyNote[] {
  const lower = text.toLowerCase();
  return rows.filter((n) => {
    if (!n.termKey) return false;
    // phrase match
    if (lower.includes(n.termKey)) return true;
    return false;
  });
}

/** Notes for any verse text in a chapter */
export function notesForChapter(
  rows: StudyNote[],
  verseTexts: string[],
): StudyNote[] {
  const blob = verseTexts.join("\n").toLowerCase();
  const hit = new Map<string, StudyNote>();
  for (const n of rows) {
    if (blob.includes(n.termKey)) hit.set(n.id, n);
  }
  return [...hit.values()].sort((a, b) => a.term.localeCompare(b.term));
}

export function notesForFeature(rows: StudyNote[], featureId: string): StudyNote[] {
  return rows.filter((n) => n.featureIds.includes(featureId));
}

export function notesForTerm(rows: StudyNote[], term: string): StudyNote | undefined {
  const k = normalizeTermKey(term);
  return rows.find((r) => r.termKey === k);
}
