import { createFileRoute, Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { assumptions, constraints, getInsight, getVerse, places } from "@/data/catalog";
import { getPlaceDossier } from "@/data/place-scripture";

export const Route = createFileRoute("/map-lab/feature/$featureId")({
  component: FeatureDossierPage,
});

function FeatureDossierPage() {
  const { featureId } = Route.useParams();
  const d = getPlaceDossier(featureId);
  const place = places.find((p) => p.id === featureId);

  if (!d) {
    return (
      <div className="space-y-3 max-w-3xl">
        <h1 className="font-serif text-2xl">Feature not found</h1>
        <p className="text-sm text-muted">No scripture dossier yet for “{featureId}”.</p>
        <Link to="/map-lab" className="text-accent text-sm hover:underline">
          ← Map Lab
        </Link>
      </div>
    );
  }

  const linkedAssumptions = assumptions.filter((a) => d.assumptionIds.includes(a.id));
  const linkedEdges = constraints.filter((c) => d.edgeIds.includes(c.id));

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link to="/map-lab" className="text-sm text-muted hover:text-accent">
          ← Map Lab
        </Link>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge tone="teal">{d.kind}</Badge>
          <Badge>{d.scriptures.length} scripture refs</Badge>
        </div>
        <h1 className="font-serif text-3xl font-semibold mt-2">{d.name}</h1>
        <p className="text-ink-soft mt-2 leading-relaxed">{d.summary}</p>
        {place && (
          <p className="text-xs text-muted mt-1">Map id: {place.id}</p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          <Link
            to="/reader"
            search={{ feature: d.id, q: d.name.split(" ")[0] }}
            className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-fg"
          >
            Open in Reader · tag verses
          </Link>
          <Link
            to="/reader"
            search={{ feature: d.id }}
            className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
          >
            Reader (feature filter)
          </Link>
          <Link to="/map-lab" className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm">
            Map Lab
          </Link>
        </div>
      </div>

      <Card className="p-5 space-y-3">
        <h2 className="font-semibold">Scriptures that undergird this feature</h2>
        <p className="text-xs text-muted">
          Open the official text in a new tab, then return here to adjust model assumptions. Catalog
          links go to our comparative verse records when available.
        </p>
        <ul className="space-y-3">
          {d.scriptures.map((s) => (
            <li key={s.ref + s.note} className="border border-border rounded-[var(--radius)] p-3 space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-ink">{s.ref}</span>
                {s.tags?.map((t) => (
                  <Badge key={t}>{t}</Badge>
                ))}
              </div>
              <p className="text-sm text-ink-soft">{s.note}</p>
              <div className="flex flex-wrap gap-3 text-sm pt-1">
                <a
                  href={s.studyUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  Official text <ExternalLink className="h-3.5 w-3.5" />
                </a>
                {s.catalogId && getVerse(s.catalogId) && (
                  <Link
                    to="/verses/$verseId"
                    params={{ verseId: s.catalogId }}
                    className="text-accent hover:underline"
                  >
                    Atlas catalog record →
                  </Link>
                )}
                <Link
                  to="/reader"
                  search={{
                    feature: d.id,
                    q: s.ref.split(" ")[0],
                  }}
                  className="text-accent hover:underline"
                >
                  Tag in Reader →
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </Card>

      {linkedAssumptions.length > 0 && (
        <Card className="p-5 space-y-2">
          <h2 className="font-semibold">Model assumptions often tied here</h2>
          <ul className="space-y-2">
            {linkedAssumptions.map((a) => (
              <li key={a.id} className="text-sm rounded bg-surface-2 p-2">
                <Badge className="mb-1">{a.modelId}</Badge>
                <div>{a.statement}</div>
                <Link
                  to="/models/$modelId"
                  params={{ modelId: a.modelId }}
                  className="text-xs text-accent hover:underline"
                >
                  Open model →
                </Link>
              </li>
            ))}
          </ul>
          <Link to="/my-models" className="text-sm text-accent hover:underline">
            Fork & toggle assumptions in My Models →
          </Link>
        </Card>
      )}

      {linkedEdges.length > 0 && (
        <Card className="p-5 space-y-2">
          <h2 className="font-semibold">Map connections using this feature</h2>
          <ul className="text-sm space-y-1">
            {linkedEdges.map((e) => (
              <li key={e.id}>
                <span className="font-medium">
                  {e.from} → {e.to}
                </span>
                <span className="text-muted"> · {e.type} · {String(e.value)}</span>
                {e.sourceVerse && <span className="text-muted"> · {e.sourceVerse}</span>}
              </li>
            ))}
          </ul>
        </Card>
      )}

      {d.relatedFeatureIds.length > 0 && (
        <Card className="p-5 space-y-2">
          <h2 className="font-semibold">Related features</h2>
          <div className="flex flex-wrap gap-2">
            {d.relatedFeatureIds.map((id) => (
              <Link key={id} to="/map-lab/feature/$featureId" params={{ featureId: id }}>
                <Badge tone="claim">{getPlaceDossier(id)?.name ?? id}</Badge>
              </Link>
            ))}
          </div>
        </Card>
      )}

      {d.related.length > 0 && (
        <Card className="p-5 space-y-2">
          <h2 className="font-semibold">Other linked sources</h2>
          <ul className="space-y-1 text-sm">
            {d.related.map((r) => (
              <li key={r.href + r.label}>
                {r.href.startsWith("http") ? (
                  <a href={r.href} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                    {r.label}
                  </a>
                ) : r.href.startsWith("/verses/") ? (
                  <Link
                    to="/verses/$verseId"
                    params={{ verseId: r.href.replace("/verses/", "") }}
                    className="text-accent hover:underline"
                  >
                    {r.label}
                  </Link>
                ) : r.href.startsWith("/insights/") ? (
                  <Link
                    to="/insights/$insightId"
                    params={{ insightId: r.href.replace("/insights/", "") }}
                    className="text-accent hover:underline"
                  >
                    {r.label}
                  </Link>
                ) : r.href.startsWith("/models/") && r.href !== "/models/indexes" ? (
                  <Link
                    to="/models/$modelId"
                    params={{ modelId: r.href.replace("/models/", "") }}
                    className="text-accent hover:underline"
                  >
                    {r.label}
                  </Link>
                ) : (
                  <Link to={r.href as "/map-lab"} className="text-accent hover:underline">
                    {r.label}
                  </Link>
                )}
                <span className="text-muted text-xs ml-2">{r.kind}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* pull catalog verses if any */}
      {d.scriptures.some((s) => s.catalogId && getVerse(s.catalogId)) && (
        <Card className="p-5 space-y-2">
          <h2 className="font-semibold">Atlas comparative records</h2>
          {d.scriptures
            .filter((s) => s.catalogId)
            .map((s) => {
              const v = s.catalogId ? getVerse(s.catalogId) : undefined;
              if (!v) return null;
              return (
                <div key={s.catalogId} className="text-sm border-b border-border/50 pb-2">
                  <Link
                    to="/verses/$verseId"
                    params={{ verseId: s.catalogId! }}
                    className="font-medium text-accent hover:underline"
                  >
                    {v.book} {v.chapter}:{v.verseStart}
                  </Link>
                  <p className="scripture text-sm line-clamp-2 mt-1">{v.textExcerpt}</p>
                  <p className="text-xs text-muted mt-1">{v.modelClaims.length} model claims in catalog</p>
                </div>
              );
            })}
        </Card>
      )}
    </div>
  );
}
