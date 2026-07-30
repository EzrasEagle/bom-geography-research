import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { insights } from "@/data/catalog";
import {
  deleteStudyNote,
  loadStudyNotes,
  saveStudyNotes,
  upsertStudyNote,
  type StudyNote,
  type StudyNoteSource,
} from "@/lib/study-notes";
import { placeLabel } from "@/lib/place-connections";

export const Route = createFileRoute("/insights/")({ component: InsightsPage });

type Tab = "catalog" | "study";

function InsightsPage() {
  const [tab, setTab] = useState<Tab>("study");
  const [notes, setNotes] = useState<StudyNote[]>([]);
  const [editId, setEditId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");
  const [editSources, setEditSources] = useState("");
  const [filter, setFilter] = useState("");

  useEffect(() => {
    setNotes(loadStudyNotes());
  }, []);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.term.toLowerCase().includes(q) ||
        n.body.toLowerCase().includes(q) ||
        n.sources.some((s) => s.label.toLowerCase().includes(q)),
    );
  }, [notes, filter]);

  function persist(next: StudyNote[]) {
    setNotes(next);
    saveStudyNotes(next);
  }

  function startEdit(n: StudyNote) {
    setEditId(n.id);
    setEditBody(n.body);
    setEditSources(
      n.sources.map((s) => (s.url ? `${s.label} | ${s.url}` : s.label)).join("\n"),
    );
  }

  function saveEdit() {
    if (!editId) return;
    const n = notes.find((x) => x.id === editId);
    if (!n) return;
    const sources: StudyNoteSource[] = editSources
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [label, url] = line.split("|").map((x) => x.trim());
        return { label: label || "Source", url: url || undefined, kind: "user" as const };
      });
    const result = upsertStudyNote(notes, {
      id: editId,
      term: n.term,
      body: editBody,
      sources,
      scope: n.scope,
      anchor: n.anchor,
    });
    if (result.error) return;
    persist(result.rows);
    setEditId(null);
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold">Insights</h1>
        <p className="text-sm text-ink-soft max-w-2xl">
          Catalog research plus your saved study notes (clipped dictionary text, KJV notes, custom
          annotations) keyed to terms for the Reader and Map Lab.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTab("study")}
          className={`rounded-full px-4 py-2 text-sm border ${
            tab === "study"
              ? "border-accent bg-accent text-accent-fg"
              : "border-border bg-surface text-ink-soft"
          }`}
        >
          Study notes ({notes.length})
        </button>
        <button
          type="button"
          onClick={() => setTab("catalog")}
          className={`rounded-full px-4 py-2 text-sm border ${
            tab === "catalog"
              ? "border-accent bg-accent text-accent-fg"
              : "border-border bg-surface text-ink-soft"
          }`}
        >
          Catalog insights ({insights.length})
        </button>
      </div>

      {tab === "study" && (
        <div className="space-y-4">
          <Card className="p-4 space-y-2">
            <p className="text-sm text-ink-soft leading-relaxed">
              Save clips from the Reader dictionary (e.g. wilderness KJV notes). They reappear in any
              chapter containing that word, and attach to map features when linked. Edit text and
              sources here anytime.
            </p>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by term or text…"
              className="w-full max-w-md rounded border border-border px-3 py-2 text-sm"
            />
          </Card>

          {filtered.length === 0 && (
            <p className="text-sm text-muted">
              No study notes yet. In the Reader, open Dictionary → <strong>Save to study notes</strong>{" "}
              on a definition block.
            </p>
          )}

          {filtered.map((n) => (
            <Card key={n.id} className="p-5 space-y-2 border-l-4 border-l-teal/50">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-semibold text-lg">{n.term}</h2>
                <Badge tone="teal">{n.origin}</Badge>
                <Badge>{n.scope ?? "term"}</Badge>
                {n.featureIds.map((f) => (
                  <Badge key={f} tone="claim">
                    map: {placeLabel(f)}
                  </Badge>
                ))}
              </div>

              {editId === n.id ? (
                <div className="space-y-2">
                  <label className="block text-xs text-muted">
                    Note text (edit freely)
                    <textarea
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      rows={8}
                      className="mt-1 w-full rounded border border-border px-3 py-2 text-sm font-sans"
                    />
                  </label>
                  <label className="block text-xs text-muted">
                    Sources (one per line: Label or Label | url)
                    <textarea
                      value={editSources}
                      onChange={(e) => setEditSources(e.target.value)}
                      rows={3}
                      className="mt-1 w-full rounded border border-border px-3 py-2 text-sm font-sans"
                    />
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveEdit}
                      className="rounded bg-teal px-3 py-2 text-sm text-white font-medium"
                    >
                      Save changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditId(null)}
                      className="text-sm text-muted hover:underline"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-ink-soft whitespace-pre-wrap leading-relaxed">
                    {n.body}
                  </p>
                  {n.sources.length > 0 && (
                    <div className="text-xs space-y-0.5">
                      <div className="text-muted font-semibold uppercase tracking-wide">
                        Sources
                      </div>
                      {n.sources.map((s, i) =>
                        s.url ? (
                          <a
                            key={i}
                            href={s.url}
                            target="_blank"
                            rel="noreferrer"
                            className="block text-accent hover:underline"
                          >
                            {s.label}
                          </a>
                        ) : (
                          <div key={i} className="text-muted">
                            {s.label}
                          </div>
                        ),
                      )}
                    </div>
                  )}
                  <div className="flex gap-3 text-sm pt-1">
                    <button
                      type="button"
                      className="text-accent hover:underline"
                      onClick={() => startEdit(n)}
                    >
                      Edit text & sources
                    </button>
                    <Link
                      to="/reader"
                      search={{ q: n.term }}
                      className="text-accent hover:underline"
                    >
                      Open in Reader
                    </Link>
                    <button
                      type="button"
                      className="text-muted hover:underline"
                      onClick={() => persist(deleteStudyNote(notes, n.id))}
                    >
                      Delete
                    </button>
                  </div>
                  <p className="text-[10px] text-muted">
                    Updated {new Date(n.updatedAt).toLocaleString()}
                  </p>
                </>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === "catalog" && (
        <div className="space-y-3">
          {insights.map((ins) => (
            <Link
              key={ins.id}
              to="/insights/$insightId"
              params={{ insightId: ins.id }}
              className="block group"
            >
              <Card className="p-5 space-y-2 border-l-4 border-l-insight/40 group-hover:border-border-strong">
                <div className="flex flex-wrap gap-2">
                  <Badge tone="insight">{ins.category}</Badge>
                  <Badge>{ins.confidence}</Badge>
                </div>
                <h2 className="font-semibold">{ins.title}</h2>
                <p className="text-sm text-muted">{ins.summary}</p>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
