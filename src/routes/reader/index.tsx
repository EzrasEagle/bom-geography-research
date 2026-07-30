import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { BookOpen, ExternalLink, Link2, Search, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { places } from "@/data/catalog";
import { getPlaceDossier } from "@/data/place-scripture";
import {
  dynamicLexiconLookup,
  lexiconHitsInText,
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
import {
  classifyNode,
  guessFeaturesForPhrase,
  parseDistanceSpan,
  parseTimeSpan,
  smartSuggestionsForVerse,
  type ConnectionDraftNode,
} from "@/lib/reader-smart";

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
  wordPhrase?: string;
  tags: string[];
  note: string;
  domain: string;
  featureIds: string[];
  scope: "personal" | "suggest_shared";
  createdAt: string;
};

const STORAGE_KEY = "bom-atlas-reader-tags-v3";

function ReaderPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const books = booksInCorpus();
  const [book, setBook] = useState(search.book ?? "1 Nephi");
  const [chapter, setChapter] = useState(search.chapter ?? 18);
  const [selectedVerse, setSelectedVerse] = useState(search.verse ?? 25);
  const [wordQuery, setWordQuery] = useState(search.q ?? "");
  const [activeFeature, setActiveFeature] = useState(search.feature ?? "");
  const [tags, setTags] = useState<UserTag[]>([]);
  const [userAssocs, setUserAssocs] = useState<UserAssociation[]>([]);
  const [acceptedFlash, setAcceptedFlash] = useState<string | null>(null);
  const [hoverVerse, setHoverVerse] = useState<number | null>(null);

  // Connection builder (simple)
  const [hubId, setHubId] = useState("landing");
  const [nodes, setNodes] = useState<ConnectionDraftNode[]>([]);
  const [connKind, setConnKind] = useState<"proximity" | "path" | "contains">("contains");
  const [selectionFlash, setSelectionFlash] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY) ??
        localStorage.getItem("bom-atlas-reader-tags-v2");
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
    if (search.q) setWordQuery(search.q);
    if (search.feature) setActiveFeature(search.feature);
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

  const smartForCurrent = useMemo(() => {
    if (!current) return [];
    return smartSuggestionsForVerse(current.text, tags);
  }, [current, tags]);

  /** Already tagged phrases on this verse (don't re-suggest as new) */
  const taggedPhrasesOnVerse = useMemo(() => {
    const set = new Set<string>();
    for (const t of tagsOnVerse.get(selectedVerse) ?? []) {
      if (t.wordPhrase) set.add(t.wordPhrase.toLowerCase());
      for (const x of t.tags) set.add(x.toLowerCase());
    }
    return set;
  }, [tagsOnVerse, selectedVerse]);

  const pendingSmart = smartForCurrent.filter(
    (s) => !taggedPhrasesOnVerse.has(s.phrase.toLowerCase()),
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

  const selectionTime = useMemo(() => {
    const texts = [
      current?.text ?? "",
      ...nodes.map((n) => n.label),
    ].join(" ");
    return parseTimeSpan(texts);
  }, [current, nodes]);

  const selectionDistance = useMemo(() => {
    const texts = [current?.text ?? "", ...nodes.map((n) => n.label)].join(" ");
    return parseDistanceSpan(texts);
  }, [current, nodes]);

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

  function addNodeFromPhrase(phrase: string, ref?: string) {
    const trimmed = phrase.trim();
    if (!trimmed || trimmed.length > 80) return;
    const feats = guessFeaturesForPhrase(trimmed);
    const featureId = feats[0];
    const node: ConnectionDraftNode = {
      id: `n-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      label: trimmed,
      featureId,
      ref,
      kind: classifyNode(trimmed, featureId),
    };
    setNodes((prev) => {
      if (prev.some((p) => p.label.toLowerCase() === trimmed.toLowerCase())) return prev;
      return [...prev, node];
    });
    setSelectionFlash(trimmed);
    window.setTimeout(() => setSelectionFlash(null), 1200);
  }

  function onTextSelect() {
    const sel = window.getSelection()?.toString().trim();
    if (!sel || sel.length < 2 || sel.length > 80) return;
    const ref = current
      ? `${current.book} ${current.chapter}:${current.verse}`
      : undefined;
    addNodeFromPhrase(sel, ref);
  }

  function acceptSmartTag(phrase: string, featureIds: string[]) {
    if (!current) return;
    const feats = featureIds.length ? featureIds : guessFeaturesForPhrase(phrase);
    const row: UserTag = {
      id: `${Date.now()}`,
      book: current.book,
      chapter: current.chapter,
      verse: current.verse,
      wordPhrase: phrase,
      tags: [phrase],
      note: "Smart tag suggestion accepted",
      domain: "textual_geography",
      featureIds: feats,
      scope: "personal",
      createdAt: new Date().toISOString(),
    };
    setTags((prev) => [row, ...prev]);
    addNodeFromPhrase(phrase, `${current.book} ${current.chapter}:${current.verse}`);
  }

  function acceptAllSmart() {
    for (const s of pendingSmart) {
      acceptSmartTag(s.phrase, s.featureIds);
    }
  }

  function oneClickAccept(sug: AssociationSuggestion) {
    const row = acceptSuggestion(sug, {
      pathDistance: { quality: "unknown", note: "Marked unknown from source verse" },
      pathTime: { quality: "unknown", note: "Marked unknown from source verse" },
    });
    const next = [row, ...userAssocs.filter((a) => a.sourceSuggestionId !== sug.id)];
    setUserAssocs(next);
    saveAssociations(next);
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

  /** Build hub → each node connections (and path time if parsed) */
  function createConnectionFromBuilder() {
    if (!current || nodes.length === 0) return;

    const hubPlace = places.find((p) => p.id === hubId);
    const hubLabel = hubPlace?.name ?? hubId;
    const time =
      selectionTime ??
      ({ quality: "unknown" as const, note: "Not stated or not recognized" });
    const distance =
      selectionDistance ??
      ({ quality: "unknown" as const, note: "Not stated or not recognized" });

    const kindMap = {
      proximity: "proximity" as const,
      path: "path" as const,
      contains: "proximity" as const,
    };

    const legs = nodes
      .filter((n) => n.kind !== "time")
      .map((n) => ({
        fromFeatureId: hubId,
        toFeatureId: n.featureId ?? n.label.toLowerCase().replace(/\s+/g, "-"),
        viaPhrase: n.label,
        kind: kindMap[connKind],
        distance: { ...distance },
        time: { ...time },
        elevation: "unknown" as const,
      }));

    // If path + time node exists, also try from→hub path using first place-like and time
    const timeNode = nodes.find((n) => n.kind === "time");
    if (connKind === "path" && timeNode) {
      // already applied time to legs
    }

    const title =
      connKind === "path"
        ? `${hubLabel} path via ${nodes.map((n) => n.label).join(" · ")}`
        : connKind === "contains"
          ? `${hubLabel} contains / near: ${nodes.map((n) => n.label).join(", ")}`
          : `${hubLabel} proximity: ${nodes.map((n) => n.label).join(", ")}`;

    const assoc: UserAssociation = {
      id: `assoc-${Date.now()}`,
      book: current.book,
      chapter: current.chapter,
      verse: current.verse,
      title,
      legs:
        legs.length > 0
          ? legs
          : [
              {
                fromFeatureId: hubId,
                toFeatureId: hubId,
                viaPhrase: nodes[0]?.label,
                kind: "proximity",
                distance,
                time,
              },
            ],
      pathDistance: distance,
      pathTime: time,
      relatedRefs: nodes
        .filter((n) => n.ref)
        .map((n) => ({ ref: n.ref!, note: n.label })),
      tags: [
        connKind,
        hubLabel,
        ...nodes.map((n) => n.label),
        time.quality !== "unknown" ? "time-stated" : "time-unknown",
      ],
      createdAt: new Date().toISOString(),
      notes: `Built in Reader. Hub=${hubId}. Nodes=${nodes.map((n) => n.label).join("; ")}`,
    };

    const next = [assoc, ...userAssocs];
    setUserAssocs(next);
    saveAssociations(next);

    // Tags on verse for each node
    setTags((prev) => [
      {
        id: `${Date.now()}`,
        book: current.book,
        chapter: current.chapter,
        verse: current.verse,
        wordPhrase: nodes[0]?.label,
        tags: [connKind, hubLabel, ...nodes.map((n) => n.label)],
        note: title,
        domain: "textual_geography",
        featureIds: [
          hubId,
          ...nodes.map((n) => n.featureId).filter(Boolean) as string[],
        ],
        scope: "personal",
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    setNodes([]);
    setAcceptedFlash("builder");
    window.setTimeout(() => setAcceptedFlash(null), 2000);
  }

  const placeOptions = places.filter((p) =>
    ["land", "city", "other", "wilderness", "sea", "river", "hill"].includes(p.kind) ||
    ["landing", "promised-land", "wilderness", "forests", "beasts", "ore", "voyage"].includes(
      p.id,
    ),
  );

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="font-serif text-3xl font-semibold">Reader</h1>
        <p className="text-sm text-ink-soft max-w-3xl leading-relaxed">
          Select words in a verse to stage a connection. Smart suggestions reuse tags you already
          accepted (e.g. <em>wilderness</em>). Build{" "}
          <strong className="text-ink">hub → items</strong> (place + forests/beasts/ore) or a{" "}
          <strong className="text-ink">path with time</strong> (“space of many days”).
        </p>
      </div>

      {/* Word index — compact */}
      <Card className="p-3 space-y-2">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold shrink-0">
            <Search className="h-4 w-4 text-accent" />
            Word index
          </div>
          <input
            value={wordQuery}
            onChange={(e) => setWordQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runWordSearch(wordQuery)}
            placeholder="Zarahemla, wilderness, promised land…"
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
          <div className="max-h-32 overflow-auto space-y-1 border-t border-border pt-2">
            <p className="text-xs text-muted">
              {wordHits.length} hits · {corpus.length} corpus verses
            </p>
            {wordHits.slice(0, 40).map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => goToVerse(h)}
                className={`w-full text-left text-sm rounded px-2 py-1 hover:bg-surface-2 ${
                  current?.id === h.id ? "bg-orange-50 border border-accent/30" : ""
                }`}
              >
                <span className="font-medium text-accent">
                  {h.book} {h.chapter}:{h.verse}
                </span>
                <span className="text-ink-soft"> — {h.text.slice(0, 90)}…</span>
              </button>
            ))}
          </div>
        )}
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.85fr]">
        {/* Chapter */}
        <Card className="p-5 space-y-3">
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
            Select any words → they drop into the connection tray on the right. Click a smart
            suggestion to tag + stage in one step.
          </p>

          {activeFeature && (
            <div className="rounded-[var(--radius)] bg-teal-soft/50 border border-teal/20 p-2 text-sm">
              Feature filter:{" "}
              <strong>{getPlaceDossier(activeFeature)?.name ?? activeFeature}</strong>
              <span className="text-muted"> · {featureHits.length} verses</span>
            </div>
          )}

          <div className="space-y-2 max-h-[70vh] overflow-auto pr-1" onMouseUp={onTextSelect}>
            {chapterVerses.length === 0 && (
              <p className="text-sm text-muted">
                Full text for this chapter not loaded yet. Use Word index or official link.
              </p>
            )}
            {chapterVerses.map((row) => {
              const active = selectedVerse === row.verse;
              const vt = tagsOnVerse.get(row.verse) ?? [];
              const hasTag = vt.length > 0;
              const highlighted =
                wordQuery.trim() &&
                row.text.toLowerCase().includes(wordQuery.trim().toLowerCase());
              const rowSmart = smartSuggestionsForVerse(row.text, tags).filter((s) => {
                const phrases = new Set(
                  (tagsOnVerse.get(row.verse) ?? []).flatMap((t) => [
                    ...(t.wordPhrase ? [t.wordPhrase.toLowerCase()] : []),
                    ...t.tags.map((x) => x.toLowerCase()),
                  ]),
                );
                return !phrases.has(s.phrase.toLowerCase());
              });

              return (
                <div
                  key={row.id}
                  className={`relative rounded-[var(--radius)] border p-3 transition-colors ${
                    active
                      ? "border-accent bg-orange-50/60"
                      : hasTag
                        ? "border-teal/40 bg-teal-soft/20"
                        : "border-border bg-surface hover:bg-surface-2"
                  } ${highlighted ? "ring-1 ring-accent/30" : ""}`}
                  onMouseEnter={() => setHoverVerse(row.verse)}
                  onMouseLeave={() => setHoverVerse((h) => (h === row.verse ? null : h))}
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
                      {hasTag && (
                        <Badge tone="teal">
                          {vt.length} tag{vt.length > 1 ? "s" : ""}
                        </Badge>
                      )}
                      {vt
                        .flatMap((t) => (t.wordPhrase ? [t.wordPhrase] : t.tags.slice(0, 1)))
                        .slice(0, 4)
                        .map((x) => (
                          <Badge key={x}>{x}</Badge>
                        ))}
                      {row.featureIds?.map((f) => (
                        <Badge key={f} tone="claim">
                          {f}
                        </Badge>
                      ))}
                    </div>
                    <p className="scripture text-[15px] leading-relaxed select-text">{row.text}</p>
                  </div>

                  {rowSmart.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="text-[10px] text-muted uppercase tracking-wide self-center">
                        Suggest
                      </span>
                      {rowSmart.slice(0, 6).map((s) => (
                        <button
                          key={s.phrase}
                          type="button"
                          onClick={() => {
                            setSelectedVerse(row.verse);
                            acceptSmartTag(s.phrase, s.featureIds);
                          }}
                          className="rounded-full border border-accent/40 bg-orange-50 px-2 py-0.5 text-[11px] text-accent hover:bg-accent hover:text-accent-fg"
                          title={
                            s.priorCount
                              ? `Used in ${s.priorCount} of your tags`
                              : "Seed phrase in this verse"
                          }
                        >
                          + {s.phrase}
                          {s.priorCount > 0 ? ` (${s.priorCount})` : ""}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>

        {/* Right: simplified tools */}
        <div className="space-y-4">
          {/* Smart summary for selected verse */}
          <Card className="p-4 space-y-2 border-accent/25">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-accent" />
              Smart tags
              {current && (
                <span className="text-muted font-normal">
                  · {current.book} {current.chapter}:{current.verse}
                </span>
              )}
            </h2>
            {pendingSmart.length === 0 ? (
              <p className="text-xs text-muted">
                No new suggestions (all known phrases already tagged, or none matched).
              </p>
            ) : (
              <>
                <div className="flex flex-wrap gap-1.5">
                  {pendingSmart.map((s) => (
                    <button
                      key={s.phrase}
                      type="button"
                      onClick={() => acceptSmartTag(s.phrase, s.featureIds)}
                      className={`rounded-full px-2.5 py-1 text-xs border ${
                        s.source === "your_tags"
                          ? "border-teal bg-teal-soft/40 text-teal-900"
                          : "border-border bg-chip"
                      }`}
                    >
                      + {s.phrase}
                      {s.priorCount > 0 && (
                        <span className="text-muted"> · used {s.priorCount}×</span>
                      )}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={acceptAllSmart}
                  className="text-xs text-accent hover:underline"
                >
                  Accept all suggestions
                </button>
              </>
            )}
          </Card>

          {/* Connection builder */}
          <Card className="p-4 space-y-3 border-teal/30">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <Link2 className="h-4 w-4 text-teal" />
              Build connection
            </h2>
            <p className="text-[11px] text-muted leading-relaxed">
              <strong>Hub</strong> = place/land (e.g. promised land).{" "}
              <strong>Items</strong> = what is near/in/along it (wilderness, forests, beasts, ore)
              or path phrases (sailed, space of many days). Select text in the verse to add items.
            </p>

            <label className="block text-xs space-y-1">
              <span className="text-muted">Hub (place / land)</span>
              <select
                value={hubId}
                onChange={(e) => setHubId(e.target.value)}
                className="w-full rounded border border-border bg-surface px-2 py-2 text-sm"
              >
                {placeOptions.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.kind})
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs space-y-1">
              <span className="text-muted">Connection type</span>
              <select
                value={connKind}
                onChange={(e) =>
                  setConnKind(e.target.value as "proximity" | "path" | "contains")
                }
                className="w-full rounded border border-border bg-surface px-2 py-2 text-sm"
              >
                <option value="contains">Contains / found in (land → resources)</option>
                <option value="proximity">Proximity (near)</option>
                <option value="path">Path / travel (with time if recognized)</option>
              </select>
            </label>

            <div>
              <div className="text-xs text-muted mb-1.5">
                Staged items {selectionFlash && (
                  <span className="text-accent">· added “{selectionFlash}”</span>
                )}
              </div>
              {nodes.length === 0 ? (
                <p className="text-xs text-muted border border-dashed border-border rounded p-3">
                  Select words in the chapter, or click a smart tag. Example for 1 Ne 18:25:
                  wilderness, forests, beasts, ore → hub “Promised land”.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {nodes.map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setNodes((prev) => prev.filter((x) => x.id !== n.id))}
                      className={`rounded-full px-2.5 py-1 text-xs border ${
                        n.kind === "time"
                          ? "border-accent bg-orange-50"
                          : n.kind === "resource"
                            ? "border-teal bg-teal-soft/30"
                            : "border-border bg-chip"
                      }`}
                      title="Click to remove"
                    >
                      {n.kind === "time" ? "⏱ " : n.kind === "resource" ? "· " : ""}
                      {n.label}
                      {n.featureId ? ` → ${n.featureId}` : ""}
                      <span className="text-muted"> ×</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auto time/distance */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              <Badge tone={selectionTime ? "teal" : "claim"}>
                Time: {selectionTime ? spanLabel(selectionTime) : "unknown"}
              </Badge>
              <Badge tone={selectionDistance ? "teal" : "claim"}>
                Distance: {selectionDistance ? spanLabel(selectionDistance) : "unknown"}
              </Badge>
            </div>
            {selectionTime?.note && (
              <p className="text-[11px] text-muted">{selectionTime.note}</p>
            )}

            <button
              type="button"
              disabled={!current || nodes.length === 0}
              onClick={createConnectionFromBuilder}
              className="w-full rounded-[var(--radius)] bg-teal px-3 py-2.5 text-sm font-medium text-white disabled:opacity-50"
            >
              {acceptedFlash === "builder"
                ? "Connection saved"
                : "Create connection (hub → items)"}
            </button>
            <Link to="/map-lab" className="block text-center text-xs text-accent hover:underline">
              Open Map Lab to see corridors →
            </Link>
          </Card>

          {/* Quick path suggestions (existing) */}
          {verseSuggestions.length > 0 && (
            <Card className="p-4 space-y-2">
              <h2 className="font-semibold text-sm">Path suggestions</h2>
              {verseSuggestions.map((sug) => {
                const already = userAssocs.some((a) => a.sourceSuggestionId === sug.id);
                return (
                  <div
                    key={sug.id}
                    className="rounded border border-border p-2.5 space-y-1.5 text-xs"
                  >
                    <div className="font-medium text-sm">{sug.title}</div>
                    <p className="text-ink-soft">{sug.summary}</p>
                    <button
                      type="button"
                      disabled={already}
                      onClick={() => oneClickAccept(sug)}
                      className="w-full rounded bg-accent px-2 py-2 text-accent-fg font-medium disabled:opacity-50"
                    >
                      {already ? "Saved" : "Create path (1 click)"}
                    </button>
                  </div>
                );
              })}
              {(current?.book === "Omni" &&
                (current.verse === 12 || current.verse === 13 || current.verse === 27)) && (
                <div className="text-[11px] text-muted space-y-0.5">
                  {NEPHI_ZARAHEMLA_TRAVEL_NOTES.map((n) => (
                    <div key={n.id}>{n.claim}</div>
                  ))}
                </div>
              )}
            </Card>
          )}

          {assocsOnVerse.length > 0 && (
            <Card className="p-4 space-y-2">
              <h2 className="font-semibold text-sm">Saved on this verse</h2>
              {assocsOnVerse.map((a) => (
                <div key={a.id} className="text-xs border border-border rounded p-2 space-y-1">
                  <div className="font-medium">{a.title}</div>
                  <div className="flex flex-wrap gap-1">
                    <Badge tone="claim">Dist: {spanLabel(a.pathDistance)}</Badge>
                    <Badge tone="claim">Time: {spanLabel(a.pathTime)}</Badge>
                  </div>
                  {a.legs.map((leg, i) => (
                    <div key={i} className="text-muted">
                      {placeLabel(leg.fromFeatureId)} → {placeLabel(leg.toFeatureId)}
                      {leg.viaPhrase ? ` (“${leg.viaPhrase}”)` : ""}
                    </div>
                  ))}
                </div>
              ))}
            </Card>
          )}

          {/* Dictionary (collapsed-simple) */}
          {current && (
            <Card className="p-4 space-y-2">
              <h2 className="font-semibold text-sm flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Dictionary
              </h2>
              <p className="text-[11px] text-muted">
                Select a word in the verse, or use a staged item label.
              </p>
              {nodes[0] && dynamicLexiconLookup(nodes[0].label).curated && (
                <div className="text-xs space-y-1">
                  <div className="font-medium">{nodes[0].label}</div>
                  <p className="text-ink-soft leading-relaxed">
                    {dynamicLexiconLookup(nodes[0].label).curated?.ambiguity}
                  </p>
                  {dynamicLexiconLookup(nodes[0].label).curated?.webster1828 && (
                    <p className="text-muted">
                      1828: {dynamicLexiconLookup(nodes[0].label).curated?.webster1828}
                    </p>
                  )}
                </div>
              )}
              {!nodes[0] && lexiconHitsInText(current.text)[0] && (
                <div className="text-xs">
                  <span className="font-medium">
                    {lexiconHitsInText(current.text)[0]!.term}:
                  </span>{" "}
                  {lexiconHitsInText(current.text)[0]!.ambiguity}
                </div>
              )}
            </Card>
          )}

          {tags.length > 0 && (
            <Card className="p-3">
              <h2 className="font-semibold text-xs mb-1">Your tags ({tags.length})</h2>
              <div className="max-h-28 overflow-auto space-y-1">
                {tags.slice(0, 20).map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="block w-full text-left text-[11px] text-accent hover:underline"
                    onClick={() => {
                      setBook(t.book);
                      setChapter(t.chapter);
                      setSelectedVerse(t.verse);
                    }}
                  >
                    {t.book} {t.chapter}:{t.verse}
                    {t.wordPhrase ? ` · “${t.wordPhrase}”` : ` · ${t.tags[0]}`}
                  </button>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
