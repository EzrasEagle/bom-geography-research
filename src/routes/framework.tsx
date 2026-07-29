import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { frameworkSections } from "@/data/catalog";

export const Route = createFileRoute("/framework")({ component: FrameworkPage });

function FrameworkPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-2">
        <Badge tone="teal">Book · 00-framework</Badge>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink">Structural framework</h1>
        <p className="text-ink-soft leading-relaxed">
          High-level composition history and method before the verse-by-verse walkthrough. Full draft
          lives in <code className="text-sm bg-surface-2 px-1 rounded">book/00-framework/</code>.
        </p>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="font-serif text-xl font-semibold">Small Plates — largely intact</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          After the loss of the 116 pages, Mormon inserted the small plates of Nephi he had found.
          1 Nephi through Omni preserve Nephi’s and successors’ records with minimal Mormon
          re-narration. Words of Mormon is the bridge. For geography, early travel, Bountiful (Old
          World), the voyage, landing, and seed-planting are high-signal first-person data.
        </p>
        <p className="text-sm text-ink-soft leading-relaxed">
          The bulk of Mosiah–Mormon is Mormon’s abridgment of the large plates; Moroni contributes
          the close and Ether. Tag every catalog unit with its plate source.
        </p>
      </Card>

      <div className="space-y-4">
        {frameworkSections.map((s) => (
          <Card key={s.id} className="p-6 space-y-2">
            <h2 className="font-semibold text-lg">{s.title}</h2>
            <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{s.body}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
