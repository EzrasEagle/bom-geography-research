import { createFileRoute, Link } from "@tanstack/react-router";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export const Route = createFileRoute("/models/indexes")({ component: IndexesPage });

const packs = [
  {
    id: "internal",
    rank: 1,
    grade: "G1–G2",
    why: "Best spine for Map Lab constraints (no GPS required).",
  },
  {
    id: "mesoamerica",
    rank: 2,
    grade: "G1",
    why: "Densest published external apparatus (Sorenson-style).",
  },
  {
    id: "meso-highland",
    rank: 3,
    grade: "G0–G1",
    why: "Diff pack for highland emphasis; tests micro place swaps.",
  },
  {
    id: "heartland",
    rank: 4,
    grade: "G1",
    why: "Cumorah NY + Mississippi package; archaeology evidence_items.",
  },
  {
    id: "baja",
    rank: 5,
    grade: "G1",
    why: "Climate/seed/peninsula parameter package.",
  },
];

function IndexesPage() {
  return (
    <div className="space-y-6 max-w-3xl">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold">Model index packs</h1>
        <p className="text-sm text-ink-soft leading-relaxed">
          Each pack is harvested discover-as-you-go: places, verse claims, assumptions, constraints, and
          <em> parameters-native</em> for anything our taxonomy does not yet hold. We do not pirate full
          books—structured claims with citations only.
        </p>
      </div>
      <div className="space-y-3">
        {packs.map((p) => (
          <Card key={p.id} className="p-4 space-y-2">
            <div className="flex flex-wrap gap-2 items-center">
              <Badge tone="accent">rank {p.rank}</Badge>
              <Badge>{p.grade}</Badge>
              <Link to="/models/$modelId" params={{ modelId: p.id }} className="font-semibold text-accent hover:underline">
                {p.id}
              </Link>
            </div>
            <p className="text-sm text-ink-soft">{p.why}</p>
            <p className="text-xs text-muted">
              Files: research/models/indexes/{p.id}/ (README, places, verse-claims, assumptions,
              constraints, parameters-native, gaps)
            </p>
          </Card>
        ))}
      </div>
      <Card className="p-4 text-sm text-muted space-y-2">
        <p>
          Taxonomy: research/schema/data-taxonomy.md · Method: research/models/INDEXING_METHOD.md · Terrain
          (not SimCity): research/external/TERRAIN_LAB.md
        </p>
      </Card>
    </div>
  );
}
