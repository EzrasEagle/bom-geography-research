/**
 * Study notes: dictionary-like text keyed primarily to words/phrases from the BoM.
 * Optional verse/chapter anchors for notes that are not about a single term.
 */

export type StudyNoteSource = {
  label: string;
  url?: string;
  kind?:
    | "webster1828"
    | "kjv"
    | "concordance"
    | "curated"
    | "free_dictionary"
    | "user"
    | "other";
};

/** Primary organization: term (word/phrase). Verse/chapter are secondary scopes. */
export type StudyNoteScope = "term" | "verse" | "chapter";

export type StudyNote = {
  id: string;
  /** Word/phrase this note explains (required for term scope; recommended always) */
  term: string;
  termKey: string;
  body: string;
  sources: StudyNoteSource[];
  featureIds: string[];
  origin: "dictionary_clip" | "manual" | "curated";
  scope: StudyNoteScope;
  /** For verse/chapter scope, or extra context on term notes */
  anchor?: {
    book: string;
    chapter: number;
    verse?: number;
  };
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
    const rows = JSON.parse(raw) as StudyNote[];
    // Backfill scope for older notes
    return rows.map((r) => ({
      ...r,
      scope: r.scope ?? "term",
      featureIds: r.featureIds ?? [],
      sources: r.sources ?? [],
    }));
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
    scope?: StudyNoteScope;
    anchor?: StudyNote["anchor"];
    id?: string;
  },
): { rows: StudyNote[]; note: StudyNote | null; error?: string } {
  const term = input.term.trim();
  const body = input.body.trim();
  if (!term) return { rows, note: null, error: "Associate with a word, phrase, or anchor label." };
  if (!body) return { rows, note: null, error: "Note text is required." };

  const termKey = normalizeTermKey(term);
  const now = new Date().toISOString();
  const scope = input.scope ?? "term";

  if (input.id) {
    const note: StudyNote = {
      ...(rows.find((r) => r.id === input.id) as StudyNote),
      term,
      termKey,
      body,
      sources: input.sources ?? rows.find((r) => r.id === input.id)?.sources ?? [],
      featureIds: input.featureIds ?? rows.find((r) => r.id === input.id)?.featureIds ?? [],
      scope,
      anchor: input.anchor ?? rows.find((r) => r.id === input.id)?.anchor,
      updatedAt: now,
    };
    return {
      rows: rows.map((r) => (r.id === input.id ? note : r)),
      note,
    };
  }

  // Same term + same scope (+ same verse if verse scope) → update
  const idx = rows.findIndex((r) => {
    if (r.termKey !== termKey) return false;
    if ((r.scope ?? "term") !== scope) return false;
    if (scope === "verse" && input.anchor) {
      return (
        r.anchor?.book === input.anchor.book &&
        r.anchor?.chapter === input.anchor.chapter &&
        r.anchor?.verse === input.anchor.verse
      );
    }
    if (scope === "chapter" && input.anchor) {
      return (
        r.anchor?.book === input.anchor.book &&
        r.anchor?.chapter === input.anchor.chapter
      );
    }
    return scope === "term";
  });

  if (idx >= 0) {
    const prev = rows[idx]!;
    const note: StudyNote = {
      ...prev,
      body,
      sources: input.sources?.length ? input.sources : prev.sources,
      featureIds: [
        ...new Set([...(prev.featureIds ?? []), ...(input.featureIds ?? [])]),
      ],
      anchor: input.anchor ?? prev.anchor,
      updatedAt: now,
    };
    const next = [...rows];
    next[idx] = note;
    return { rows: next, note };
  }

  const note: StudyNote = {
    id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    term,
    termKey,
    body,
    sources: input.sources ?? [],
    featureIds: input.featureIds ?? [],
    origin: input.origin ?? "manual",
    scope,
    anchor: input.anchor,
    createdAt: now,
    updatedAt: now,
  };
  return { rows: [note, ...rows], note };
}

export function deleteStudyNote(rows: StudyNote[], id: string): StudyNote[] {
  return rows.filter((r) => r.id !== id);
}

export function notesMatchingText(rows: StudyNote[], text: string): StudyNote[] {
  const lower = text.toLowerCase();
  return rows.filter((n) => n.termKey && lower.includes(n.termKey));
}

/** Notes relevant to a chapter: term appears in text, OR anchored to chapter/verse */
export function notesForChapter(
  rows: StudyNote[],
  book: string,
  chapter: number,
  verseTexts: { verse: number; text: string }[],
): StudyNote[] {
  const blob = verseTexts.map((v) => v.text).join("\n").toLowerCase();
  const hit = new Map<string, StudyNote>();

  for (const n of rows) {
    const scope = n.scope ?? "term";
    if (scope === "term" && n.termKey && blob.includes(n.termKey)) {
      hit.set(n.id, n);
      continue;
    }
    if (
      scope === "chapter" &&
      n.anchor?.book === book &&
      n.anchor?.chapter === chapter
    ) {
      hit.set(n.id, n);
      continue;
    }
    if (
      scope === "verse" &&
      n.anchor?.book === book &&
      n.anchor?.chapter === chapter
    ) {
      hit.set(n.id, n);
      continue;
    }
    // term notes with anchor to this chapter still show
    if (
      n.anchor?.book === book &&
      n.anchor?.chapter === chapter &&
      scope === "term"
    ) {
      hit.set(n.id, n);
    }
  }
  return [...hit.values()].sort((a, b) => a.term.localeCompare(b.term));
}

export function notesForFeature(rows: StudyNote[], featureId: string): StudyNote[] {
  return rows.filter((n) => n.featureIds.includes(featureId));
}

export function notesForTerm(rows: StudyNote[], term: string): StudyNote | undefined {
  const k = normalizeTermKey(term);
  return rows.find((r) => r.termKey === k && (r.scope ?? "term") === "term");
}
