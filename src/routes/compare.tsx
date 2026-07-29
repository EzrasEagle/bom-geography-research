import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { models, verses } from "@/data/catalog";

export const Route = createFileRoute("/compare")({ component: ComparePage });

function ComparePage() {
  const [a, setA] = useState("baja");
  const [b, setB] = useState("mesoamerica");
  const [c, setC] = useState<string>("");

  const selected = useMemo(() => [a, b, c].filter(Boolean), [a, b, c]);

  const rows = verses
    .map((v) => {
      const claims = selected.map((mid) => v.modelClaims.find((cl) => cl.modelId === mid) ?? null);
      if (claims.every((x) => x === null)) return null;
      return { verse: v, claims };
    })
    .filter(Boolean) as {
    verse: (typeof verses)[0];
    claims: ((typeof verses)[0]["modelClaims"][0] | null)[];
  }[];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-semibold">Compare models</h1>
        <p className="text-sm text-ink-soft">
          Pick two or three models. Only verses that have at least one selected claim appear.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: "Model A", value: a, set: setA },
          { label: "Model B", value: b, set: setB },
          { label: "Model C (optional)", value: c, set: setC },
        ].map((ctl) => (
          <label key={ctl.label} className="text-sm space-y-1">
            <span className="text-muted">{ctl.label}</span>
            <select
              value={ctl.value}
              onChange={(e) => ctl.set(e.target.value)}
              className="w-full rounded-[var(--radius)] border border-border bg-surface px-3 py-2.5"
            >
              {ctl.label.includes("optional") && <option value="">— none —</option>}
              {models.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </label>
        ))}
      </div>

      <div className="space-y-4">
        {rows.map(({ verse, claims }) => (
          <Card key={verse.id} className="p-4 md:p-5 space-y-3 overflow-x-auto">
            <Link
              to="/verses/$verseId"
              params={{ verseId: verse.id }}
              className="font-semibold text-accent hover:underline"
            >
              {verse.book} {verse.chapter}:{verse.verseStart}
            </Link>
            <p className="scripture text-sm line-clamp-2">{verse.textExcerpt}</p>
            <div
              className="grid gap-3"
              style={{ gridTemplateColumns: `repeat(${selected.length}, minmax(12rem, 1fr))` }}
            >
              {claims.map((cl, i) => (
                <div key={i} className="rounded-[var(--radius)] border border-border bg-surface-2/50 p-3 text-sm">
                  <div className="label-claim mb-1">{selected[i]}</div>
                  {cl ? (
                    <>
                      <p className="text-ink">{cl.claim}</p>
                      <Badge tone="claim" className="mt-2">
                        {cl.confidence}
                      </Badge>
                    </>
                  ) : (
                    <p className="text-muted italic">No claim in seed catalog</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}
        {rows.length === 0 && (
          <p className="text-sm text-muted text-center py-8">No overlapping claims in the seed set.</p>
        )}
      </div>
    </div>
  );
}
