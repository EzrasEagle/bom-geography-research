/** Model ↔ Map editor integration: each model owns a layout + macro/micro knobs. */

export type Point = { x: number; y: number };

export type EdgeOverride = {
  days?: number;
  terrain?: "open" | "mountain" | "jungle" | "mixed" | "coast" | "river";
  strength?: "soft" | "hard";
  enabled?: boolean;
  note?: string;
};

export type Macro = {
  dayMilesOpen: number;
  dayMilesMountain: number;
  dayMilesJungle: number;
  globalScale: number;
  directionRotation: number;
  roadsMode: "unknown" | "roads" | "no_roads";
  defaultTerrain: "open" | "mountain" | "jungle" | "mixed";
  breakNeck: boolean;
};

/** Full package the GUI edits — saved per model id (published or user fork). */
export type ModelMapPackage = {
  modelId: string;
  /** Abstract canvas positions (0–520 x, 0–360 y). Later: add lat/lng for Terrain Lab. */
  layout: Record<string, Point>;
  macro: Macro;
  micro: Record<string, EdgeOverride>;
  updatedAt: string;
};

export const MAP_PACK_STORE_KEY = "bom-atlas-model-map-packs-v1";
export const ACTIVE_MAP_MODEL_KEY = "bom-atlas-active-map-model-v1";

export const defaultMacro = (): Macro => ({
  dayMilesOpen: 17,
  dayMilesMountain: 10,
  dayMilesJungle: 8,
  globalScale: 1,
  directionRotation: 0,
  roadsMode: "unknown",
  defaultTerrain: "mixed",
  breakNeck: false,
});

/** Shared neutral spine (internal relative map). */
export const LAYOUT_INTERNAL: Record<string, Point> = {
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

/** Model-specific default layouts (schematic — not GPS). */
export const MODEL_DEFAULT_LAYOUTS: Record<string, Record<string, Point>> = {
  internal: { ...LAYOUT_INTERNAL },
  // Pacific west / Gulf east — Tehuantepec-style neck mid-map
  mesoamerica: {
    "sea-west": { x: 40, y: 200 },
    "sea-east": { x: 480, y: 160 },
    landing: { x: 90, y: 300 },
    nephi: { x: 160, y: 280 },
    manti: { x: 220, y: 230 },
    sidon: { x: 250, y: 190 },
    zarahemla: { x: 240, y: 150 },
    jershon: { x: 380, y: 150 },
    "bountiful-nw": { x: 320, y: 110 },
    "narrow-neck": { x: 300, y: 90 },
    desolation: { x: 300, y: 55 },
    cumorah: { x: 340, y: 45 },
  },
  "meso-highland": {
    "sea-west": { x: 50, y: 210 },
    "sea-east": { x: 470, y: 170 },
    landing: { x: 100, y: 310 },
    nephi: { x: 200, y: 300 }, // further "up/south"
    manti: { x: 240, y: 250 },
    sidon: { x: 260, y: 200 },
    zarahemla: { x: 250, y: 160 },
    jershon: { x: 390, y: 160 },
    "bountiful-nw": { x: 310, y: 105 },
    "narrow-neck": { x: 300, y: 75 },
    desolation: { x: 300, y: 45 },
    cumorah: { x: 350, y: 40 },
  },
  // North American long stage: Cumorah far NE, Sidon as N–S spine
  heartland: {
    "sea-west": { x: 80, y: 120 },
    "sea-east": { x: 450, y: 100 },
    landing: { x: 280, y: 320 },
    nephi: { x: 300, y: 280 },
    manti: { x: 260, y: 220 },
    sidon: { x: 260, y: 160 },
    zarahemla: { x: 240, y: 170 },
    jershon: { x: 360, y: 150 },
    "bountiful-nw": { x: 300, y: 110 },
    "narrow-neck": { x: 340, y: 70 },
    desolation: { x: 360, y: 50 },
    cumorah: { x: 420, y: 40 },
  },
  // Peninsula: seas left/right, neck mid, landing NW
  baja: {
    "sea-west": { x: 50, y: 200 },
    "sea-east": { x: 470, y: 200 },
    landing: { x: 140, y: 80 },
    nephi: { x: 200, y: 220 },
    manti: { x: 240, y: 250 },
    sidon: { x: 260, y: 200 },
    zarahemla: { x: 250, y: 160 },
    jershon: { x: 320, y: 180 },
    "bountiful-nw": { x: 260, y: 120 },
    "narrow-neck": { x: 260, y: 100 },
    desolation: { x: 260, y: 70 },
    cumorah: { x: 220, y: 50 },
  },
  "south-america": { ...LAYOUT_INTERNAL },
  malay: { ...LAYOUT_INTERNAL },
};

export function cloneLayout(src: Record<string, Point>): Record<string, Point> {
  const out: Record<string, Point> = {};
  for (const [k, v] of Object.entries(src)) out[k] = { x: v.x, y: v.y };
  return out;
}

export function defaultLayoutForModel(modelId: string): Record<string, Point> {
  const base = MODEL_DEFAULT_LAYOUTS[modelId] ?? LAYOUT_INTERNAL;
  return cloneLayout(base);
}

export function emptyPack(modelId: string): ModelMapPackage {
  return {
    modelId,
    layout: defaultLayoutForModel(modelId.replace(/^user-.*$/, "internal")),
    macro: defaultMacro(),
    micro: {},
    updatedAt: new Date().toISOString(),
  };
}

export function loadAllPacks(): Record<string, ModelMapPackage> {
  try {
    const raw = localStorage.getItem(MAP_PACK_STORE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, ModelMapPackage>;
  } catch {
    return {};
  }
}

export function saveAllPacks(packs: Record<string, ModelMapPackage>) {
  localStorage.setItem(MAP_PACK_STORE_KEY, JSON.stringify(packs));
}

export function loadPack(modelId: string, baseModelId?: string): ModelMapPackage {
  const all = loadAllPacks();
  if (all[modelId]) return all[modelId];
  const base = baseModelId ?? modelId;
  const pack = emptyPack(base);
  pack.modelId = modelId;
  // If forking user model from published, start from published default layout
  pack.layout = defaultLayoutForModel(base);
  return pack;
}

export function persistPack(pack: ModelMapPackage) {
  const all = loadAllPacks();
  all[pack.modelId] = { ...pack, updatedAt: new Date().toISOString() };
  saveAllPacks(all);
}

export function applyMacroTransform(
  layout: Record<string, Point>,
  rotDeg: number,
  scale: number,
): Record<string, Point> {
  // Macro rotation/scale is applied as view transform only when editing positions
  // are stored in "model space". For simplicity we bake into display:
  const cx = 260;
  const cy = 180;
  const rad = (rotDeg * Math.PI) / 180;
  const out: Record<string, Point> = {};
  for (const [id, p] of Object.entries(layout)) {
    const dx = (p.x - cx) * scale;
    const dy = (p.y - cy) * scale;
    out[id] = {
      x: cx + dx * Math.cos(rad) - dy * Math.sin(rad),
      y: cy + dx * Math.sin(rad) + dy * Math.cos(rad),
    };
  }
  return out;
}

export type UserModelLite = {
  id: string;
  name: string;
  forkedFrom: string;
};

export function loadUserModelsLite(): UserModelLite[] {
  try {
    const raw = localStorage.getItem("bom-atlas-user-models-v1");
    if (!raw) return [];
    const arr = JSON.parse(raw) as { id: string; name: string; forkedFrom: string }[];
    return arr.map((m) => ({ id: m.id, name: m.name, forkedFrom: m.forkedFrom }));
  } catch {
    return [];
  }
}
