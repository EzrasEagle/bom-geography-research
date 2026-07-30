import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  assumptionsForModel,
  getMesoamericaPack,
  getModel,
  versesForModel,
} from "@/data/catalog";

export const Route = createFileRoute("/models/$modelId")({ component: ModelDetailPage });

function ModelDetailPage() {
  const { modelId } = Route.useParams();
  const m = getModel(modelId);
  if (!m) {
    return <p className="text-muted">Model not found.</p>;
  }
  const related = versesForModel(m.id);
  const pack = m.id === "mesoamerica" ? getMesoamericaPack() : null;
  const assumptions = assumptionsForModel(m.id);

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link to="/models" className="text-sm text-muted hover:text-accent">
          ← All models
        </Link>
        <h1 className="font-serif text-3xl font-semibold mt-2">{m.name}</h1>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge tone="accent">{m.category}</Badge>
          <Badge>{m.status}</Badge>
          {pack && (
            <Badge tone="teal">
              Index grade {pack.meta.grade} · {pack.stats.verseClaims} verse claims ·{" "}
              {pack.stats.places} places
            </Badge>
          )}
        </div>
      </div>

      <Card className="p-5">
        <p className="text-sm text-ink-soft leading-relaxed">{m.summary}</p>
        {pack && (
          <p className="text-xs text-muted mt-3 leading-relaxed">{pack.meta.completenessNote}</p>
        )}
      </Card>

      <div className="flex flex-wrap gap-2">
        <Link
          to="/map-lab"
          className="rounded-[var(--radius)] bg-accent px-4 py-2 text-sm font-medium text-accent-fg"
        >
          Open in Map Lab
        </Link>
        <Link
          to="/reader"
          className="rounded-[var(--radius)] border border-border px-4 py-2 text-sm"
        >
          Reader
        </Link>
      </div>

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

      {pack && (
        <Card className="p-5 space-y-3">
          <h2 className="font-semibold">Place dictionary ({pack.places.length})</h2>
          <p className="text-xs text-muted">
            BoM name → real-world candidate in Sorenson-style tradition (confidence varies).
          </p>
          <div className="overflow-x-auto max-h-[28rem] overflow-y-auto border border-border rounded-[var(--radius)]">
            <table className="w-full text-xs text-left">
              <thead className="bg-surface-2 sticky top-0">
                <tr>
                  <th className="p-2 font-semibold">BoM</th>
                  <th className="p-2 font-semibold">Real-world candidate</th>
                  <th className="p-2 font-semibold">Conf.</th>
                </tr>
              </thead>
              <tbody>
                {pack.places.map((pl) => (
                  <tr key={pl.id} className="border-t border-border/60">
                    <td className="p-2 font-medium align-top">{pl.bomName}</td>
                    <td className="p-2 text-ink-soft align-top">
                      {pl.realWorld}
                      {pl.notes && (
                        <span className="block text-muted mt-0.5">{pl.notes}</span>
                      )}
                    </td>
                    <td className="p-2 align-top">
                      <Badge
                        tone={
                          pl.confidence === "high"
                            ? "teal"
                            : pl.confidence === "medium"
                              ? "claim"
                              : "default"
                        }
                      >
                        {pl.confidence}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

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

      <Card className="p-5 space-y-3">
        <h2 className="font-semibold">Explicit assumptions ({assumptions.length})</h2>
        <p className="text-sm text-muted">
          Load-bearing premises. Fork under My Models to toggle or replace them.
        </p>
        <ul className="space-y-2">
          {assumptions.map((a) => (
            <li key={a.id} className="text-sm rounded-[var(--radius-sm)] bg-surface-2/80 p-3">
              <span className="text-xs uppercase tracking-wide text-muted">
                {a.category} · {a.status}
              </span>
              <div className="text-ink-soft mt-0.5">{a.statement}</div>
              {"impact" in a && a.impact && (
                <div className="text-[11px] text-muted mt-1">Impact: {String(a.impact)}</div>
              )}
            </li>
          ))}
          {assumptions.length === 0 && (
            <li className="text-sm text-muted">No seed assumptions yet for this model.</li>
          )}
        </ul>
      </Card>

      {pack && (
        <Card className="p-5 space-y-3">
          <h2 className="font-semibold">Constraints ({pack.constraints.length})</h2>
          <ul className="space-y-1.5 text-xs">
            {pack.constraints.map((c) => (
              <li
                key={c.id}
                className="flex flex-wrap gap-2 items-baseline border-b border-border/50 py-1.5"
              >
                <Badge tone={c.strength === "hard" ? "teal" : "claim"}>{c.strength}</Badge>
                <span className="font-medium">
                  {c.from} → {c.to}
                </span>
                <span className="text-muted">{c.type}</span>
                <span className="text-ink-soft">{c.value}</span>
                <span className="text-muted">({c.sourceVerse})</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <section className="space-y-2">
        <h2 className="font-semibold">
          Verse claims for this model ({related.length})
        </h2>
        {related.length === 0 ? (
          <p className="text-sm text-muted">No seed claims yet — catalog more verses.</p>
        ) : (
          <ul className="space-y-2 max-h-[32rem] overflow-y-auto">
            {related.map((v) => (
              <li
                key={v.id + (v.modelClaims[0]?.claim?.slice(0, 20) ?? "")}
                className="rounded-[var(--radius)] border border-border p-3 text-sm"
              >
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="font-medium">
                    {v.book} {v.chapter}:{v.verseStart}
                  </span>
                  {v.tags?.slice(0, 4).map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
                <p className="text-ink-soft mt-1 text-xs leading-relaxed">
                  {v.modelClaims[0]?.claim ?? v.textExcerpt}
                </p>
                {v.modelClaims[0]?.sources?.[0] && (
                  <p className="text-[10px] text-muted mt-1">{v.modelClaims[0].sources[0]}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      {pack && (
        <Card className="p-5 space-y-2">
          <h2 className="font-semibold text-sm">Primary sources (cite; don’t dump books)</h2>
          <ul className="list-disc pl-4 text-sm text-ink-soft space-y-1">
            {pack.meta.primarySources.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
