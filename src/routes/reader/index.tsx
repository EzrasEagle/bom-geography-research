import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, ExternalLink, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { evidenceDomains, places, verses } from "@/data/catalog";
import { getPlaceDossier } from "@/data/place-scripture";
import {
  dynamicLexiconLookup,
  lexiconHitsInText,
  lookupLexicon,
  priorityEntries,
} from "@/data/lexicon";
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
  saveAssociations,
  spanLabel,
  type UserAssociation,
} from "@/lib/user-associations";
import { placeLabel } from "@/lib/place-connections";

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

type UserTag = {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  /** Exact words from the text when possible */
  wordPhrase?: string;
  tags: string[];
  note: string;
  domain: string;
  featureIds: string[];
  scope: "personal" | "suggest_shared";
  createdAt: string;
};

const STORAGE_KEY = "bom-atlas-reader-tags-v3";

/** Prefer BoM phraseology as tag labels */
const SUGGESTED_TAGS = [
  "wilderness",
  "land of Nephi",
  "land of Zarahemla",
  "came down",
  "went up",
  "narrow neck of land",
  "narrow pass",
  "sea east",
  "sea west",
  "whirlwind",
  "tempest",
  "great waters",
  "promised land",
  "seasons of peace",
  "seasons of serious war",
  "high-signal",
  "conflict-candidate",
  "proximity",
];

function ReaderPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const books = booksInCorpus();
  const [book, setBook] = useState(search.book ?? "Omni");
  const [chapter, setChapter] = useState(search.chapter ?? 1);
  const [selectedVerse, setSelectedVerse] = useState(search.verse ?? 13);
  const [wordQuery, setWordQuery] = useState(search.q ?? "");
  const [activeFeature, setActiveFeature] = useState(search.feature ?? "");
  const [tags, setTags] = useState<UserTag[]>([]);
  const [note, setNote] = useState("");
  const [domain, setDomain] = useState("textual_geography");
  const [picked, setPicked] = useState<string[]>(["wilderness"]);
  const [wordPhrase, setWordPhrase] = useState(search.q ?? "");
  const [scope, setScope] = useState<"personal" | "suggest_shared">("personal");
  const [featurePick, setFeaturePick] = useState<string[]>(
    search.feature ? [search.feature] : ["wilderness"],
  );
  const [hoverVerse, setHoverVerse] = useState<number | null>(null);
  const [customTag, setCustomTag] = useState("");
  const [customFeatureName, setCustomFeatureName] = useState("");
  const [userAssocs, setUserAssocs] = useState<UserAssociation[]>([]);
  const [acceptedFlash, setAcceptedFlash] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem("bom-atlas-reader-tags-v2");
      if (raw) setTags(JSON.parse(raw) as UserTag[]);
    } catch {
      /* ignore */
    }
    setUserAssocs(loadAssociations());
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
  }, [tags]);

  useEffect(() => {
    if (search.book) setBook(search.book);
    if (search.chapter) setChapter(search.chapter);
    if (search.verse) setSelectedVerse(search.verse);
    if (search.q) {
      setWordQuery(search.q);
      setWordPhrase(search.q);
    }
    if (search.feature) {
      setActiveFeature(search.feature);
      setFeaturePick((prev) =>
        prev.includes(search.feature!) ? prev : [...prev, search.feature!],
      );
    }
  }, [search.book, search.chapter, search.verse, search.q, search.feature]);

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
    const map = new Map<number, UserTag[]>();
    for (const t of tags) {
      if (t.book === book && t.chapter === chapter) {
        const arr = map.get(t.verse) ?? [];
        arr.push(t);
        map.set(t.verse, arr);
      }
    }
    return map;
  }, [tags, book, chapter]);

  const dynamicLex = useMemo(() => dynamicLexiconLookup(wordPhrase), [wordPhrase]);
  const lexiconForSelection = dynamicLex.curated;
  const corpusConcordance = useMemo(() => {
    const q = wordPhrase.trim();
    if (!q || q.length < 2) return [];
    return searchWord(q);
  }, [wordPhrase]);
  const verseLexHits = useMemo(
    () => (current ? lexiconHitsInText(current.text) : []),
    [current],
  );
  const verseSuggestions = useMemo(
    () =>
      current
        ? suggestionsForVerse(current.book, current.chapter, current.verse)
        : [],
    [current],
  );
  const assocsOnVerse = useMemo(() => {
    if (!current) return [];
    return userAssocs.filter(
      (a) =>
        a.book === current.book &&
        a.chapter === current.chapter &&
        a.verse === current.verse,
    );
  }, [userAssocs, current]);

  function oneClickAccept(sug: AssociationSuggestion) {
    const row = acceptSuggestion(sug, {
      pathDistance: { quality: "unknown", note: "Marked unknown from source verse" },
      pathTime: { quality: "unknown", note: "Marked unknown from source verse" },
    });
    const next = [row, ...userAssocs.filter((a) => a.sourceSuggestionId !== sug.id)];
    setUserAssocs(next);
    saveAssociations(next);
    // also create a tag for continuity
    setTags((prev) => [
      {
        id: `${Date.now()}`,
        book: sug.book,
        chapter: sug.chapter,
        verse: sug.verse,
        wordPhrase: sug.tags[0],
        tags: [...sug.tags, "path", "distance-unknown", "time-unknown"],
        note: sug.summary,
        domain: "textual_geography",
        featureIds: [
          ...new Set(sug.legs.flatMap((l) => [l.fromFeatureId, l.toFeatureId])),
        ],
        scope: "personal",
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setAcceptedFlash(sug.id);
    window.setTimeout(() => setAcceptedFlash(null), 2000);
  }


  const lexiconInChapter = useMemo(() => {
    const hits = new Map<string, ReturnType<typeof lookupLexicon>>();
    for (const v of chapterVerses) {
      for (const e of lexiconHitsInText(v.text)) {
        hits.set(e.term, e);
      }
    }
    return [...hits.values()].filter(Boolean);
  }, [chapterVerses]);

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
    setWordPhrase(q);
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
    if (sel && sel.length < 80) {
      setWordPhrase(sel);
      // Prefer exact phrase as a tag chip
      if (!picked.includes(sel) && sel.length > 2) {
        setPicked((p) => [...p, sel]);
      }
      const lex = lookupLexicon(sel);
      if (lex) {
        // soft map feature guess
        if (lex.term === "wilderness" && !featurePick.includes("wilderness")) {
          setFeaturePick((f) => [...f, "wilderness"]);
        }
      }
    }
  }

  function toggleTag(t: string) {
    setPicked((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function toggleFeature(id: string) {
    setFeaturePick((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function addCustomTag() {
    const t = customTag.trim();
    if (!t) return;
    if (!picked.includes(t)) setPicked((p) => [...p, t]);
    setWordPhrase(t);
    setCustomTag("");
  }

  function saveTag() {
    if (!current) return;
    const row: UserTag = {
      id: `${Date.now()}`,
      book: current.book,
      chapter: current.chapter,
      verse: current.verse,
      wordPhrase: wordPhrase || undefined,
      tags: picked,
      note,
      domain,
      featureIds: featurePick,
      scope,
      createdAt: new Date().toISOString(),
    };
    setTags((prev) => [row, ...prev]);
    setNote("");
  }

  /** Quick associate: selected phrase + features (e.g. wilderness near Nephi) */
  function saveProximityAssociation() {
    if (!current) return;
    const phrase = wordPhrase || "wilderness";
    const feats = featurePick.length ? featurePick : ["wilderness", "nephi"];
    setTags((prev) => [
      {
        id: `${Date.now()}`,
        book: current.book,
        chapter: current.chapter,
        verse: current.verse,
        wordPhrase: phrase,
        tags: [phrase, "proximity", ...picked.filter((t) => t !== phrase)],
        note:
          note ||
          `Association: ${phrase} in proximity to ${feats.map((f) => places.find((p) => p.id === f)?.name ?? f).join(", ")}`,
        domain: "textual_geography",
        featureIds: feats,
        scope,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  }

  const featureOptions = places;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold">Reader · full chapter · tags</h1>
        <p className="text-sm text-ink-soft max-w-3xl leading-relaxed">
          Full chapter text when available (Omni 1 complete). Select words in a verse to tag with{" "}
          <em>the text’s own phrase</em>. Soft features like <strong className="text-ink">wilderness</strong>{" "}
          can associate with many lands. Lexicon: 1828 Webster + KJV sense for key terms.
        </p>
      </div>

      {/* Word index */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center gap-2 font-semibold text-sm">
          <Search className="h-4 w-4 text-accent" />
          Word index
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            value={wordQuery}
            onChange={(e) => setWordQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runWordSearch(wordQuery)}
            placeholder="Zarahemla, wilderness, narrow pass…"
            className="flex-1 rounded-[var(--radius)] border border-border bg-surface px-3 py-2.5 text-sm"
          />
          <button
            type="button"
            onClick={() => runWordSearch(wordQuery)}
            className="rounded-[var(--radius)] bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg"
          >
            Find all
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {["wilderness", "Zarahemla", "land of Nephi", "came down", "whirlwind", "narrow"].map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => runWordSearch(w)}
              className="rounded-full border border-border px-2.5 py-1 text-xs hover:bg-surface-2"
            >
              {w}
            </button>
          ))}
        </div>
        {wordQuery.trim() && (
          <div className="max-h-40 overflow-auto space-y-1 border-t border-border pt-2">
            <p className="text-xs text-muted">
              {wordHits.length} hit{wordHits.length === 1 ? "" : "s"} · corpus {corpus.length} verses
            </p>
            {wordHits.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => goToVerse(h)}
                className={`w-full text-left text-sm rounded px-2 py-1.5 hover:bg-surface-2 ${
                  current?.id === h.id ? "bg-orange-50 border border-accent/30" : ""
                }`}
              >
                <span className="font-medium text-accent">
                  {h.book} {h.chapter}:{h.verse}
                </span>
                <span className="text-ink-soft"> — {h.text.slice(0, 110)}…</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.25fr_0.85fr]">
        {/* Full chapter */}
        <Card className="p-5 space-y-4">
          <div className="flex flex-wrap gap-2 items-end">
            <label className="text-xs space-y-1">
              <span className="text-muted">Book</span>
              <select
                value={book}
                onChange={(e) => {
                  const b = e.target.value;
                  setBook(b);
                  const chs = chaptersForBook(b);
                  setChapter(chs[0] ?? 1);
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
            <Badge tone="claim">
              {chapterVerses.length} verses loaded
            </Badge>
            {current && (
              <a
                href={current.studyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-accent hover:underline ml-auto"
              >
                Official edition <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          <p className="text-xs text-muted">
            Full verse text stays in the row. Hover opens a context panel (features, tags, lexicon terms, links)—not a second copy of the text. Select any word for dynamic dictionary/KJV/concordance lookup.
          </p>

          {activeFeature && (
            <div className="rounded-[var(--radius)] bg-teal-soft/50 border border-teal/20 p-3 text-sm">
              Linked feature:{" "}
              <strong>{getPlaceDossier(activeFeature)?.name ?? activeFeature}</strong>
              <span className="text-muted"> · {featureHits.length} pre-linked corpus verses</span>
            </div>
          )}

          <div className="space-y-2 max-h-[70vh] overflow-auto pr-1" onMouseUp={onTextSelect}>
            {chapterVerses.length === 0 && (
              <p className="text-sm text-muted">
                Full text for this chapter not in the working corpus yet. Use official link; we expand
                chapter-by-chapter (Omni 1 is complete).
              </p>
            )}
            {chapterVerses.map((row) => {
              const active = selectedVerse === row.verse;
              const vt = tagsOnVerse.get(row.verse) ?? [];
              const hasTag = vt.length > 0;
              const highlighted =
                wordQuery.trim() &&
                row.text.toLowerCase().includes(wordQuery.trim().toLowerCase());
              return (
                <div key={row.id} className="relative">
                  <button
                    type="button"
                    onClick={() => goToVerse(row)}
                    onMouseEnter={() => setHoverVerse(row.verse)}
                    onMouseLeave={() => setHoverVerse((h) => (h === row.verse ? null : h))}
                    className={`w-full text-left rounded-[var(--radius)] border p-3 transition-colors ${
                      active
                        ? "border-accent bg-orange-50/60"
                        : hasTag
                          ? "border-teal/40 bg-teal-soft/20"
                          : "border-border bg-surface hover:bg-surface-2"
                    } ${highlighted ? "ring-1 ring-accent/30" : ""}`}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <span className="text-xs font-semibold text-muted tabular-nums">
                        {row.verse}
                      </span>
                      {hasTag && (
                        <Badge tone="teal">
                          {vt.length} tag{vt.length > 1 ? "s" : ""}
                        </Badge>
                      )}
                      {vt.flatMap((t) => t.wordPhrase ? [t.wordPhrase] : t.tags.slice(0, 1)).slice(0, 3).map((x) => (
                        <Badge key={x}>{x}</Badge>
                      ))}
                      {row.featureIds?.map((f) => (
                        <Badge key={f} tone="claim">
                          {f}
                        </Badge>
                      ))}
                    </div>
                    <p className="scripture text-[15px] leading-relaxed select-text">{row.text}</p>
                    {hasTag && (
                      <div className="mt-2 space-y-1 border-t border-border/50 pt-2">
                        {vt.map((t) => (
                          <div key={t.id} className="text-[11px] text-muted">
                            {t.wordPhrase && (
                              <span className="text-accent font-medium">“{t.wordPhrase}” · </span>
                            )}
                            {t.tags.join(", ")}
                            {t.featureIds.length > 0 && (
                              <span> → {t.featureIds.join(", ")}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </button>
                  {hoverVerse === row.verse && (
                    <div className="absolute z-20 left-2 right-2 top-full mt-1 rounded-[var(--radius)] border border-border bg-surface shadow-lg p-3 text-xs space-y-2 pointer-events-none">
                      <div className="font-semibold text-ink font-sans">
                        {row.book} {row.chapter}:{row.verse} · context
                      </div>
                      {userAssocs.some(
                        (a) =>
                          a.book === row.book &&
                          a.chapter === row.chapter &&
                          a.verse === row.verse,
                      ) && (
                        <div>
                          <span className="text-muted uppercase tracking-wide">Associations · </span>
                          {userAssocs
                            .filter(
                              (a) =>
                                a.book === row.book &&
                                a.chapter === row.chapter &&
                                a.verse === row.verse,
                            )
                            .map((a) => a.title)
                            .join("; ")}
                          <span className="text-muted">
                            {" "}
                            (dist {spanLabel(
                              userAssocs.find(
                                (a) =>
                                  a.book === row.book &&
                                  a.chapter === row.chapter &&
                                  a.verse === row.verse,
                              )!.pathDistance,
                            )}
                            , time{" "}
                            {spanLabel(
                              userAssocs.find(
                                (a) =>
                                  a.book === row.book &&
                                  a.chapter === row.chapter &&
                                  a.verse === row.verse,
                              )!.pathTime,
                            )}
                            )
                          </span>
                        </div>
                      )}
                      {(tagsOnVerse.get(row.verse) ?? []).length > 0 && (
                        <div>
                          <span className="text-muted uppercase tracking-wide">Your tags · </span>
                          {(tagsOnVerse.get(row.verse) ?? []).map((tg) => (
                            <span key={tg.id} className="mr-1">
                              {tg.wordPhrase ? `“${tg.wordPhrase}”` : tg.tags.join(", ")}
                              {tg.featureIds.length ? ` → ${tg.featureIds.join(", ")}` : ""}
                            </span>
                          ))}
                        </div>
                      )}
                      {row.featureIds && row.featureIds.length > 0 && (
                        <div>
                          <span className="text-muted uppercase tracking-wide">Map features · </span>
                          {row.featureIds.join(", ")}
                        </div>
                      )}
                      {lexiconHitsInText(row.text).length > 0 && (
                        <div>
                          <span className="text-muted uppercase tracking-wide">Key terms · </span>
                          {lexiconHitsInText(row.text)
                            .map((e) => e.term)
                            .join(" · ")}
                        </div>
                      )}
                      {lexiconHitsInText(row.text)[0] && (
                        <p className="text-ink-soft leading-relaxed">
                          <span className="font-medium text-ink">
                            {lexiconHitsInText(row.text)[0]!.term}:
                          </span>{" "}
                          {lexiconHitsInText(row.text)[0]!.ambiguity}
                        </p>
                      )}
                      <div className="text-muted">
                        Click to select · highlight a word for dictionary panel · official link in
                        sidebar
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Tag + lexicon panel */}
        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <h2 className="font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-accent" />
              Tag{" "}
              {current
                ? `${current.book} ${current.chapter}:${current.verse}`
                : "a verse"}
            </h2>
            <label className="block text-sm space-y-1">
              <span className="text-muted">Selected words (from text — preferred tag label)</span>
              <input
                value={wordPhrase}
                onChange={(e) => setWordPhrase(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-sm"
                placeholder="Select in verse or type: wilderness"
              />
            </label>
            <div className="flex gap-2">
              <input
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                placeholder="New tag using text’s phrase…"
                className="flex-1 rounded border border-border px-2 py-1.5 text-sm"
              />
              <button
                type="button"
                onClick={addCustomTag}
                className="rounded border border-border px-2 text-sm"
              >
                Add tag
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTED_TAGS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => toggleTag(t)}
                  className={`rounded-full px-2.5 py-1 text-xs border ${
                    picked.includes(t)
                      ? "border-accent bg-accent text-accent-fg"
                      : "border-border bg-chip text-ink-soft"
                  }`}
                >
                  {t}
                </button>
              ))}
              {picked
                .filter((t) => !SUGGESTED_TAGS.includes(t))
                .map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => toggleTag(t)}
                    className="rounded-full px-2.5 py-1 text-xs border border-accent bg-accent text-accent-fg"
                  >
                    {t}
                  </button>
                ))}
            </div>
            <div>
              <div className="text-xs text-muted mb-1">
                Associate map features (soft regions OK — many wildernesses)
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-32 overflow-auto">
                {featureOptions.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleFeature(f.id)}
                    className={`rounded-full px-2.5 py-1 text-xs border ${
                      featurePick.includes(f.id)
                        ? "border-teal bg-teal text-white"
                        : "border-border bg-chip text-ink-soft"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
            <label className="block text-sm space-y-1">
              <span className="text-muted">Domain</span>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full rounded border border-border bg-surface px-3 py-2 text-sm"
              >
                {evidenceDomains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. land of Nephi in proximity to wilderness corridor toward Zarahemla"
              rows={3}
              className="w-full rounded border border-border px-3 py-2 text-sm"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={saveTag}
                disabled={!current}
                className="rounded-[var(--radius)] bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
              >
                Save tag
              </button>
              <button
                type="button"
                onClick={saveProximityAssociation}
                disabled={!current}
                className="rounded-[var(--radius)] border border-teal px-3 py-2.5 text-sm text-teal disabled:opacity-50"
              >
                Save proximity association
              </button>
            </div>
            <p className="text-[11px] text-muted">
              Example: select “wilderness” in Omni 1:13, associate features{" "}
              <strong>Wilderness</strong> + <strong>Land/City of Nephi</strong>, save proximity.
            </p>
          </Card>

          {/* One-click association suggestions */}
          {verseSuggestions.length > 0 && (
            <Card className="p-5 space-y-3 border-accent/30">
              <h2 className="font-semibold text-sm">Suggested associations</h2>
              <p className="text-[11px] text-muted leading-relaxed">
                One click creates the path with <strong>distance unknown</strong> and{" "}
                <strong>time unknown</strong> unless the verse states otherwise. Related travel /
                lost-party refs are kept for later distance proposals.
              </p>
              {verseSuggestions.map((sug) => {
                const already = userAssocs.some((a) => a.sourceSuggestionId === sug.id);
                return (
                  <div
                    key={sug.id}
                    className="rounded-[var(--radius)] border border-border bg-surface-2/50 p-3 space-y-2"
                  >
                    <div className="font-medium text-sm">{sug.title}</div>
                    <p className="text-xs text-ink-soft leading-relaxed">{sug.summary}</p>
                    <div className="space-y-1.5">
                      {sug.legs.map((leg, i) => (
                        <div key={i} className="text-xs rounded bg-surface border border-border/60 px-2 py-1.5">
                          <span className="font-medium text-accent">
                            {placeLabel(leg.fromFeatureId)} → {placeLabel(leg.toFeatureId)}
                          </span>
                          <span className="text-muted"> · {leg.kind}</span>
                          {leg.viaPhrase && (
                            <div className="text-ink-soft italic">“{leg.viaPhrase}”</div>
                          )}
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            <Badge tone={leg.distance.quality === "unknown" ? "claim" : "teal"}>
                              Distance: {spanLabel(leg.distance)}
                            </Badge>
                            <Badge tone={leg.time.quality === "unknown" ? "claim" : "teal"}>
                              Time: {spanLabel(leg.time)}
                            </Badge>
                            {leg.elevation && leg.elevation !== "unknown" && (
                              <Badge>{leg.elevation === "down" ? "↓ down" : "↑ up"}</Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {sug.relatedRefs.length > 0 && (
                      <div className="text-[11px] space-y-0.5">
                        <div className="text-muted font-semibold uppercase tracking-wide">
                          Related travel / lost parties
                        </div>
                        {sug.relatedRefs.map((r) => (
                          <div key={r.ref + r.note}>
                            <span className="font-medium text-ink">{r.ref}</span>
                            <span className="text-muted"> — {r.note}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {(current?.book === "Omni" &&
                      (current.verse === 12 || current.verse === 13 || current.verse === 27)) && (
                      <div className="text-[11px] border-t border-border pt-2 space-y-0.5">
                        <div className="text-muted font-semibold uppercase">
                          Nephi ↔ Zarahemla travel notes
                        </div>
                        {NEPHI_ZARAHEMLA_TRAVEL_NOTES.map((n) => (
                          <div key={n.id}>
                            <span className="text-ink-soft">{n.claim}</span>
                            <span className="text-muted"> ({n.refs.join("; ")})</span>
                          </div>
                        ))}
                      </div>
                    )}
                    <button
                      type="button"
                      disabled={already}
                      onClick={() => oneClickAccept(sug)}
                      className="w-full rounded-[var(--radius)] bg-accent px-3 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
                    >
                      {already
                        ? "Association saved"
                        : acceptedFlash === sug.id
                          ? "Created — distance & time unknown"
                          : "Create association (1 click)"}
                    </button>
                  </div>
                );
              })}
            </Card>
          )}

          {assocsOnVerse.length > 0 && (
            <Card className="p-4 space-y-2">
              <h2 className="font-semibold text-sm">Saved on this verse</h2>
              {assocsOnVerse.map((a) => (
                <div key={a.id} className="text-xs border border-border rounded p-2 space-y-1">
                  <div className="font-medium">{a.title}</div>
                  <div className="flex flex-wrap gap-1">
                    <Badge tone="claim">Distance: {spanLabel(a.pathDistance)}</Badge>
                    <Badge tone="claim">Time: {spanLabel(a.pathTime)}</Badge>
                  </div>
                  <Link to="/map-lab" className="text-accent hover:underline">
                    View corridor on Map Lab →
                  </Link>
                </div>
              ))}
            </Card>
          )}

          {userAssocs.length > 0 && assocsOnVerse.length === 0 && (
            <Card className="p-4 space-y-1">
              <h2 className="font-semibold text-sm">All saved associations</h2>
              <p className="text-[11px] text-muted">{userAssocs.length} total</p>
              {userAssocs.slice(0, 5).map((a) => (
                <button
                  key={a.id}
                  type="button"
                  className="block text-xs text-left text-accent hover:underline"
                  onClick={() => {
                    setBook(a.book);
                    setChapter(a.chapter);
                    setSelectedVerse(a.verse);
                  }}
                >
                  {a.book} {a.chapter}:{a.verse} — {a.title}
                </button>
              ))}
            </Card>
          )}

          {/* Dynamic lexicon: curated + any-word external lookup */}
          <Card className="p-5 space-y-3">
            <h2 className="font-semibold text-sm">Dictionary · KJV · concordance</h2>
            <p className="text-[11px] text-muted leading-relaxed">
              Select any word in a verse (or type below). Curated notes appear when we have them;
              Webster 1828, KJV search, and concordance links work for every word.
            </p>
            <input
              value={wordPhrase}
              onChange={(e) => setWordPhrase(e.target.value)}
              placeholder="Lookup word or phrase…"
              className="w-full rounded border border-border px-3 py-2 text-sm"
            />
            <div className="flex flex-wrap gap-1">
              <span className="text-[10px] text-muted self-center mr-1">Frequent:</span>
              {priorityEntries().map((e) => (
                <button
                  key={e.term}
                  type="button"
                  onClick={() => setWordPhrase(e.term)}
                  className={`rounded-full border px-2 py-0.5 text-[11px] ${
                    wordPhrase.toLowerCase() === e.term.toLowerCase()
                      ? "border-accent bg-accent/10 text-ink"
                      : "border-border hover:border-accent"
                  }`}
                >
                  {e.term}
                </button>
              ))}
            </div>
            {verseLexHits.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-[10px] text-muted self-center mr-1">In this verse:</span>
                {verseLexHits.map((e) => (
                  <button
                    key={e.term}
                    type="button"
                    onClick={() => setWordPhrase(e.term)}
                    className="rounded-full border border-teal/40 bg-teal-soft/40 px-2 py-0.5 text-[11px]"
                  >
                    {e.term}
                  </button>
                ))}
              </div>
            )}
            {dynamicLex.query ? (
              <div className="space-y-3 text-sm border-t border-border pt-3">
                <div className="font-serif text-lg font-semibold">“{dynamicLex.query}”</div>
                {lexiconForSelection ? (
                  <>
                    <div>
                      <div className="text-xs font-semibold text-muted uppercase">Webster 1828 (curated)</div>
                      <p className="text-ink-soft leading-relaxed">{lexiconForSelection.webster1828}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted uppercase">KJV / biblical usage</div>
                      <p className="text-ink-soft leading-relaxed">{lexiconForSelection.kjvNotes}</p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-muted uppercase">Map ambiguity</div>
                      <p className="text-ink-soft leading-relaxed">{lexiconForSelection.ambiguity}</p>
                    </div>
                    {lexiconForSelection.relatedTerms && (
                      <div className="flex flex-wrap gap-1">
                        {lexiconForSelection.relatedTerms.map((r) => (
                          <button
                            key={r}
                            type="button"
                            onClick={() => setWordPhrase(r)}
                            className="text-xs text-accent hover:underline"
                          >
                            {r}
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-xs text-muted">
                    No curated entry yet for this word — use external links below. We can promote
                    frequent lookups into the curated lexicon as you study.
                  </p>
                )}
                <div>
                  <div className="text-xs font-semibold text-muted uppercase mb-1">
                    Look up anywhere
                  </div>
                  <ul className="space-y-1">
                    {dynamicLex.external.map((x) => (
                      <li key={x.url}>
                        <a
                          href={x.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-accent hover:underline inline-flex items-center gap-1"
                        >
                          {x.label} <ExternalLink className="h-3 w-3" />
                        </a>
                        <span className="text-[10px] text-muted ml-1">{x.kind}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                {corpusConcordance.length > 0 && (
                  <div>
                    <div className="text-xs font-semibold text-muted uppercase mb-1">
                      Working corpus concordance ({corpusConcordance.length})
                    </div>
                    <ul className="max-h-28 overflow-auto space-y-1">
                      {corpusConcordance.slice(0, 12).map((h) => (
                        <li key={h.id}>
                          <button
                            type="button"
                            onClick={() => goToVerse(h)}
                            className="text-xs text-left text-accent hover:underline"
                          >
                            {h.book} {h.chapter}:{h.verse}
                          </button>
                          <span className="text-[11px] text-muted"> — {h.text.slice(0, 60)}…</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted">
                Select a word in the verse text, or click a frequent term above.
              </p>
            )}
            {lexiconInChapter.length > 0 && (
              <div className="border-t border-border pt-2">
                <div className="text-xs text-muted mb-1">Curated terms in this chapter</div>
                <div className="flex flex-wrap gap-1">
                  {lexiconInChapter.map((e) =>
                    e ? (
                      <button
                        key={e.term}
                        type="button"
                        onClick={() => setWordPhrase(e.term)}
                        className="rounded-full border border-border px-2 py-0.5 text-xs hover:border-accent"
                      >
                        {e.term}
                      </button>
                    ) : null,
                  )}
                </div>
              </div>
            )}
          </Card>

          <Card className="p-5 space-y-2">
            <h2 className="font-semibold text-sm">Your tags</h2>
            {tags.length === 0 && <p className="text-sm text-muted">None yet.</p>}
            <ul className="space-y-2 max-h-48 overflow-auto">
              {tags.map((t) => (
                <li key={t.id} className="text-sm border-b border-border/50 pb-2">
                  <button
                    type="button"
                    className="font-medium text-accent hover:underline"
                    onClick={() => {
                      setBook(t.book);
                      setChapter(t.chapter);
                      setSelectedVerse(t.verse);
                    }}
                  >
                    {t.book} {t.chapter}:{t.verse}
                  </button>
                  {t.wordPhrase && (
                    <span className="text-muted"> · “{t.wordPhrase}”</span>
                  )}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {t.tags.map((x) => (
                      <Badge key={x}>{x}</Badge>
                    ))}
                    {t.featureIds.map((f) => (
                      <Badge key={f} tone="teal">
                        {f}
                      </Badge>
                    ))}
                  </div>
                  {t.note && <p className="text-xs text-muted mt-1">{t.note}</p>}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
