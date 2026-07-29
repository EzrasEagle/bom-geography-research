# Map editor ↔ model integration

## Idea
A **geography model** is not only assumptions and verse claims. It also owns a **spatial arrangement** of places (cities, seas, rivers, neck). The Map Lab GUI edits that arrangement and writes it back into the model package.

```
┌─────────────────────────────────────────────┐
│  Model package (published or user fork)     │
│  · assumptions[]                            │
│  · place_mappings / claims                  │
│  · ModelMapPackage:                         │
│      layout{ placeId → {x,y} }  ← GUI drag  │
│      macro { day miles, scale, rot… }       │
│      micro { edgeId → overrides }           │
└──────────────────┬──────────────────────────┘
                   │ load / save
                   ▼
┌─────────────────────────────────────────────┐
│  Map Lab GUI                                │
│  · Select model                             │
│  · Drag places / seas                       │
│  · Macro + micro panels                     │
│  · Constraints recolor from layout+params   │
└─────────────────────────────────────────────┘
```

## Coordinate systems
| Stage | Coords | Purpose |
| --- | --- | --- |
| **Model space (now)** | Abstract 520×360 canvas | Relative geometry; drag cities |
| **Geo space (Terrain Lab)** | lat/lng + DEM | Real topography overlay |

Same place IDs; later add optional `geo: { lat, lng }` per place without discarding abstract layout.

## GUI operations bound to the model
| Action | Writes to |
| --- | --- |
| Drag Zarahemla | `layout.zarahemla` |
| Drag sea-east | `layout.sea-east` |
| Macro day miles | `macro.*` |
| Micro edge days | `micro[edgeId]` |
| Export JSON | whole `ModelMapPackage` |
| Switch model | load another package (defaults if none) |

## Storage (v1)
Browser `localStorage` key `bom-atlas-model-map-packs-v1` map of `modelId → ModelMapPackage`.  
Published models ship **default layouts** in code (`MODEL_DEFAULT_LAYOUTS`). User edits create an override pack for that id (or for `user-*` forks).

## Future
- Persist packs in GitHub/Drive as `research/models/indexes/<id>/layout.json`
- Terrain Lab: pin layout onto lat/lng with two-point calibration
- Snap-to-constraint assist (optional)
