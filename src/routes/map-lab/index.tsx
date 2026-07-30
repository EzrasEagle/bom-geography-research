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
  assumptionsForIds,
  getPlaceConnectionBundle,
  placeLabel,
} from "@/lib/place-connections";
import {
  ALL_LAYERS,
  DEFAULT_VISIBLE_LAYERS,
  LAYER_META,
  layerOf,
  type ObjectLayer,
} from "@/data/object-taxonomy";
import { lookupLexicon } from "@/data/lexicon";
import {
  associationDistanceLabel,
  associationsAsMapEdges,
  loadAssociations,
  spanLabel,
} from "@/lib/user-associations";
import {
  DEFAULT_DAY_PIXELS,
  isSoftRegionFeature,
} from "@/data/soft-regions";
import {
  dayLengthPixels,
  dayRingRadius,
  pointAlongPolyline,
  polylineToSvgD,
  polyToSvgPath,
  transformPoints,
  wildernessBandsFromRoutes,
  wildernessEndpoints,
  elevationMarkersForRoute,
} from "@/lib/soft-region-geometry";
import { PATH_PHRASE_SUGGESTIONS, type PathObject } from "@/data/path-phrases";
import {
  loadRouteAssociations,
  saveRouteAssociations,
  type ElevationSegment,
  type RouteAssociation,
  type SpanField,
} from "@/data/route-associations";
import { Plus, Minus, Maximize2 } from "lucide-react";
import {
  multiEdgeControl,
  midOfQuad,
  placeMarkerRadius,
  quadPath,
  elevFromEdgeNotes,
} from "@/lib/map-edge-geometry";
import {
  MAP_OVERLAYS,
  OVERLAY_GROUPS,
  PLANNED_OVERLAYS,
  CHRONO_WINDOWS,
  defaultOverlayState,
  type MapOverlayId,
  type ChronoWindow,
} from "@/data/map-layers";
import {
  loadCampaigns,
  saveCampaigns,
  type Campaign,
} from "@/data/campaigns";
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

const VB = { w: 720, h: 480 };

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
  // p is already in current viewBox user units (includes pan/zoom)
  return { x: p.x, y: p.y };
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
  const [visibleLayers, setVisibleLayers] = useState<ObjectLayer[]>([...DEFAULT_VISIBLE_LAYERS]);
  const [showClimateLayer, setShowClimateLayer] = useState(false);
  const [assocCount, setAssocCount] = useState(0);
  const [showPaths, setShowPaths] = useState(true);
  const [selectedPathId, setSelectedPathId] = useState<string | null>("path-limhi-lost-to-desolation");
  const [pathFilter, setPathFilter] = useState<"all" | "feature">("all");
  const [dayPixels, setDayPixels] = useState(DEFAULT_DAY_PIXELS);
  const [showSoftRegions, setShowSoftRegions] = useState(true);
  const [corridorHalfWidth, setCorridorHalfWidth] = useState(22);
  const [showConstraintEdges, setShowConstraintEdges] = useState(true);
  const [routeAssocs, setRouteAssocs] = useState<RouteAssociation[]>([]);
  const [editRouteId, setEditRouteId] = useState<string | null>("route-nephi-zarahemla-omni");
  const [assocForObject, setAssocForObject] = useState<{ title: string; dist: string; time: string }[]>([]);
  const [dragId, setDragId] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(true);
  const [savedFlash, setSavedFlash] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [mapZoom, setMapZoom] = useState(1.25);
  const [mapPan, setMapPan] = useState({ x: 0, y: 0 });
  const [showCampaigns, setShowCampaigns] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(
    "camp-amlicite-amnihu-minon",
  );
  const [showLabels, setShowLabels] = useState<"auto" | "all" | "hover">("auto");
  const [isPanning, setIsPanning] = useState(false);
  const [panTool, setPanTool] = useState(false);
  const [overlays, setOverlays] = useState(defaultOverlayState);
  const [chronoWindow, setChronoWindow] = useState<ChronoWindow>("all");
  const [layersOpen, setLayersOpen] = useState(false);
  const [panelCampaigns, setPanelCampaigns] = useState(false);
  const [panelMacro, setPanelMacro] = useState(false);
  const [panelMicro, setPanelMicro] = useState(false);
  const [panelPlace, setPanelPlace] = useState(false);
  const [panelAdd, setPanelAdd] = useState(false);
  const [panelRoutes, setPanelRoutes] = useState(false);
  const panStart = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);
  const dragMoved = useRef(false);
  const spaceDown = useRef(false);
  const [connectMode, setConnectMode] = useState(false);
  const [connectFrom, setConnectFrom] = useState<string | null>(null);
  const [newRouteForm, setNewRouteForm] = useState({
    from: "nephi",
    to: "zarahemla",
    name: "",
    corridor: "wilderness" as RouteAssociation["corridor"],
    objects: ["land of Nephi", "into the wilderness", "came down", "land of Zarahemla"] as string[],
    customObject: "",
  });

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
    setRouteAssocs(loadRouteAssociations());
    setCampaigns(loadCampaigns());
  }, []);

  function patchRoute(id: string, patch: Partial<RouteAssociation>) {
    setRouteAssocs((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, ...patch } : r));
      saveRouteAssociations(next);
      return next;
    });
  }

  function patchRouteSpan(
    id: string,
    field: "distance" | "time",
    span: SpanField,
  ) {
    setRouteAssocs((prev) => {
      const next = prev.map((r) => (r.id === id ? { ...r, [field]: span } : r));
      saveRouteAssociations(next);
      return next;
    });
  }

  function addNewRoute(
    fromId: string,
    toId: string,
    name?: string,
    corridor: RouteAssociation["corridor"] = "wilderness",
    objectLabels?: string[],
  ) {
    const id = `route-user-${Date.now()}`;
    const labels =
      objectLabels && objectLabels.length > 0
        ? objectLabels
        : [
            placeLabel(fromId),
            corridor === "wilderness" ? "into the wilderness" : corridor,
            placeLabel(toId),
          ];
    // Ensure endpoints present
    const objs = [...labels];
    if (!objs.some((o) => o.toLowerCase().includes(placeLabel(fromId).toLowerCase().split(" ")[0] ?? ""))) {
      objs.unshift(placeLabel(fromId));
    }
    if (!objs.some((o) => o.toLowerCase().includes(placeLabel(toId).toLowerCase().split(" ")[0] ?? ""))) {
      objs.push(placeLabel(toId));
    }
    const pathObjects: PathObject[] = objs.map((label, i) => {
      const lower = label.toLowerCase();
      let kind: PathObject["kind"] = "phrase";
      if (lower.includes("up")) kind = "elevation";
      else if (lower.includes("down")) kind = "elevation";
      else if (lower.includes("wilderness")) kind = "phrase";
      else if (lower.includes("lost")) kind = "event";
      else if (places.some((pl) => pl.name.toLowerCase() === lower || pl.id === lower)) kind = "place";
      const placeHit = places.find(
        (pl) => pl.name.toLowerCase() === lower || label.toLowerCase().includes(pl.name.toLowerCase()),
      );
      return {
        id: `${id}-po-${i}`,
        label,
        kind: placeHit ? "place" : kind,
        t: objs.length <= 1 ? 0 : i / (objs.length - 1),
        placeId: placeHit?.id,
      };
    });
    const row: RouteAssociation = {
      id,
      name: name || `${placeLabel(fromId)} → ${placeLabel(toId)}`,
      placeIds: [fromId, toId],
      objects: objs,
      pathObjects,
      sourceRefs: [],
      summary: "User-created association — edit path objects, elevation, distance/time",
      distance: {
        quality: "unknown",
        strength: "estimate",
        note: "Text distance not set — fill stated vs estimate below",
      },
      time: { quality: "unknown", strength: "estimate" },
      corridor,
      enabled: true,
      color: "#0f766e",
      style: "solid",
      elevation: [
        { id: `${id}-level`, t0: 0, t1: 1, kind: "level", note: "Default level — edit sequence" },
      ],
      intendedDestinationId: toId,
      actualDestinationId: toId,
    };
    setRouteAssocs((prev) => {
      const next = [...prev, row];
      saveRouteAssociations(next);
      return next;
    });
    setEditRouteId(id);
    setConnectMode(false);
    setConnectFrom(null);
  }

  function patchElevation(routeId: string, elevation: ElevationSegment[]) {
    patchRoute(routeId, { elevation });
  }

  function addElevationSeg(routeId: string) {
    const route = routeAssocs.find((r) => r.id === routeId);
    const segs = [...(route?.elevation ?? [])];
    const lastT = segs.length ? segs[segs.length - 1]!.t1 : 0;
    const t0 = Math.min(0.9, lastT);
    segs.push({
      id: `elev-${Date.now()}`,
      t0,
      t1: 1,
      kind: "down",
      phrase: "",
      note: "New elevation stage",
    });
    // shrink previous last segment if needed
    if (segs.length >= 2) {
      const prev = segs[segs.length - 2]!;
      if (prev.t1 > t0) segs[segs.length - 2] = { ...prev, t1: t0 };
    }
    patchElevation(routeId, segs);
  }

  function updateElevSeg(routeId: string, segId: string, patch: Partial<ElevationSegment>) {
    const route = routeAssocs.find((r) => r.id === routeId);
    if (!route?.elevation) return;
    patchElevation(
      routeId,
      route.elevation.map((s) => (s.id === segId ? { ...s, ...patch } : s)),
    );
  }

  function removeElevSeg(routeId: string, segId: string) {
    const route = routeAssocs.find((r) => r.id === routeId);
    if (!route?.elevation) return;
    patchElevation(
      routeId,
      route.elevation.filter((s) => s.id !== segId),
    );
  }

  function syncObjectsFromPathObjects(routeId: string, pathObjects: PathObject[]) {
    patchRoute(routeId, {
      pathObjects,
      objects: pathObjects.map((o) => o.label),
    });
  }

  function addPathObject(routeId: string, label: string) {
    const route = routeAssocs.find((r) => r.id === routeId);
    if (!route || !label.trim()) return;
    const existing = route.pathObjects ?? route.objects.map((o, i) => ({
      id: `${routeId}-legacy-${i}`,
      label: o,
      kind: "phrase" as const,
      t: route.objects.length <= 1 ? 0 : i / Math.max(1, route.objects.length - 1),
    }));
    if (existing.some((o) => o.label.toLowerCase() === label.trim().toLowerCase())) return;
    const next = [
      ...existing,
      {
        id: `po-${Date.now()}`,
        label: label.trim(),
        kind: (label.toLowerCase().includes("up") || label.toLowerCase().includes("down")
          ? "elevation"
          : label.toLowerCase().includes("wilderness")
            ? "phrase"
            : "phrase") as PathObject["kind"],
        t: 0.5,
      },
    ];
    // re-spread t
    const spaced = next.map((o, i) => ({
      ...o,
      t: next.length <= 1 ? 0 : i / (next.length - 1),
    }));
    syncObjectsFromPathObjects(routeId, spaced);
  }

  function removePathObject(routeId: string, poId: string) {
    const route = routeAssocs.find((r) => r.id === routeId);
    if (!route) return;
    const existing = route.pathObjects ?? [];
    const next = existing.filter((o) => o.id !== poId);
    const spaced = next.map((o, i) => ({
      ...o,
      t: next.length <= 1 ? 0 : i / (next.length - 1),
    }));
    syncObjectsFromPathObjects(routeId, spaced);
  }

  function movePathObject(routeId: string, poId: string, dir: -1 | 1) {
    const route = routeAssocs.find((r) => r.id === routeId);
    if (!route?.pathObjects) return;
    const segs = [...route.pathObjects];
    const i = segs.findIndex((s) => s.id === poId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= segs.length) return;
    [segs[i], segs[j]] = [segs[j]!, segs[i]!];
    const spaced = segs.map((o, idx) => ({
      ...o,
      t: segs.length <= 1 ? 0 : idx / (segs.length - 1),
    }));
    syncObjectsFromPathObjects(routeId, spaced);
  }

  function moveElevSeg(routeId: string, segId: string, dir: -1 | 1) {
    const route = routeAssocs.find((r) => r.id === routeId);
    if (!route?.elevation) return;
    const segs = [...route.elevation];
    const i = segs.findIndex((s) => s.id === segId);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= segs.length) return;
    [segs[i], segs[j]] = [segs[j]!, segs[i]!];
    // re-normalize t ranges evenly
    const n = segs.length;
    const normalized = segs.map((s, idx) => ({
      ...s,
      t0: idx / n,
      t1: (idx + 1) / n,
    }));
    patchElevation(routeId, normalized);
  }

  /** Layout-derived path length in abstract miles (using dayPixels + open day miles scale) */
  function layoutDerivedMiles(placeIds: string[]): number | null {
    let total = 0;
    for (let i = 1; i < placeIds.length; i++) {
      const a = layout[placeIds[i - 1]!];
      const b = layout[placeIds[i]!];
      if (!a || !b) return null;
      const px = Math.hypot(b.x - a.x, b.y - a.y);
      // dayPixels map units ≈ 1 open day ≈ dayMilesOpen miles
      total += (px / Math.max(1, dayPixels)) * macro.dayMilesOpen;
    }
    return Math.round(total * 10) / 10;
  }

  function layoutDerivedDays(placeIds: string[], terrain: "open" | "mountain" | "jungle" | "mixed" = "mixed"): number | null {
    const mi = layoutDerivedMiles(placeIds);
    if (mi == null) return null;
    let dayMi = macro.dayMilesOpen;
    if (terrain === "mountain") dayMi = macro.dayMilesMountain;
    if (terrain === "jungle") dayMi = macro.dayMilesJungle;
    if (terrain === "mixed") dayMi = (macro.dayMilesOpen + macro.dayMilesJungle) / 2;
    return Math.round((mi / Math.max(1, dayMi)) * 10) / 10;
  }

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

  function handlePlaceClick(id: string) {
    if (connectMode) {
      if (!connectFrom) {
        setConnectFrom(id);
        setSelectedPlace(id);
        return;
      }
      if (connectFrom === id) {
        setConnectFrom(null);
        return;
      }
      addNewRoute(connectFrom, id);
      return;
    }
    setSelectedPlace(id);
    setDossierOpen(true);
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

  const wildernessBandsDisplay = useMemo(() => {
    const bands = wildernessBandsFromRoutes(routeAssocs, layout, corridorHalfWidth);
    return bands.map((b) => ({
      id: b.id,
      route: b.route,
      spine: transformPoints(b.spine, (keyed) =>
        applyMacroTransform(keyed, macro.directionRotation, macro.globalScale),
      ),
      points: transformPoints(b.points, (keyed) =>
        applyMacroTransform(keyed, macro.directionRotation, macro.globalScale),
      ),
      mid: transformPoints([b.mid], (keyed) =>
        applyMacroTransform(keyed, macro.directionRotation, macro.globalScale),
      )[0]!,
      branchPt:
        b.route.branchesFromRouteId && b.spine.length >= 2
          ? transformPoints(
              [
                pointAlongPolyline(
                  b.spine,
                  // branch is second point in spine for branch routes (start, branch, end)
                  b.spine.length >= 3 ? 0.5 : b.route.branchT ?? 0.5,
                ),
              ],
              // wait - spine already in model space; transform after
              (keyed) => keyed,
            )[0]
          : null,
    })).map((b) => {
      // Fix branchPt transform properly
      let branchPt = null as { x: number; y: number } | null;
      if (b.route.branchesFromRouteId && b.spine.length >= 3) {
        // spine already display-transformed: [start, branch, end]
        branchPt = b.spine[1]!;
      }
      return { ...b, branchPt };
    });
  }, [routeAssocs, layout, corridorHalfWidth, macro.directionRotation, macro.globalScale]);

  const wildEndpoints = useMemo(
    () => wildernessEndpoints(routeAssocs),
    [routeAssocs],
  );

  const elevMarkersDisplay = useMemo(() => {
    const out: {
      routeId: string;
      segmentId: string;
      kind: string;
      phrase?: string;
      note?: string;
      x: number;
      y: number;
    }[] = [];
    for (const band of wildernessBandsDisplay) {
      const segs = band.route.elevation ?? [];
      if (!segs.length) continue;
      // spine is already display-transformed
      const marks = elevationMarkersForRoute(band.id, band.spine, segs);
      for (const m of marks) {
        out.push({
          routeId: m.routeId,
          segmentId: m.segmentId,
          kind: m.kind,
          phrase: m.phrase,
          note: m.note,
          x: m.at.x,
          y: m.at.y,
        });
      }
    }
    return out;
  }, [wildernessBandsDisplay]);


  const dayPxWild = useMemo(
    () =>
      dayLengthPixels(
        dayPixels,
        macro.dayMilesOpen,
        Math.min(macro.dayMilesJungle, macro.dayMilesMountain, macro.dayMilesOpen),
      ),
    [dayPixels, macro.dayMilesOpen, macro.dayMilesJungle, macro.dayMilesMountain],
  );


  const editingRoute = useMemo(
    () => routeAssocs.find((r) => r.id === editRouteId) ?? null,
    [routeAssocs, editRouteId],
  );

  const edges = useMemo(() => {
    const userEdges = associationsAsMapEdges(loadAssociations()).map((u) => ({
      id: u.id,
      from: u.from,
      to: u.to,
      type: u.type as (typeof seedConstraints)[0]["type"],
      value: u.value,
      sourceVerse: u.sourceVerse,
      notes: u.notes,
      strength: u.strength,
      maxDayFraction: u.maxDayFraction,
    }));

    const combined = [
      ...seedConstraints.map((c) => ({ ...c, maxDayFraction: c.type === "adjacent" ? 0.5 : 2 })),
      ...userEdges,
    ];

    return combined.map((c) => {
      const o = micro[c.id] ?? {};
      const enabled = o.enabled !== false;
      const strength = o.strength ?? c.strength;
      const terrain = o.terrain ?? macro.defaultTerrain;
      let dayMiles = macro.dayMilesOpen;
      if (terrain === "mountain") dayMiles = macro.dayMilesMountain;
      if (terrain === "jungle") dayMiles = macro.dayMilesJungle;

      const maxDayFraction = (c as { maxDayFraction?: number }).maxDayFraction ?? 1;
      const maxPx = dayPixels * maxDayFraction;

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

      // Hard near edges: stretched beyond maxDayFraction of a day-walk → conflict
      const a = displayLayout[c.from];
      const b = displayLayout[c.to];
      if (a && b && enabled && strength === "hard") {
        const dist = Math.hypot(a.x - b.x, a.y - b.y);
        const limit =
          c.type === "adjacent" || maxDayFraction <= 1 ? Math.max(maxPx, 80) : 220;
        if (dist > limit) {
          color = "#b45309";
          conflict = true;
        }
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
        note: o.note ?? (c as { notes?: string }).notes,
        maxDayFraction,
      };
    });
  }, [macro, micro, displayLayout, dayPixels, assocCount]);

  const selected = edges.find((e) => e.id === selectedEdge) ?? edges[0];
  const redCount = edges.filter((e) => e.conflict && e.enabled).length;

  const focusPlaceId = selectedPlace ?? hoverPlace;
  const effectiveLayers = useMemo(() => {
    const s = new Set(visibleLayers);
    if (showClimateLayer) {
      s.add("climate");
      s.add("season");
    }
    return s;
  }, [visibleLayers, showClimateLayer]);

  const pickerPlaces = useMemo(
    () => places.filter((pl) => effectiveLayers.has(layerOf(pl.id))),
    [effectiveLayers],
  );

  const objectId =
    selectedPlace && effectiveLayers.has(layerOf(selectedPlace))
      ? selectedPlace
      : pickerPlaces[0]?.id ?? places[0]?.id ?? null;
  const objectBundle = useMemo(
    () => (objectId ? getPlaceConnectionBundle(objectId) : null),
    [objectId],
  );
  const objectAssumptions = useMemo(
    () => (objectBundle ? assumptionsForIds(objectBundle.assumptionIds) : []),
    [objectBundle],
  );

  useEffect(() => {
    const all = loadAssociations();
    setAssocCount(all.length);
  }, [loaded]);

  useEffect(() => {
    if (!objectId) {
      setAssocForObject([]);
      return;
    }
    const all = loadAssociations();
    const hit = all.filter((a) =>
      a.legs.some((l) => l.fromFeatureId === objectId || l.toFeatureId === objectId),
    );
    setAssocForObject(
      hit.map((a) => ({
        title: a.title,
        dist: associationDistanceLabel(a),
        time: spanLabel(a.pathTime),
      })),
    );
    setAssocCount(all.length);
  }, [objectId, loaded]);
  const placeDossier = focusPlaceId ? getPlaceDossier(focusPlaceId) : undefined;



  const edgeDossier = useMemo(() => {
    const e = edges.find((x) => x.id === (hoverEdge || selectedEdge));
    if (!e) return null;
    return buildEdgeDossier(e.id, e.from, e.to, e.value, e.sourceVerse);
  }, [edges, hoverEdge, selectedEdge]);



  function ov(id: MapOverlayId) {
    return overlays[id] !== false;
  }

  function toggleOverlay(id: MapOverlayId) {
    setOverlays((prev) => {
      const next = { ...prev, [id]: !prev[id] };
      if (id === "campaigns") setShowCampaigns(next.campaigns);
      if (id === "constraint_edges" || id === "user_associations") {
        setShowConstraintEdges(next.constraint_edges || next.user_associations);
      }
      if (id === "soft_wilderness") setShowSoftRegions(next.soft_wilderness);
      if (id === "paths_corridors") setShowPaths(next.paths_corridors);
      if (id === "climate") setShowClimateLayer(next.climate);
      return next;
    });
  }

  function zoomAt(clientX: number, clientY: number, nextZoom: number) {
    const svg = svgRef.current;
    const z0 = mapZoom;
    const z1 = Math.min(8, Math.max(0.5, nextZoom));
    if (!svg || z1 === z0) {
      setMapZoom(z1);
      return;
    }
    const rect = svg.getBoundingClientRect();
    const fx = (clientX - rect.left) / Math.max(1, rect.width);
    const fy = (clientY - rect.top) / Math.max(1, rect.height);
    const vbW0 = VB.w / z0;
    const vbH0 = VB.h / z0;
    const vbW1 = VB.w / z1;
    const vbH1 = VB.h / z1;
    const mx = mapPan.x + fx * vbW0;
    const my = mapPan.y + fy * vbH0;
    setMapZoom(z1);
    setMapPan({ x: mx - fx * vbW1, y: my - fy * vbH1 });
  }

  function resetView() {
    setMapZoom(1.25);
    setMapPan({ x: 0, y: 0 });
  }

  function centerOnPlace(id: string) {
    const pt = displayLayout[id] ?? layout[id];
    if (!pt) return;
    const z = Math.max(mapZoom, 2);
    setMapZoom(z);
    setMapPan({ x: pt.x - VB.w / z / 2, y: pt.y - VB.h / z / 2 });
  }

  function beginPan(clientX: number, clientY: number) {
    setIsPanning(true);
    panStart.current = { x: clientX, y: clientY, panX: mapPan.x, panY: mapPan.y };
  }

  const onPointerDownPlace = useCallback(
    (id: string, e: React.PointerEvent) => {
      e.stopPropagation();
      setSelectedPlace(id);
      setDossierOpen(true);
      if (connectMode) {
        handlePlaceClick(id);
        return;
      }
      if (panTool || spaceDown.current) {
        beginPan(e.clientX, e.clientY);
        return;
      }
      if (!editMode) return;
      dragMoved.current = false;
      setDragId(id);
      (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    },
    [editMode, connectMode, panTool, mapPan.x, mapPan.y],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (isPanning && panStart.current) {
        const svg = svgRef.current;
        const rect = svg?.getBoundingClientRect();
        const unitX = rect ? VB.w / mapZoom / rect.width : 1 / mapZoom;
        const unitY = rect ? VB.h / mapZoom / rect.height : 1 / mapZoom;
        setMapPan({
          x: panStart.current.panX - (e.clientX - panStart.current.x) * unitX,
          y: panStart.current.panY - (e.clientY - panStart.current.y) * unitY,
        });
        return;
      }
      if (!dragId || !svgRef.current || !editMode) return;
      dragMoved.current = true;
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
        x: Math.min(VB.w + 80, Math.max(-40, cx + ux)),
        y: Math.min(VB.h + 80, Math.max(-40, cy + uy)),
      });
    },
    [dragId, editMode, macro.globalScale, macro.directionRotation, isPanning, mapZoom],
  );

  const onPointerUp = useCallback(() => {
    setDragId(null);
    setIsPanning(false);
    panStart.current = null;
  }, []);

  const modelLabel =
    userModels.find((u) => u.id === modelId)?.name ??
    models.find((m) => m.id === modelId)?.name ??
    modelId;

  /** Fan out multiple edges between the same place pair */
  const edgeDrawList = useMemo(() => {
    const groups = new Map<string, typeof edges>();
    for (const e of edges) {
      if (!e.enabled) continue;
      const key = [e.from, e.to].sort().join("|");
      const g = groups.get(key) ?? [];
      g.push(e);
      groups.set(key, g);
    }
    const out: {
      e: (typeof edges)[0];
      a: Point;
      b: Point;
      ctrl: Point;
      mid: Point;
      elev: ReturnType<typeof elevFromEdgeNotes>;
      multi: number;
    }[] = [];
    for (const g of groups.values()) {
      g.forEach((e, i) => {
        const a = displayLayout[e.from];
        const b = displayLayout[e.to];
        if (!a || !b) return;
        const ctrl = multiEdgeControl(a, b, i, g.length, 16 + Math.min(12, g.length * 2));
        const mid = midOfQuad(a, b, ctrl);
        const elev = elevFromEdgeNotes(
          String(e.value ?? ""),
          (e as { note?: string }).note,
          (e as { placement?: string }).placement,
        );
        out.push({ e, a, b, ctrl, mid, elev, multi: g.length });
      });
    }
    return out;
  }, [edges, displayLayout]);

  const campaignPaths = useMemo(() => {
    return campaigns
      .filter((c) => c.enabled)
      .map((c) => {
        const pts = c.waypoints
          .map((w) => (w.placeId ? displayLayout[w.placeId] : null))
          .filter(Boolean) as Point[];
        return { campaign: c, pts };
      })
      .filter((x) => x.pts.length >= 2);
  }, [campaigns, displayLayout]);

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
          <label className="inline-flex items-center gap-2 text-sm px-2">
            <input type="checkbox" checked={showPaths} onChange={(e) => setShowPaths(e.target.checked)} />
            Multi-paths
          </label>
          <label className="inline-flex items-center gap-2 text-sm px-2">
            <input
              type="checkbox"
              checked={showSoftRegions}
              onChange={(e) => setShowSoftRegions(e.target.checked)}
            />
            Soft regions
          </label>
          <label className="inline-flex items-center gap-2 text-sm px-2">
            <input
              type="checkbox"
              checked={showConstraintEdges}
              onChange={(e) => setShowConstraintEdges(e.target.checked)}
            />
            Constraint links
          </label>
          <label className="inline-flex items-center gap-2 text-sm px-2">
            <input
              type="checkbox"
              checked={showCampaigns}
              onChange={(e) => setShowCampaigns(e.target.checked)}
            />
            Campaigns / armies
          </label>
          <label className="inline-flex items-center gap-2 text-sm px-2">
            Labels
            <select
              value={showLabels}
              onChange={(e) => setShowLabels(e.target.value as typeof showLabels)}
              className="rounded border border-border px-1 py-0.5 text-xs bg-surface"
            >
              <option value="auto">auto (zoom/hover)</option>
              <option value="hover">hover only</option>
              <option value="all">all</option>
            </select>
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

      {/* Map (full width) + fixed inspector tray + collapsed controls */}
      <div className="space-y-3">
        <Card className="p-2 md:p-3 overflow-hidden flex flex-col">

          <div className="flex flex-wrap items-center justify-between gap-2 px-1 pb-2">
            <span className="text-xs font-semibold text-muted uppercase tracking-wide">
              Map canvas
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                className="rounded border border-border px-2 py-1 text-xs hover:bg-surface-2"
                onClick={() => {
                  const svg = svgRef.current;
                  const rect = svg?.getBoundingClientRect();
                  if (rect) zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, mapZoom - 0.25);
                  else setMapZoom((z) => Math.max(0.5, z - 0.25));
                }}
                title="Zoom out"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="text-xs tabular-nums w-12 text-center">{Math.round(mapZoom * 100)}%</span>
              <button
                type="button"
                className="rounded border border-border px-2 py-1 text-xs hover:bg-surface-2"
                onClick={() => {
                  const svg = svgRef.current;
                  const rect = svg?.getBoundingClientRect();
                  if (rect) zoomAt(rect.left + rect.width / 2, rect.top + rect.height / 2, mapZoom + 0.25);
                  else setMapZoom((z) => Math.min(8, z + 0.25));
                }}
                title="Zoom in"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className={`rounded border px-2 py-1 text-xs ${
                  panTool ? "bg-teal text-white border-teal" : "border-border hover:bg-surface-2"
                }`}
                onClick={() => setPanTool((p) => !p)}
                title="Pan tool (or hold Space)"
              >
                Pan
              </button>
              <button
                type="button"
                className="rounded border border-border px-2 py-1 text-xs hover:bg-surface-2"
                onClick={resetView}
                title="Reset view"
              >
                <Maximize2 className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                className="rounded border border-border px-2 py-1 text-xs hover:bg-surface-2 disabled:opacity-40"
                disabled={!selectedPlace}
                onClick={() => selectedPlace && centerOnPlace(selectedPlace)}
                title="Center on selected"
              >
                Center
              </button>
              <button
                type="button"
                className={`rounded px-2.5 py-1 text-xs font-medium border ${
                  connectMode
                    ? "bg-accent text-accent-fg border-accent"
                    : "border-border hover:bg-surface-2"
                }`}
                onClick={() => {
                  setConnectMode((c) => !c);
                  setConnectFrom(null);
                }}
              >
                {connectMode
                  ? connectFrom
                    ? `Click end (from ${placeLabel(connectFrom)})…`
                    : "Click start place…"
                  : "Add connection"}
              </button>
            </div>
          </div>
          <svg
            ref={svgRef}
            viewBox={`${mapPan.x} ${mapPan.y} ${VB.w / mapZoom} ${VB.h / mapZoom}`}
            className={`w-full h-[min(70vh,640px)] min-h-[420px] bg-[#faf6ef] rounded-[var(--radius)] touch-none border border-border/60 ${
              panTool || isPanning ? "cursor-grab active:cursor-grabbing" : ""
            }`}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
            onWheel={(e) => {
              e.preventDefault();
              if (e.ctrlKey || e.metaKey) {
                const delta = e.deltaY > 0 ? -0.12 : 0.12;
                zoomAt(e.clientX, e.clientY, mapZoom + delta);
                return;
              }
              // Two-finger trackpad pan (and mouse wheel pan)
              const svg = svgRef.current;
              const rect = svg?.getBoundingClientRect();
              const unitX = rect ? VB.w / mapZoom / rect.width : 1 / mapZoom;
              const unitY = rect ? VB.h / mapZoom / rect.height : 1 / mapZoom;
              setMapPan((p) => ({
                x: p.x + e.deltaX * unitX,
                y: p.y + e.deltaY * unitY,
              }));
            }}
            onPointerDown={(e) => {
              const wantPan =
                panTool ||
                spaceDown.current ||
                e.button === 1 ||
                e.altKey ||
                e.button === 2 ||
                (e.button === 0 && e.target === e.currentTarget);
              if (wantPan) {
                e.preventDefault();
                (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
                beginPan(e.clientX, e.clientY);
              }
            }}
            onDoubleClick={(e) => {
              if (e.target === e.currentTarget) resetView();
            }}
            onContextMenu={(e) => e.preventDefault()}
          >
            <defs>
              <marker id="arrowhead" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L6,3 L0,6 Z" fill="#b91c1c" />
              </marker>
            </defs>
            <rect x="0" y="0" width="56" height={VB.h} fill="#ccfbf1" opacity="0.55" />
            <rect x={VB.w - 56} y="0" width="56" height={VB.h} fill="#ccfbf1" opacity="0.55" />
            
            


            {/* Constraint / association edges (curved when multi) */}
            {(ov("constraint_edges") || ov("user_associations")) &&
              edgeDrawList.map(({ e, a, b, ctrl, mid, elev, multi }) => {
                const active = e.id === selected?.id;
                const d = quadPath(a, b, ctrl);
                return (
                  <g key={e.id}>
                    {/* wide invisible hit target */}
                    <path
                      d={d}
                      fill="none"
                      stroke="transparent"
                      strokeWidth={14}
                      className="cursor-pointer"
                      onClick={(ev) => {
                        ev.stopPropagation();
                        setSelectedEdge(e.id);
                        setSelectedPlace(null);
                      }}
                      onPointerEnter={() => setHoverEdge(e.id)}
                      onPointerLeave={() => setHoverEdge((h) => (h === e.id ? null : h))}
                    />
                    <path
                      d={d}
                      fill="none"
                      stroke={e.color}
                      strokeWidth={active || hoverEdge === e.id ? 3.25 : e.strength === "hard" ? 1.75 : 1.15}
                      strokeDasharray={e.strength === "soft" ? "4 3" : undefined}
                      opacity={0.92}
                      className="pointer-events-none"
                    />
                    {multi > 1 && (
                      <circle cx={mid.x} cy={mid.y} r={3} fill={e.color} opacity={0.85} className="pointer-events-none" />
                    )}
                    {elev !== "none" && (
                      <text
                        x={mid.x}
                        y={mid.y - 6}
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="700"
                        fill={elev === "up" ? "#b45309" : elev === "down" ? "#1e3a5f" : "#57534e"}
                        className="pointer-events-none select-none"
                      >
                        {elev === "up" ? "↑" : elev === "down" ? "↓" : "≈"}
                      </text>
                    )}
                    <title>
                      {e.from} → {e.to}: {String(e.value)}
                      {e.sourceVerse ? ` · ${e.sourceVerse}` : ""}
                      {multi > 1 ? ` · ${multi} links this pair` : ""}
                    </title>
                  </g>
                );
              })}

            {/* Wilderness bands — one per enabled route; multi-endpoint stretches shape */}
            {ov("soft_wilderness") &&
              wildernessBandsDisplay.map((band) => (
                <path
                  key={band.id}
                  d={polyToSvgPath(band.points)}
                  fill="#3f6212"
                  fillOpacity={
                    editRouteId === band.id || selectedPlace === "wilderness" ? 0.36 : 0.18
                  }
                  stroke="#14532d"
                  strokeWidth={editRouteId === band.id ? 2 : 1.25}
                  strokeDasharray="6 3"
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedPlace("wilderness");
                    setEditRouteId(band.id);
                  }}
                >
                  <title>
                    {band.route.name} · dist {band.route.distance.quality} · time{" "}
                    {band.route.time.quality}
                    {band.route.lost ? " · LOST" : ""}
                  </title>
                </path>
              ))}

            {/* Route centerlines (editable associations) */}
            {ov("paths_corridors") &&
              wildernessBandsDisplay.map((band) => {
                const d = polylineToSvgD(band.spine);
                const sel = editRouteId === band.id;
                const dash =
                  band.route.style === "dashed"
                    ? "8 5"
                    : band.route.style === "dotted"
                      ? "2 5"
                      : undefined;
                return (
                  <g key={`line-${band.id}`}>
                    <path
                      d={d}
                      fill="none"
                      stroke={band.route.color}
                      strokeWidth={sel ? 4 : 2.5}
                      strokeDasharray={dash}
                      opacity={0.9}
                      className="cursor-pointer"
                      onClick={() => setEditRouteId(band.id)}
                    />
                    {/* Branch split marker INSIDE wilderness */}
                    {band.branchPt && (
                      <g>
                        <circle
                          cx={band.branchPt.x}
                          cy={band.branchPt.y}
                          r={7}
                          fill="#fffdf8"
                          stroke={band.route.color}
                          strokeWidth={2.5}
                        />
                        <text
                          x={band.branchPt.x + 10}
                          y={band.branchPt.y - 6}
                          fontSize="9"
                          fill={band.route.color}
                          className="select-none pointer-events-none font-semibold"
                        >
                          split / lost
                        </text>
                      </g>
                    )}
                    {/* Ghost intended destination */}
                    {band.route.lost &&
                      band.route.intendedDestinationId &&
                      displayLayout[band.route.intendedDestinationId] &&
                      band.branchPt && (
                        <path
                          d={`M ${band.branchPt.x} ${band.branchPt.y} L ${displayLayout[band.route.intendedDestinationId]!.x} ${displayLayout[band.route.intendedDestinationId]!.y}`}
                          fill="none"
                          stroke={band.route.color}
                          strokeWidth={1.5}
                          strokeDasharray="4 4"
                          opacity={0.4}
                        />
                      )}
                  </g>
                );
              })}


            {/* Path object beads on selected/edited route */}
            {ov("paths_corridors") &&
              wildernessBandsDisplay
                .filter((b) => b.id === editRouteId || b.route.pathObjects?.length)
                .flatMap((band) => {
                  const pos = band.route.pathObjects ?? [];
                  return pos.map((po) => {
                    if (po.t == null && !po.placeId) return null;
                    let pt = po.placeId && displayLayout[po.placeId]
                      ? displayLayout[po.placeId]!
                      : pointAlongPolyline(band.spine, po.t ?? 0.5);
                    // pointAlongPolyline expects model? spine is display space
                    return (
                      <g key={`${band.id}-${po.id}`}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={band.id === editRouteId ? 5 : 3.5}
                          fill="#fffdf8"
                          stroke={
                            po.kind === "elevation"
                              ? "#b45309"
                              : po.kind === "event"
                                ? "#b91c1c"
                                : "#0f766e"
                          }
                          strokeWidth={1.5}
                        />
                        {(band.id === editRouteId || po.kind === "elevation") && (
                          <text
                            x={pt.x + 7}
                            y={pt.y - 6}
                            fontSize="8"
                            fill="#44403c"
                            className="select-none pointer-events-none"
                          >
                            {po.label.length > 22 ? po.label.slice(0, 20) + "…" : po.label}
                          </text>
                        )}
                        <title>{po.label}</title>
                      </g>
                    );
                  });
                })}

            {/* Elevation signals along corridors */}
            {ov("elevation") &&
              elevMarkersDisplay.map((m) => {
                const color =
                  m.kind === "up" ? "#b45309" : m.kind === "down" ? "#1e3a5f" : "#57534e";
                const label =
                  m.kind === "up" ? "↑ up" : m.kind === "down" ? "↓ down" : "≈ level";
                return (
                  <g key={`${m.routeId}-${m.segmentId}`} className="pointer-events-none">
                    {m.kind === "level" ? (
                      <rect
                        x={m.x - 14}
                        y={m.y - 5}
                        width={28}
                        height={10}
                        rx={3}
                        fill="#faf6ef"
                        stroke={color}
                        strokeWidth={1.5}
                        opacity={0.9}
                      />
                    ) : (
                      <circle
                        cx={m.x}
                        cy={m.y}
                        r={11}
                        fill="#faf6ef"
                        stroke={color}
                        strokeWidth={2}
                      />
                    )}
                    <text
                      x={m.x}
                      y={m.y + 3.5}
                      textAnchor="middle"
                      fontSize="9"
                      fontWeight="700"
                      fill={color}
                    >
                      {label}
                    </text>
                    <title>
                      {m.phrase ?? m.kind}
                      {m.note ? ` — ${m.note}` : ""}
                    </title>
                  </g>
                );
              })}

            {/* Campaign progressions (armies / lost parties) — flex routes */}
            {ov("campaigns") &&
              campaignPaths.map(({ campaign: c, pts }) => {
                const sel = selectedCampaignId === c.id;
                // simple polyline; later: obstacle-aware flex
                const d = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
                return (
                  <g key={c.id} className="cursor-pointer" onClick={() => setSelectedCampaignId(c.id)}>
                    <path
                      d={d}
                      fill="none"
                      stroke={c.color}
                      strokeWidth={sel ? 4 : 2.5}
                      strokeDasharray={
                        c.style === "dashed" ? "7 4" : c.style === "dotted" ? "2 4" : undefined
                      }
                      opacity={0.95}
                      markerEnd="url(#arrowhead)"
                    />
                    {/* actor label at midpoint */}
                    {pts.length >= 2 && (
                      <text
                        x={(pts[0]!.x + pts[pts.length - 1]!.x) / 2}
                        y={(pts[0]!.y + pts[pts.length - 1]!.y) / 2 - 8}
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="600"
                        fill={c.color}
                        className="select-none pointer-events-none"
                      >
                        {c.actor}
                        {c.flexAroundObstacles ? " · flex" : ""}
                      </text>
                    )}
                    <title>
                      {c.name}: {c.summary}
                    </title>
                  </g>
                );
              })}

            {/* Day rings on wilderness endpoints */}
            {ov("day_rings") &&
              (selectedPlace === "wilderness" || hoverPlace === "wilderness") &&
              wildEndpoints.map((pid) => {
                const c = displayLayout[pid];
                if (!c) return null;
                const r = dayRingRadius(1, dayPxWild) * macro.globalScale;
                return (
                  <circle
                    key={`ring-${pid}`}
                    cx={c.x}
                    cy={c.y}
                    r={r}
                    fill="none"
                    stroke="#3f6212"
                    strokeWidth={1}
                    strokeDasharray="4 3"
                    opacity={0.45}
                  />
                );
              })}

            {ov("places") &&
              places
                .filter((p) => {
                  if (!(effectiveLayers.has(layerOf(p.id)) || objectId === p.id)) return false;
                  if (p.kind === "sea" && !ov("seas")) return false;
                  const L = layerOf(p.id);
                  if ((L === "climate" || L === "season") && !ov("climate")) return false;
                  return true;
                })
                .map((p) => {
              const pos = displayLayout[p.id] ?? { x: 260, y: 180 };
              const isSea = p.kind === "sea";
              const isSoft = isSoftRegionFeature(p.id, p.kind);
              const selected = selectedPlace === p.id || objectId === p.id;
              const hovered = hoverPlace === p.id;
              const isNeighbor = objectBundle?.neighborIds.includes(p.id) ?? false;
              const inSphere = objectBundle?.sphereMemberIds.includes(p.id) ?? false;
              const dossier = getPlaceDossier(p.id);
              const nRefs = dossier?.scriptures.length ?? 0;
              // Soft regions: centroid handle only (blob drawn separately)
              if (isSoft && p.id === "wilderness") {
                const mids = wildernessBandsDisplay.map((b) => b.mid);
                const cx =
                  mids.length > 0
                    ? mids.reduce((s, m) => s + m.x, 0) / mids.length
                    : pos.x;
                const cy =
                  mids.length > 0
                    ? mids.reduce((s, m) => s + m.y, 0) / mids.length
                    : pos.y;
                return (
                  <g
                    key={p.id}
                    className="cursor-pointer"
                    onClick={() => handlePlaceClick(p.id)}
                    onPointerEnter={() => setHoverPlace(p.id)}
                    onPointerLeave={() => setHoverPlace((h) => (h === p.id ? null : h))}
                  >
                    <title>
                      Wilderness corridor(s) — along routes only; does not encompass cities
                    </title>
                    <polygon
                      points={`${cx},${cy - 8} ${cx + 7},${cy} ${cx},${cy + 8} ${cx - 7},${cy}`}
                      fill="#3f6212"
                      stroke={selected || hovered ? "#f59e0b" : "#14532d"}
                      strokeWidth={2}
                    />
                    <text
                      x={cx + 10}
                      y={cy + 3}
                      fontSize="9"
                      fill="#14532d"
                      className="select-none pointer-events-none font-semibold"
                    >
                      wilderness corridor
                    </text>
                  </g>
                );
              }
              return (
                <g
                  key={p.id}
                  className={editMode ? "cursor-grab active:cursor-grabbing" : "cursor-pointer"}
                  onPointerDown={(e) => onPointerDownPlace(p.id, e)}
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
                      r={placeMarkerRadius(p.kind, p.sizeTier) * (selected || hovered ? 1.25 : 1)}
                      fill={
                        p.kind === "river"
                          ? "#1e3a5f"
                          : p.kind === "hill"
                            ? "#78716c"
                            : p.kind === "land"
                              ? "#b45309"
                              : "#9a3412"
                      }
                      stroke={selected || hovered ? "#f59e0b" : inSphere ? "#0369a1" : isNeighbor ? "#0f766e" : "white"}
                      strokeWidth={selected || hovered ? 2 : 1}
                    />
                  )}
                  {nRefs > 0 && (selected || hovered || mapZoom >= 1.8) && (
                    <text
                      x={pos.x + 5}
                      y={pos.y - 5}
                      fontSize="7"
                      fill="#9a3412"
                      className="select-none pointer-events-none font-semibold"
                    >
                      {nRefs}
                    </text>
                  )}
                  {(showLabels === "all" ||
                    selected ||
                    hovered ||
                    (showLabels === "auto" && mapZoom >= 1.6)) && (
                    <text
                      x={pos.x + 7}
                      y={pos.y + 3}
                      fontSize={mapZoom >= 2 ? 9 : 8}
                      fill="#1c1917"
                      className="select-none pointer-events-none"
                      style={{ paintOrder: "stroke", stroke: "#faf6ef", strokeWidth: 2.5 }}
                    >
                      {p.name.length > 18 && mapZoom < 2 ? p.name.slice(0, 16) + "…" : p.name}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <p className="text-[11px] text-muted mt-2">
            Pan: trackpad / wheel / Pan tool / Space+drag · Zoom: pinch or +/− · Center · double-click empty = reset
          </p>
        </Card>

        {/* Fixed-height inspector — never collapses, so the map does not jump */}
        <div className="rounded-[var(--radius)] border border-border bg-surface-2/80 px-3 py-2 min-h-[5.5rem] h-[5.5rem] overflow-hidden text-xs">
          {hoverPlace && getPlaceDossier(hoverPlace) ? (
            <div className="space-y-0.5">
              <div className="font-semibold text-sm text-ink truncate">
                {getPlaceDossier(hoverPlace)!.name}
                <span className="ml-2 font-normal text-muted">
                  {getPlaceDossier(hoverPlace)!.scriptures.length} refs · click pin for full dossier
                </span>
              </div>
              <div className="text-muted line-clamp-2">{getPlaceDossier(hoverPlace)!.summary}</div>
            </div>
          ) : hoverEdge && edgeDossier ? (
            <div className="space-y-0.5">
              <div className="font-semibold text-sm text-ink">
                {edgeDossier.from} → {edgeDossier.to}
              </div>
              <div className="text-muted line-clamp-2">{edgeDossier.summary}</div>
              <div className="text-accent">
                {edgeDossier.scriptures.length} refs · click edge to select
              </div>
            </div>
          ) : selectedPlace ? (
            <div className="space-y-0.5">
              <div className="font-semibold text-sm text-ink">
                Selected: {placeLabel(selectedPlace)}
              </div>
              <div className="text-muted">
                Hover a place or link for a quick preview. Open <strong>Place</strong> below for full connections.
              </div>
            </div>
          ) : (
            <div className="text-muted pt-1">
              Hover a place or connection for preview (this box stays fixed so the map does not move).
            </div>
          )}
        </div>

        {/* Collapsible control panels under map */}
        <div className="space-y-2">
          <Card className="p-0 overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold hover:bg-surface-2"
              onClick={() => setLayersOpen((o) => !o)}
            >
              Layers
              <span className="text-xs font-normal text-muted">{layersOpen ? "hide" : "show"}</span>
            </button>
            {layersOpen ? (
              <div className="border-t border-border px-3 py-2 space-y-2 max-h-72 overflow-auto">
                <p className="text-[10px] text-muted">
                  Toggle what the map draws (connections, campaigns, elevation, date…).
                </p>
                {OVERLAY_GROUPS.map((g) => (
                  <div key={g.id} className="space-y-0.5">
                    <div className="text-[10px] uppercase tracking-wide text-muted font-semibold pt-0.5">
                      {g.label}
                    </div>
                    {MAP_OVERLAYS.filter((d) => d.group === g.id).map((d) => (
                      <label
                        key={d.id}
                        className="flex items-start gap-2 text-xs rounded px-1 py-0.5 hover:bg-surface-2 cursor-pointer"
                        title={d.description}
                      >
                        <input
                          type="checkbox"
                          className="mt-0.5"
                          checked={!!overlays[d.id]}
                          onChange={() => toggleOverlay(d.id)}
                        />
                        <span>
                          <span className="font-medium">{d.label}</span>
                          <span className="block text-[10px] text-muted">{d.description}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                ))}
                {overlays.chrono_filter ? (
                  <label className="block text-xs space-y-1 pt-1 border-t border-border">
                    <span className="text-muted">Date window</span>
                    <select
                      value={chronoWindow}
                      onChange={(e) => setChronoWindow(e.target.value as ChronoWindow)}
                      className="w-full rounded border border-border bg-surface px-1.5 py-1"
                    >
                      {CHRONO_WINDOWS.map((w) => (
                        <option key={w.id} value={w.id}>
                          {w.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ) : null}
                <div className="flex flex-wrap gap-1 pt-1">
                  <button
                    type="button"
                    className="text-[10px] rounded border border-border px-1.5 py-0.5"
                    onClick={() => setOverlays(defaultOverlayState())}
                  >
                    Reset layers
                  </button>
                  <button
                    type="button"
                    className="text-[10px] rounded border border-border px-1.5 py-0.5"
                    onClick={() => {
                      const all = defaultOverlayState();
                      (Object.keys(all) as MapOverlayId[]).forEach((k) => {
                        all[k] = false;
                      });
                      all.places = true;
                      all.labels = true;
                      setOverlays(all);
                    }}
                  >
                    Places only
                  </button>
                </div>
              </div>
            ) : null}
          </Card>

        {/* MACRO + MICRO below map */}
        {/* MACRO + MICRO below map */}
        <div className="grid gap-2 md:grid-cols-2">
      <Card className="p-0 overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold hover:bg-surface-2"
          onClick={() => setPanelCampaigns((o) => !o)}
        >
          <span className="flex items-center gap-2">
            Campaigns / progressions
            <Badge tone="claim">{campaigns.filter((c) => c.enabled).length}</Badge>
          </span>
          <span className="text-xs font-normal text-muted">{panelCampaigns ? "hide" : "show"}</span>
        </button>
        {panelCampaigns ? (
        <div className="border-t border-border p-3 space-y-3">
        <p className="text-xs text-muted leading-relaxed">
          Named actors (armies, lost parties) with ordered waypoints. These routes can{" "}
          <strong>flex</strong> around obstacles on real terrain (e.g. Amlicites reaching Minon
          above Zarahemla without treating the path as a straight static edge).
        </p>
        <ul className="space-y-2">
          {campaigns.map((c) => (
            <li
              key={c.id}
              className={`rounded border px-3 py-2 text-xs ${
                selectedCampaignId === c.id ? "border-accent bg-orange-50/50" : "border-border"
              }`}
            >
              <button
                type="button"
                className="w-full text-left"
                onClick={() => {
                  setSelectedCampaignId(c.id);
                  setShowCampaigns(true);
                  const first = c.waypoints.find((w) => w.placeId)?.placeId;
                  if (first) setSelectedPlace(first);
                }}
              >
                <div className="font-medium" style={{ color: c.color }}>
                  {c.actor}
                </div>
                <div className="text-ink">{c.name}</div>
                <div className="text-muted mt-0.5">
                  {c.waypoints.map((w) => w.label).join(" → ")}
                  {c.flexAroundObstacles ? " · flex route" : ""}
                </div>
                <div className="text-muted">{c.sourceRefs.join("; ")}</div>
              </button>
              <label className="inline-flex items-center gap-1.5 mt-1">
                <input
                  type="checkbox"
                  checked={c.enabled}
                  onChange={() => {
                    const next = campaigns.map((x) =>
                      x.id === c.id ? { ...x, enabled: !x.enabled } : x,
                    );
                    setCampaigns(next);
                    saveCampaigns(next);
                  }}
                />
                Show on map
              </label>
            </li>
          ))}
        </ul>
        </div>
        ) : null}
      </Card>

      <Card className="p-0 overflow-hidden">
        <button
          type="button"
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold hover:bg-surface-2"
          onClick={() => setPanelMacro((o) => !o)}
        >
          Macro (whole model)
          <span className="text-xs font-normal text-muted">{panelMacro ? "hide" : "show"}</span>
        </button>
        {panelMacro ? (
        <div className="border-t border-border p-3 space-y-3">
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
        </div>
        ) : null}
      </Card>

        {/* MICRO + place coords */}
        <Card className="p-0 overflow-hidden">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold hover:bg-surface-2"
            onClick={() => setPanelMicro((o) => !o)}
          >
            Micro + place
            <span className="text-xs font-normal text-muted">{panelMicro ? "hide" : "show"}</span>
          </button>
          {panelMicro ? (
          <div className="border-t border-border p-3 space-y-3">
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
          </div>
          ) : null}
        </Card>
        </div>

        {/* Add association (form) */}
        <Card className="p-0 overflow-hidden border-teal/30">
          <button
            type="button"
            className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold hover:bg-surface-2"
            onClick={() => setPanelAdd((o) => !o)}
          >
            Add association / connection
            <span className="text-xs font-normal text-muted">{panelAdd ? "hide" : "show"}</span>
          </button>
          {panelAdd ? (
          <div className="border-t border-border p-3 space-y-3">
          <p className="text-xs text-muted">
            Or use <strong>Add connection</strong> on the map: click start place, then end place.
            New routes get unknown distance/time; fill stated vs estimate below.
          </p>
          <div className="flex flex-wrap gap-2 items-end">
            <label className="text-xs space-y-1">
              <span className="text-muted">From</span>
              <select
                className="block rounded border border-border px-2 py-1.5 text-sm min-w-[8rem]"
                value={newRouteForm.from}
                onChange={(e) => setNewRouteForm((f) => ({ ...f, from: e.target.value }))}
              >
                {places.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs space-y-1">
              <span className="text-muted">To</span>
              <select
                className="block rounded border border-border px-2 py-1.5 text-sm min-w-[8rem]"
                value={newRouteForm.to}
                onChange={(e) => setNewRouteForm((f) => ({ ...f, to: e.target.value }))}
              >
                {places.map((pl) => (
                  <option key={pl.id} value={pl.id}>
                    {pl.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-xs space-y-1">
              <span className="text-muted">Corridor</span>
              <select
                className="block rounded border border-border px-2 py-1.5 text-sm"
                value={newRouteForm.corridor}
                onChange={(e) =>
                  setNewRouteForm((f) => ({
                    ...f,
                    corridor: e.target.value as RouteAssociation["corridor"],
                  }))
                }
              >
                <option value="wilderness">wilderness</option>
                <option value="open">open</option>
                <option value="coast">coast</option>
                <option value="unknown">unknown</option>
              </select>
            </label>
            <label className="text-xs space-y-1 flex-1 min-w-[10rem]">
              <span className="text-muted">Name (optional)</span>
              <input
                className="w-full rounded border border-border px-2 py-1.5 text-sm"
                value={newRouteForm.name}
                onChange={(e) => setNewRouteForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Scout party A"
              />
            </label>
          </div>
          <div className="space-y-2 border-t border-border pt-3">
            <div className="text-xs font-semibold text-muted uppercase tracking-wide">
              Path objects (ordered along the route)
            </div>
            <p className="text-[11px] text-muted">
              Not just endpoints — include phrases like <em>went up</em>, <em>came down</em>,{" "}
              <em>into the wilderness</em>. Order = sequence along the path.
            </p>
            <div className="flex flex-wrap gap-1.5">
              {newRouteForm.objects.map((o, i) => (
                <span
                  key={`${o}-${i}`}
                  className="inline-flex items-center gap-1 rounded-full border border-border bg-chip px-2.5 py-1 text-xs"
                >
                  <span className="text-muted tabular-nums">{i + 1}.</span>
                  {o}
                  <button
                    type="button"
                    className="text-muted hover:text-ink ml-0.5"
                    onClick={() =>
                      setNewRouteForm((f) => ({
                        ...f,
                        objects: f.objects.filter((_, j) => j !== i),
                      }))
                    }
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PATH_PHRASE_SUGGESTIONS.map((phrase) => {
                const on = newRouteForm.objects.includes(phrase);
                return (
                  <button
                    key={phrase}
                    type="button"
                    className={`rounded-full border px-2 py-0.5 text-[11px] ${
                      on
                        ? "border-accent bg-accent/10 text-ink"
                        : "border-border text-muted hover:border-accent"
                    }`}
                    onClick={() =>
                      setNewRouteForm((f) => ({
                        ...f,
                        objects: on
                          ? f.objects.filter((x) => x !== phrase)
                          : [...f.objects, phrase],
                      }))
                    }
                  >
                    {on ? "✓ " : "+ "}
                    {phrase}
                  </button>
                );
              })}
            </div>
            <div className="flex gap-2">
              <input
                className="flex-1 rounded border border-border px-2 py-1.5 text-sm"
                placeholder="Custom phrase from the text…"
                value={newRouteForm.customObject}
                onChange={(e) => setNewRouteForm((f) => ({ ...f, customObject: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newRouteForm.customObject.trim()) {
                    e.preventDefault();
                    setNewRouteForm((f) => ({
                      ...f,
                      objects: [...f.objects, f.customObject.trim()],
                      customObject: "",
                    }));
                  }
                }}
              />
              <button
                type="button"
                className="rounded border border-border px-3 py-1.5 text-sm"
                onClick={() => {
                  if (!newRouteForm.customObject.trim()) return;
                  setNewRouteForm((f) => ({
                    ...f,
                    objects: [...f.objects, f.customObject.trim()],
                    customObject: "",
                  }));
                }}
              >
                Add phrase
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm font-medium text-accent-fg"
              onClick={() =>
                addNewRoute(
                  newRouteForm.from,
                  newRouteForm.to,
                  newRouteForm.name || undefined,
                  newRouteForm.corridor,
                  newRouteForm.objects,
                )
              }
            >
              Create association
            </button>
          </div>
          </div>
          ) : null}
        </Card>
      </div>
      </div>

      {/* Object / place connections */}
      <Card className="p-0 overflow-hidden border-accent/25">
        <button
          type="button"
          className="w-full flex items-center justify-between px-3 py-2.5 text-sm font-semibold hover:bg-surface-2"
          onClick={() => setPanelPlace((o) => !o)}
        >
          <span>
            Place · connections
            {selectedPlace ? (
              <span className="ml-2 font-normal text-muted">{placeLabel(selectedPlace)}</span>
            ) : null}
          </span>
          <span className="text-xs font-normal text-muted">{panelPlace ? "hide" : "show"}</span>
        </button>
        {panelPlace ? (
        <div className="border-t border-border p-4 md:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-between">
          <div>
            <p className="text-xs text-muted mt-0.5">
              Each place is a first-class object. This box lists every map edge, related feature,
              scripture, and assumption tied to it.
            </p>
          </div>
          <label className="text-xs space-y-1 min-w-[12rem]">
            <span className="text-muted">Object (filtered by layer)</span>
            <select
              value={objectId ?? ""}
              onChange={(e) => setSelectedPlace(e.target.value)}
              className="w-full rounded-[var(--radius)] border border-border bg-surface px-2 py-2 text-sm font-medium"
            >
              {ALL_LAYERS.filter((L) => effectiveLayers.has(L)).map((L) => (
                <optgroup key={L} label={LAYER_META[L].label}>
                  {pickerPlaces
                    .filter((pl) => layerOf(pl.id) === L)
                    .map((pl) => (
                      <option key={pl.id} value={pl.id}>
                        {pl.name}
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-wrap gap-1.5 items-center">
          <span className="text-xs text-muted mr-1">Show layers:</span>
          {ALL_LAYERS.map((L) => {
            const on = effectiveLayers.has(L);
            return (
              <button
                key={L}
                type="button"
                onClick={() => {
                  if (L === "climate" || L === "season") {
                    setShowClimateLayer(!showClimateLayer);
                    return;
                  }
                  setVisibleLayers((prev) =>
                    prev.includes(L) ? prev.filter((x) => x !== L) : [...prev, L],
                  );
                }}
                className={`rounded-full px-2.5 py-1 text-[11px] border ${
                  on ? "border-accent bg-accent/10 text-ink font-medium" : "border-border text-muted"
                }`}
                title={LAYER_META[L].description}
              >
                {LAYER_META[L].label}
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-muted">
          Soft categories only — climate can still link to cities. Whirlwinds are not mixed into the
          settlement list unless you enable the Climate layer.
        </p>

        {objectBundle && (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-serif text-xl font-semibold text-ink">{objectBundle.name}</span>
              <Badge tone="teal">{objectBundle.layer}</Badge>
              <Badge>{objectBundle.kind}</Badge>
              {objectBundle.elevationBand && objectBundle.elevationBand !== "unknown" && (
                <Badge tone="claim">elev: {objectBundle.elevationBand}</Badge>
              )}
              <Badge tone="claim">{objectBundle.edgesIn.length + objectBundle.edgesOut.length} edges</Badge>
              <Badge>{objectBundle.neighborIds.length} neighbors</Badge>
              <Badge>{objectBundle.scriptureCount} dossier refs</Badge>
              <Badge>{objectBundle.corpusVerses.length} corpus</Badge>
            </div>
            {objectBundle.summary && (
              <p className="text-sm text-ink-soft leading-relaxed">{objectBundle.summary}</p>
            )}
            {lookupLexicon(objectBundle.name) || lookupLexicon(objectBundle.id.replace(/-/g, " ")) ? (
              <div className="rounded-[var(--radius)] bg-surface-2/90 border border-border p-3 text-xs space-y-1">
                <div className="font-semibold text-muted uppercase tracking-wide">1820s · KJV lexicon</div>
                {(() => {
                  const lex =
                    lookupLexicon(objectBundle.name) ||
                    lookupLexicon(objectBundle.id.replace(/-/g, " ")) ||
                    lookupLexicon(
                      objectBundle.name.split("(")[0].trim(),
                    );
                  if (!lex) return null;
                  return (
                    <>
                      <div className="font-medium text-ink">{lex.term}</div>
                      <p className="text-ink-soft">{lex.webster1828}</p>
                      <p className="text-muted"><span className="font-medium">KJV:</span> {lex.kjvNotes}</p>
                      <p className="text-muted"><span className="font-medium">Map:</span> {lex.ambiguity}</p>
                    </>
                  );
                })()}
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[var(--radius)] bg-surface-2/80 p-3 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Connections out (this → other)
                </h3>
                {objectBundle.edgesOut.length === 0 && (
                  <p className="text-xs text-muted">None in constraint graph</p>
                )}
                <ul className="space-y-1.5">
                  {objectBundle.edgesOut.map((e) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        className="text-left text-sm w-full hover:bg-surface rounded px-1 py-0.5"
                        onClick={() => {
                          setSelectedEdge(e.id);
                          setSelectedPlace(e.to);
                        }}
                      >
                        <span className="text-accent font-medium">→ {placeLabel(e.to)}</span>
                        <span className="text-muted"> · {e.type}</span>
                        <div className="text-xs text-ink-soft">{String(e.value)}</div>
                        {e.sourceVerse && (
                          <div className="text-xs text-muted">{e.sourceVerse}</div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-[var(--radius)] bg-surface-2/80 p-3 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Connections in (other → this)
                </h3>
                {objectBundle.edgesIn.length === 0 && (
                  <p className="text-xs text-muted">None in constraint graph</p>
                )}
                <ul className="space-y-1.5">
                  {objectBundle.edgesIn.map((e) => (
                    <li key={e.id}>
                      <button
                        type="button"
                        className="text-left text-sm w-full hover:bg-surface rounded px-1 py-0.5"
                        onClick={() => {
                          setSelectedEdge(e.id);
                          setSelectedPlace(e.from);
                        }}
                      >
                        <span className="text-accent font-medium">{placeLabel(e.from)} →</span>
                        <span className="text-muted"> · {e.type}</span>
                        <div className="text-xs text-ink-soft">{String(e.value)}</div>
                        {e.sourceVerse && (
                          <div className="text-xs text-muted">{e.sourceVerse}</div>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="rounded-[var(--radius)] border border-border p-3 space-y-2">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                Related objects (dossier + neighbors)
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {objectBundle.neighborIds.map((nid) => (
                  <button
                    key={nid}
                    type="button"
                    onClick={() => setSelectedPlace(nid)}
                    className="rounded-full border border-border bg-chip px-2.5 py-1 text-xs hover:border-accent hover:text-accent"
                  >
                    {placeLabel(nid)}
                  </button>
                ))}
                {objectBundle.neighborIds.length === 0 && (
                  <span className="text-xs text-muted">No neighbors linked yet</span>
                )}
              </div>
            </div>

            {/* Sphere of influence + river path + elevation */}
            {objectBundle.sphereMemberIds.length > 0 && (
              <div className="rounded-[var(--radius)] border border-teal/30 bg-teal-soft/20 p-3 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-teal">
                  Sphere of influence / mentions
                </h3>
                <p className="text-[11px] text-muted">
                  Every other object textually or relationally tied to this one (e.g. cities in a
                  whirlwind narrative; places that mention Sidon).
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {objectBundle.sphereMemberIds.map((nid) => (
                    <button
                      key={nid}
                      type="button"
                      onClick={() => setSelectedPlace(nid)}
                      className="rounded-full border border-teal/40 bg-surface px-2.5 py-1 text-xs hover:bg-teal-soft"
                    >
                      {placeLabel(nid)}
                      <span className="text-muted ml-1">({layerOf(nid)})</span>
                    </button>
                  ))}
                </div>
                <ul className="space-y-1 max-h-28 overflow-auto">
                  {objectBundle.relations.map((r) => (
                    <li key={r.id} className="text-xs text-ink-soft">
                      <span className="font-medium text-ink">
                        {placeLabel(r.from)} —{r.kind}→ {placeLabel(r.to)}
                      </span>
                      {r.sourceVerse && <span className="text-muted"> · {r.sourceVerse}</span>}
                      {r.note && <div className="text-muted pl-2">{r.note}</div>}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {objectBundle.pathMentions.length > 0 && (
              <div className="rounded-[var(--radius)] border border-border p-3 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Path candidates (along / mentions → this)
                </h3>
                <p className="text-[11px] text-muted">
                  For rivers: every city/land that should sit on a possible course. Use elevation
                  drop between them as a future hard constraint.
                </p>
                <ol className="list-decimal pl-4 space-y-1">
                  {objectBundle.pathMentions.map((r) => (
                    <li key={r.id} className="text-xs">
                      <button
                        type="button"
                        className="text-accent hover:underline font-medium"
                        onClick={() => setSelectedPlace(r.from)}
                      >
                        {placeLabel(r.from)}
                      </button>
                      <span className="text-muted"> · {r.sourceVerse}</span>
                      {r.note && <span className="text-ink-soft"> — {r.note}</span>}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {(objectBundle.elevationLinks.length > 0 || objectBundle.elevationBand) && (
              <div className="rounded-[var(--radius)] border border-border p-3 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Elevation
                </h3>
                {objectBundle.elevationBand && (
                  <p className="text-xs">
                    Working band:{" "}
                    <Badge tone="claim">{objectBundle.elevationBand}</Badge>
                    <span className="text-muted"> (model-adjustable)</span>
                  </p>
                )}
                <ul className="space-y-1">
                  {objectBundle.elevationLinks.map((r) => (
                    <li key={r.id} className="text-xs">
                      <span className="font-medium">
                        {placeLabel(r.from)} {r.kind === "up_to" ? "↑ up to" : "↓ down to"}{" "}
                        {placeLabel(r.to)}
                      </span>
                      {r.sourceVerse && <span className="text-muted"> · {r.sourceVerse}</span>}
                      {r.note && <div className="text-muted">{r.note}</div>}
                    </li>
                  ))}
                </ul>
                <p className="text-[11px] text-muted">
                  Tag more up/down verses in the Reader with the elevation domain; they feed this
                  list as relations grow.
                </p>
              </div>
            )}

            {objectAssumptions.length > 0 && (
              <div className="rounded-[var(--radius)] border border-border p-3 space-y-1.5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Assumptions that often load this object
                </h3>
                <ul className="space-y-1">
                  {objectAssumptions.map((a) => (
                    <li key={a.id} className="text-xs">
                      <Badge className="mr-1">{a.modelId}</Badge>
                      {a.statement}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {objectBundle.corpusVerses.length > 0 && (
              <div className="rounded-[var(--radius)] border border-border p-3 space-y-1.5">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Corpus verses (working index)
                </h3>
                <ul className="space-y-1 max-h-28 overflow-auto">
                  {objectBundle.corpusVerses.map((v) => (
                    <li key={v.id} className="text-xs">
                      <Link
                        to="/reader"
                        search={{
                          book: v.book,
                          chapter: v.chapter,
                          verse: v.verse,
                          feature: objectBundle.id,
                        }}
                        className="text-accent hover:underline font-medium"
                      >
                        {v.book} {v.chapter}:{v.verse}
                      </Link>
                      <span className="text-muted"> — {v.text.slice(0, 80)}…</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex flex-wrap gap-2 pt-1">
              <Link
                to="/map-lab/feature/$featureId"
                params={{ featureId: objectBundle.id }}
                className="rounded-[var(--radius)] bg-accent px-3 py-2 text-sm text-accent-fg font-medium"
              >
                Full object dossier
              </Link>
              <Link
                to="/reader"
                search={{ feature: objectBundle.id, q: objectBundle.name.split(/[\s/]/)[0] }}
                className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm"
              >
                Word index / tag in Reader
              </Link>
            </div>
          </div>
        )}
        </div>
        ) : null}
      </Card>


      {/* Route association editor + multi-endpoint wilderness */}
      {showSoftRegions && (
        <Card className="p-4 md:p-5 space-y-3 border-emerald-800/20">
          <div>
            <h2 className="font-semibold text-base">Routes & associations</h2>
            <p className="text-xs text-muted mt-0.5 max-w-2xl leading-relaxed">
              Edit each <strong>route association</strong> (distance, time, lost, branch). Wilderness
              shape is the union of enabled wilderness routes — more endpoints stretch the green
              bands. Branch splits are placed <em>inside</em> the parent wilderness corridor.
            </p>
          </div>
          <label className="block text-xs space-y-1 max-w-md">
            <span className="text-muted">Corridor perimeter (half-width)</span>
            <input
              type="range"
              min={8}
              max={48}
              value={corridorHalfWidth}
              onChange={(e) => setCorridorHalfWidth(Number(e.target.value))}
              className="w-full"
            />
            <span className="tabular-nums font-medium">{corridorHalfWidth}px</span>
          </label>
          <p className="text-[11px] text-muted">
            Endpoints in wilderness now:{" "}
            {wildEndpoints.map((id) => placeLabel(id)).join(", ") || "none"}
          </p>
          <div className="space-y-2">
            {routeAssocs.map((route) => (
              <div
                key={route.id}
                className={`rounded-[var(--radius)] border p-3 space-y-2 ${
                  editRouteId === route.id ? "border-accent bg-orange-50/40" : "border-border"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="checkbox"
                    checked={route.enabled}
                    onChange={(e) => patchRoute(route.id, { enabled: e.target.checked })}
                  />
                  <button
                    type="button"
                    className="font-medium text-sm text-left hover:underline"
                    onClick={() => setEditRouteId(route.id)}
                  >
                    {route.name}
                  </button>
                  {route.lost && <Badge tone="accent">lost</Badge>}
                  <Badge tone="claim">dist {route.distance.quality}</Badge>
                  <Badge tone="claim">time {route.time.quality}</Badge>
                </div>
                <div className="flex flex-wrap gap-1">
                  {(route.pathObjects ?? route.objects.map((label) => ({ label }))).map((o, i) => (
                    <Badge key={"label" in o ? `${o.label}-${i}` : i}>
                      {typeof o === "string" ? o : o.label}
                    </Badge>
                  ))}
                </div>
                {editRouteId === route.id && (
                  <div className="grid gap-2 sm:grid-cols-2 border-t border-border pt-2">
                    <div className="sm:col-span-2 space-y-2 rounded border border-teal/30 bg-teal-soft/20 p-3">
                      <div className="text-xs font-semibold text-muted uppercase tracking-wide">
                        Path objects along this association
                      </div>
                      <p className="text-[11px] text-muted">
                        Ordered beads: places, went up / came down, wilderness, lost, etc. Reorder
                        with arrows. Map markers use position % when set.
                      </p>
                      <ul className="space-y-1.5">
                        {(route.pathObjects ??
                          route.objects.map((label, i) => ({
                            id: `${route.id}-leg-${i}`,
                            label,
                            kind: "phrase" as const,
                            t: route.objects.length <= 1 ? 0 : i / (route.objects.length - 1),
                          }))).map((po, idx, arr) => (
                          <li
                            key={po.id}
                            className="flex flex-wrap items-center gap-2 text-xs rounded bg-surface border border-border px-2 py-1.5"
                          >
                            <span className="text-muted tabular-nums w-5">{idx + 1}.</span>
                            <input
                              className="flex-1 min-w-[8rem] rounded border border-border px-2 py-1"
                              value={po.label}
                              onChange={(e) => {
                                const base =
                                  route.pathObjects ??
                                  route.objects.map((label, i) => ({
                                    id: `${route.id}-leg-${i}`,
                                    label,
                                    kind: "phrase" as const,
                                    t: route.objects.length <= 1 ? 0 : i / (route.objects.length - 1),
                                  }));
                                const next = base.map((x) =>
                                  x.id === po.id ? { ...x, label: e.target.value } : x,
                                );
                                syncObjectsFromPathObjects(route.id, next);
                              }}
                            />
                            <label className="flex items-center gap-1 text-muted">
                              @%
                              <input
                                type="number"
                                min={0}
                                max={100}
                                className="w-14 rounded border border-border px-1 py-0.5"
                                value={Math.round((po.t ?? 0) * 100)}
                                onChange={(e) => {
                                  const base =
                                    route.pathObjects ??
                                    route.objects.map((label, i) => ({
                                      id: `${route.id}-leg-${i}`,
                                      label,
                                      kind: "phrase" as const,
                                      t: route.objects.length <= 1 ? 0 : i / (route.objects.length - 1),
                                    }));
                                  const next = base.map((x) =>
                                    x.id === po.id
                                      ? { ...x, t: Number(e.target.value) / 100 }
                                      : x,
                                  );
                                  syncObjectsFromPathObjects(route.id, next);
                                }}
                              />
                            </label>
                            <button
                              type="button"
                              className="border rounded px-1"
                              disabled={idx === 0}
                              onClick={() => movePathObject(route.id, po.id, -1)}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="border rounded px-1"
                              disabled={idx === arr.length - 1}
                              onClick={() => movePathObject(route.id, po.id, 1)}
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              className="border rounded px-1 text-red-700"
                              onClick={() => removePathObject(route.id, po.id)}
                            >
                              ×
                            </button>
                          </li>
                        ))}
                      </ul>
                      <div className="flex flex-wrap gap-1">
                        {PATH_PHRASE_SUGGESTIONS.slice(0, 16).map((phrase) => (
                          <button
                            key={phrase}
                            type="button"
                            className="rounded-full border border-border px-2 py-0.5 text-[11px] hover:border-accent"
                            onClick={() => addPathObject(route.id, phrase)}
                          >
                            + {phrase}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <input
                          id={`custom-po-${route.id}`}
                          className="flex-1 rounded border border-border px-2 py-1 text-xs"
                          placeholder="Custom path object from text…"
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              const v = (e.target as HTMLInputElement).value.trim();
                              if (v) {
                                addPathObject(route.id, v);
                                (e.target as HTMLInputElement).value = "";
                              }
                            }
                          }}
                        />
                        <button
                          type="button"
                          className="rounded border border-border px-2 py-1 text-xs"
                          onClick={() => {
                            const el = document.getElementById(
                              `custom-po-${route.id}`,
                            ) as HTMLInputElement | null;
                            if (el?.value.trim()) {
                              addPathObject(route.id, el.value.trim());
                              el.value = "";
                            }
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>
                    <div className="text-xs space-y-1.5 sm:col-span-2 rounded bg-surface-2/60 p-2">
                      <div className="font-semibold text-muted uppercase tracking-wide">
                        Layout-derived (moves with map)
                      </div>
                      <p className="text-ink-soft">
                        Path length ≈{" "}
                        <strong className="text-ink">
                          {layoutDerivedMiles(route.placeIds) ?? "—"} mi
                        </strong>
                        {" · "}
                        travel ≈{" "}
                        <strong className="text-ink">
                          {layoutDerivedDays(route.placeIds) ?? "—"} days
                        </strong>{" "}
                        (mixed terrain pace). Not scripture — for testing only.
                      </p>
                      <button
                        type="button"
                        className="text-accent hover:underline"
                        onClick={() => {
                          const mi = layoutDerivedMiles(route.placeIds);
                          const d = layoutDerivedDays(route.placeIds);
                          if (mi != null) {
                            patchRouteSpan(route.id, "distance", {
                              ...route.distance,
                              estimate: String(mi),
                              estimateUnit: "miles",
                              strength: "layout_derived",
                            });
                          }
                          if (d != null) {
                            patchRouteSpan(route.id, "time", {
                              ...route.time,
                              estimate: String(d),
                              estimateUnit: "days",
                              strength: "layout_derived",
                            });
                          }
                        }}
                      >
                        Copy layout values into estimates
                      </button>
                    </div>
                    <div className="text-xs space-y-1 border border-border rounded p-2">
                      <div className="font-semibold">Distance (text vs estimate)</div>
                      <label className="block space-y-0.5">
                        <span className="text-muted">Text support</span>
                        <select
                          className="w-full rounded border border-border px-2 py-1.5"
                          value={route.distance.quality}
                          onChange={(e) =>
                            patchRouteSpan(route.id, "distance", {
                              ...route.distance,
                              quality: e.target.value as SpanField["quality"],
                              strength:
                                e.target.value === "stated"
                                  ? "text_explicit"
                                  : e.target.value === "approximate"
                                    ? "text_implied"
                                    : route.distance.strength ?? "estimate",
                            })
                          }
                        >
                          <option value="unknown">Unknown (not stated)</option>
                          <option value="approximate">Implied / approximate in text</option>
                          <option value="stated">Explicitly stated</option>
                        </select>
                      </label>
                      <label className="block space-y-0.5">
                        <span className="text-muted">Stated / textual value</span>
                        <input
                          className="w-full rounded border border-border px-2 py-1"
                          placeholder='e.g. "many days" or leave blank'
                          value={route.distance.value ?? ""}
                          onChange={(e) =>
                            patchRouteSpan(route.id, "distance", {
                              ...route.distance,
                              value: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label className="block space-y-0.5">
                        <span className="text-muted">Your estimate</span>
                        <div className="flex gap-1">
                          <input
                            className="flex-1 rounded border border-border px-2 py-1"
                            placeholder="e.g. 120"
                            value={route.distance.estimate ?? ""}
                            onChange={(e) =>
                              patchRouteSpan(route.id, "distance", {
                                ...route.distance,
                                estimate: e.target.value,
                                strength: route.distance.strength ?? "estimate",
                              })
                            }
                          />
                          <select
                            className="rounded border border-border px-1 py-1"
                            value={route.distance.estimateUnit ?? "miles"}
                            onChange={(e) =>
                              patchRouteSpan(route.id, "distance", {
                                ...route.distance,
                                estimateUnit: e.target.value as SpanField["estimateUnit"],
                              })
                            }
                          >
                            <option value="miles">miles</option>
                            <option value="km">km</option>
                            <option value="days">days</option>
                            <option value="other">other</option>
                          </select>
                        </div>
                      </label>
                      <label className="block space-y-0.5">
                        <span className="text-muted">Strength in model</span>
                        <select
                          className="w-full rounded border border-border px-2 py-1"
                          value={route.distance.strength ?? "estimate"}
                          onChange={(e) =>
                            patchRouteSpan(route.id, "distance", {
                              ...route.distance,
                              strength: e.target.value as SpanField["strength"],
                            })
                          }
                        >
                          <option value="text_explicit">Text explicit</option>
                          <option value="text_implied">Text implied</option>
                          <option value="estimate">Estimate</option>
                          <option value="layout_derived">Layout-derived</option>
                          <option value="weak">Weak</option>
                        </select>
                      </label>
                      <label className="block space-y-0.5">
                        <span className="text-muted">Note</span>
                        <textarea
                          className="w-full rounded border border-border px-2 py-1"
                          rows={2}
                          value={route.distance.note ?? ""}
                          onChange={(e) =>
                            patchRouteSpan(route.id, "distance", {
                              ...route.distance,
                              note: e.target.value,
                            })
                          }
                        />
                      </label>
                    </div>
                    <div className="text-xs space-y-1 border border-border rounded p-2">
                      <div className="font-semibold">Travel time (text vs estimate)</div>
                      <label className="block space-y-0.5">
                        <span className="text-muted">Text support</span>
                        <select
                          className="w-full rounded border border-border px-2 py-1.5"
                          value={route.time.quality}
                          onChange={(e) =>
                            patchRouteSpan(route.id, "time", {
                              ...route.time,
                              quality: e.target.value as SpanField["quality"],
                              strength:
                                e.target.value === "stated"
                                  ? "text_explicit"
                                  : e.target.value === "approximate"
                                    ? "text_implied"
                                    : route.time.strength ?? "estimate",
                            })
                          }
                        >
                          <option value="unknown">Unknown (not stated)</option>
                          <option value="approximate">Implied / approximate in text</option>
                          <option value="stated">Explicitly stated</option>
                        </select>
                      </label>
                      <label className="block space-y-0.5">
                        <span className="text-muted">Stated / textual value</span>
                        <input
                          className="w-full rounded border border-border px-2 py-1"
                          placeholder="e.g. many days"
                          value={route.time.value ?? ""}
                          onChange={(e) =>
                            patchRouteSpan(route.id, "time", {
                              ...route.time,
                              value: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label className="block space-y-0.5">
                        <span className="text-muted">Your estimate</span>
                        <div className="flex gap-1">
                          <input
                            className="flex-1 rounded border border-border px-2 py-1"
                            placeholder="e.g. 8"
                            value={route.time.estimate ?? ""}
                            onChange={(e) =>
                              patchRouteSpan(route.id, "time", {
                                ...route.time,
                                estimate: e.target.value,
                                strength: route.time.strength ?? "estimate",
                              })
                            }
                          />
                          <select
                            className="rounded border border-border px-1 py-1"
                            value={route.time.estimateUnit ?? "days"}
                            onChange={(e) =>
                              patchRouteSpan(route.id, "time", {
                                ...route.time,
                                estimateUnit: e.target.value as SpanField["estimateUnit"],
                              })
                            }
                          >
                            <option value="days">days</option>
                            <option value="hours">hours</option>
                            <option value="other">other</option>
                          </select>
                        </div>
                      </label>
                      <label className="block space-y-0.5">
                        <span className="text-muted">Strength in model</span>
                        <select
                          className="w-full rounded border border-border px-2 py-1"
                          value={route.time.strength ?? "estimate"}
                          onChange={(e) =>
                            patchRouteSpan(route.id, "time", {
                              ...route.time,
                              strength: e.target.value as SpanField["strength"],
                            })
                          }
                        >
                          <option value="text_explicit">Text explicit</option>
                          <option value="text_implied">Text implied</option>
                          <option value="estimate">Estimate</option>
                          <option value="layout_derived">Layout-derived</option>
                          <option value="weak">Weak</option>
                        </select>
                      </label>
                      <label className="block space-y-0.5">
                        <span className="text-muted">Note</span>
                        <textarea
                          className="w-full rounded border border-border px-2 py-1"
                          rows={2}
                          value={route.time.note ?? ""}
                          onChange={(e) =>
                            patchRouteSpan(route.id, "time", {
                              ...route.time,
                              note: e.target.value,
                            })
                          }
                        />
                      </label>
                    </div>
                    <label className="flex items-center gap-2 text-xs sm:col-span-2">
                      <input
                        type="checkbox"
                        checked={!!route.lost}
                        onChange={(e) => patchRoute(route.id, { lost: e.target.checked })}
                      />
                      Lost / failed to reach intended destination
                    </label>
                    {route.branchesFromRouteId && (
                      <label className="text-xs space-y-1 sm:col-span-2">
                        <span className="text-muted">
                          Branch position along parent wilderness (0 = start, 1 = end)
                        </span>
                        <input
                          type="range"
                          min={0.15}
                          max={0.85}
                          step={0.05}
                          value={route.branchT ?? 0.5}
                          onChange={(e) =>
                            patchRoute(route.id, { branchT: Number(e.target.value) })
                          }
                          className="w-full"
                        />
                        <span className="tabular-nums">{((route.branchT ?? 0.5) * 100).toFixed(0)}% along trunk</span>
                      </label>
                    )}

                    <div className="sm:col-span-2 space-y-2 border-t border-border pt-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-xs font-semibold text-muted uppercase tracking-wide">
                          Elevation sequence (edit stages)
                        </div>
                        <button
                          type="button"
                          className="rounded border border-border px-2 py-1 text-xs hover:bg-surface-2"
                          onClick={() => addElevationSeg(route.id)}
                        >
                          + Add stage
                        </button>
                      </div>
                      {(route.elevation ?? []).map((seg, idx) => (
                        <div
                          key={seg.id}
                          className="rounded border border-border bg-surface-2/50 p-2 space-y-1.5 text-xs"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-muted">#{idx + 1}</span>
                            <select
                              className="rounded border border-border px-1.5 py-1"
                              value={seg.kind}
                              onChange={(e) =>
                                updateElevSeg(route.id, seg.id, {
                                  kind: e.target.value as ElevationSegment["kind"],
                                })
                              }
                            >
                              <option value="level">≈ level</option>
                              <option value="up">↑ up</option>
                              <option value="down">↓ down</option>
                              <option value="unknown">unknown</option>
                            </select>
                            <label className="flex items-center gap-1">
                              from %
                              <input
                                type="number"
                                min={0}
                                max={100}
                                className="w-14 rounded border border-border px-1 py-0.5"
                                value={Math.round(seg.t0 * 100)}
                                onChange={(e) =>
                                  updateElevSeg(route.id, seg.id, {
                                    t0: Number(e.target.value) / 100,
                                  })
                                }
                              />
                            </label>
                            <label className="flex items-center gap-1">
                              to %
                              <input
                                type="number"
                                min={0}
                                max={100}
                                className="w-14 rounded border border-border px-1 py-0.5"
                                value={Math.round(seg.t1 * 100)}
                                onChange={(e) =>
                                  updateElevSeg(route.id, seg.id, {
                                    t1: Number(e.target.value) / 100,
                                  })
                                }
                              />
                            </label>
                            <button
                              type="button"
                              className="px-1 border rounded"
                              onClick={() => moveElevSeg(route.id, seg.id, -1)}
                              title="Move earlier"
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              className="px-1 border rounded"
                              onClick={() => moveElevSeg(route.id, seg.id, 1)}
                              title="Move later"
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              className="px-1 border rounded text-red-700"
                              onClick={() => removeElevSeg(route.id, seg.id)}
                            >
                              ×
                            </button>
                          </div>
                          <input
                            className="w-full rounded border border-border px-2 py-1"
                            placeholder="Phrase from text (e.g. came down into…)"
                            value={seg.phrase ?? ""}
                            onChange={(e) =>
                              updateElevSeg(route.id, seg.id, { phrase: e.target.value })
                            }
                          />
                          <input
                            className="w-full rounded border border-border px-2 py-1"
                            placeholder="Note"
                            value={seg.note ?? ""}
                            onChange={(e) =>
                              updateElevSeg(route.id, seg.id, { note: e.target.value })
                            }
                          />
                        </div>
                      ))}
                      {(!route.elevation || route.elevation.length === 0) && (
                        <p className="text-[11px] text-muted">
                          No elevation stages — add one (level / up / down).
                        </p>
                      )}
                    </div>

                    <p className="text-[11px] text-muted sm:col-span-2">{route.summary}</p>
                    <p className="text-[10px] text-muted sm:col-span-2">
                      {route.sourceRefs.join(" · ")}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Multi-path route panel */}
      



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
              <Link
                to="/reader"
                search={{ feature: placeDossier.id, q: placeDossier.name.split(/[\s/]/)[0] }}
                className="rounded-[var(--radius)] border border-border px-3 py-2 text-sm text-accent"
              >
                Open in Reader · tag
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
