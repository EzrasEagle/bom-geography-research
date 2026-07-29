import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getInsight, getModel, getVerse } from "@/data/catalog";

export const Route = createFileRoute("/verses/$verseId")({
  component: VerseDetailPage,
});

function VerseDetailPage() {
  const { verseId } = Route.useParams();
  const v = getVerse(verseId);

  if (!v) {
    return (
      <div className="space-y-3">
        <h1 className="font-serif text-2xl">Verse not found</h1>
        <Link to="/verses" className="text-accent text-sm hover:underline">
          Back to catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link to="/verses" className="text-sm text-muted hover:text-accent">
          ← All verses
        </Link>
        <h1 className="font-serif text-3xl font-semibold mt-2">
          {v.book} {v.chapter}:{v.verseStart}
        </h1>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge tone="teal">{v.plateSource.replaceAll("_", " ")}</Badge>
          <Badge>Speaker: {v.speaker}</Badge>
        </div>
      </div>

      <Card className="p-5 md:p-6">
        <p className="scripture">{v.textExcerpt}</p>
      </Card>

      <section className="space-y-2">
        <h2 className="font-semibold">Geographic clues</h2>
        <div className="space-y-2">
          {v.clues.map((c, i) => (
            <Card key={i} className="p-4">
              <div className="text-xs uppercase tracking-wide text-muted mb-1">{c.type}</div>
              <p className="text-sm text-ink-soft">{c.summary}</p>
              <div className="flex flex-wrap gap-1 mt-2">
                {c.rawTerms.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="label-claim">Model claims</span>
          <span className="text-xs text-muted">Comparative — not endorsements</span>
        </div>
        {v.modelClaims.map((c, i) => {
          const m = getModel(c.modelId);
          return (
            <Card key={i} className="p-4 space-y-2 border-l-4 border-l-claim/40">
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to="/models/$modelId"
                  params={{ modelId: c.modelId }}
                  className="font-semibold text-claim hover:underline"
                >
                  {m?.name ?? c.modelId}
                </Link>
                <Badge tone="claim">{c.confidence}</Badge>
              </div>
              <p className="text-sm text-ink">{c.claim}</p>
              <p className="text-sm text-muted">
                <span className="font-medium text-ink-soft">Why: </span>
                {c.why}
              </p>
              <ul className="text-xs text-muted list-disc pl-4">
                {c.sources.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </Card>
          );
        })}
      </section>

      {v.insightIds.length > 0 && (
        <section className="space-y-3">
          <span className="label-insight">Linked insights</span>
          {v.insightIds.map((id) => {
            const ins = getInsight(id);
            if (!ins) return null;
            return (
              <Link key={id} to="/insights/$insightId" params={{ insightId: id }} className="block">
                <Card className="p-4 border-l-4 border-l-insight/50 hover:border-border-strong">
                  <div className="font-medium text-insight">{ins.title}</div>
                  <p className="text-sm text-muted mt-1">{ins.summary}</p>
                </Card>
              </Link>
            );
          })}
        </section>
      )}

      {v.ourNotes && (
        <Card className="p-4 bg-surface-2/50">
          <div className="text-xs uppercase tracking-wide text-muted mb-1">Editorial notes</div>
          <p className="text-sm text-ink-soft">{v.ourNotes}</p>
        </Card>
      )}

      <div className="flex flex-wrap gap-1.5">
        {v.tags.map((t) => (
          <Badge key={t}>{t}</Badge>
        ))}
      </div>
    </div>
  );
}
