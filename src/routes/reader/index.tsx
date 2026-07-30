import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ExternalLink,
  GitBranch,
  Link2,
  Search,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  addUserPlace,
  allPlaces,
  loadUserPlaces,
  type UserPlace,
} from "@/lib/user-places";
import {
  detectRelationsInText,
  relationLabel,
  type DetectedRelation,
} from "@/lib/relation-phrases";
import { getPlaceDossier } from "@/data/place-scripture";
import { lexiconHitsInText } from "@/data/lexicon";
import {
  booksInCorpus,
  chaptersForBook,
  corpus,
  searchWord,
  versesFor,
  versesForFeature,
  type CorpusVerse,
} from "@/data/scripture-corpus";
import {
  NEPHI_ZARAHEMLA_TRAVEL_NOTES,
  suggestionsForVerse,
  type AssociationSuggestion,
} from "@/data/suggested-associations";
import {
  acceptSuggestion,
  loadAssociations,
  removeAssociation,
  removeLeg,
  saveAssociations,
  spanLabel,
  associationDistanceLabel,
  updateAssociation,
  type UserAssociation,
} from "@/lib/user-associations";
import { placeLabel } from "@/lib/place-connections";
import {
  chronologyForChapter,
  formatChronologySpan,
  type ChronologySpan,
} from "@/data/chronology";
import {
  DISTANCE_PRESETS,
  presetFromRelation,
  presetToDistanceSpec,
  type DistancePreset,
  type DistanceSpec,
} from "@/data/spatial-distance";
import { linksForRiver, riverById } from "@/data/hydro-relations";
import {
  classifyNode,
  guessFeaturesForPhrase,
  parseDistanceSpan,
  parseTimeSpan,
  smartSuggestionsForVerse,
  type ConnectionDraftNode,
} from "@/lib/reader-smart";
import {
  loadTagSets,
  removePhrase,
  removeTagSet,
  saveTagSets,
  upsertPhrases,
  verseKey,
  type VerseTagSet,
} from "@/lib/reader-tags";
import {
  getSuggestionById,
  listConnectionsForChapter,
} from "@/lib/reader-connections";
import {
  fetchEmbeddedLexicon,
  type EmbeddedLexicon,
} from "@/lib/embed-lexicon";
import {
  loadStudyNotes,
  notesForChapter,
  saveStudyNotes,
  upsertStudyNote,
  deleteStudyNote,
  type StudyNote,
  type StudyNoteSource,
} from "@/lib/study-notes";

type ReaderSearch = {
  q?: string;
  feature?: string;
  book?: string;
  chapter?: number;
  verse?: number;
};

export const Route = createFileRoute("/reader/")({
  validateSearch: (s: Record<string, unknown>): ReaderSearch => ({
    q: typeof s.q === "string" ? s.q : undefined,
    feature: typeof s.feature === "string" ? s.feature : undefined,
    book: typeof s.book === "string" ? s.book : undefined,
    chapter: s.chapter != null ? Number(s.chapter) : undefined,
    verse: s.verse != null ? Number(s.verse) : undefined,
  }),
  component: ReaderPage,
});

type ConnMode = "path" | "contains" | "proximity" | "same_region" | "river";

function ReaderPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const books = booksInCorpus();
  const [book, setBook] = useState(search.book ?? "Omni");
  const [chapter, setChapter] = useState(search.chapter ?? 1);
  const [selectedVerse, setSelectedVerse] = useState(search.verse ?? 13);
  const [wordQuery, setWordQuery] = useState(search.q ?? "");
  const [activeFeature, setActiveFeature] = useState(search.feature ?? "");

  const [tagSets, setTagSets] = useState<VerseTagSet[]>([]);
  const [userAssocs, setUserAssocs] = useState<UserAssociation[]>([]);
  const [flash, setFlash] = useState<string | null>(null);
  const [lookupPhrase, setLookupPhrase] = useState("");
  const [embeddedLex, setEmbeddedLex] = useState<EmbeddedLexicon | null>(null);
  const [embedLoading, setEmbedLoading] = useState(false);
  const [selectionBar, setSelectionBar] = useState<string>("");
  const [studyNotes, setStudyNotes] = useState<StudyNote[]>([]);
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editNoteBody, setEditNoteBody] = useState("");
  const [editNoteSources, setEditNoteSources] = useState("");
  const [showNewNote, setShowNewNote] = useState(false);
  const [newNoteTerm, setNewNoteTerm] = useState("");
  const [newNoteBody, setNewNoteBody] = useState("");
  const [newNoteScope, setNewNoteScope] = useState<"term" | "verse" | "chapter">("term");
  const [newNoteSources, setNewNoteSources] = useState("");
  const [manualTimeQuality, setManualTimeQuality] = useState<"auto" | "unknown" | "approximate" | "stated">("auto");
  const [manualTimeValue, setManualTimeValue] = useState("");
  const [manualDistQuality, setManualDistQuality] = useState<"auto" | "unknown" | "approximate" | "stated">("auto");
  const [manualDistValue, setManualDistValue] = useState("");
  const [assocChronology, setAssocChronology] = useState<ChronologySpan | null>(null);
  const [chronoLabel, setChronoLabel] = useState("");
  const [showAddPlace, setShowAddPlace] = useState(false);
  const [newPlaceName, setNewPlaceName] = useState("");
  const [newPlaceKind, setNewPlaceKind] = useState<
    "hill" | "city" | "land" | "river" | "wilderness" | "other"
  >("hill");
  const [userPlaces, setUserPlaces] = useState<UserPlace[]>([]);
  const [distancePreset, setDistancePreset] = useState<DistancePreset>("unknown");
  const [closenessHard, setClosenessHard] = useState(true);
  const [modelForked, setModelForked] = useState(false);
  const [showSeedInPanel, setShowSeedInPanel] = useState(true);
  const [showYoursInPanel, setShowYoursInPanel] = useState(true);

  // Path / connection builder
  const [mode, setMode] = useState<ConnMode>("path");
  const [hubId, setHubId] = useState("nephi");
  /** Ordered steps for a path (or related items for contains/proximity) */
  const [steps, setSteps] = useState<ConnectionDraftNode[]>([]);
  const [editingAssocId, setEditingAssocId] = useState<string | null>(null);

  useEffect(() => {
    setTagSets(loadTagSets());
    setUserAssocs(loadAssociations());
    setStudyNotes(loadStudyNotes());
    setUserPlaces(loadUserPlaces());
    try {
      setModelForked(localStorage.getItem("bom-atlas-model-forked") === "1");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    saveTagSets(tagSets);
  }, [tagSets]);

  useEffect(() => {
    const q = lookupPhrase.trim();
    if (!q || q.length < 1) {
      setEmbeddedLex(null);
      return;
    }
    let cancelled = false;
    setEmbedLoading(true);
    fetchEmbeddedLexicon(q).then((r) => {
      if (!cancelled) {
        setEmbeddedLex(r);
        setEmbedLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [lookupPhrase]);

  useEffect(() => {
    if (search.book) setBook(search.book);
    if (search.chapter) setChapter(search.chapter);
    if (search.verse) setSelectedVerse(search.verse);
    if (search.q) setWordQuery(search.q);
    if (search.feature) setActiveFeature(search.feature);
  }, [search.book, search.chapter, search.verse, search.q, search.feature]);

  // When verse changes: clear in-progress path unless editing; load chapter dates
  useEffect(() => {
    if (!editingAssocId) {
      setSteps([]);
    }
    const ch = chronologyForChapter(book, chapter);
    setAssocChronology(ch);
    setChronoLabel(ch?.label ?? "");
  }, [book, chapter, selectedVerse]); // eslint-disable-line react-hooks/exhaustive-deps

  const chapterList = chaptersForBook(book);
  const chapterVerses = versesFor(book, chapter);
  const wordHits = useMemo(() => searchWord(wordQuery), [wordQuery]);
  const featureHits = useMemo(
    () => (activeFeature ? versesForFeature(activeFeature) : []),
    [activeFeature],
  );

  const current =
    chapterVerses.find((v) => v.verse === selectedVerse) ?? chapterVerses[0] ?? null;

  const tagsOnVerse = useMemo(() => {
    const map = new Map<number, VerseTagSet>();
    for (const t of tagSets) {
      if (t.book === book && t.chapter === chapter) map.set(t.verse, t);
    }
    return map;
  }, [tagSets, book, chapter]);

  const currentTagSet = current
    ? tagsOnVerse.get(current.verse) ?? null
    : null;

  const smartForCurrent = useMemo(() => {
    if (!current) return [];
    // Flatten phrases as "tags" for smart engine
    const flat = tagSets.flatMap((ts) =>
      ts.phrases.map((p) => ({
        wordPhrase: p,
        tags: [p],
        featureIds: ts.featureIds,
      })),
    );
    return smartSuggestionsForVerse(current.text, flat);
  }, [current, tagSets]);

  const pendingSmart = smartForCurrent.filter(
    (s) =>
      !currentTagSet?.phrases.some(
        (p) => p.toLowerCase() === s.phrase.toLowerCase(),
      ),
  );

  /** Candidates for builder: smart + saved tags + seeds on verse — not yet in steps */
  const candidates = useMemo(() => {
    if (!current) return [] as { label: string; featureId?: string; source: string }[];
    const out: { label: string; featureId?: string; source: string }[] = [];
    const seen = new Set(steps.map((s) => s.label.toLowerCase()));

    const push = (label: string, featureId: string | undefined, source: string) => {
      const k = label.toLowerCase();
      if (seen.has(k) || k.length < 2) return;
      seen.add(k);
      out.push({ label, featureId, source });
    };

    for (const s of smartForCurrent) {
      push(s.phrase, s.featureIds[0], s.priorCount ? "your tags elsewhere" : "in verse");
    }
    if (currentTagSet) {
      for (const p of currentTagSet.phrases) {
        push(p, guessFeaturesForPhrase(p)[0], "saved tag");
      }
    }
    for (const f of current.featureIds ?? []) {
      const name = allPlaces().find((p) => p.id === f)?.name ?? f;
      push(name, f, "seed feature");
    }
    // Nearby verses ±2
    for (const v of chapterVerses) {
      if (Math.abs(v.verse - current.verse) > 2 || v.verse === current.verse) continue;
      for (const s of smartSuggestionsForVerse(v.text, [])) {
        push(s.phrase, s.featureIds[0], `v${v.verse}`);
      }
    }
    return out.slice(0, 24);
  }, [current, smartForCurrent, currentTagSet, steps, chapterVerses]);

  const verseSuggestions = useMemo(
    () =>
      current
        ? suggestionsForVerse(current.book, current.chapter, current.verse)
        : [],
    [current],
  );

  const chapterConnections = useMemo(
    () => listConnectionsForChapter(book, chapter, userAssocs),
    [book, chapter, userAssocs],
  );

  const chapterStudyNotes = useMemo(
    () =>
      notesForChapter(
        studyNotes,
        book,
        chapter,
        chapterVerses.map((v) => ({ verse: v.verse, text: v.text })),
      ),
    [studyNotes, book, chapter, chapterVerses],
  );

  const filteredConnections = chapterConnections.filter((c) => {
    if (c.source === "seed" && !showSeedInPanel) return false;
    if (c.source === "yours" && !showYoursInPanel) return false;
    return true;
  });

  const assocsOnVerse = useMemo(() => {
    if (!current) return [];
    return userAssocs.filter(
      (a) =>
        a.book === current.book &&
        a.chapter === current.chapter &&
        a.verse === current.verse,
    );
  }, [userAssocs, current]);

  const selectionTime = useMemo(() => {
    const texts = [current?.text ?? "", ...steps.map((n) => n.label)].join(" ");
    return parseTimeSpan(texts);
  }, [current, steps]);

  const selectionDistance = useMemo(() => {
    const texts = [current?.text ?? "", ...steps.map((n) => n.label)].join(" ");
    return parseDistanceSpan(texts);
  }, [current, steps]);

  const detectedRelations = useMemo(() => {
    if (!current?.text) return [] as DetectedRelation[];
    return detectRelationsInText(current.text);
  }, [current, userPlaces]);

  const placeOptions = useMemo(() => allPlaces(), [userPlaces]);

  function goToVerse(v: CorpusVerse) {
    setBook(v.book);
    setChapter(v.chapter);
    setSelectedVerse(v.verse);
    void navigate({
      search: {
        book: v.book,
        chapter: v.chapter,
        verse: v.verse,
        q: wordQuery || undefined,
        feature: activeFeature || undefined,
      },
    });
  }

  function runWordSearch(q: string) {
    setWordQuery(q);
    const hits = searchWord(q);
    if (hits[0]) {
      setBook(hits[0].book);
      setChapter(hits[0].chapter);
      setSelectedVerse(hits[0].verse);
    }
    void navigate({
      search: {
        q: q || undefined,
        feature: activeFeature || undefined,
        book: hits[0]?.book,
        chapter: hits[0]?.chapter,
        verse: hits[0]?.verse,
      },
    });
  }

  function onTextSelect() {
    const sel = window.getSelection()?.toString().trim();
    if (!sel || sel.length > 120) return;
    setLookupPhrase(sel);
    setSelectionBar(sel);
  }

  function tagSelection() {
    const phrase = (selectionBar || lookupPhrase).trim();
    if (!phrase || !current) return;
    addTagPhrase(phrase);
    setFlash(`Tagged "${phrase}" on ${current.book} ${current.chapter}:${current.verse}`);
    window.setTimeout(() => setFlash(null), 2000);
  }

  function pathSelection() {
    const phrase = (selectionBar || lookupPhrase).trim();
    if (!phrase) return;
    addStep(phrase);
    setFlash(`Added to builder "${phrase}"`);
    window.setTimeout(() => setFlash(null), 1500);
  }

  function addTagPhrase(phrase: string, featureIds: string[] = []) {
    if (!current) return;
    const next = upsertPhrases(
      tagSets,
      current.book,
      current.chapter,
      current.verse,
      [phrase],
      featureIds.length ? featureIds : guessFeaturesForPhrase(phrase),
    );
    setTagSets(next);
    setFlash(`Tagged “${phrase}”`);
    window.setTimeout(() => setFlash(null), 1500);
  }

  function addStep(label: string, featureId?: string) {
    const trimmed = label.trim();
    if (!trimmed) return;
    const fid = featureId ?? guessFeaturesForPhrase(trimmed)[0];
    setSteps((prev) => {
      if (prev.some((p) => p.label.toLowerCase() === trimmed.toLowerCase())) return prev;
      return [
        ...prev,
        {
          id: `s-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          label: trimmed,
          featureId: fid,
          ref: current
            ? `${current.book} ${current.chapter}:${current.verse}`
            : undefined,
          kind: classifyNode(trimmed, fid),
        },
      ];
    });
  }

  function removeStep(id: string) {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  }

  function moveStep(id: string, dir: -1 | 1) {
    setSteps((prev) => {
      const i = prev.findIndex((s) => s.id === id);
      if (i < 0) return prev;
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      const tmp = next[i]!;
      next[i] = next[j]!;
      next[j] = tmp;
      return next;
    });
  }


  function persistNotes(next: StudyNote[]) {
    setStudyNotes(next);
    saveStudyNotes(next);
  }

  function saveSenseAsNote(
    term: string,
    body: string,
    sources: StudyNoteSource[],
    origin: StudyNote["origin"] = "dictionary_clip",
    scope: "term" | "verse" | "chapter" = "term",
    anchor?: { book: string; chapter: number; verse?: number },
  ) {
    const feats = guessFeaturesForPhrase(term);
    const result = upsertStudyNote(studyNotes, {
      term,
      body,
      sources,
      featureIds: feats,
      origin,
      scope,
      anchor,
    });
    if (result.error || !result.note) {
      setFlash(result.error || "Could not save study note");
      window.setTimeout(() => setFlash(null), 2500);
      return false;
    }
    persistNotes(result.rows);
    setFlash(`Saved study note for "${term}"`);
    window.setTimeout(() => setFlash(null), 2000);
    return true;
  }


  function createPlaceFromForm() {
    const name = newPlaceName.trim() || selectionBar.trim() || lookupPhrase.trim();
    if (!name) {
      setFlash("Enter a place name (e.g. Hill Amnihu)");
      window.setTimeout(() => setFlash(null), 2000);
      return;
    }
    const result = addUserPlace({
      name,
      kind: newPlaceKind,
      sizeTier: newPlaceKind === "hill" ? "point" : newPlaceKind === "city" ? "settlement_city" : "land_local",
      aliases: [name, name.replace(/^hill\s+/i, ""), name.replace(/^the\s+/i, "")],
      sourceVerse: current
        ? `${current.book} ${current.chapter}:${current.verse}`
        : undefined,
      note: "Created from Reader",
    });
    if (result.error) {
      setFlash(result.error);
      window.setTimeout(() => setFlash(null), 3000);
      return;
    }
    setUserPlaces(result.places);
    setHubId(result.place.id);
    addStep(result.place.name, result.place.id);
    addTagPhrase(result.place.name, [result.place.id]);
    setShowAddPlace(false);
    setNewPlaceName("");
    setFlash(`Place added: ${result.place.name} (${result.place.kind})`);
    window.setTimeout(() => setFlash(null), 2500);
  }

  function applyDetectedRelation(rel: DetectedRelation) {
    // Ensure subject is a place step; create user place if missing and looks like a named hill/city
    let fromId = rel.subjectPlaceId;
    let toId = rel.objectPlaceId;
    if (!fromId && rel.subjectPhrase && rel.subjectPhrase !== "?") {
      const created = addUserPlace({
        name: rel.subjectPhrase,
        kind: /hill/i.test(rel.subjectPhrase)
          ? "hill"
          : /city/i.test(rel.subjectPhrase)
            ? "city"
            : /land/i.test(rel.subjectPhrase)
              ? "land"
              : /river/i.test(rel.subjectPhrase)
                ? "river"
                : "other",
        sourceVerse: current
          ? `${current.book} ${current.chapter}:${current.verse}`
          : undefined,
      });
      if (created.place) {
        fromId = created.place.id;
        setUserPlaces(created.places);
      }
    }
    if (!toId && rel.objectPhrase) {
      const created = addUserPlace({
        name: rel.objectPhrase,
        kind: /river/i.test(rel.objectPhrase)
          ? "river"
          : /land/i.test(rel.objectPhrase)
            ? "land"
            : /city/i.test(rel.objectPhrase)
              ? "city"
              : "other",
        sourceVerse: current
          ? `${current.book} ${current.chapter}:${current.verse}`
          : undefined,
      });
      if (created.place) {
        toId = created.place.id;
        setUserPlaces(loadUserPlaces());
      }
    }
    setMode(
      rel.suggestedKind === "river"
        ? "river"
        : rel.suggestedKind === "contains"
          ? "contains"
          : rel.suggestedKind === "same_region"
            ? "same_region"
            : "proximity",
    );
    {
      const inf = presetFromRelation(rel.relation);
      setDistancePreset(inf.preset);
      setClosenessHard(true);
    }
    if (fromId) setHubId(fromId);
    setSteps([]);
    if (fromId) addStep(rel.subjectPhrase, fromId);
    // addStep is async state - need batch
    const stepsToAdd: { label: string; id?: string }[] = [];
    if (fromId) stepsToAdd.push({ label: rel.subjectPhrase, id: fromId });
    if (toId) stepsToAdd.push({ label: rel.objectPhrase, id: toId });
    setSteps(
      stepsToAdd.map((s, i) => ({
        id: `rel-${Date.now()}-${i}`,
        label: s.label,
        featureId: s.id,
        kind: "place" as const,
        ref: current
          ? `${current.book} ${current.chapter}:${current.verse}`
          : undefined,
      })),
    );
    if (fromId) setHubId(fromId);
    setFlash(
      `Staged: ${rel.subjectPhrase} ${relationLabel(rel.relation)} ${rel.objectPhrase}`,
    );
    window.setTimeout(() => setFlash(null), 2500);
  }

  function createNoteFromForm() {
    if (!current) {
      setFlash("Select a verse first");
      window.setTimeout(() => setFlash(null), 2000);
      return;
    }
    const term =
      newNoteTerm.trim() ||
      selectionBar.trim() ||
      lookupPhrase.trim() ||
      (newNoteScope === "verse"
        ? `${current.book} ${current.chapter}:${current.verse}`
        : newNoteScope === "chapter"
          ? `${current.book} ${current.chapter}`
          : "");
    const sources: StudyNoteSource[] = newNoteSources
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|").map((x) => x.trim());
        return { label: parts[0] || "Source", url: parts[1], kind: "user" as const };
      });
    const anchor =
      newNoteScope === "term"
        ? { book: current.book, chapter: current.chapter, verse: current.verse }
        : newNoteScope === "verse"
          ? { book: current.book, chapter: current.chapter, verse: current.verse }
          : { book: current.book, chapter: current.chapter };
    const ok = saveSenseAsNote(
      term,
      newNoteBody,
      sources.length ? sources : [{ label: "User study note", kind: "user" }],
      "manual",
      newNoteScope,
      anchor,
    );
    if (ok) {
      setShowNewNote(false);
      setNewNoteBody("");
      setNewNoteSources("");
      setNewNoteTerm("");
    }
  }

  function startEditNote(n: StudyNote) {
    setEditingNoteId(n.id);
    setEditNoteBody(n.body);
    setEditNoteSources(
      n.sources.map((s) => (s.url ? `${s.label} | ${s.url}` : s.label)).join("\n"),
    );
  }

  function commitEditNote() {
    if (!editingNoteId) return;
    const n = studyNotes.find((x) => x.id === editingNoteId);
    if (!n) return;
    const sources: StudyNoteSource[] = editNoteSources
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const parts = line.split("|").map((x) => x.trim());
        return {
          label: parts[0] || "Source",
          url: parts[1] || undefined,
          kind: "user" as const,
        };
      });
    const result = upsertStudyNote(studyNotes, {
      id: editingNoteId,
      term: n.term,
      body: editNoteBody,
      sources,
      scope: n.scope,
      anchor: n.anchor,
    });
    if (result.error) {
      setFlash(result.error);
      return;
    }
    persistNotes(result.rows);
    setEditingNoteId(null);
    setFlash("Study note updated");
    window.setTimeout(() => setFlash(null), 1500);
  }

  function oneClickAccept(sug: AssociationSuggestion) {
    const verseBlob =
      corpus.find(
        (c) =>
          c.book === sug.book && c.chapter === sug.chapter && c.verse === sug.verse,
      )?.text ??
      current?.text ??
      "";
    const parsedTime = parseTimeSpan(verseBlob);
    const parsedDist = parseDistanceSpan(verseBlob);
    const base = acceptSuggestion(sug);
    const pathTime =
      base.pathTime.quality !== "unknown" ? base.pathTime : parsedTime ?? base.pathTime;
    const pathDistance =
      base.pathDistance.quality !== "unknown"
        ? base.pathDistance
        : parsedDist ?? base.pathDistance;
    const leg0 = base.legs[0];
    const spatialFromLegs =
      leg0?.distancePreset
        ? presetToDistanceSpec(leg0.distancePreset, {
            closeness: leg0.closeness,
            placement: leg0.placement,
            maxDayFraction: leg0.maxDayFraction,
            value: pathDistance.value ?? leg0.distance.value,
            note: leg0.distance.note,
          })
        : undefined;
    const row: UserAssociation = {
      ...base,
      pathTime,
      pathDistance,
      spatialDistance: spatialFromLegs,
      legs: base.legs.map((leg) => ({
        ...leg,
        time:
          leg.time?.quality === "unknown" && pathTime.quality !== "unknown"
            ? pathTime
            : leg.time,
        distance:
          leg.distance?.quality === "unknown" && pathDistance.quality !== "unknown"
            ? pathDistance
            : leg.distance,
      })),
    };
    const next = [row, ...userAssocs.filter((a) => a.sourceSuggestionId !== sug.id)];
    setUserAssocs(next);
    saveAssociations(next);
    // Tag only meaningful place phrases once (merged set)
    setTagSets((prev) =>
      upsertPhrases(
        prev,
        sug.book,
        sug.chapter,
        sug.verse,
        sug.tags.filter(
          (t) =>
            !["path", "proximity", "lost_party", "intended_vs_actual"].includes(t),
        ),
        [...new Set(sug.legs.flatMap((l) => [l.fromFeatureId, l.toFeatureId]))],
      ),
    );
    setFlash("Path saved");
    window.setTimeout(() => setFlash(null), 2000);
  }

  function adoptSeed(seedId: string) {
    const sug = getSuggestionById(seedId);
    if (!sug) return;
    oneClickAccept(sug);
  }

  function markForked() {
    setModelForked(true);
    try {
      localStorage.setItem("bom-atlas-model-forked", "1");
    } catch {
      /* ignore */
    }
  }

  function deleteAssoc(id: string, isSeedDerived?: boolean) {
    if (isSeedDerived && !modelForked) {
      markForked();
    }
    const next = removeAssociation(userAssocs, id);
    setUserAssocs(next);
    saveAssociations(next);
    if (editingAssocId === id) {
      setEditingAssocId(null);
      setSteps([]);
    }
  }

  function buildConnection() {
    if (!current || steps.length === 0) return;

    const spatial: DistanceSpec = presetToDistanceSpec(distancePreset, {
      closeness: closenessHard ? "hard" : "soft",
      value:
        manualDistQuality !== "auto" && manualDistValue.trim()
          ? manualDistValue.trim()
          : undefined,
      note:
        distancePreset === "same_scene" || distancePreset === "border_adjacent"
          ? "Text situates these in one locale — models must keep them near (same land theater)."
          : undefined,
    });

    const time =
      manualTimeQuality === "auto"
        ? selectionTime ??
          ({ quality: "unknown" as const, note: "Not stated or not recognized" })
        : {
            quality: manualTimeQuality,
            value: manualTimeValue.trim() || undefined,
            note: "Set in Association Builder",
          };
    const distance =
      distancePreset !== "unknown"
        ? {
            quality: spatial.quality,
            value: spatial.value ?? DISTANCE_PRESETS.find((p) => p.id === distancePreset)?.label,
            note: spatial.note,
          }
        : manualDistQuality === "auto"
          ? selectionDistance ??
            ({ quality: "unknown" as const, note: "Not stated or not recognized" })
          : {
              quality: manualDistQuality,
              value: manualDistValue.trim() || undefined,
              note: "Set in Association Builder",
            };

    let legs: UserAssociation["legs"] = [];
    let title = "";
    const kindMap = {
      proximity: "proximity" as const,
      path: "path" as const,
      contains: "contains" as const,
      same_region: "same_region" as const,
      river: "river" as const,
    };

    if (mode === "path") {
      // Ordered chain: step0 → step1 → step2 …
      // If only one step, hub → step
      const chain =
        steps.length === 1
          ? [
              {
                id: "hub",
                label: placeLabel(hubId),
                featureId: hubId,
                kind: "place" as const,
              },
              steps[0]!,
            ]
          : steps;
      for (let i = 0; i < chain.length - 1; i++) {
        const a = chain[i]!;
        const b = chain[i + 1]!;
        legs.push({
          fromFeatureId: a.featureId ?? a.label.toLowerCase().replace(/\s+/g, "-"),
          toFeatureId: b.featureId ?? b.label.toLowerCase().replace(/\s+/g, "-"),
          viaPhrase: b.label,
          kind: "path",
          distance: { ...distance },
          time: { ...time },
          elevation:
            /came down|went down|down into/i.test(b.label)
              ? "down"
              : /went up|go up|up to/i.test(b.label)
                ? "up"
                : "unknown",
        });
      }
      title = `Path: ${chain.map((c) => c.label).join(" → ")}`;
    } else if (mode === "same_region") {
      // Peer places in one region — chain or star from first step / hub
      const nodes =
        steps.length >= 2
          ? steps
          : [
              {
                id: "hub",
                label: placeLabel(hubId),
                featureId: hubId,
                kind: "place" as const,
              },
              ...steps,
            ];
      for (let i = 0; i < nodes.length - 1; i++) {
        const a = nodes[i]!;
        const b = nodes[i + 1]!;
        legs.push({
          fromFeatureId: a.featureId ?? a.label.toLowerCase().replace(/\s+/g, "-"),
          toFeatureId: b.featureId ?? b.label.toLowerCase().replace(/\s+/g, "-"),
          viaPhrase: b.label,
          kind: "same_region",
          distance: { ...distance },
          time: { ...time },
        });
      }
      title = `Same region: ${nodes.map((n) => n.label).join(" · ")}`;
    } else if (mode === "river") {
      // Hub should be river (sidon); steps = places on it
      for (const s of steps) {
        legs.push({
          fromFeatureId: hubId,
          toFeatureId: s.featureId ?? s.label.toLowerCase().replace(/\s+/g, "-"),
          viaPhrase: s.label,
          kind: "river",
          distance: { quality: "unknown" },
          time: { quality: "unknown" },
        });
      }
      title = `River ${placeLabel(hubId)}: ${steps.map((s) => s.label).join(", ")}`;
    } else {
      // Hub → each related item (contains / proximity)
      for (const s of steps) {
        legs.push({
          fromFeatureId: hubId,
          toFeatureId: s.featureId ?? s.label.toLowerCase().replace(/\s+/g, "-"),
          viaPhrase: s.label,
          kind: kindMap[mode],
          distance: { quality: "unknown" },
          time: { quality: "unknown" },
        });
      }
      const hubLabel = placeLabel(hubId);
      title =
        mode === "contains"
          ? `${hubLabel} contains: ${steps.map((s) => s.label).join(", ")}`
          : `${hubLabel} near: ${steps.map((s) => s.label).join(", ")}`;
    }

    if (legs.length === 0) return;

    // Stamp spatial distance on every leg for Map Lab
    legs = legs.map((leg) => ({
      ...leg,
      distance: { ...distance },
      distancePreset: spatial.preset,
      placement: spatial.placement,
      closeness: spatial.closeness,
      maxDayFraction: spatial.maxDayFraction,
    }));

    if (editingAssocId) {
      const next = userAssocs.map((a) =>
        a.id === editingAssocId
          ? {
              ...a,
              title,
              legs,
              pathDistance: distance,
              pathTime: time,
              notes: `Edited in Reader (${mode})`,
            }
          : a,
      );
      setUserAssocs(next);
      saveAssociations(next);
      setEditingAssocId(null);
    } else {
      const chrono: ChronologySpan = assocChronology
        ? { ...assocChronology, label: chronoLabel || assocChronology.label }
        : chronologyForChapter(current.book, current.chapter) ?? {
            quality: "unknown" as const,
          };
      const assoc: UserAssociation = {
        id: `assoc-${Date.now()}`,
        book: current.book,
        chapter: current.chapter,
        verse: current.verse,
        title,
        legs,
        pathDistance: distance,
        pathTime: time,
        spatialDistance: spatial,
        chronology: chrono,
        relatedRefs: [],
        tags: [mode, ...steps.map((s) => s.label)],
        createdAt: new Date().toISOString(),
        notes: `Built in Reader (${mode})`,
      };
      const next = [assoc, ...userAssocs];
      setUserAssocs(next);
      saveAssociations(next);
    }

    setSteps([]);
    setFlash(mode === "path" ? "Path saved" : "Connection saved");
    window.setTimeout(() => setFlash(null), 2000);
  }

  function loadAssocIntoBuilder(a: UserAssociation) {
    setEditingAssocId(a.id);
    setBook(a.book);
    setChapter(a.chapter);
    setSelectedVerse(a.verse);
    setMode(a.legs.some((l) => l.kind === "path") ? "path" : "proximity");
    if (a.legs[0]) setHubId(a.legs[0].fromFeatureId);
    setManualTimeQuality(a.pathTime.quality === "unknown" && !a.pathTime.value ? "unknown" : a.pathTime.quality);
    setManualTimeValue(a.pathTime.value ?? "");
    setManualDistQuality(
      a.pathDistance.quality === "unknown" && !a.pathDistance.value
        ? "unknown"
        : a.pathDistance.quality,
    );
    setManualDistValue(a.pathDistance.value ?? "");
    if (a.chronology) {
      setAssocChronology(a.chronology);
      setChronoLabel(a.chronology.label ?? "");
    }
    // Reconstruct ordered steps from legs
    const ids: ConnectionDraftNode[] = [];
    if (a.legs[0]) {
      ids.push({
        id: `e-0`,
        label: placeLabel(a.legs[0].fromFeatureId),
        featureId: a.legs[0].fromFeatureId,
        kind: "place",
      });
    }
    for (let i = 0; i < a.legs.length; i++) {
      const leg = a.legs[i]!;
      ids.push({
        id: `e-${i + 1}`,
        label: leg.viaPhrase || placeLabel(leg.toFeatureId),
        featureId: leg.toFeatureId,
        kind: classifyNode(leg.viaPhrase || leg.toFeatureId, leg.toFeatureId),
      });
    }
    setSteps(ids);
  }


  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-semibold">Reader</h1>
        <p className="text-sm text-ink-soft max-w-4xl leading-relaxed">
          <strong className="text-ink">Left:</strong> connections (seed + yours).{" "}
          <strong className="text-ink">Center:</strong> chapter text — select a word for the
          dictionary; use + to tag or add to a path.{" "}
          <strong className="text-ink">Right:</strong> build a path (ordered steps) or a
          contains/proximity link (hub + items).
        </p>
        {flash && (
          <p className="text-sm text-teal font-medium" role="status">
            {flash}
          </p>
        )}
        {modelForked && (
          <Badge tone="accent">Working model forked (seed edits apply to your copy)</Badge>
        )}
      </div>

      {/* Word index */}
      <Card className="p-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold shrink-0">
            <Search className="h-4 w-4 text-accent" />
            Word index
          </div>
          <input
            value={wordQuery}
            onChange={(e) => setWordQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runWordSearch(wordQuery)}
            placeholder="Zarahemla, wilderness…"
            className="flex-1 rounded-[var(--radius)] border border-border bg-surface px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => runWordSearch(wordQuery)}
            className="rounded-[var(--radius)] bg-accent px-4 py-2 text-sm font-medium text-accent-fg"
          >
            Find
          </button>
        </div>
        {wordQuery.trim() && (
          <div className="max-h-28 overflow-auto mt-2 space-y-1 border-t border-border pt-2">
            <p className="text-xs text-muted">
              {wordHits.length} hits · {corpus.length} corpus verses
            </p>
            {wordHits.slice(0, 30).map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => goToVerse(h)}
                className="w-full text-left text-sm rounded px-2 py-1 hover:bg-surface-2"
              >
                <span className="font-medium text-accent">
                  {h.book} {h.chapter}:{h.verse}
                </span>
                <span className="text-ink-soft"> — {h.text.slice(0, 80)}…</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-4 xl:grid-cols-[0.75fr_1.35fr_0.95fr]">
        {/* LEFT: connections */}
        <div className="space-y-3 order-2 xl:order-1">
          <Card className="p-3 space-y-2">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-accent" />
              Connections
            </h2>
            <p className="text-[11px] text-muted leading-relaxed">
              Seed paths for this chapter + your saved ones. Adopt a seed into your working
              model. Deleting a seed-derived link forks your model.
            </p>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <label className="inline-flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={showSeedInPanel}
                  onChange={(e) => setShowSeedInPanel(e.target.checked)}
                />
                Seed
              </label>
              <label className="inline-flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={showYoursInPanel}
                  onChange={(e) => setShowYoursInPanel(e.target.checked)}
                />
                Yours
              </label>
            </div>
            <div className="max-h-[55vh] overflow-auto space-y-2">
              {filteredConnections.length === 0 && (
                <p className="text-xs text-muted">No connections for this chapter yet.</p>
              )}
              {filteredConnections.map((c) => (
                <div
                  key={c.id}
                  className={`rounded border p-2 text-xs space-y-1 ${
                    current && c.verse === current.verse
                      ? "border-accent bg-orange-50/40"
                      : "border-border"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-1">
                    <Badge tone={c.source === "seed" ? "claim" : "teal"}>
                      {c.source === "seed" ? "seed" : "yours"}
                    </Badge>
                    {c.adopted && <Badge tone="teal">adopted</Badge>}
                    <button
                      type="button"
                      className="text-accent hover:underline ml-auto"
                      onClick={() => {
                        setBook(c.book);
                        setChapter(c.chapter);
                        setSelectedVerse(c.verse);
                      }}
                    >
                      {c.ref}
                    </button>
                  </div>
                  <div className="font-medium leading-snug">{c.title}</div>
                  <div className="text-muted">{c.steps.join(" → ")}</div>
                  {c.source === "seed" && !c.adopted && c.seedId && (
                    <button
                      type="button"
                      className="text-accent hover:underline"
                      onClick={() => adoptSeed(c.seedId!)}
                    >
                      Adopt into my model
                    </button>
                  )}
                  {c.userId && (
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="text-accent hover:underline"
                        onClick={() => {
                          const a = userAssocs.find((u) => u.id === c.userId);
                          if (a) loadAssocIntoBuilder(a);
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="text-muted hover:underline"
                        onClick={() =>
                          deleteAssoc(c.userId!, Boolean(c.seedId))
                        }
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-[10px] text-muted">
              All chapter connections · {chapterConnections.length} total
            </p>
          </Card>

          <Card className="p-3 space-y-2 border-teal/30">
            <h2 className="font-semibold text-sm">Chapter study notes</h2>
            <p className="text-[11px] text-muted leading-relaxed">
              Dictionary-style notes keyed to a <strong>word or phrase</strong> in the text.
              They reappear in any chapter containing that phrase and can attach to map features.
            </p>
            <button
              type="button"
              className="w-full rounded border border-teal/50 bg-teal-soft/20 px-2 py-1.5 text-xs font-medium text-teal-900 hover:bg-teal-soft/40"
              onClick={() => {
                setShowNewNote((v) => !v);
                setNewNoteTerm(selectionBar || lookupPhrase || "");
                setNewNoteScope("term");
              }}
            >
              {showNewNote ? "Cancel new note" : "+ New study note"}
            </button>
            {showNewNote && (
              <div className="rounded border border-border bg-surface p-2 space-y-1.5 text-xs">
                <label className="block space-y-0.5">
                  <span className="text-muted">Associate with (word / phrase)</span>
                  <input
                    value={newNoteTerm}
                    onChange={(e) => setNewNoteTerm(e.target.value)}
                    placeholder={
                      selectionBar ||
                      lookupPhrase ||
                      (current
                        ? `${current.book} ${current.chapter}:${current.verse}`
                        : "e.g. wilderness")
                    }
                    className="w-full rounded border border-border px-2 py-1.5"
                  />
                </label>
                <label className="block space-y-0.5">
                  <span className="text-muted">Scope</span>
                  <select
                    value={newNoteScope}
                    onChange={(e) =>
                      setNewNoteScope(e.target.value as "term" | "verse" | "chapter")
                    }
                    className="w-full rounded border border-border px-2 py-1.5 bg-surface"
                  >
                    <option value="term">Term (shows wherever phrase appears)</option>
                    <option value="verse">This verse only</option>
                    <option value="chapter">This chapter only</option>
                  </select>
                </label>
                <label className="block space-y-0.5">
                  <span className="text-muted">Note text</span>
                  <textarea
                    value={newNoteBody}
                    onChange={(e) => setNewNoteBody(e.target.value)}
                    rows={4}
                    placeholder="Paste or write insight (KJV sense, geography note…)"
                    className="w-full rounded border border-border px-2 py-1.5"
                  />
                </label>
                <label className="block space-y-0.5">
                  <span className="text-muted">Sources (optional, one per line: Label | url)</span>
                  <textarea
                    value={newNoteSources}
                    onChange={(e) => setNewNoteSources(e.target.value)}
                    rows={2}
                    className="w-full rounded border border-border px-2 py-1.5"
                  />
                </label>
                <button
                  type="button"
                  onClick={createNoteFromForm}
                  className="w-full rounded bg-teal px-2 py-1.5 text-white font-medium"
                >
                  Save study note
                </button>
              </div>
            )}
            {chapterStudyNotes.length === 0 && !showNewNote && (
              <p className="text-xs text-muted">
                None yet. Save a clip from Dictionary, or + New study note.
              </p>
            )}
            <div className="max-h-[40vh] overflow-auto space-y-2">
              {chapterStudyNotes.map((n) => (
                <div key={n.id} className="rounded border border-border p-2 text-xs space-y-1">
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="font-semibold text-sm text-ink">{n.term}</span>
                    <Badge>{n.scope ?? "term"}</Badge>
                    {n.featureIds.map((f) => (
                      <Badge key={f} tone="claim">
                        {f}
                      </Badge>
                    ))}
                  </div>
                  {editingNoteId === n.id ? (
                    <div className="space-y-1.5">
                      <textarea
                        value={editNoteBody}
                        onChange={(e) => setEditNoteBody(e.target.value)}
                        rows={6}
                        className="w-full rounded border border-border px-2 py-1.5 text-xs"
                      />
                      <textarea
                        value={editNoteSources}
                        onChange={(e) => setEditNoteSources(e.target.value)}
                        rows={2}
                        placeholder="Sources: Label | url"
                        className="w-full rounded border border-border px-2 py-1.5 text-xs"
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="text-teal font-medium hover:underline"
                          onClick={commitEditNote}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="text-muted hover:underline"
                          onClick={() => setEditingNoteId(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-ink-soft whitespace-pre-wrap leading-relaxed">
                        {n.body.length > 280 ? n.body.slice(0, 280) + "…" : n.body}
                      </p>
                      {n.sources[0] && (
                        <p className="text-muted text-[10px]">
                          Source: {n.sources[0].label}
                          {n.sources.length > 1 ? ` (+ ${n.sources.length - 1})` : ""}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="text-accent hover:underline"
                          onClick={() => startEditNote(n)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="text-accent hover:underline"
                          onClick={() => {
                            setLookupPhrase(n.term);
                            setSelectionBar(n.term);
                          }}
                        >
                          Dictionary
                        </button>
                        <button
                          type="button"
                          className="text-muted hover:underline"
                          onClick={() => {
                            persistNotes(deleteStudyNote(studyNotes, n.id));
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
            <Link to="/insights" className="block text-center text-[11px] text-accent hover:underline">
              All study notes in Insights →
            </Link>
          </Card>
        </div>

        {/* CENTER: chapter */}
        <Card className="p-4 space-y-3 order-1 xl:order-2">
          <div className="flex flex-wrap gap-2 items-end">
            <label className="text-xs space-y-1">
              <span className="text-muted">Book</span>
              <select
                value={book}
                onChange={(e) => {
                  const b = e.target.value;
                  setBook(b);
                  setChapter(chaptersForBook(b)[0] ?? 1);
                }}
                className="block rounded border border-border bg-surface px-2 py-2 text-sm min-w-[8rem]"
              >
                {books.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs space-y-1">
              <span className="text-muted">Chapter</span>
              <select
                value={chapter}
                onChange={(e) => setChapter(Number(e.target.value))}
                className="block rounded border border-border bg-surface px-2 py-2 text-sm"
              >
                {(chapterList.length ? chapterList : [chapter]).map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <Badge tone="claim">{chapterVerses.length} verses</Badge>
            {current && (
              <a
                href={current.studyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-accent hover:underline ml-auto"
              >
                Official <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <p className="text-xs text-muted">
            Highlight words, then click <strong>Tag selection</strong> or <strong>Add to Builder</strong>
            below (or on the right). Suggestions still offer one-click + tag / path.
          </p>

          {selectionBar && (
            <div className="sticky top-0 z-10 flex flex-wrap items-center gap-2 rounded-[var(--radius)] border border-accent/40 bg-orange-50 p-2.5 shadow-sm">
              <span className="text-xs text-ink-soft">
                Selected: <strong className="text-ink">"{selectionBar}"</strong>
              </span>
              <button
                type="button"
                onClick={tagSelection}
                className="rounded bg-accent px-3 py-1.5 text-xs font-medium text-accent-fg"
              >
                Tag selection
              </button>
              <button
                type="button"
                onClick={pathSelection}
                className="rounded bg-teal px-3 py-1.5 text-xs font-medium text-white"
              >
                Add to Builder
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectionBar("");
                }}
                className="text-xs text-muted hover:underline ml-auto"
              >
                Dismiss
              </button>
            </div>
          )}

          {activeFeature && (
            <div className="rounded bg-teal-soft/50 border border-teal/20 p-2 text-sm">
              Feature:{" "}
              <strong>{getPlaceDossier(activeFeature)?.name ?? activeFeature}</strong>
              <span className="text-muted"> · {featureHits.length} verses</span>
            </div>
          )}

          <div className="space-y-2 max-h-[70vh] overflow-auto pr-1" onMouseUp={onTextSelect}>
            {chapterVerses.length === 0 && (
              <p className="text-sm text-muted">Chapter text not in corpus yet.</p>
            )}
            {chapterVerses.map((row) => {
              const active = selectedVerse === row.verse;
              const ts = tagsOnVerse.get(row.verse);
              const phrases = ts?.phrases ?? [];
              const rowSmart = smartSuggestionsForVerse(
                row.text,
                tagSets.flatMap((t) =>
                  t.phrases.map((p) => ({
                    wordPhrase: p,
                    tags: [p],
                    featureIds: t.featureIds,
                  })),
                ),
              ).filter(
                (s) =>
                  !phrases.some((p) => p.toLowerCase() === s.phrase.toLowerCase()),
              );

              return (
                <div
                  key={row.id}
                  className={`rounded-[var(--radius)] border p-3 ${
                    active
                      ? "border-accent bg-orange-50/60"
                      : phrases.length
                        ? "border-teal/40 bg-teal-soft/15"
                        : "border-border bg-surface"
                  }`}
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => goToVerse(row)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") goToVerse(row);
                    }}
                    className="w-full text-left cursor-pointer"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-muted tabular-nums">
                        {row.verse}
                      </span>
                      {phrases.slice(0, 5).map((p) => (
                        <Badge key={p} tone="teal">
                          {p}
                        </Badge>
                      ))}
                      {row.featureIds?.map((f) => (
                        <Badge key={f} tone="claim">
                          seed: {f}
                        </Badge>
                      ))}
                    </div>
                    <p className="scripture text-[15px] leading-relaxed select-text">
                      {row.text}
                    </p>
                  </div>

                  {rowSmart.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-muted uppercase self-center">
                        Suggest
                      </span>
                      {rowSmart.slice(0, 5).map((s) => (
                        <span key={s.phrase} className="inline-flex items-center gap-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVerse(row.verse);
                              addTagPhrase(s.phrase, s.featureIds);
                            }}
                            className="rounded-l-full border border-accent/40 bg-orange-50 px-2 py-0.5 text-[11px] text-accent hover:bg-accent hover:text-accent-fg"
                            title="Save as tag on this verse"
                          >
                            + tag {s.phrase}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedVerse(row.verse);
                              addStep(s.phrase, s.featureIds[0]);
                            }}
                            className="rounded-r-full border border-teal/40 border-l-0 bg-teal-soft/40 px-2 py-0.5 text-[11px] text-teal-900 hover:bg-teal hover:text-white"
                            title="Add as next path step"
                          >
                            path
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* RIGHT: builder + dict */}
        <div className="space-y-3 order-3">
          <Card className="p-4 space-y-3 border-teal/30">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Link2 className="h-4 w-4 text-teal" />
              Association Builder
            </h2>
            <div className="text-[11px] text-muted space-y-1 leading-relaxed">
              <p>
                <strong className="text-ink">Path</strong> = journey.{" "}
                <strong className="text-ink">Contains</strong> = inside a land.{" "}
                <strong className="text-ink">Proximity</strong> = near.{" "}
                <strong className="text-ink">Same region</strong> = peer places in one theater
                (east-sea cities) without inventing a road.{" "}
                <strong className="text-ink">River</strong> = bank / through / head of Sidon etc.
              </p>
            </div>

            <div className="rounded border border-border p-2 space-y-1.5 text-xs">
              <div className="font-medium">Places (gazetteer)</div>
              <p className="text-[10px] text-muted leading-relaxed">
                Places are map objects (hills, cities, lands). Tags are text phrases. You can tag
                “Amnihu” and also add Hill Amnihu as a place for the builder/map.
              </p>
              <button
                type="button"
                className="w-full rounded border border-teal/40 px-2 py-1.5 hover:bg-teal-soft/30"
                onClick={() => {
                  setShowAddPlace((v) => !v);
                  setNewPlaceName(
                    selectionBar || lookupPhrase || "Hill Amnihu",
                  );
                }}
              >
                {showAddPlace ? "Cancel" : "+ Add place to gazetteer"}
              </button>
              {showAddPlace && (
                <div className="space-y-1.5">
                  <input
                    value={newPlaceName}
                    onChange={(e) => setNewPlaceName(e.target.value)}
                    placeholder="Hill Amnihu"
                    className="w-full rounded border border-border px-2 py-1.5"
                  />
                  <select
                    value={newPlaceKind}
                    onChange={(e) =>
                      setNewPlaceKind(e.target.value as typeof newPlaceKind)
                    }
                    className="w-full rounded border border-border px-2 py-1.5 bg-surface"
                  >
                    <option value="hill">Hill</option>
                    <option value="city">City</option>
                    <option value="land">Land</option>
                    <option value="river">River</option>
                    <option value="wilderness">Wilderness</option>
                    <option value="other">Other</option>
                  </select>
                  <button
                    type="button"
                    onClick={createPlaceFromForm}
                    className="w-full rounded bg-teal px-2 py-1.5 text-white font-medium"
                  >
                    Create place & add to builder
                  </button>
                </div>
              )}
            </div>

            {detectedRelations.length > 0 && (
              <div className="rounded border border-accent/30 bg-orange-50/40 p-2 space-y-1.5 text-xs">
                <div className="font-medium">Relations detected in this verse</div>
                <p className="text-[10px] text-muted">
                  Words like <em>east of</em>, <em>by</em>, <em>west of</em> situate places. Click to
                  stage an association.
                </p>
                {detectedRelations.slice(0, 8).map((rel) => (
                  <button
                    key={rel.id + rel.raw}
                    type="button"
                    onClick={() => applyDetectedRelation(rel)}
                    className="w-full text-left rounded border border-border bg-surface px-2 py-1.5 hover:border-accent"
                  >
                    <span className="font-medium">
                      {rel.subjectPhrase} {relationLabel(rel.relation)} {rel.objectPhrase}
                    </span>
                    <span className="block text-[10px] text-muted">
                      “{rel.viaPhrase}” · {rel.suggestedKind}
                      {!rel.subjectPlaceId ? " · will create subject place" : ""}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <label className="block text-xs space-y-1">
              <span className="text-muted">Type</span>
              <select
                value={mode}
                onChange={(e) => {
                  const m = e.target.value as ConnMode;
                  setMode(m);
                  if (m === "river") setHubId("sidon");
                  if (m === "same_region" && hubId === "sidon") setHubId("east-sea-cluster");
                }}
                className="w-full rounded border border-border bg-surface px-2 py-2 text-sm"
              >
                <option value="path">Path (ordered travel / journey)</option>
                <option value="contains">Contains (inside a land/place)</option>
                <option value="proximity">Proximity (near, not contained)</option>
                <option value="same_region">Same region (peer places, no path)</option>
                <option value="river">River / watercourse link</option>
              </select>
            </label>

            {(mode !== "path" || steps.length < 2) && (
              <label className="block text-xs space-y-1">
                <span className="text-muted">
                  {mode === "river"
                    ? "River (hub)"
                    : mode === "same_region"
                      ? "Region anchor (optional hub)"
                      : mode === "path"
                        ? "Starting place (if only one step)"
                        : "Hub place"}
                </span>
                <select
                  value={hubId}
                  onChange={(e) => setHubId(e.target.value)}
                  className="w-full rounded border border-border bg-surface px-2 py-2 text-sm"
                >
                  {placeOptions.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} · {p.kind}
                      {p.parentId ? ` ⊂ ${p.parentId}` : ""}
                    </option>
                  ))}
                </select>
              </label>
            )}


            {/* Ordered steps */}
            <div>
              <div className="text-xs font-medium mb-1">
                {mode === "path" ? "Path steps (in order)" : "Related items"}
              </div>
              {steps.length === 0 ? (
                <p className="text-xs text-muted border border-dashed border-border rounded p-2">
                  Empty. Click a candidate below, or “+ path” on a verse suggestion.
                  {mode === "path" &&
                    " Example: Land of Nephi → wilderness → came down → Zarahemla."}
                </p>
              ) : (
                <ol className="space-y-1.5">
                  {steps.map((s, i) => (
                    <li
                      key={s.id}
                      className="flex items-center gap-1 text-xs rounded border border-border bg-surface-2/50 px-2 py-1.5"
                    >
                      <span className="text-muted tabular-nums w-4">{i + 1}.</span>
                      <span className="flex-1 font-medium">
                        {s.label}
                        {s.featureId && (
                          <span className="text-muted font-normal"> · {s.featureId}</span>
                        )}
                      </span>
                      <button
                        type="button"
                        className="px-1 text-muted hover:text-ink"
                        title="Move up"
                        onClick={() => moveStep(s.id, -1)}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="px-1 text-muted hover:text-ink"
                        title="Move down"
                        onClick={() => moveStep(s.id, 1)}
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        className="px-1.5 text-accent hover:underline"
                        onClick={() => removeStep(s.id)}
                      >
                        remove
                      </button>
                    </li>
                  ))}
                </ol>
              )}
              {mode === "path" && steps.length > 0 && (
                <p className="text-[11px] text-muted mt-1">
                  Preview:{" "}
                  {steps.length === 1
                    ? `${placeLabel(hubId)} → ${steps[0]!.label}`
                    : steps.map((s) => s.label).join(" → ")}
                </p>
              )}
            </div>

            {mode === "river" && hubId === "sidon" && (
              <button
                type="button"
                className="w-full rounded border border-border px-2 py-1.5 text-xs hover:bg-surface-2"
                onClick={() => {
                  const links = linksForRiver("sidon");
                  for (const l of links) {
                    addStep(placeLabel(l.placeId), l.placeId);
                  }
                  setFlash("Loaded Sidon-linked places (head → mouth order)");
                  window.setTimeout(() => setFlash(null), 2000);
                }}
              >
                Load Sidon places from seed hydro graph
              </button>
            )}

            {/* Candidates */}
            <div>
              <div className="text-xs font-medium mb-1 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" />
                Candidates for this verse
              </div>
              <p className="text-[10px] text-muted mb-1.5">
                From this verse, nearby verses, saved tags, and seeds. Click to add to the list
                above (does not delete).
              </p>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-auto">
                {candidates.length === 0 && (
                  <span className="text-xs text-muted">No candidates — select a verse with text.</span>
                )}
                {candidates.map((c) => (
                  <button
                    key={c.label + c.source}
                    type="button"
                    onClick={() => addStep(c.label, c.featureId)}
                    className="rounded-full border border-border bg-chip px-2.5 py-1 text-[11px] hover:border-teal hover:bg-teal-soft/40"
                    title={c.source}
                  >
                    + {c.label}
                    <span className="text-muted"> · {c.source}</span>
                  </button>
                ))}
              </div>
            </div>

            {lookupPhrase.trim().length >= 2 && (
              <button
                type="button"
                className="text-xs text-accent hover:underline"
                onClick={() => {
                  addStep(lookupPhrase.trim());
                  addTagPhrase(lookupPhrase.trim());
                }}
              >
                Add selection “{lookupPhrase.trim()}” to builder + tags
              </button>
            )}

            <div className="space-y-2 rounded border border-border p-2 text-xs">
              <div className="font-medium">Closeness preset (map + model tests)</div>
              <p className="text-[10px] text-muted leading-relaxed">
                Prefer presets from the text (by / east of / same battle) over inventing miles.
                <strong> Hard</strong> closeness: a model that separates these by another land/city
                without the named feature should fail.
              </p>
              <select
                value={distancePreset}
                onChange={(e) => setDistancePreset(e.target.value as DistancePreset)}
                className="w-full rounded border border-border bg-surface px-1.5 py-1"
              >
                {DISTANCE_PRESETS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-muted">
                {DISTANCE_PRESETS.find((p) => p.id === distancePreset)?.description}
              </p>
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={closenessHard}
                  onChange={(e) => setClosenessHard(e.target.checked)}
                />
                Hard constraint (must stay near / same theater)
              </label>
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    ["same_scene", "Same scene"],
                    ["by_adjacent", "By / adjacent"],
                    ["border_adjacent", "On border"],
                    ["across_feature", "East/west of river"],
                  ] as const
                ).map(([id, lab]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => {
                      setDistancePreset(id);
                      setClosenessHard(true);
                    }}
                    className="rounded-full border border-border px-2 py-0.5 hover:border-teal"
                  >
                    {lab}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 rounded border border-border p-2 text-xs">
              <div className="font-medium">Time & distance</div>
              <p className="text-[10px] text-muted leading-relaxed">
                Auto reads phrases like “space of many days” from the verse/steps. Override anytime.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <label className="space-y-0.5">
                  <span className="text-muted">Time</span>
                  <select
                    value={manualTimeQuality}
                    onChange={(e) =>
                      setManualTimeQuality(
                        e.target.value as typeof manualTimeQuality,
                      )
                    }
                    className="w-full rounded border border-border bg-surface px-1.5 py-1"
                  >
                    <option value="auto">
                      Auto
                      {selectionTime ? ` (→ ${spanLabel(selectionTime)})` : " (unknown)"}
                    </option>
                    <option value="unknown">Unknown</option>
                    <option value="approximate">Approximate</option>
                    <option value="stated">Stated in text</option>
                  </select>
                </label>
                <label className="space-y-0.5">
                  <span className="text-muted">Time value</span>
                  <input
                    value={manualTimeValue}
                    onChange={(e) => {
                      setManualTimeValue(e.target.value);
                      if (manualTimeQuality === "auto") setManualTimeQuality("stated");
                    }}
                    placeholder={selectionTime?.value ?? "e.g. many days"}
                    className="w-full rounded border border-border px-1.5 py-1"
                  />
                </label>
                <label className="space-y-0.5">
                  <span className="text-muted">Distance</span>
                  <select
                    value={manualDistQuality}
                    onChange={(e) =>
                      setManualDistQuality(
                        e.target.value as typeof manualDistQuality,
                      )
                    }
                    className="w-full rounded border border-border bg-surface px-1.5 py-1"
                  >
                    <option value="auto">
                      Auto
                      {selectionDistance
                        ? ` (→ ${spanLabel(selectionDistance)})`
                        : " (unknown)"}
                    </option>
                    <option value="unknown">Unknown</option>
                    <option value="approximate">Approximate</option>
                    <option value="stated">Stated in text</option>
                  </select>
                </label>
                <label className="space-y-0.5">
                  <span className="text-muted">Distance value</span>
                  <input
                    value={manualDistValue}
                    onChange={(e) => {
                      setManualDistValue(e.target.value);
                      if (manualDistQuality === "auto") setManualDistQuality("approximate");
                    }}
                    placeholder={selectionDistance?.value ?? "e.g. ~40 miles"}
                    className="w-full rounded border border-border px-1.5 py-1"
                  />
                </label>
              </div>
              <button
                type="button"
                className="text-accent hover:underline"
                onClick={() => {
                  if (selectionTime) {
                    setManualTimeQuality(selectionTime.quality);
                    setManualTimeValue(selectionTime.value ?? "");
                  } else {
                    setManualTimeQuality("unknown");
                    setManualTimeValue("");
                  }
                  if (selectionDistance) {
                    setManualDistQuality(selectionDistance.quality);
                    setManualDistValue(selectionDistance.value ?? "");
                  } else {
                    setManualDistQuality("unknown");
                    setManualDistValue("");
                  }
                }}
              >
                Apply auto-parsed values
              </button>
            </div>


            <div className="space-y-2 rounded border border-border p-2 text-xs">
              <div className="font-medium">Historical date (time layer)</div>
              <p className="text-[10px] text-muted leading-relaxed">
                Defaults from chapter-heading estimates. Attach to every association so size/war
                overlays can slice by year later.
              </p>
              {assocChronology ? (
                <p className="text-ink-soft">
                  Auto: {formatChronologySpan(assocChronology)}{" "}
                  <span className="text-muted">({assocChronology.quality})</span>
                </p>
              ) : (
                <p className="text-muted">No chapter heading date for this chapter yet.</p>
              )}
              <label className="block space-y-0.5">
                <span className="text-muted">Label (editable)</span>
                <input
                  value={chronoLabel}
                  onChange={(e) => {
                    setChronoLabel(e.target.value);
                    setAssocChronology((c) =>
                      c
                        ? { ...c, label: e.target.value, quality: c.quality === "unknown" ? "approximate" : c.quality }
                        : {
                            quality: "approximate",
                            label: e.target.value,
                          },
                    );
                  }}
                  placeholder="e.g. ~74 BC"
                  className="w-full rounded border border-border px-1.5 py-1"
                />
              </label>
            </div>

            <button
              type="button"
              disabled={steps.length === 0}
              onClick={buildConnection}
              className="w-full rounded-[var(--radius)] bg-teal px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {editingAssocId
                ? "Update association"
                : mode === "path"
                  ? "Save path association"
                  : "Save association"}
            </button>
            {editingAssocId && (
              <button
                type="button"
                className="w-full text-xs text-muted hover:underline"
                onClick={() => {
                  setEditingAssocId(null);
                  setSteps([]);
                }}
              >
                Cancel edit
              </button>
            )}
            <button
              type="button"
              className="w-full text-xs text-muted hover:underline"
              onClick={() => setSteps([])}
            >
              Clear steps
            </button>
            <Link to="/map-lab" className="block text-center text-xs text-accent hover:underline">
              Map Lab →
            </Link>
          </Card>

          {/* Path suggestions for verse */}
          {verseSuggestions.length > 0 && (
            <Card className="p-3 space-y-2">
              <h2 className="font-semibold text-sm">Suggested paths</h2>
              {verseSuggestions.map((sug) => {
                const already = userAssocs.some((a) => a.sourceSuggestionId === sug.id);
                return (
                  <div key={sug.id} className="rounded border border-border p-2 text-xs space-y-1">
                    <div className="font-medium text-sm">{sug.title}</div>
                    <p className="text-ink-soft">{sug.summary}</p>
                    <button
                      type="button"
                      disabled={already}
                      onClick={() => oneClickAccept(sug)}
                      className="w-full rounded bg-accent px-2 py-2 text-accent-fg font-medium disabled:opacity-50"
                    >
                      {already ? "Already adopted" : "Adopt path (1 click)"}
                    </button>
                  </div>
                );
              })}
              {current?.book === "Omni" &&
                (current.verse === 12 || current.verse === 13) && (
                  <div className="text-[11px] text-muted space-y-0.5">
                    {NEPHI_ZARAHEMLA_TRAVEL_NOTES.map((n) => (
                      <div key={n.id}>{n.claim}</div>
                    ))}
                  </div>
                )}
            </Card>
          )}

          {/* Tags on verse — one set */}
          {currentTagSet && (
            <Card className="p-3 space-y-2">
              <h2 className="font-semibold text-sm">Tags on this verse</h2>
              <p className="text-[11px] text-muted">
                One list per verse. Click × to remove a phrase.
              </p>
              <div className="flex flex-wrap gap-1.5">
                {currentTagSet.phrases.map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() =>
                      setTagSets(removePhrase(tagSets, currentTagSet.key, p))
                    }
                    className="rounded-full border border-teal/40 bg-teal-soft/30 px-2.5 py-1 text-xs hover:bg-red-50"
                  >
                    {p} ×
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="text-xs text-muted hover:underline"
                onClick={() => setTagSets(removeTagSet(tagSets, currentTagSet.key))}
              >
                Clear all tags on this verse
              </button>
            </Card>
          )}

          {assocsOnVerse.length > 0 && (
            <Card className="p-3 space-y-2">
              <h2 className="font-semibold text-sm">Saved on this verse</h2>
              {assocsOnVerse.map((a) => (
                <div key={a.id} className="text-xs border border-border rounded p-2 space-y-1">
                  <div className="font-medium">{a.title}</div>
                  <div className="flex flex-wrap gap-1">
                    <Badge tone={a.pathDistance.quality === "unknown" && !a.spatialDistance ? "claim" : "teal"}>
                      Dist: {associationDistanceLabel(a)}
                    </Badge>
                    {a.spatialDistance?.closeness === "hard" && (
                      <Badge tone="accent">hard near</Badge>
                    )}
                    <Badge tone={a.pathTime.quality === "unknown" ? "claim" : "teal"}>
                      Travel time: {spanLabel(a.pathTime)}
                    </Badge>
                    {a.chronology && (
                      <Badge tone="insight">
                        Date: {formatChronologySpan(a.chronology)}
                      </Badge>
                    )}
                  </div>
                  {a.legs.map((leg, i) => (
                    <div key={i} className="flex justify-between gap-2 text-muted">
                      <span>
                        {placeLabel(leg.fromFeatureId)} → {placeLabel(leg.toFeatureId)}
                      </span>
                      <button
                        type="button"
                        className="text-accent"
                        onClick={() => {
                          const next = removeLeg(userAssocs, a.id, i);
                          setUserAssocs(next);
                          saveAssociations(next);
                        }}
                      >
                        remove
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="text-accent hover:underline"
                      onClick={() => loadAssocIntoBuilder(a)}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="text-muted hover:underline"
                      onClick={() => deleteAssoc(a.id, Boolean(a.sourceSuggestionId))}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </Card>
          )}

          
          {/* Dictionary — embedded text */}
          <Card className="p-3 space-y-2">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Dictionary · KJV · Hebrew/Semitic
            </h2>
            <p className="text-[11px] text-muted">
              Webster/KJV senses plus Hebrew or Semitic roots when known. Proper names are often{" "}
              <strong>speculative</strong> — confidence is always labeled.
            </p>
            <div className="flex gap-1.5">
              <input
                value={lookupPhrase}
                onChange={(e) => {
                  setLookupPhrase(e.target.value);
                  setSelectionBar(e.target.value);
                }}
                placeholder="Selected word or type…"
                className="flex-1 rounded border border-border px-2 py-1.5 text-sm"
              />
            </div>
            {(lookupPhrase.trim() || selectionBar) && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={tagSelection}
                  className="rounded bg-accent px-2.5 py-1 text-xs font-medium text-accent-fg"
                >
                  Tag selection
                </button>
                <button
                  type="button"
                  onClick={pathSelection}
                  className="rounded bg-teal px-2.5 py-1 text-xs font-medium text-white"
                >
                  Add to Builder
                </button>
                                <button
                  type="button"
                  onClick={() => {
                    const term = (lookupPhrase || selectionBar).trim();
                    if (!term) {
                      setFlash("Select or type a word to associate the note with");
                      window.setTimeout(() => setFlash(null), 2500);
                      return;
                    }
                    const parts = embeddedLex?.senses.map((s) => s.body).filter(Boolean) ?? [];
                    let body = parts.join("\n\n").trim();
                    if (!body) {
                      // open left-panel form prefilled when no embedded text
                      setNewNoteTerm(term);
                      setNewNoteBody("");
                      setNewNoteScope("term");
                      setShowNewNote(true);
                      setFlash("Add your note text in Chapter study notes (left)");
                      window.setTimeout(() => setFlash(null), 3000);
                      return;
                    }
                    const ok = saveSenseAsNote(
                      term,
                      body,
                      (embeddedLex?.curated.external || []).slice(0, 3).map((ex) => ({
                        label: ex.label,
                        url: ex.url,
                        kind: ex.kind as StudyNoteSource["kind"],
                      })),
                      "manual",
                      "term",
                      current
                        ? {
                            book: current.book,
                            chapter: current.chapter,
                            verse: current.verse,
                          }
                        : undefined,
                    );
                    if (ok) {
                      setShowNewNote(false);
                    }
                  }}
                  className="rounded border border-teal px-2.5 py-1 text-xs font-medium text-teal"
                >
                  Save custom study note
                </button>
              </div>
            )}
            {embedLoading && (
              <p className="text-xs text-muted">Loading definitions…</p>
            )}
            {embeddedLex && embeddedLex.senses.length > 0 && (
              <div className="space-y-3 max-h-72 overflow-auto">
                {embeddedLex.senses.map((s, i) => (
                  <div
                    key={i}
                    className={`rounded border p-2 text-xs space-y-1.5 ${
                      s.source === "semitic"
                        ? "border-insight/40 bg-lime-50/50"
                        : "border-border bg-surface-2/40"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      <div className="font-semibold text-[11px] uppercase tracking-wide text-muted">
                        {s.title}
                      </div>
                      {s.confidence && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium border ${
                            s.confidence.startsWith("Biblical")
                              ? "bg-teal-soft/50 border-teal/30 text-teal-900"
                              : s.confidence.startsWith("Plausible")
                                ? "bg-orange-50 border-orange-200 text-accent"
                                : "bg-chip border-border text-muted"
                          }`}
                        >
                          {s.confidence}
                        </span>
                      )}
                    </div>
                    <p className="text-ink-soft leading-relaxed whitespace-pre-wrap">
                      {s.body}
                    </p>
                    <button
                      type="button"
                      className="rounded bg-teal/90 px-2.5 py-1 text-[11px] font-medium text-white hover:bg-teal"
                      onClick={() => {
                        const term = embeddedLex.query || lookupPhrase.trim();
                        const sources: StudyNoteSource[] = [
                          {
                            label: s.title,
                            kind:
                              s.source === "curated"
                                ? "curated"
                                : s.source === "semitic"
                                  ? "other"
                                  : s.source === "kjv_api"
                                    ? "kjv"
                                    : s.source === "free_dictionary"
                                      ? "free_dictionary"
                                      : "other",
                          },
                          ...embeddedLex.curated.external
                            .filter((ex) =>
                              s.source === "curated"
                                ? ex.kind === "webster1828" || ex.kind === "kjv"
                                : true,
                            )
                            .slice(0, 2)
                            .map((ex) => ({
                              label: ex.label,
                              url: ex.url,
                              kind: ex.kind as StudyNoteSource["kind"],
                            })),
                        ];
                        saveSenseAsNote(term, s.body, sources, "dictionary_clip");
                      }}
                    >
                      Save to study notes
                    </button>
                  </div>
                ))}
              </div>
            )}
            {lookupPhrase.trim() &&
              !embedLoading &&
              embeddedLex &&
              embeddedLex.senses.length === 0 && (
                <p className="text-xs text-muted">
                  No embedded entry for "{lookupPhrase}". Try another form of the word, or use
                  external links below.
                </p>
              )}
            {embeddedLex && embeddedLex.curated.external.length > 0 && (
              <div className="border-t border-border pt-2 space-y-0.5">
                <div className="text-[10px] uppercase text-muted font-semibold">
                  Optional external
                </div>
                {embeddedLex.curated.external.slice(0, 3).map((ex) => (
                  <a
                    key={ex.url}
                    href={ex.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-[11px] text-accent hover:underline"
                  >
                    {ex.label}
                  </a>
                ))}
              </div>
            )}
            {lookupPhrase.trim() && searchWord(lookupPhrase).length > 0 && (
              <div className="border-t border-border pt-2 space-y-0.5">
                <div className="text-[10px] uppercase text-muted font-semibold">
                  BoM concordance ({searchWord(lookupPhrase).length})
                </div>
                {searchWord(lookupPhrase)
                  .slice(0, 6)
                  .map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => goToVerse(h)}
                      className="block text-xs text-accent hover:underline"
                    >
                      {h.book} {h.chapter}:{h.verse}
                    </button>
                  ))}
              </div>
            )}
          </Card>

        </div>
      </div>
    </div>
  );
}
