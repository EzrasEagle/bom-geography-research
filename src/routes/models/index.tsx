import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getMesoamericaPack, models, versesForModel } from "@/data/catalog";

export const Route = createFileRoute("/models/")({ component: ModelsPage });

function ModelsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold">Geography models</h1>
        <p className="text-sm text-ink-soft max-w-2xl">
          Profiles summarize each model’s map and arguments. Claims on individual verses live on the
          verse records so you can compare without conflating frameworks.{" "}
          <Link to="/models/indexes" className="text-accent hover:underline">
            Open index packs & harvest order →
          </Link>
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {models.map((m) => (
          <Link key={m.id} to="/models/$modelId" params={{ modelId: m.id }} className="group">
            <Card className="h-full p-5 space-y-3 transition-transform group-hover:-translate-y-0.5">
              <div className="flex flex-wrap gap-2">
                <Badge tone="accent">{m.category}</Badge>
                <Badge>{m.status}</Badge>
                <Badge tone="claim">{versesForModel(m.id).length} verses in seed</Badge>
              </div>
              <h2 className="font-semibold text-lg leading-snug">{m.name}{m.id === "mesoamerica" ? ` (${getMesoamericaPack().meta.grade})` : ""}</h2>
              <p className="text-sm text-muted leading-relaxed">{m.summary}</p>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
