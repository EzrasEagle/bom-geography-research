# Tag & association layers (how we track things)

## Three layers (do not collapse)

| Layer | Source | Storage | Scope |
| --- | --- | --- | --- |
| **Seed features** | Corpus `featureIds` on verses (e.g. `climate-agriculture`, `landing`) | Code: `scripture-corpus.ts` | Shared by **all** models — text-side prelabels |
| **Your tags** | Reader smart tags / manual | `localStorage` `bom-atlas-reader-tags-v3` | Personal (later: per-user model fork) |
| **Your associations** | Path/proximity builder + path suggestions | `localStorage` `bom-atlas-user-associations-v1` | Personal graph edges (Map Lab) |

## Model packs (Mesoamerica, Heartland, …)

- Live under `src/data/models/*` and `research/models/indexes/*`
- Hold **interpretations**: place IDs, real-world pins, assumptions, verse→claim rows
- Same verse can be seeded once; each model **maps** features to different real-world candidates

## Future: model-specific real-world match

Keep:

1. **Internal graph** (BoM names + relations) — mostly shared  
2. **Projection** (internal node → lat/lng / site) — **per model**  
3. **Evidence strength** — per model assumption set  

Seed tags stay available to every modified model; differences show up in projection + assumptions, not by hiding seeds.

## Note for later (user request)

How each model projects the same internal places onto different real-world sites — design when we add multi-model Map Lab projections.
