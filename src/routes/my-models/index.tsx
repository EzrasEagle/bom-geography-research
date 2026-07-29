import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { assumptions, assumptionsForModel, models } from "@/data/catalog";

export const Route = createFileRoute("/my-models/")({ component: MyModelsPage });

type UserModel = {
  id: string;
  name: string;
  forkedFrom: string;
  enabledAssumptionIds: string[];
  customAssumptions: { id: string; statement: string; category: string }[];
  notes: string;
  updatedAt: string;
};

const STORAGE_KEY = "bom-atlas-user-models-v1";

function MyModelsPage() {
  const [userModels, setUserModels] = useState<UserModel[]>([]);
  const [forkSource, setForkSource] = useState("baja");
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setUserModels(JSON.parse(raw) as UserModel[]);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(userModels));
  }, [userModels]);

  const active = userModels.find((m) => m.id === activeId) ?? userModels[0] ?? null;

  function fork() {
    const base = assumptionsForModel(forkSource);
    const m: UserModel = {
      id: `user-${Date.now()}`,
      name: `My fork of ${models.find((x) => x.id === forkSource)?.name ?? forkSource}`,
      forkedFrom: forkSource,
      enabledAssumptionIds: base.map((a) => a.id),
      customAssumptions: [],
      notes: "",
      updatedAt: new Date().toISOString(),
    };
    setUserModels((prev) => [m, ...prev]);
    setActiveId(m.id);
  }

  function toggleAssumption(id: string) {
    if (!active) return;
    setUserModels((prev) =>
      prev.map((m) => {
        if (m.id !== active.id) return m;
        const has = m.enabledAssumptionIds.includes(id);
        return {
          ...m,
          enabledAssumptionIds: has
            ? m.enabledAssumptionIds.filter((x) => x !== id)
            : [...m.enabledAssumptionIds, id],
          updatedAt: new Date().toISOString(),
        };
      }),
    );
  }

  function addCustom() {
    if (!active) return;
    const statement = window.prompt("New assumption statement?");
    if (!statement) return;
    const row = {
      id: `custom-${Date.now()}`,
      statement,
      category: "other",
    };
    setUserModels((prev) =>
      prev.map((m) =>
        m.id === active.id
          ? {
              ...m,
              customAssumptions: [...m.customAssumptions, row],
              updatedAt: new Date().toISOString(),
            }
          : m,
      ),
    );
  }

  function exportJson() {
    if (!active) return;
    const blob = new Blob([JSON.stringify(active, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${active.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const baseAssumptions = active ? assumptionsForModel(active.forkedFrom) : [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold">My models</h1>
        <p className="text-sm text-ink-soft max-w-2xl leading-relaxed">
          Fork a published model, enable/disable its assumptions, add your own, and export JSON to share. Spatial layout (drag cities/seas) is edited in Map Lab and saved per model id.
          v0 stores models in this browser only. Shared community publishing is Phase 2.
        </p>
      </div>

      <Card className="p-5 flex flex-col sm:flex-row gap-3 sm:items-end">
        <label className="text-sm space-y-1 flex-1">
          <span className="text-muted">Fork from</span>
          <select
            value={forkSource}
            onChange={(e) => setForkSource(e.target.value)}
            className="w-full rounded-[var(--radius)] border border-border bg-surface px-3 py-2.5 text-sm"
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={fork}
          className="rounded-[var(--radius)] bg-accent px-4 py-2.5 text-sm font-medium text-accent-fg"
        >
          Create fork
        </button>
      </Card>

      {userModels.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {userModels.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setActiveId(m.id)}
              className={`rounded-full px-3 py-1.5 text-xs border ${
                active?.id === m.id
                  ? "border-accent bg-accent text-accent-fg"
                  : "border-border bg-surface text-ink-soft"
              }`}
            >
              {m.name}
            </button>
          ))}
        </div>
      )}

      {!active && (
        <Card className="p-8 text-center text-sm text-muted">
          No personal models yet. Fork a published model to start customizing assumptions.
        </Card>
      )}

      {active && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="p-5 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-semibold">{active.name}</h2>
              <Badge tone="claim">from {active.forkedFrom}</Badge>
            </div>
            <p className="text-xs text-muted">Updated {new Date(active.updatedAt).toLocaleString()}</p>
            <h3 className="text-sm font-medium">Inherited assumptions (toggle)</h3>
            <ul className="space-y-2">
              {baseAssumptions.map((a) => {
                const on = active.enabledAssumptionIds.includes(a.id);
                return (
                  <li key={a.id}>
                    <label className="flex items-start gap-2 text-sm">
                      <input type="checkbox" checked={on} onChange={() => toggleAssumption(a.id)} className="mt-1" />
                      <span>
                        <span className="text-muted text-xs uppercase">{a.category}</span>
                        <br />
                        {a.statement}
                      </span>
                    </label>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap gap-2 pt-2">
              <button
                type="button"
                onClick={addCustom}
                className="rounded-[var(--radius-sm)] border border-border px-3 py-2 text-sm"
              >
                Add custom assumption
              </button>
              <button
                type="button"
                onClick={exportJson}
                className="rounded-[var(--radius-sm)] border border-border px-3 py-2 text-sm"
              >
                Export JSON
              </button>
              <Link
                to="/map-lab"
                className="rounded-[var(--radius-sm)] bg-surface-2 px-3 py-2 text-sm text-accent"
                onClick={() => {
                  try {
                    localStorage.setItem("bom-atlas-active-map-model-v1", active.id);
                  } catch {
                    /* ignore */
                  }
                }}
              >
                Open Map Lab for this model →
              </Link>
            </div>
          </Card>

          <Card className="p-5 space-y-3">
            <h3 className="font-semibold text-sm">Custom assumptions</h3>
            {active.customAssumptions.length === 0 && (
              <p className="text-sm text-muted">None yet—add climate, genetics caution, roads, etc.</p>
            )}
            <ul className="space-y-2 text-sm">
              {active.customAssumptions.map((c) => (
                <li key={c.id} className="rounded-[var(--radius-sm)] bg-surface-2 p-2">
                  <Badge className="mb-1">{c.category}</Badge>
                  <div>{c.statement}</div>
                </li>
              ))}
            </ul>
            <h3 className="font-semibold text-sm pt-2">Also available from all models</h3>
            <p className="text-xs text-muted">
              Adopt pieces: browse {assumptions.length} seed assumptions across published models in the
              catalog. Future: pick individual assumptions from any model into this fork.
            </p>
            <Link to="/models" className="text-sm text-accent hover:underline">
              Browse published models →
            </Link>
          </Card>
        </div>
      )}
    </div>
  );
}
