import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { verses, evidenceDomains } from "@/data/catalog";

export const Route = createFileRoute("/reader/")({ component: ReaderPage });

type UserTag = {
  id: string;
  book: string;
  chapter: number;
  verse: number;
  tags: string[];
  note: string;
  domain: string;
  scope: "personal" | "suggest_shared";
  createdAt: string;
};

const STORAGE_KEY = "bom-atlas-reader-tags-v1";

const SAMPLE_CHAPTER = {
  book: "1 Nephi",
  chapter: 18,
  // Short public-domain-friendly excerpts / paraphrases for demo; full modern text is copyrighted.
  // Users should study full chapters via official sources; tags attach to references.
  verses: [
    { v: 22, text: "…they did worship the Lord, and did go forth with thanksgiving…" },
    {
      v: 23,
      text: "And it came to pass that after we had sailed for the space of many days we did arrive at the promised land; and we went forth upon the land, and did pitch our tents; and we did call it the promised land.",
    },
    {
      v: 24,
      text: "And it came to pass that we did begin to till the earth, and we began to plant seeds; yea, we did put all our seeds into the earth, which we had brought from the land of Jerusalem. And it came to pass that they did grow exceedingly; wherefore, we were blessed in abundance.",
    },
    {
      v: 25,
      text: "And it came to pass that we did find upon the land of promise, as we journeyed in the wilderness, that there were beasts in the forests of every kind… and we did find all manner of ore, both of gold, and of silver, and of copper.",
    },
  ],
};

const SUGGESTED_TAGS = [
  "landing",
  "voyage",
  "seed-grow",
  "climate",
  "ore",
  "animals",
  "promised-land",
  "small-plates",
  "high-signal",
];

function ReaderPage() {
  const [tags, setTags] = useState<UserTag[]>([]);
  const [selectedVerse, setSelectedVerse] = useState(23);
  const [note, setNote] = useState("");
  const [domain, setDomain] = useState("textual_geography");
  const [picked, setPicked] = useState<string[]>(["landing"]);
  const [scope, setScope] = useState<"personal" | "suggest_shared">("personal");

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

  const catalogHits = useMemo(
    () => verses.filter((v) => v.book === SAMPLE_CHAPTER.book && v.chapter === SAMPLE_CHAPTER.chapter),
    [],
  );

  function toggleTag(t: string) {
    setPicked((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function saveTag() {
    const row: UserTag = {
      id: `${Date.now()}`,
      book: SAMPLE_CHAPTER.book,
      chapter: SAMPLE_CHAPTER.chapter,
      verse: selectedVerse,
      tags: picked,
      note,
      domain,
      scope,
      createdAt: new Date().toISOString(),
    };
    setTags((prev) => [row, ...prev]);
    setNote("");
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold">Scripture reader + tagging</h1>
        <p className="text-sm text-ink-soft max-w-2xl leading-relaxed">
          Read by reference, attach geographic and multi-domain tags, and keep them personal or mark them
          as suggested shared tags. Full modern Church edition text is copyrighted—this demo uses sample
          verses already in our research excerpts. Hook an official study link or public-domain 1830
          pipeline in a later phase.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">
              {SAMPLE_CHAPTER.book} {SAMPLE_CHAPTER.chapter}
            </h2>
            <Badge tone="teal">Sample chapter · seed</Badge>
          </div>
          <div className="space-y-3">
            {SAMPLE_CHAPTER.verses.map((row) => {
              const active = selectedVerse === row.v;
              const inCatalog = catalogHits.some((c) => c.verseStart === row.v);
              return (
                <button
                  key={row.v}
                  type="button"
                  onClick={() => setSelectedVerse(row.v)}
                  className={`w-full text-left rounded-[var(--radius)] border p-3 transition-colors ${
                    active ? "border-accent bg-orange-50/50" : "border-border bg-surface hover:bg-surface-2"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-muted">v{row.v}</span>
                    {inCatalog && <Badge tone="claim">in catalog</Badge>}
                  </div>
                  <p className="scripture text-sm">{row.text}</p>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-muted">
            Official study:{" "}
            <a
              className="text-accent hover:underline"
              href="https://www.churchofjesuschrist.org/study/scriptures/bofm"
              target="_blank"
              rel="noreferrer"
            >
              churchofjesuschrist.org scriptures
            </a>
          </p>
        </Card>

        <div className="space-y-4">
          <Card className="p-5 space-y-3">
            <h2 className="font-semibold">
              Tag {SAMPLE_CHAPTER.book} {SAMPLE_CHAPTER.chapter}:{selectedVerse}
            </h2>
            <label className="block text-sm space-y-1">
              <span className="text-muted">Evidence domain</span>
              <select
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                className="w-full rounded-[var(--radius)] border border-border bg-surface px-3 py-2 text-sm"
              >
                {evidenceDomains.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
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
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Why is this relevant? Optional note…"
              rows={3}
              className="w-full rounded-[var(--radius)] border border-border bg-surface px-3 py-2 text-sm"
            />
            <div className="flex flex-wrap gap-3 text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  checked={scope === "personal"}
                  onChange={() => setScope("personal")}
                />
                Personal only
              </label>
              <label className="inline-flex items-center gap-2">
                <input
                  type="radio"
                  checked={scope === "suggest_shared"}
                  onChange={() => setScope("suggest_shared")}
                />
                Suggest for shared model
              </label>
            </div>
            <button
              type="button"
              onClick={saveTag}
              className="rounded-[var(--radius)] bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg"
            >
              Save tag
            </button>
          </Card>

          <Card className="p-5 space-y-2">
            <h2 className="font-semibold text-sm">Your tags (this browser)</h2>
            {tags.length === 0 && <p className="text-sm text-muted">None yet.</p>}
            <ul className="space-y-2 max-h-64 overflow-auto">
              {tags.map((t) => (
                <li key={t.id} className="text-sm border-b border-border/50 pb-2">
                  <span className="font-medium">
                    {t.book} {t.chapter}:{t.verse}
                  </span>{" "}
                  <Badge>{t.scope}</Badge>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {t.tags.map((x) => (
                      <Badge key={x}>{x}</Badge>
                    ))}
                  </div>
                  {t.note && <p className="text-muted mt-1">{t.note}</p>}
                </li>
              ))}
            </ul>
            <Link to="/verses" className="text-sm text-accent hover:underline">
              Open formal verse catalog →
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
