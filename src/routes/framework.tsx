import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { evidenceDomains, frameworkSections } from "@/data/catalog";

export const Route = createFileRoute("/framework")({ component: FrameworkPage });

function FrameworkPage() {
  return (
    <div className="space-y-8 max-w-3xl">
      <div className="space-y-2">
        <Badge tone="teal">Book · 00-framework</Badge>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-ink">Structural framework</h1>
        <p className="text-ink-soft leading-relaxed">
          Composition history, method, assumptions, and evidence domains. Full drafts live under{" "}
          <code className="text-sm bg-surface-2 px-1 rounded">book/00-framework/</code>.
        </p>
      </div>

      <Card className="p-6 space-y-4 border-l-4 border-l-accent">
        <h2 className="font-serif text-xl font-semibold">Small plates vs the 116 pages (chronology)</h2>
        <p className="text-sm text-ink-soft leading-relaxed">
          <strong className="text-ink">~A.D. 385–400:</strong> Mormon abridged the large plates of Nephi.
          He also found the small plates of Nephi and included them with his record for a wise purpose
          (Words of Mormon 1:3–7)—with Words of Mormon as his bridge. 1 Nephi through Omni therefore
          preserve Nephi’s and successors’ records with minimal Mormon re-narration.
        </p>
        <p className="text-sm text-ink-soft leading-relaxed">
          <strong className="text-ink">A.D. 1828:</strong> Joseph Smith’s translation manuscript of Mormon’s
          abridgment of the early large-plate material (often called the Book of Lehi)—about 116
          pages—was lost. That modern loss is <em>not</em> when Mormon inserted the small plates; Mormon’s
          editorial choice was already on the plates ~1,400 years earlier. After the loss, the small-plate
          account supplies that historical span in the published Book of Mormon.
        </p>
        <p className="text-sm text-ink-soft leading-relaxed">
          For geography, early travel, Old World Bountiful, the voyage, landing, and seed-planting remain
          high-signal first-person data on the small plates.
        </p>
      </Card>

      <Card className="p-6 space-y-3">
        <h2 className="font-semibold text-lg">Workbench method (revised focus)</h2>
        <ol className="list-decimal pl-5 text-sm text-ink-soft space-y-2 leading-relaxed">
          <li>Start from published models as assumption packages.</li>
          <li>Make every place identification and distance scale an explicit, editable assumption.</li>
          <li>Tag scripture and external evidence (climate, language, artifacts, genetics…).</li>
          <li>Fork models, mix pieces, and stress-test constraints in Map Lab.</li>
          <li>Optionally overlay the internal graph on real topography when ready.</li>
        </ol>
        <div className="flex flex-wrap gap-2 pt-2">
          <Link to="/map-lab" className="text-sm text-accent hover:underline">
            Open Map Lab →
          </Link>
          <Link to="/my-models" className="text-sm text-accent hover:underline">
            My Models →
          </Link>
          <Link to="/reader" className="text-sm text-accent hover:underline">
            Reader + tagging →
          </Link>
        </div>
      </Card>

      <div className="space-y-4">
        {frameworkSections.map((s) => (
          <Card key={s.id} className="p-6 space-y-2">
            <h2 className="font-semibold text-lg">{s.title}</h2>
            <p className="text-sm text-ink-soft leading-relaxed whitespace-pre-wrap">{s.body}</p>
          </Card>
        ))}
      </div>

      <Card className="p-6 space-y-3">
        <h2 className="font-semibold text-lg">Evidence domains</h2>
        <p className="text-sm text-muted">
          Users can attach insights and tags in any domain. High-uncertainty domains always show a caution.
        </p>
        <ul className="space-y-2">
          {evidenceDomains.map((d) => (
            <li key={d.id} className="text-sm flex flex-col sm:flex-row sm:gap-2 border-b border-border/60 pb-2">
              <span className="font-medium text-ink min-w-[11rem]">{d.label}</span>
              <span className="text-muted">{d.caution}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
