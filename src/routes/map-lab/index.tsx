import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink } from "lucide-react";
import { assumptions, constraints as seedConstraints, models, places } from "@/data/catalog";
import {
  buildEdgeDossier,
  getPlaceDossier,
} from "@/data/place-scripture";
import {
  ACTIVE_MAP_MODEL_KEY,
  type EdgeOverride,
  type Macro,
  type ModelMapPackage,
  type Point,
  applyMacroTransform,
  defaultLayoutForModel,
  defaultMacro,
  loadPack,
  loadUserModelsLite,
  persistPack,
} from "@/lib/model-map-state";

export const Route = createFileRoute("/map-lab/")({ component: MapLabPage });

const VB = { w: 520, h: 360 };

function clientToSvg(
  svg: SVGSVGElement,
  clientX: number,
  clientY: number,
): Point {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const ctm = svg.getScreenCTM();
  if (!ctm) return { x: 0, y: 0 };
  const p = pt.matrixTransform(ctm.inverse());
  return {
    x: Math.min(VB.w, Math.max(0, p.x)),
    y: Math.min(VB.h, Math.max(0, p.y)),
  };
}

function MapLabPage() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [modelId, setModelId] = useState("internal");
  const [userModels, setUserModels] = useState<{ id: string; name: string; forkedFrom: string }[]>([]);
  const [pack, setPack] = useState<ModelMapPackage>(() => loadPack("internal"));
  const [selectedEdge, setSelectedEdge] = useState(seedConstraints[0]?.id ?? "");
  const [selectedPlace, setSelectedPlace] = useState<string | null>(null);
  const [hoverPlace, setHoverPlace] = useState<string | null>(null);
  const [hoverEdge, setHoverEdge] = useState<string | null>(null);
  const [dossierOpen, setDossierOpen] = useState(true);
  const [dragId, setDragId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(true);
  const [savedFlash, setSavedFlash] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Model-space layout (what we store). Display applies macro rot/scale on top.
  const layout = pack.layout;
  const macro = pack.macro;
  const micro = pack.micro;

  useEffect(() => {
    const users = loadUserModelsLite();
    setUserModels(users);
    let initial = "internal";
    try {
      initial = localStorage.getItem(ACTIVE_MAP_MODEL_KEY) || "internal";
    } catch {
      /* ignore */
    }
    const base =
      users.find((u) => u.id === initial)?.forkedFrom ??
      (models.some((m) => m.id === initial) ? initial : "internal");
    const p = loadPack(initial, base);
    // Ensure all place ids exist
    const def = defaultLayoutForModel(base);
    for (const pl of places) {
      if (!p.layout[pl.id]) p.layout[pl.id] = def[pl.id] ?? { x: 260, y: 180 };
    }
    setModelId(initial);
    setPack(p);
    setLoaded(true);
  }, []);

  function switchModel(id: string) {
    const user = userModels.find((u) => u.id === id);
    const base = user?.forkedFrom ?? id;
    const p = loadPack(id, base);
    const def = defaultLayoutForModel(base);
    for (const pl of places) {
      if (!p.layout[pl.id]) p.layout[pl.id] = def[pl.id] ?? { x: 260, y: 180 };
    }
    setModelId(id);
    setPack(p);
    try {
      localStorage.setItem(ACTIVE_MAP_MODEL_KEY, id);
    } catch {
      /* ignore */
    }
  }

  function updatePack(mut: (prev: ModelMapPackage) => ModelMapPackage) {
    setPack((prev) => mut(prev));
  }

  function patchMacro(partial: Partial<Macro>) {
    updatePack((p) => ({ ...p, macro: { ...p.macro, ...partial } }));
  }

  function patchMicro(id: string, partial: Partial<EdgeOverride>) {
    updatePack((p) => ({
      ...p,
      micro: { ...p.micro, [id]: { ...p.micro[id], ...partial } },
    }));
  }

  function setPlacePos(id: string, pt: Point) {
    updatePack((p) => ({
      ...p,
      layout: { ...p.layout, [id]: pt },
    }));
  }

  function saveToModel() {
    persistPack(pack);
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 1500);
  }

  function resetLayoutToModelDefault() {
    const user = userModels.find((u) => u.id === modelId);
    const base = user?.forkedFrom ?? modelId;
    updatePack((p) => ({
      ...p,
      layout: defaultLayoutForModel(base),
      macro: defaultMacro(),
      micro: {},
    }));
  }

  function exportPack() {
    const blob = new Blob([JSON.stringify(pack, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `map-pack-${modelId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Display layout = model layout + macro transform (rotation/scale)
  const displayLayout = useMemo(
    () => applyMacroTransform(layout, macro.directionRotation, macro.globalScale),
    [layout, macro.directionRotation, macro.globalScale],
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
      if (!enabled) color = "#d6d3d1";
      else if (macro.breakNeck && (c.id === "c5" || c.id === "c6" || c.id === "c10")) {
        color = "#b91c1c";
        conflict = true;
      } else if (c.type === "days_travel" && typeof o.days === "number" && o.days * dayMiles > 400) {
        color = "#b45309";
        conflict = true;
      } else if (dayMiles < 6 && strength === "hard") {
        color = "#b91c1c";
        conflict = true;
      }

      // Distance-based soft warning: very stretched hard adjacent edges
      const a = displayLayout[c.from];
      const b = displayLayout[c.to];
      if (a && b && enabled && strength === "hard" && c.type === "adjacent") {
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        if (dist > 200) {
          color = "#b45309";
          conflict = true;
        }
      }

      return { ...c, enabled, strength, terrain, days: o.days, dayMiles, color, conflict, note: o.note };
    });
  }, [macro, micro, displayLayout]);

  const selected = edges.find((e) => e.id === selectedEdge) ?? edges[0];
  const redCount = edges.filter((e) => e.conflict && e.enabled).length;

  const focusPlaceId = selectedPlace ?? hoverPlace;
  const placeDossier = focusPlaceId ? getPlaceDossier(focusPlaceId) : undefined;
  const edgeDossier = useMemo(() => {
    const e = edges.find((x) => x.id === (hoverEdge || selectedEdge));
    if (!e) return null;
    return buildEdgeDossier(e.id, e.from, e.to, e.value, e.sourceVerse);
  }, [edges, hoverEdge, selectedEdge]);


  const onPointerDownPlace = useCallback(
    (id: string, e: React.PointerEvent) => {
      if (!editMode) return;
      e.preventDefault();
      e.stopPropagation();
      setSelectedPlace(id);
      setDragId(id);
      (e.target as Element).setPointerCapture?.(e.pointerId);
    },
    [editMode],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragId || !svgRef.current || !editMode) return;
      // Convert display coords back to model space (inverse of macro transform)
      const displayPt = clientToSvg(svgRef.current, e.clientX, e.clientY);
      const cx = 260;
      const cy = 180;
      const scale = macro.globalScale || 1;
      const rad = (-macro.directionRotation * Math.PI) / 180;
      const dx = displayPt.x - cx;
      const dy = displayPt.y - cy;
      const ux = (dx * Math.cos(rad) - dy * Math.sin(rad)) / scale;
      const uy = (dx * Math.sin(rad) + dy * Math.cos(rad)) / scale;
      setPlacePos(dragId, {
        x: Math.min(VB.w, Math.max(0, cx + ux)),
        y: Math.min(VB.h, Math.max(0, cy + uy)),
      });
    },
    [dragId, editMode, macro.globalScale, macro.directionRotation],
  );

  const onPointerUp = useCallback(() => {
    setDragId(null);
  }, []);

  const modelLabel =
    userModels.find((u) => u.id === modelId)?.name ??
    models.find((m) => m.id === modelId)?.name ??
    modelId;

  if (!loaded) {
    return <p className="text-sm text-muted">Loading map package…</p>;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold">Map Lab · model editor</h1>
        <p className="text-sm text-ink-soft max-w-2xl leading-relaxed">
          The map is <strong className="text-ink">bound to a model</strong>. Choose a published or forked
          model, drag cities and seas, tune macro/micro constraints, then{" "}
          <strong className="text-ink">Save to model</strong>. Layout + knobs become part of that model
          package (see research/schema/map-editor-integration.md).
        </p>
      </div>

      {/* Model binding bar */}
      <Card className="p-4 flex flex-col lg:flex-row gap-3 lg:items-end">
        <label className="text-sm space-y-1 flex-1">
          <span className="text-muted">Active model (map package)</span>
          <select
            value={modelId}
            onChange={(e) => switchModel(e.target.value)}
            className="w-full rounded-[var(--radius)] border border-border bg-surface px-3 py-2.5 text-sm"
          >
            <optgroup label="Published">
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </optgroup>
            {userModels.length > 0 && (
              <optgroup label="My forks">
                {userModels.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex items-center gap-2 text-sm px-2">
            <input type="checkbox" checked={editMode} onChange={(e) => setEditMode(e.target.checked)} />
            Drag places
          </label>
          <button
            type="button"
            onClick={saveToModel}
            className="rounded-[var(--radius)] bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg"
          >
            {savedFlash ? "Saved" : "Save to model"}
          </button>
          <button
            type="button"
            onClick={exportPack}
            className="rounded-[var(--radius)] border border-border px-3 py-2.5 text-sm"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={resetLayoutToModelDefault}
            className="rounded-[var(--radius)] border border-border px-3 py-2.5 text-sm"
          >
            Reset layout
          </button>
          <Link to="/my-models" className="rounded-[var(--radius)] border border-border px-3 py-2.5 text-sm text-accent">
            My Models
          </Link>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2 text-xs">
        <Badge tone="teal">{modelLabel}</Badge>
        <Badge tone="claim">{places.length} places</Badge>
        <Badge tone={redCount ? "accent" : "default"}>{redCount} layout/constraint conflicts</Badge>
        {selectedPlace && <Badge>Selected: {selectedPlace}</Badge>}
        <span className="text-muted self-center">
          Updated {new Date(pack.updatedAt).toLocaleString()}
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_18rem_18rem]">
        <Card className="p-3 md:p-4 overflow-x-auto">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VB.w} ${VB.h}`}
            className="w-full min-w-[320px] h-auto bg-[#faf6ef] rounded-[var(--radius)] touch-none"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            <rect x="0" y="0" width="50" height="360" fill="#ccfbf1" opacity="0.55" />
            <rect x="470" y="0" width="50" height="360" fill="#ccfbf1" opacity="0.55" />
            <text x="18" y="180" fontSize="9" fill="#0f766e" transform="rotate(-90 18 180)">
              sea band
            </text>

            {edges.map((e) => {
              if (!e.enabled) return null;
              const a = displayLayout[e.from];
              const b = displayLayout[e.to];
              if (!a || !b) return null;
              const active = e.id === selected?.id;
              return (
                <line
                  key={e.id}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                  stroke={e.color}
                  strokeWidth={active || hoverEdge === e.id ? 4 : e.strength === "hard" ? 2.5 : 1.5}
                  strokeDasharray={e.strength === "soft" ? "4 3" : undefined}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedEdge(e.id);
                    setSelectedPlace(null);
                  }}
                  onPointerEnter={() => setHoverEdge(e.id)}
                  onPointerLeave={() => setHoverEdge((h) => (h === e.id ? null : h))}
                >
                  <title>
                    {e.from} → {e.to}: {String(e.value)}
                    {e.sourceVerse ? ` · ${e.sourceVerse}` : ""}
                  </title>
                </line>
              );
            })}

            {places.map((p) => {
              const pos = displayLayout[p.id] ?? { x: 260, y: 180 };
              const isSea = p.kind === "sea";
              const selected = selectedPlace === p.id;
              const hovered = hoverPlace === p.id;
              const dossier = getPlaceDossier(p.id);
              const nRefs = dossier?.scriptures.length ?? 0;
              return (
                <g
                  key={p.id}
                  className={editMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
                  onPointerDown={(e) => onPointerDownPlace(p.id, e)}
                  onClick={() => {
                    setSelectedPlace(p.id);
                    setDossierOpen(true);
                  }}
                  onPointerEnter={() => setHoverPlace(p.id)}
                  onPointerLeave={() => setHoverPlace((h) => (h === p.id ? null : h))}
                >
                  <title>
                    {p.name}
                    {nRefs ? ` · ${nRefs} scripture refs — click for dossier` : " · click for details"}
                  </title>
                  {isSea ? (
                    <rect
                      x={pos.x - 14}
                      y={pos.y - 10}
                      width={28}
                      height={20}
                      rx={4}
                      fill="#0f766e"
                      opacity={0.85}
                      stroke={selected || hovered ? "#9a3412" : "transparent"}
                      strokeWidth={selected || hovered ? 2.5 : 2}
                    />
                  ) : (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={p.kind === "river" ? 8 : 10}
                      fill={p.kind === "river" ? "#1e3a5f" : "#9a3412"}
                      stroke={selected || hovered ? "#f59e0b" : "white"}
                      strokeWidth={selected || hovered ? 3 : 1}
                    />
                  )}
                  {nRefs > 0 && (
                    <circle
                      cx={pos.x + (isSea ? 12 : 8)}
                      cy={pos.y - (isSea ? 8 : 8)}
                      r={7}
                      fill="#fffdf8"
                      stroke="#9a3412"
                      strokeWidth={1}
                    />
                  )}
                  {nRefs > 0 && (
                    <text
                      x={pos.x + (isSea ? 12 : 8)}
                      y={pos.y - (isSea ? 8 : 8) + 3}
                      textAnchor="middle"
                      fontSize="8"
                      fill="#9a3412"
                      className="select-none pointer-events-none font-semibold"
                    >
                      {nRefs}
                    </text>
                  )}
                  <text
                    x={pos.x + 12}
                    y={pos.y + 4}
                    fontSize="10"
                    fill="#1c1917"
                    className="select-none pointer-events-none"
                  >
                    {p.name}
                  </text>
                </g>
              );
            })}
          </svg>
          <p className="text-xs text-muted mt-2">
            {editMode
              ? "Drag places to move them. Hover for scripture counts; click a place or edge for the dossier panel."
              : "Drag disabled — enable “Drag places” to move features. Hover/click still opens scripture dossiers."}
          </p>
          {(hoverPlace || hoverEdge) && (
            <div className="mt-3 rounded-[var(--radius)] border border-border bg-surface-2/90 p-3 text-xs space-y-1">
              {hoverPlace && getPlaceDossier(hoverPlace) && (
                <>
                  <div className="font-semibold text-sm text-ink">{getPlaceDossier(hoverPlace)!.name}</div>
                  <div className="text-muted line-clamp-2">{getPlaceDossier(hoverPlace)!.summary}</div>
                  <div className="text-accent font-medium">
                    {getPlaceDossier(hoverPlace)!.scriptures.length} scriptures · click marker for full dossier
                  </div>
                  <ul className="list-disc pl-4 text-ink-soft">
                    {getPlaceDossier(hoverPlace)!.scriptures.slice(0, 3).map((s) => (
                      <li key={s.ref}>{s.ref}</li>
                    ))}
                    {getPlaceDossier(hoverPlace)!.scriptures.length > 3 && (
                      <li>+{getPlaceDossier(hoverPlace)!.scriptures.length - 3} more…</li>
                    )}
                  </ul>
                </>
              )}
              {hoverEdge && !hoverPlace && edgeDossier && (
                <>
                  <div className="font-semibold text-sm text-ink">
                    Connection: {edgeDossier.from} → {edgeDossier.to}
                  </div>
                  <div className="text-muted">{edgeDossier.summary}</div>
                  <div className="text-accent font-medium">
                    {edgeDossier.scriptures.length} related refs · click edge to pin in panel
                  </div>
                </>
              )}
            </div>
          )}
        </Card>

        {/* MACRO */}
        <Card className="p-4 space-y-3">
          <h2 className="font-semibold text-sm">Macro (whole model)</h2>
          <label className="block text-xs space-y-1">
            <span className="text-muted">Day mi · open</span>
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
            <span className="text-muted">Day mi · mountain</span>
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
            <span className="text-muted">Day mi · jungle</span>
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
            <span className="text-muted">View scale</span>
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
            <span className="text-muted">View rotation °</span>
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
          <label className="flex items-start gap-2 text-xs">
            <input
              type="checkbox"
              checked={macro.breakNeck}
              onChange={(e) => patchMacro({ breakNeck: e.target.checked })}
              className="mt-0.5"
            />
            Stress-test narrow-neck edges
          </label>
        </Card>

        {/* MICRO + place coords */}
        <Card className="p-4 space-y-3">
          <h2 className="font-semibold text-sm">Micro + place</h2>
          {selectedPlace && layout[selectedPlace] && (
            <div className="rounded bg-surface-2 p-2 text-xs space-y-1">
              <div className="font-medium">{places.find((p) => p.id === selectedPlace)?.name}</div>
              <div className="text-muted tabular-nums">
                x {layout[selectedPlace].x.toFixed(0)} · y {layout[selectedPlace].y.toFixed(0)}
              </div>
              <div className="grid grid-cols-2 gap-1">
                <label>
                  x
                  <input
                    type="number"
                    className="w-full border border-border rounded px-1 py-0.5"
                    value={Math.round(layout[selectedPlace].x)}
                    onChange={(e) =>
                      setPlacePos(selectedPlace, {
                        ...layout[selectedPlace],
                        x: Number(e.target.value),
                      })
                    }
                  />
                </label>
                <label>
                  y
                  <input
                    type="number"
                    className="w-full border border-border rounded px-1 py-0.5"
                    value={Math.round(layout[selectedPlace].y)}
                    onChange={(e) =>
                      setPlacePos(selectedPlace, {
                        ...layout[selectedPlace],
                        y: Number(e.target.value),
                      })
                    }
                  />
                </label>
              </div>
            </div>
          )}
          <label className="block text-xs space-y-1">
            <span className="text-muted">Edge</span>
            <select
              value={selected?.id}
              onChange={(e) => setSelectedEdge(e.target.value)}
              className="w-full rounded border border-border bg-surface px-2 py-1.5"
            >
              {edges.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.from} → {e.to}
                </option>
              ))}
            </select>
          </label>
          {selected && (
            <>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={selected.enabled}
                  onChange={(e) => patchMicro(selected.id, { enabled: e.target.checked })}
                />
                Enabled
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
                <span className="text-muted">Terrain</span>
                <select
                  value={selected.terrain}
                  onChange={(e) =>
                    patchMicro(selected.id, { terrain: e.target.value as EdgeOverride["terrain"] })
                  }
                  className="w-full rounded border border-border bg-surface px-2 py-1.5"
                >
                  <option value="open">Open</option>
                  <option value="mountain">Mountain</option>
                  <option value="jungle">Jungle</option>
                  <option value="mixed">Mixed</option>
                  <option value="coast">Coast</option>
                  <option value="river">River</option>
                </select>
              </label>
              <label className="block text-xs space-y-1">
                <span className="text-muted">Days override</span>
                <input
                  type="number"
                  step={0.5}
                  min={0}
                  className="w-full rounded border border-border px-2 py-1.5"
                  value={selected.days ?? ""}
                  onChange={(e) =>
                    patchMicro(selected.id, {
                      days: e.target.value === "" ? undefined : Number(e.target.value),
                    })
                  }
                />
              </label>
            </>
          )}
        </Card>
      </div>

      {/* Scripture dossier for selected place or edge */}
      <Card className="p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-semibold">
            Scripture & sources dossier
            {focusPlaceId && placeDossier ? ` · ${placeDossier.name}` : selected ? ` · edge ${selected.from}→${selected.to}` : ""}
          </h2>
          <div className="flex flex-wrap gap-2">
            {focusPlaceId && (
              <a
                href={`/map-lab/feature/${focusPlaceId}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-sm text-accent hover:underline"
              >
                Open full page <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
            <button
              type="button"
              className="text-xs text-muted hover:text-ink"
              onClick={() => setDossierOpen((o) => !o)}
            >
              {dossierOpen ? "Collapse" : "Expand"}
            </button>
          </div>
        </div>
        {dossierOpen && placeDossier && (
          <div className="space-y-3">
            <p className="text-sm text-ink-soft leading-relaxed">{placeDossier.summary}</p>
            <div className="flex flex-wrap gap-1.5">
              <Badge tone="teal">{placeDossier.kind}</Badge>
              <Badge tone="claim">{placeDossier.scriptures.length} verses</Badge>
              <Badge>{placeDossier.edgeIds.length} map connections</Badge>
            </div>
            <ul className="space-y-2 max-h-72 overflow-auto">
              {placeDossier.scriptures.map((s) => (
                <li
                  key={s.ref + s.note}
                  className="text-sm border border-border rounded-[var(--radius-sm)] p-3 space-y-1"
                >
                  <div className="font-semibold">{s.ref}</div>
                  <p className="text-ink-soft text-xs leading-relaxed">{s.note}</p>
                  <div className="flex flex-wrap gap-3 text-xs pt-0.5">
                    <a
                      href={s.studyUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-accent hover:underline"
                    >
                      Official text <ExternalLink className="h-3 w-3" />
                    </a>
                    {s.catalogId && (
                      <Link
                        to="/verses/$verseId"
                        params={{ verseId: s.catalogId }}
                        className="text-accent hover:underline"
                      >
                        Atlas record
                      </Link>
                    )}
                  </div>
                </li>
              ))}
            </ul>
            {placeDossier.relatedFeatureIds.length > 0 && (
              <div className="flex flex-wrap gap-2 items-center text-xs">
                <span className="text-muted">Related:</span>
                {placeDossier.relatedFeatureIds.map((id) => (
                  <button
                    key={id}
                    type="button"
                    className="text-accent hover:underline"
                    onClick={() => {
                      setSelectedPlace(id);
                      setHoverPlace(id);
                    }}
                  >
                    {getPlaceDossier(id)?.name ?? id}
                  </button>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              <Link
                to="/map-lab/feature/$featureId"
                params={{ featureId: placeDossier.id }}
                target="_blank"
                className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm text-accent-fg font-medium"
              >
                Full dossier (new context)
              </Link>
              <Link to="/my-models" className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm">
                Adjust assumptions
              </Link>
            </div>
          </div>
        )}
        {dossierOpen && !placeDossier && edgeDossier && (
          <div className="space-y-3">
            <p className="text-sm text-ink-soft">{edgeDossier.summary}</p>
            <ul className="space-y-2">
              {edgeDossier.scriptures.map((s) => (
                <li key={s.ref + s.note} className="text-sm border border-border rounded p-2">
                  <div className="font-semibold">{s.ref}</div>
                  <p className="text-xs text-muted">{s.note}</p>
                  <a
                    href={s.studyUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-accent hover:underline"
                  >
                    Official text ↗
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex flex-wrap gap-2 text-sm">
              <button
                type="button"
                className="text-accent hover:underline"
                onClick={() => setSelectedPlace(edgeDossier.from)}
              >
                Open {edgeDossier.from}
              </button>
              <button
                type="button"
                className="text-accent hover:underline"
                onClick={() => setSelectedPlace(edgeDossier.to)}
              >
                Open {edgeDossier.to}
              </button>
            </div>
          </div>
        )}
        {dossierOpen && !placeDossier && !edgeDossier && (
          <p className="text-sm text-muted">
            Hover or click a place (e.g. sea east) or connection to see every scripture and source tied to
            it.
          </p>
        )}
      </Card>

      <Card className="p-4 text-sm text-ink-soft space-y-2">
        <h2 className="font-semibold text-ink text-sm">How integration works</h2>
        <ol className="list-decimal pl-5 space-y-1 text-sm">
          <li>Select a model (or a fork from My Models).</li>
          <li>Drag places — layout is stored on that model’s map package.</li>
          <li>Macro/micro knobs also live on the package.</li>
          <li>Save to model (local for now); Export JSON to share or commit later as layout.json.</li>
          <li>Switch models to load a different arrangement (Baja ≠ Heartland defaults).</li>
        </ol>
        <p className="text-xs text-muted">
          Next: Terrain Lab pins the same place IDs to lat/lng on a real DEM. Assumptions stay in My
          Models; spatial form stays here—together they are the full model.
        </p>
        {assumptions.filter((a) => a.modelId === modelId || a.modelId === userModels.find((u) => u.id === modelId)?.forkedFrom).length >
          0 && (
          <p className="text-xs">
            Linked assumptions for this model:{" "}
            {assumptions
              .filter(
                (a) =>
                  a.modelId === modelId ||
                  a.modelId === userModels.find((u) => u.id === modelId)?.forkedFrom,
              )
              .length}{" "}
            in catalog · edit toggles in My Models.
          </p>
        )}
      </Card>
    </div>
  );
}
