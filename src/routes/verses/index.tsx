import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { verses } from "@/data/catalog";

export const Route = createFileRoute("/verses/")({ component: VersesPage });

function VersesPage() {
  const [q, setQ] = useState("");
  const [tag, setTag] = useState<string>("all");

  const allTags = useMemo(() => {
    const s = new Set<string>();
    verses.forEach((v) => v.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, []);

  const filtered = verses.filter((v) => {
    const hay = `${v.id} ${v.book} ${v.textExcerpt} ${v.tags.join(" ")}`.toLowerCase();
    const okQ = !q || hay.includes(q.toLowerCase());
    const okTag = tag === "all" || v.tags.includes(tag);
    return okQ && okTag;
  });

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold">Verse catalog</h1>
        <p className="text-ink-soft text-sm max-w-2xl">
          Each unit is a geographic evidence record. Open a verse to see model claims and linked
          insights. Seed set starts in 1 Nephi; expand via research sessions.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search id, text, tags…"
          className="flex-1 rounded-[var(--radius)] border border-border bg-surface px-3 py-2.5 text-sm outline-none focus:border-accent"
        />
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          className="rounded-[var(--radius)] border border-border bg-surface px-3 py-2.5 text-sm"
        >
          <option value="all">All tags</option>
          {allTags.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        {filtered.map((v) => (
          <Link key={v.id} to="/verses/$verseId" params={{ verseId: v.id }} className="block group">
            <Card className="p-4 md:p-5 transition-colors group-hover:border-border-strong">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="font-semibold text-ink">
                  {v.book} {v.chapter}:{v.verseStart}
                  {v.verseEnd !== v.verseStart ? `–${v.verseEnd}` : ""}
                </span>
                <Badge>{v.plateSource.replaceAll("_", " ")}</Badge>
                <Badge tone="claim">{v.modelClaims.length} claims</Badge>
              </div>
              <p className="scripture line-clamp-2 mb-3">{v.textExcerpt}</p>
              <div className="flex flex-wrap gap-1.5">
                {v.tags.map((t) => (
                  <Badge key={t} tone="default">
                    {t}
                  </Badge>
                ))}
              </div>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted py-8 text-center">No verses match this filter.</p>
        )}
      </div>
    </div>
  );
}
