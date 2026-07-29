import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getModel, versesForModel } from "@/data/catalog";

export const Route = createFileRoute("/models/$modelId")({ component: ModelDetailPage });

function ModelDetailPage() {
  const { modelId } = Route.useParams();
  const m = getModel(modelId);
  if (!m) {
    return <p className="text-muted">Model not found.</p>;
  }
  const related = versesForModel(m.id);

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link to="/models" className="text-sm text-muted hover:text-accent">
          ← All models
        </Link>
        <h1 className="font-serif text-3xl font-semibold mt-2">{m.name}</h1>
        <div className="flex gap-2 mt-2">
          <Badge tone="accent">{m.category}</Badge>
          <Badge>{m.status}</Badge>
        </div>
      </div>

      <Card className="p-5">
        <p className="text-sm text-ink-soft leading-relaxed">{m.summary}</p>
      </Card>

      <Card className="p-5 space-y-3">
        <h2 className="font-semibold">Core map (typical)</h2>
        <dl className="grid gap-2 sm:grid-cols-2 text-sm">
          {Object.entries(m.coreMap).map(([k, val]) => (
            <div key={k} className="rounded-[var(--radius-sm)] bg-surface-2/80 p-3">
              <dt className="text-xs uppercase tracking-wide text-muted">{k}</dt>
              <dd className="text-ink-soft mt-0.5">{val}</dd>
            </div>
          ))}
        </dl>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5 space-y-2">
          <h2 className="font-semibold text-sm">Key claims</h2>
          <ul className="list-disc pl-4 text-sm text-ink-soft space-y-1">
            {m.keyClaims.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Card>
        <Card className="p-5 space-y-2">
          <h2 className="font-semibold text-sm">Strengths claimed</h2>
          <ul className="list-disc pl-4 text-sm text-ink-soft space-y-1">
            {m.strengths.map((c) => (
              <li key={c}>{c}</li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-5 space-y-2">
        <h2 className="font-semibold text-sm">Common criticisms</h2>
        <ul className="list-disc pl-4 text-sm text-ink-soft space-y-1">
          {m.criticisms.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </Card>

      <section className="space-y-2">
        <h2 className="font-semibold">Seed verses with claims for this model</h2>
        {related.length === 0 ? (
          <p className="text-sm text-muted">No seed claims yet — catalog more verses.</p>
        ) : (
          <ul className="space-y-2">
            {related.map((v) => (
              <li key={v.id}>
                <Link
                  to="/verses/$verseId"
                  params={{ verseId: v.id }}
                  className="text-sm text-accent hover:underline"
                >
                  {v.book} {v.chapter}:{v.verseStart}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
