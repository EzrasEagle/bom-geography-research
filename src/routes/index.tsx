import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, Lightbulb, Map, Scale } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { stats, verses, models } from "@/data/catalog";

export const Route = createFileRoute("/")({ component: HomePage });

function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
        <div className="space-y-4">
          <Badge tone="teal">Research atlas · dual track</Badge>
          <h1 className="font-serif text-4xl md:text-5xl font-semibold tracking-tight text-ink leading-[1.15]">
            Weigh every model against the text—and against the ground truth you gather.
          </h1>
          <p className="text-lg text-ink-soft max-w-2xl leading-relaxed">
            A verse-by-verse catalog of Book of Mormon geographic clues, each model’s claims with
            sources, and a parallel insights track for travel, climate, flora, hydrology, and history.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/verses"
              className="inline-flex items-center gap-2 rounded-[var(--radius)] bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg hover:bg-accent-soft transition-colors"
            >
              Browse verses <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/framework"
              className="inline-flex items-center gap-2 rounded-[var(--radius)] border border-border bg-surface px-4 py-2.5 text-sm font-medium text-ink hover:bg-surface-2 transition-colors"
            >
              Read the framework
            </Link>
          </div>
        </div>
        <Card className="p-5 grid grid-cols-2 gap-4">
          {[
            { label: "Verse units", value: stats.verseCount },
            { label: "Models tracked", value: stats.modelCount },
            { label: "Model claims", value: stats.claimCount },
            { label: "Insights", value: stats.insightCount },
          ].map((s) => (
            <div key={s.label} className="rounded-[var(--radius)] bg-surface-2/80 p-3">
              <div className="text-2xl font-semibold text-ink tabular-nums">{s.value}</div>
              <div className="text-xs text-muted mt-0.5">{s.label}</div>
            </div>
          ))}
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            to: "/verses" as const,
            icon: BookOpen,
            title: "Verse catalog",
            body: "Book / chapter / verse units with clues, tags, plate source, and competing claims.",
          },
          {
            to: "/models" as const,
            icon: Map,
            title: "Geography models",
            body: "Mesoamerica, Heartland, Baja, South America, Malay, and internal-only profiles.",
          },
          {
            to: "/insights" as const,
            icon: Lightbulb,
            title: "Independent insights",
            body: "Travel times, crop viability, hydrology—evidence that isn’t owned by one map.",
          },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.to} to={item.to} className="group">
              <Card className="h-full p-5 transition-transform group-hover:-translate-y-0.5">
                <Icon className="h-5 w-5 text-accent mb-3" />
                <h2 className="font-semibold text-ink mb-1">{item.title}</h2>
                <p className="text-sm text-muted leading-relaxed">{item.body}</p>
              </Card>
            </Link>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6 space-y-3">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-claim" />
            <h2 className="font-semibold">How to use this atlas</h2>
          </div>
          <ol className="list-decimal pl-5 space-y-2 text-sm text-ink-soft leading-relaxed">
            <li>Start with the textual framework (Small Plates vs abridgment).</li>
            <li>Open high-signal verses (landing, seeds, narrow neck, Sidon, Cumorah).</li>
            <li>Compare model claims side-by-side—read the “why,” not only the pin.</li>
            <li>Consult insights for external context, then decide what weight you give each line of evidence.</li>
          </ol>
        </Card>
        <Card className="p-6 space-y-3">
          <h2 className="font-semibold">Seed catalog highlights</h2>
          <ul className="space-y-2">
            {verses.map((v) => (
              <li key={v.id}>
                <Link
                  to="/verses/$verseId"
                  params={{ verseId: v.id }}
                  className="text-sm text-accent hover:underline font-medium"
                >
                  {v.book} {v.chapter}:{v.verseStart}
                </Link>
                <span className="text-sm text-muted"> — {v.tags.slice(0, 3).join(", ")}</span>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted pt-2">
            {models.length} models registered · expand via research/verses and data/catalog
          </p>
        </Card>
      </section>
    </div>
  );
}
