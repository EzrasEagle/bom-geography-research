import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { insights } from "@/data/catalog";

export const Route = createFileRoute("/insights/")({ component: InsightsPage });

function InsightsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold">Independent insights</h1>
        <p className="text-sm text-ink-soft max-w-2xl">
          Dual-track research: facts and analyses that help evaluate geography without belonging to
          a single model (travel corridors, crops, climate, hydrology, history).
        </p>
      </div>
      <div className="space-y-3">
        {insights.map((ins) => (
          <Link key={ins.id} to="/insights/$insightId" params={{ insightId: ins.id }} className="block group">
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
    </div>
  );
}
