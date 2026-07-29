# Vision — BoM Geography Model Workbench (revised)

*This supersedes the earlier “static catalog + book only” focus. The catalog remains the core; the product goal is a **testable, forkable model workbench**.*

## One-sentence mission

Start from well-published geography models, make every **assumption and verse use** explicit, let users **fork/customize** models, **tag scripture and new science**, and **test** internal constraint graphs against **real-world maps**—so evidence weight rises as the same verses and data points are reused and stress-tested.

## What changed in focus

| Earlier emphasis | Revised emphasis |
| --- | --- |
| Catalog models’ claims | Treat models as **packages of assumptions + claims + evidence links** |
| Read-only comparison | **User models**: adopt pieces, change assumptions, share |
| Book + atlas | Book + atlas + **reader tagging** + **map lab** |
| Geography text clues | Also **language, artifacts, genetics, climate, hydrology, routes…** |
| Static footnotes | **Living data collection** that improves shared and personal models |

## Core objects

1. **Verse unit** — Book/Chapter/Verse(s)/optional word span + tags + clues  
2. **Assumption** — Explicit premise (e.g. “day’s march ≈ 15–20 miles on plains”; “narrow neck = Tehuantepec”; “Cumorah final battle = NY hill”)  
3. **Model** — Named bundle of assumptions + place mappings + verse claims + evidence weights  
4. **Claim** — How a model uses a verse *given* listed assumptions  
5. **Insight / evidence item** — Independent fact (crop range, gene study summary, artifact horizon, road network) with sources  
6. **Constraint** — Graph edge: place A is N days from B; A is north of B; river between; no road; jungle corridor…  
7. **User contribution** — Private or shared tags, assumptions, claims, insights  
8. **Overlay** — Placement of an internal graph onto real topography/hydrography  

## User journeys

1. **Study** — Read BoM in-app; tag geographic/language/cultural spans; tags feed personal or shared models.  
2. **Inspect** — Open a published model; see every assumption and every verse used.  
3. **Fork** — Clone Heartland / Mesoamerica / Baja / Internal / …; toggle assumptions; add own.  
4. **Stress-test** — Map Lab builds internal geography from constraints; red/yellow when assumptions conflict.  
5. **Overlay** — Drag the internal network onto real map layers (terrain, rivers); see what breaks.  
6. **Share** — Publish a user model or a single insight for others to adopt.

## Map Lab (not full SimCity)

Prefer a **constraint graph + real GIS overlay** over a full city-sim economy. SimCity-like repos can inspire **UI for placing settlements and corridors**, but the scientific core is:

- Force-directed / constraint satisfaction layout of places  
- Distance bands from “X days’ journey”  
- Directional wedges  
- Terrain cost layers (mountains, water, jungle assumptions)  
- Real basemap (Leaflet/MapLibre + DEM/rivers when available)  
- Conflict coloring when constraints cannot be satisfied together  

Candidate code to **reference or adapt** (not necessarily hard-fork as the app core):

| Project | Use |
| --- | --- |
| [PaulLeCam/react-leaflet](https://github.com/PaulLeCam/react-leaflet) | Real map overlay |
| [BillPrisbrey/Book-of-Mormon-Geography](https://github.com/BillPrisbrey/Book-of-Mormon-Geography) | Graph DB of internal places |
| [edwardsjohnmartin/bom-map-constraints](https://github.com/edwardsjohnmartin/bom-map-constraints) | Textual mapping constraints |
| [dgreenheck/simcity-threejs-clone](https://github.com/dgreenheck/simcity-threejs-clone) | Placement UX inspiration only |
| [amilich/isometric-city](https://github.com/amilich/isometric-city) / IsoCity | Isometric builder UX inspiration only |
| USGS NHD, HydroSHEDS, py3dep | Real rivers/elevation |

## Evidence domains (beyond pure geography text)

- Internal textual geography & travel  
- Climate / botany / zoology  
- Hydrology / topography  
- Archaeology / artifacts / architecture  
- Language / onomastics / writing systems  
- Genetics / population history (with strong uncertainty labeling)  
- Historical travel corridors (e.g. Spanish-era)  
- Paleoclimate proxies  

## Neutrality & epistemology

- Published models are **starting packs**, not winners.  
- Genetics/language/artifacts are **probabilistic evidence**, not slam-dunks—UI must show uncertainty.  
- Shared community tags increase **reuse count** (relevance heat) without forcing consensus.

## Out of scope (for honesty)

- Authoritative Church doctrine pronouncement on geography  
- Perfect reconstruction of 600 BC climates  
- Full multiplayer MMO  
- Shipping multi-GB DEM inside git  
