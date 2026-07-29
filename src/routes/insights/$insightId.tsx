import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getInsight, getModel } from "@/data/catalog";

export const Route = createFileRoute("/insights/$insightId")({ component: InsightDetailPage });

function InsightDetailPage() {
  const { insightId } = Route.useParams();
  const ins = getInsight(insightId);
  if (!ins) return <p className="text-muted">Insight not found.</p>;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link to="/insights" className="text-sm text-muted hover:text-accent">
          ← All insights
        </Link>
        <h1 className="font-serif text-3xl font-semibold mt-2">{ins.title}</h1>
        <div className="flex gap-2 mt-2">
          <Badge tone="insight">{ins.category}</Badge>
          <Badge>{ins.confidence}</Badge>
        </div>
      </div>
      <Card className="p-5">
        <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{ins.body}</p>
      </Card>
      {ins.relevanceToModels.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">May inform these models</h2>
          <div className="flex flex-wrap gap-2">
            {ins.relevanceToModels.map((id) => (
              <Link key={id} to="/models/$modelId" params={{ modelId: id }}>
                <Badge tone="claim">{getModel(id)?.name ?? id}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
      {ins.relatedVerses.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold">Related verses</h2>
          <ul className="space-y-1">
            {ins.relatedVerses.map((vid) => (
              <li key={vid}>
                <Link to="/verses/$verseId" params={{ verseId: vid }} className="text-sm text-accent hover:underline">
                  {vid}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
