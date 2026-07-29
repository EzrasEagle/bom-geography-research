import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Search } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { evidenceDomains, places, verses } from "@/data/catalog";
import { getPlaceDossier } from "@/data/place-scripture";
import {
  booksInCorpus,
  chaptersForBook,
  corpus,
  searchWord,
  versesFor,
  versesForFeature,
  type CorpusVerse,
} from "@/data/scripture-corpus";

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
  /** Optional word span within the verse text */
  wordPhrase?: string;
  tags: string[];
  note: string;
  domain: string;
  /** Map feature association */
  featureIds: string[];
  scope: "personal" | "suggest_shared";
  createdAt: string;
};

const STORAGE_KEY = "bom-atlas-reader-tags-v2";

const SUGGESTED_TAGS = [
  "landing",
  "voyage",
  "seed-grow",
  "climate",
  "whirlwind",
  "storm",
  "seasons",
  "agriculture",
  "war-timing",
  "ore",
  "animals",
  "promised-land",
  "narrow-neck",
  "high-signal",
  "conflict-candidate",
];

function ReaderPage() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();

  const books = booksInCorpus();
  const [book, setBook] = useState(search.book ?? "1 Nephi");
  const [chapter, setChapter] = useState(search.chapter ?? 18);
  const [selectedVerse, setSelectedVerse] = useState(search.verse ?? 23);
  const [wordQuery, setWordQuery] = useState(search.q ?? "");
  const [activeFeature, setActiveFeature] = useState(search.feature ?? "");
  const [tags, setTags] = useState<UserTag[]>([]);
  const [note, setNote] = useState("");
  const [domain, setDomain] = useState(
    search.feature?.startsWith("climate") ? "climate_botany" : "textual_geography",
  );
  const [picked, setPicked] = useState<string[]>(
    search.feature?.includes("whirlwind")
      ? ["whirlwind", "climate"]
      : search.feature
        ? ["high-signal"]
        : ["landing"],
  );
  const [wordPhrase, setWordPhrase] = useState(search.q ?? "");
  const [scope, setScope] = useState<"personal" | "suggest_shared">("personal");
  const [featurePick, setFeaturePick] = useState<string[]>(
    search.feature ? [search.feature] : [],
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setTags(JSON.parse(raw) as UserTag[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tags));
  }, [tags]);

  // Sync from URL when deep-linked
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

  const catalogHit = useMemo(() => {
    if (!current) return undefined;
    return verses.find(
      (v) =>
        v.book === current.book &&
        v.chapter === current.chapter &&
        v.verseStart === current.verse,
    );
  }, [current]);

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

  function toggleTag(t: string) {
    setPicked((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function toggleFeature(id: string) {
    setFeaturePick((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
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

  const featureOptions = places.map((p) => ({
    id: p.id,
    name: p.name,
    climate: p.id.startsWith("climate"),
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold">Reader · tag · word index</h1>
        <p className="text-sm text-ink-soft max-w-3xl leading-relaxed">
          Read working excerpts, jump by <strong className="text-ink">word index</strong> (every hit
          for “Zarahemla”, “whirlwind”…), open official full chapters, and tag verses/phrases with{" "}
          <strong className="text-ink">map features</strong> (cities, seas, climate, seasons). Tags
          stay in this browser and feed model work.
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
            onKeyDown={(e) => {
              if (e.key === "Enter") runWordSearch(wordQuery);
            }}
            placeholder='Search corpus: Zarahemla, Sidon, whirlwind, grain…'
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
          {["Zarahemla", "Sidon", "Bountiful", "Cumorah", "whirlwind", "tempest", "seasons", "grain", "narrow"].map(
            (w) => (
              <button
                key={w}
                type="button"
                onClick={() => runWordSearch(w)}
                className="rounded-full border border-border px-2.5 py-1 text-xs hover:bg-surface-2"
              >
                {w}
              </button>
            ),
          )}
        </div>
        {wordQuery.trim() && (
          <div className="max-h-48 overflow-auto space-y-1 border-t border-border pt-2">
            <p className="text-xs text-muted">
              {wordHits.length} hit{wordHits.length === 1 ? "" : "s"} in working corpus (
              {corpus.length} verses loaded)
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
                <span className="text-ink-soft"> — {h.text.slice(0, 100)}…</span>
              </button>
            ))}
            {wordHits.length === 0 && (
              <p className="text-xs text-muted">
                No corpus hit. Expand scripture-corpus.ts while indexing, or open official text by
                reference.
              </p>
            )}
          </div>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        {/* Chapter reader */}
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
                {chapterList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            {current && (
              <a
                href={current.studyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-accent hover:underline ml-auto"
              >
                Full official chapter <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </div>

          {activeFeature && (
            <div className="rounded-[var(--radius)] bg-teal-soft/50 border border-teal/20 p-3 text-sm space-y-1">
              <div className="font-medium text-teal">
                Linked feature: {getPlaceDossier(activeFeature)?.name ?? activeFeature}
              </div>
              <p className="text-xs text-muted">
                {featureHits.length} corpus verses pre-associated · tags can attach more
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/map-lab/feature/$featureId"
                  params={{ featureId: activeFeature }}
                  className="text-xs text-accent hover:underline"
                >
                  Feature dossier →
                </Link>
                <Link to="/map-lab" className="text-xs text-accent hover:underline">
                  Map Lab →
                </Link>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {chapterVerses.length === 0 && (
              <p className="text-sm text-muted">
                No excerpts for this chapter in the working corpus yet. Use word index or open the
                official text, then tag by reference when we add the verse.
              </p>
            )}
            {chapterVerses.map((row) => {
              const active = selectedVerse === row.verse;
              const inCatalog = verses.some(
                (v) =>
                  v.book === row.book && v.chapter === row.chapter && v.verseStart === row.verse,
              );
              return (
                <button
                  key={row.id}
                  type="button"
                  onClick={() => goToVerse(row)}
                  className={`w-full text-left rounded-[var(--radius)] border p-3 transition-colors ${
                    active ? "border-accent bg-orange-50/50" : "border-border bg-surface hover:bg-surface-2"
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-muted">v{row.verse}</span>
                    {inCatalog && <Badge tone="claim">catalog</Badge>}
                    {row.featureIds?.map((f) => (
                      <Badge key={f} tone="teal">
                        {f.replace("climate-", "")}
                      </Badge>
                    ))}
                  </div>
                  <p className="scripture text-sm">{row.text}</p>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Tagging panel */}
        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <h2 className="font-semibold">
              Tag{" "}
              {current
                ? `${current.book} ${current.chapter}:${current.verse}`
                : "a verse"}
            </h2>
            <label className="block text-sm space-y-1">
              <span className="text-muted">Word / phrase in verse (optional)</span>
              <input
                value={wordPhrase}
                onChange={(e) => setWordPhrase(e.target.value)}
                className="w-full rounded border border-border px-3 py-2 text-sm"
                placeholder="e.g. Zarahemla, whirlwind"
              />
            </label>
            <label className="block text-sm space-y-1">
              <span className="text-muted">Evidence domain</span>
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
            <div>
              <div className="text-xs text-muted mb-1">Tags</div>
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
              </div>
            </div>
            <div>
              <div className="text-xs text-muted mb-1">Associate map features (cities, climate…)</div>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-auto">
                {featureOptions.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => toggleFeature(f.id)}
                    className={`rounded-full px-2.5 py-1 text-xs border ${
                      featurePick.includes(f.id)
                        ? f.climate
                          ? "border-teal bg-teal text-white"
                          : "border-accent bg-accent text-accent-fg"
                        : "border-border bg-chip text-ink-soft"
                    }`}
                  >
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why tag this? Conflict with a model? Seasonal war pause?"
              rows={3}
              className="w-full rounded border border-border px-3 py-2 text-sm"
            />
            <div className="flex flex-wrap gap-3 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  checked={scope === "personal"}
                  onChange={() => setScope("personal")}
                />
                Personal
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  checked={scope === "suggest_shared"}
                  onChange={() => setScope("suggest_shared")}
                />
                Suggest shared
              </label>
            </div>
            <button
              type="button"
              onClick={saveTag}
              disabled={!current}
              className="rounded-[var(--radius)] bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg disabled:opacity-50"
            >
              Save tag
            </button>
            {catalogHit && (
              <Link
                to="/verses/$verseId"
                params={{ verseId: catalogHit.id }}
                className="block text-sm text-accent hover:underline"
              >
                Open comparative catalog ({catalogHit.modelClaims.length} model claims) →
              </Link>
            )}
            {current && (
              <a
                href={current.studyUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
              >
                Official full text for this verse <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </Card>

          <Card className="p-5 space-y-2">
            <h2 className="font-semibold text-sm">Your tags (this browser)</h2>
            {tags.length === 0 && <p className="text-sm text-muted">None yet.</p>}
            <ul className="space-y-2 max-h-56 overflow-auto">
              {tags.map((t) => (
                <li key={t.id} className="text-sm border-b border-border/50 pb-2">
                  <button
                    type="button"
                    className="font-medium text-accent hover:underline"
                    onClick={() =>
                      goToVerse({
                        id: "",
                        book: t.book,
                        chapter: t.chapter,
                        verse: t.verse,
                        text: "",
                        studyUrl: "",
                      })
                    }
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
                  {t.note && <p className="text-muted mt-1 text-xs">{t.note}</p>}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card className="p-4 text-xs text-muted space-y-1">
        <p>
          Working corpus: {corpus.length} verses (excerpts for research). Full chapters via official
          links. Add verses to <code className="bg-surface-2 px-1 rounded">src/data/scripture-corpus.ts</code>{" "}
          as you index models — the word index grows automatically.
        </p>
      </Card>
    </div>
  );
}
