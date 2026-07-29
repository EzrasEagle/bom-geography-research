import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { assumptions, constraints as seedConstraints, places } from "@/data/catalog";

export const Route = createFileRoute("/map-lab/")({ component: MapLabPage });

type EdgeOverride = {
  days?: number;
  terrain?: "open" | "mountain" | "jungle" | "mixed" | "coast" | "river";
  strength?: "soft" | "hard";
  enabled?: boolean;
  note?: string;
};

type Macro = {
  dayMilesOpen: number;
  dayMilesMountain: number;
  dayMilesJungle: number;
  globalScale: number;
  directionRotation: number;
  roadsMode: "unknown" | "roads" | "no_roads";
  defaultTerrain: "open" | "mountain" | "jungle" | "mixed";
  breakNeck: boolean;
};

const LAYOUT0: Record<string, { x: number; y: number }> = {
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

const MACRO_KEY = "bom-atlas-maplab-macro-v1";
const MICRO_KEY = "bom-atlas-maplab-micro-v1";

const defaultMacro: Macro = {
  dayMilesOpen: 17,
  dayMilesMountain: 10,
  dayMilesJungle: 8,
  globalScale: 1,
  directionRotation: 0,
  roadsMode: "unknown",
  defaultTerrain: "mixed",
  breakNeck: false,
};

function rotateLayout(rot: number, scale: number) {
  const cx = 260;
  const cy = 180;
  const rad = (rot * Math.PI) / 180;
  const out: Record<string, { x: number; y: number }> = {};
  for (const [id, p] of Object.entries(LAYOUT0)) {
    const dx = (p.x - cx) * scale;
    const dy = (p.y - cy) * scale;
    out[id] = {
      x: cx + dx * Math.cos(rad) - dy * Math.sin(rad),
      y: cy + dx * Math.sin(rad) + dy * Math.cos(rad),
    };
  }
  return out;
}

function MapLabPage() {
  const [macro, setMacro] = useState<Macro>(defaultMacro);
  const [micro, setMicro] = useState<Record<string, EdgeOverride>>({});
  const [selectedEdge, setSelectedEdge] = useState<string>(seedConstraints[0]?.id ?? "");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const m = localStorage.getItem(MACRO_KEY);
      const u = localStorage.getItem(MICRO_KEY);
      if (m) setMacro({ ...defaultMacro, ...(JSON.parse(m) as Macro) });
      if (u) setMicro(JSON.parse(u) as Record<string, EdgeOverride>);
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(MACRO_KEY, JSON.stringify(macro));
  }, [macro, loaded]);

  useEffect(() => {
    if (!loaded) return;
    localStorage.setItem(MICRO_KEY, JSON.stringify(micro));
  }, [micro, loaded]);

  const layout = useMemo(
    () => rotateLayout(macro.directionRotation, macro.globalScale),
    [macro.directionRotation, macro.globalScale],
  );

  const edges = useMemo(() => {
    return seedConstraints.map((c) => {
      const o = micro[c.id] ?? {};
      const enabled = o.enabled !== false;
      const strength = o.strength ?? c.strength;
      const terrain = o.terrain ?? macro.defaultTerrain;
      let dayMiles = macro.dayMilesOpen;
      if (terrain === "mountain") dayMiles = macro.dayMilesMountain;
      if (terrain === "jungle") dayMiles = macro.dayMilesJungle;

      let color = strength === "hard" ? "#1e3a5f" : "#a8a29e";
      let conflict = false;
      if (!enabled) {
        color = "#d6d3d1";
      } else if (macro.breakNeck && (c.id === "c5" || c.id === "c6" || c.id === "c10")) {
        color = "#b91c1c";
        conflict = true;
      } else if (c.type === "days_travel" && typeof o.days === "number" && o.days * dayMiles > 400) {
        // absurd micro distance under current day scale
        color = "#b45309";
        conflict = true;
      } else if (dayMiles < 6 && strength === "hard") {
        color = "#b91c1c";
        conflict = true;
      }

      return {
        ...c,
        enabled,
        strength,
        terrain,
        days: o.days,
        dayMiles,
        color,
        conflict,
        note: o.note,
      };
    });
  }, [macro, micro]);

  const selected = edges.find((e) => e.id === selectedEdge) ?? edges[0];
  const redCount = edges.filter((e) => e.conflict && e.enabled).length;

  function patchMacro(p: Partial<Macro>) {
    setMacro((m) => ({ ...m, ...p }));
  }

  function patchMicro(id: string, p: Partial<EdgeOverride>) {
    setMicro((prev) => ({ ...prev, [id]: { ...prev[id], ...p } }));
  }

  function resetAll() {
    setMacro(defaultMacro);
    setMicro({});
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold">Map Lab</h1>
        <p className="text-sm text-ink-soft max-w-2xl leading-relaxed">
          <strong className="text-ink">Macro</strong> knobs adjust the whole graph (day scales, rotation,
          global stretch, default terrain). <strong className="text-ink">Micro</strong> edits apply to a
          single city-to-city edge (days, terrain, hard/soft, on/off). Prefer this over a city-builder;
          Terrain Lab (real DEM) is the next layer—see research/external/TERRAIN_LAB.md.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_20rem_20rem]">
        <Card className="p-3 md:p-4 overflow-x-auto">
          <svg viewBox="0 0 520 360" className="w-full min-w-[320px] h-auto bg-[#faf6ef] rounded-[var(--radius)]">
            <rect x="0" y="0" width="50" height="360" fill="#ccfbf1" opacity="0.7" />
            <rect x="470" y="0" width="50" height="360" fill="#ccfbf1" opacity="0.7" />
            {edges.map((e) => {
              if (!e.enabled) return null;
              const a = layout[e.from];
              const b = layout[e.to];
              if (!a || !b) return null;
              const active = e.id === selected?.id;
              return (
                <g
                  key={e.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedEdge(e.id)}
                >
                  <line
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke={e.color}
                    strokeWidth={active ? 4 : e.strength === "hard" ? 2.5 : 1.5}
                    strokeDasharray={e.strength === "soft" ? "4 3" : undefined}
                  />
                </g>
              );
            })}
            {places.map((p) => {
              const pos = layout[p.id];
              if (!pos) return null;
              return (
                <g key={p.id}>
                  <circle cx={pos.x} cy={pos.y} r={8} fill="#9a3412" />
                  <text x={pos.x + 10} y={pos.y + 4} fontSize="10" fill="#1c1917">
                    {p.name}
                  </text>
                </g>
              );
            })}
          </svg>
          <div className="flex flex-wrap gap-2 mt-2 text-xs text-muted">
            <span>Click an edge to micro-edit</span>
            <Badge tone={redCount ? "accent" : "teal"}>{redCount} conflicts</Badge>
            <Badge>
              scale {macro.globalScale.toFixed(2)}× · rot {macro.directionRotation}°
            </Badge>
          </div>
        </Card>

        {/* MACRO */}
        <Card className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-sm">Macro adjustments</h2>
            <button type="button" onClick={resetAll} className="text-xs text-accent hover:underline">
              Reset all
            </button>
          </div>
          <label className="block text-xs space-y-1">
            <span className="text-muted">Day miles · open</span>
            <input
              type="range"
              min={5}
              max={30}
              value={macro.dayMilesOpen}
              onChange={(e) => patchMacro({ dayMilesOpen: Number(e.target.value) })}
              className="w-full"
            />
            <span className="font-medium tabular-nums">{macro.dayMilesOpen}</span>
          </label>
          <label className="block text-xs space-y-1">
            <span className="text-muted">Day miles · mountain</span>
            <input
              type="range"
              min={3}
              max={20}
              value={macro.dayMilesMountain}
              onChange={(e) => patchMacro({ dayMilesMountain: Number(e.target.value) })}
              className="w-full"
            />
            <span className="font-medium tabular-nums">{macro.dayMilesMountain}</span>
          </label>
          <label className="block text-xs space-y-1">
            <span className="text-muted">Day miles · jungle</span>
            <input
              type="range"
              min={3}
              max={20}
              value={macro.dayMilesJungle}
              onChange={(e) => patchMacro({ dayMilesJungle: Number(e.target.value) })}
              className="w-full"
            />
            <span className="font-medium tabular-nums">{macro.dayMilesJungle}</span>
          </label>
          <label className="block text-xs space-y-1">
            <span className="text-muted">Global scale (stretch graph)</span>
            <input
              type="range"
              min={50}
              max={150}
              value={Math.round(macro.globalScale * 100)}
              onChange={(e) => patchMacro({ globalScale: Number(e.target.value) / 100 })}
              className="w-full"
            />
            <span className="font-medium tabular-nums">{macro.globalScale.toFixed(2)}×</span>
          </label>
          <label className="block text-xs space-y-1">
            <span className="text-muted">Direction rotation (°)</span>
            <input
              type="range"
              min={-180}
              max={180}
              value={macro.directionRotation}
              onChange={(e) => patchMacro({ directionRotation: Number(e.target.value) })}
              className="w-full"
            />
            <span className="font-medium tabular-nums">{macro.directionRotation}°</span>
          </label>
          <label className="block text-xs space-y-1">
            <span className="text-muted">Default terrain</span>
            <select
              value={macro.defaultTerrain}
              onChange={(e) =>
                patchMacro({ defaultTerrain: e.target.value as Macro["defaultTerrain"] })
              }
              className="w-full rounded border border-border bg-surface px-2 py-1.5"
            >
              <option value="open">Open</option>
              <option value="mountain">Mountain</option>
              <option value="jungle">Jungle</option>
              <option value="mixed">Mixed</option>
            </select>
          </label>
          <label className="block text-xs space-y-1">
            <span className="text-muted">Roads (global)</span>
            <select
              value={macro.roadsMode}
              onChange={(e) => patchMacro({ roadsMode: e.target.value as Macro["roadsMode"] })}
              className="w-full rounded border border-border bg-surface px-2 py-1.5"
            >
              <option value="unknown">Unspecified</option>
              <option value="roads">Roads / trails</option>
              <option value="no_roads">No roads</option>
            </select>
          </label>
          <label className="flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              checked={macro.breakNeck}
              onChange={(e) => patchMacro({ breakNeck: e.target.checked })}
              className="mt-0.5"
            />
            Stress-test: break narrow-neck family edges
          </label>
        </Card>

        {/* MICRO */}
        <Card className="p-4 space-y-3">
          <h2 className="font-semibold text-sm">Micro · point-to-point</h2>
          <label className="block text-xs space-y-1">
            <span className="text-muted">Edge</span>
            <select
              value={selected?.id}
              onChange={(e) => setSelectedEdge(e.target.value)}
              className="w-full rounded border border-border bg-surface px-2 py-1.5"
            >
              {edges.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.from} → {e.to} ({e.type})
                </option>
              ))}
            </select>
          </label>
          {selected && (
            <>
              <p className="text-xs text-ink-soft leading-relaxed">
                {String(selected.value)}
                {selected.sourceVerse ? ` · ${selected.sourceVerse}` : ""}
              </p>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={selected.enabled}
                  onChange={(e) => patchMicro(selected.id, { enabled: e.target.checked })}
                />
                Constraint enabled
              </label>
              <label className="block text-xs space-y-1">
                <span className="text-muted">Strength</span>
                <select
                  value={selected.strength}
                  onChange={(e) =>
                    patchMicro(selected.id, { strength: e.target.value as "soft" | "hard" })
                  }
                  className="w-full rounded border border-border bg-surface px-2 py-1.5"
                >
                  <option value="hard">Hard</option>
                  <option value="soft">Soft</option>
                </select>
              </label>
              <label className="block text-xs space-y-1">
                <span className="text-muted">Terrain (this edge)</span>
                <select
                  value={selected.terrain}
                  onChange={(e) =>
                    patchMicro(selected.id, {
                      terrain: e.target.value as EdgeOverride["terrain"],
                    })
                  }
                  className="w-full rounded border border-border bg-surface px-2 py-1.5"
                >
                  <option value="open">Open</option>
                  <option value="mountain">Mountain</option>
                  <option value="jungle">Jungle</option>
                  <option value="mixed">Mixed</option>
                  <option value="coast">Coast</option>
                  <option value="river">River corridor</option>
                </select>
              </label>
              <label className="block text-xs space-y-1">
                <span className="text-muted">Days (override, optional)</span>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  placeholder="e.g. 1.5"
                  value={selected.days ?? ""}
                  onChange={(e) =>
                    patchMicro(selected.id, {
                      days: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                  className="w-full rounded border border-border bg-surface px-2 py-1.5"
                />
                <span className="text-muted">
                  Effective miles/day for terrain: {selected.dayMiles}
                </span>
              </label>
              <label className="block text-xs space-y-1">
                <span className="text-muted">Note</span>
                <textarea
                  rows={2}
                  value={selected.note ?? ""}
                  onChange={(e) => patchMicro(selected.id, { note: e.target.value })}
                  className="w-full rounded border border-border bg-surface px-2 py-1.5"
                  placeholder="Why this micro override?"
                />
              </label>
              {selected.conflict && (
                <p className="text-xs text-red-700 font-medium">Conflict under current macro+micro</p>
              )}
            </>
          )}
        </Card>
      </div>

      <Card className="p-4">
        <h2 className="font-semibold text-sm mb-2">All edges (micro state)</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="text-muted">
              <tr>
                <th className="py-1 pr-2">Edge</th>
                <th className="py-1 pr-2">Type</th>
                <th className="py-1 pr-2">Terrain</th>
                <th className="py-1 pr-2">Days</th>
                <th className="py-1 pr-2">On</th>
                <th className="py-1">Status</th>
              </tr>
            </thead>
            <tbody>
              {edges.map((e) => (
                <tr
                  key={e.id}
                  className="border-t border-border/60 cursor-pointer hover:bg-surface-2/80"
                  onClick={() => setSelectedEdge(e.id)}
                >
                  <td className="py-1.5 pr-2 font-medium">
                    {e.from} → {e.to}
                  </td>
                  <td className="pr-2">{e.type}</td>
                  <td className="pr-2">{e.terrain}</td>
                  <td className="pr-2 tabular-nums">{e.days ?? "—"}</td>
                  <td className="pr-2">{e.enabled ? "yes" : "no"}</td>
                  <td style={{ color: e.color }}>{e.conflict ? "conflict" : e.strength}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="p-4 space-y-2">
        <h2 className="font-semibold text-sm">Published assumptions (reference)</h2>
        <ul className="grid gap-2 sm:grid-cols-2 text-xs">
          {assumptions.slice(0, 6).map((a) => (
            <li key={a.id} className="bg-surface-2/80 rounded p-2">
              <Badge className="mb-1">{a.modelId}</Badge>
              <div>{a.statement}</div>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
