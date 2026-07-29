# Book of Mormon Geography Research Workbench

**Repo:** [EzrasEagle/bom-geography-research](https://github.com/EzrasEagle/bom-geography-research)

Start from **well-published geography models**, make every **assumption** explicit, **fork/customize** models, **tag scripture and multi-domain evidence**, and **stress-test** internal constraint graphs (Map Lab)—with a path to **real-map overlays**.

## Dual track + workbench

1. **Models track** — Claims, citations, and **assumptions** for each model.  
2. **Insights track** — Climate, travel, hydrology, language, artifacts, genetics, history…  
3. **User track** — Personal tags & forked models (local now; shareable packages next).  
4. **Map Lab** — Constraint graph with conflict coloring; real GIS overlay planned.

## App sections
| Route | Purpose |
| --- | --- |
| Framework | Composition chronology (Small Plates vs 116 pages corrected), method |
| Reader | Sample chapter + tag verses (personal / suggest shared) |
| Verses | Formal geographic catalog |
| Models | Published model profiles + assumptions |
| My Models | Fork, toggle assumptions, export JSON |
| Map Lab | Internal geography constraints |
| Insights | Independent research notes |
| Compare | Side-by-side model claims |
| Sources | Bibliography + **fork tracking** |

## Filling models (indexing)
We **index** models discover-as-you-go rather than forcing a perfect dump into one schema. Start order: Internal → Sorenson-style Mesoamerica → Highland variant → Heartland → Baja. See `research/models/INDEXING_METHOD.md`, `RICHNESS_RANKING.md`, and packs under `research/models/indexes/`.

Map Lab supports **macro** (whole-graph) and **micro** (edge-by-edge) adjustments. Real topography = Terrain Lab path (`research/external/TERRAIN_LAB.md`), not SimCity.

## Data layout
See `VISION.md`, `ROADMAP.md`, `LIMITATIONS.md`, and `prompts/rebuild/MASTER_SPEC.md`.

| Path | Purpose |
| --- | --- |
| `research/verses/` | Verse records |
| `research/models/` | Model profiles |
| `research/schema/` | Assumptions, verse, evidence domains |
| `research/indexes/high-signal-verses.md` | Harvest checklist |
| `research/external/FORK_TRACKING.md` | Upstream forks & data |
| `data/catalog/` | CSV mirrors |
| `book/` | Manuscript |
| `prompts/` | AI rebuild / session / sync |

## Sync
- GitHub source of truth  
- Drive: [BoM Geography Research](https://drive.google.com/drive/folders/1qrxdvtHzvncHLmXSaZewEQIN7fm4H8DU)  
- Skill: `.grok/skills/bom-geography/SKILL.md`

## Scripture text note
Modern LDS edition is copyrighted. Reader uses research excerpts + official study links; full public-domain 1830 pipeline is a later phase.
