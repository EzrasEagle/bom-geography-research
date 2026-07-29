import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  assumptions,
  constraints,
  places,
  type GeoConstraint,
} from "@/data/catalog";

export const Route = createFileRoute("/map-lab/")({ component: MapLabPage });

/** Simple deterministic layout positions for seed places (internal abstract map). */
const LAYOUT: Record<string, { x: number; y: number }> = {
  "sea-west": { x: 60, y: 200 },
  landing: { x: 100, y: 320 },
  nephi: { x: 180, y: 300 },
  manti: { x: 260, y: 240 },
  sidon: { x: 300, y: 200 },
  zarahemla: { x: 280, y: 160 },
  jershon: { x: 400, y: 180 },
  "sea-east": { x: 480, y: 200 },
  "bountiful-nw": { x: 300, y: 100 },
  "narrow-neck": { x: 300, y: 70 },
  desolation: { x: 300, y: 40 },
  cumorah: { x: 360, y: 30 },
};

function constraintColor(c: GeoConstraint, dayMiles: number, breakNeck: boolean): string {
  // Demo conflict rules: user can break narrow-neck assumption or shrink day scale.
  if (breakNeck && (c.id === "c5" || c.id === "c6" || c.id === "c10")) {
    return "#b91c1c"; // red — violated by user toggle
  }
  if (c.type === "days_travel" && dayMiles < 8 && c.strength === "hard") {
    return "#b91c1c";
  }
  if (c.strength === "hard") return "#1e3a5f";
  return "#a8a29e";
}

function MapLabPage() {
  const [dayMiles, setDayMiles] = useState(17);
  const [breakNeck, setBreakNeck] = useState(false);
  const [terrain, setTerrain] = useState<"open" | "mountain" | "jungle" | "mixed">("mixed");
  const [roads, setRoads] = useState<"unknown" | "roads" | "no_roads">("unknown");

  const edges = useMemo(() => {
    return constraints.map((c) => ({
      ...c,
      color: constraintColor(c, dayMiles, breakNeck),
    }));
  }, [dayMiles, breakNeck]);

  const redCount = edges.filter((e) => e.color === "#b91c1c").length;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold">Map Lab</h1>
        <p className="text-sm text-ink-soft max-w-2xl leading-relaxed">
          Internal geography as a constraint graph—not a finished real-world pin map. Toggle assumptions
          to see which edges go red. Phase 3 will overlay this graph on real rivers/terrain (Leaflet +
          NHD/HydroSHEDS). SimCity-style builders are UX inspiration only; the solver is constraints.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_18rem]">
        <Card className="p-3 md:p-4 overflow-x-auto">
          <svg viewBox="0 0 520 360" className="w-full min-w-[320px] h-auto bg-[#faf6ef] rounded-[var(--radius)]">
            {/* seas as bands */}
            <rect x="0" y="0" width="50" height="360" fill="#ccfbf1" opacity="0.7" />
            <rect x="470" y="0" width="50" height="360" fill="#ccfbf1" opacity="0.7" />
            <text x="8" y="180" className="fill-teal text-[10px]" transform="rotate(-90 12 180)">
              sea west (abstract)
            </text>
            <text x="500" y="180" className="fill-teal text-[10px]" transform="rotate(90 508 180)">
              sea east (abstract)
            </text>

            {edges.map((e) => {
              const a = LAYOUT[e.from];
              const b = LAYOUT[e.to];
              if (!a || !b) return null;
              return (
                <g key={e.id}>
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={e.color}
                    strokeWidth={e.strength === "hard" ? 2.5 : 1.5}
                    strokeDasharray={e.strength === "soft" ? "4 3" : undefined}
                  />
                </g>
              );
            })}

            {places.map((p) => {
              const pos = LAYOUT[p.id];
              if (!pos) return null;
              return (
                <g key={p.id}>
                  <circle cx={pos.x} cy={pos.y} r={p.kind === "river" ? 7 : 9} fill="#9a3412" opacity={0.9} />
                  <text x={pos.x + 12} y={pos.y + 4} fontSize="10" fill="#1c1917">
                    {p.name}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted">
            <span>
              <span className="inline-block w-3 h-0.5 bg-claim align-middle mr-1" /> hard constraint
            </span>
            <span>
              <span className="inline-block w-3 h-0.5 bg-stone-400 align-middle mr-1 border-t border-dashed" />{" "}
              soft
            </span>
            <span className="text-red-700">red = broken under current assumptions</span>
          </div>
        </Card>

        <div className="space-y-3">
          <Card className="p-4 space-y-3">
            <h2 className="font-semibold text-sm">Working assumptions</h2>
            <label className="block text-sm space-y-1">
              <span className="text-muted">Day’s march (miles)</span>
              <input
                type="range"
                min={5}
                max={30}
                value={dayMiles}
                onChange={(e) => setDayMiles(Number(e.target.value))}
                className="w-full"
              />
              <span className="text-ink font-medium tabular-nums">{dayMiles} mi</span>
            </label>
            <label className="block text-sm space-y-1">
              <span className="text-muted">Terrain between places</span>
              <select
                value={terrain}
                onChange={(e) => setTerrain(e.target.value as typeof terrain)}
                className="w-full rounded-[var(--radius-sm)] border border-border bg-surface px-2 py-2 text-sm"
              >
                <option value="open">Open plains</option>
                <option value="mountain">Mountains</option>
                <option value="jungle">Jungle / dense forest</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>
            <label className="block text-sm space-y-1">
              <span className="text-muted">Roads</span>
              <select
                value={roads}
                onChange={(e) => setRoads(e.target.value as typeof roads)}
                className="w-full rounded-[var(--radius-sm)] border border-border bg-surface px-2 py-2 text-sm"
              >
                <option value="unknown">Unspecified</option>
                <option value="roads">Allow roads / improved trails</option>
                <option value="no_roads">No roads (foot/game trails only)</option>
              </select>
            </label>
            <label className="flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                checked={breakNeck}
                onChange={(e) => setBreakNeck(e.target.checked)}
                className="mt-1"
              />
              <span>
                Stress-test: deny “narrow neck between seas / Bountiful–Desolation adjacency” (shows red
                conflicts)
              </span>
            </label>
            <div className="text-sm">
              Conflicts:{" "}
              <Badge tone={redCount ? "accent" : "teal"}>{redCount} red edges</Badge>
            </div>
            <p className="text-xs text-muted">
              Terrain/roads recorded for future cost models ({terrain}, {roads}). Full cost routing comes
              with real basemap layers.
            </p>
          </Card>

          <Card className="p-4 space-y-2">
            <h2 className="font-semibold text-sm">Constraint list</h2>
            <ul className="max-h-56 overflow-auto space-y-2 text-xs">
              {edges.map((e) => (
                <li key={e.id} className="border-b border-border/50 pb-1">
                  <span className="font-medium" style={{ color: e.color }}>
                    {e.from} → {e.to}
                  </span>
                  <div className="text-muted">
                    {e.type}: {String(e.value)}
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>

      <Card className="p-5 space-y-2">
        <h2 className="font-semibold">Published model assumptions (reference)</h2>
        <p className="text-sm text-muted">
          Fork and edit these under My Models. Map Lab will eventually load a selected user model’s
          assumption set.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2 text-sm">
          {assumptions.slice(0, 8).map((a) => (
            <li key={a.id} className="rounded-[var(--radius-sm)] bg-surface-2/80 p-2">
              <Badge className="mb-1">{a.modelId}</Badge>
              <div className="text-ink-soft">{a.statement}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
