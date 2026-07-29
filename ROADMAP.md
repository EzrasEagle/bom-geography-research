# Roadmap — what it takes to carry out the vision

## Phase 0 — Foundation (done / in progress)
- [x] Repo + dual-track catalog (verses, models, insights)
- [x] Hybrid markdown + CSV
- [x] AI rebuild prompts
- [x] GitHub + Drive backup folders
- [x] Framework chronology correction
- [x] Atlas UI (browse, compare)
- [x] Vision revision docs
- [x] Map Lab v0 (internal constraint graph)
- [x] Reader v0 (chapter navigation + tagging UI)
- [x] My Models v0 (fork assumptions in localStorage)
- [x] Fork tracking docs
- [x] High-signal verse index (seed)

## Phase 1 — Data completeness (months of research work)
- [ ] Exhaustive verse harvest for each major model (from their books/sites)
- [ ] Assumption ontology filled for Mesoamerica, Heartland, Baja, Internal, SA, Malay
- [ ] Place gazetteer (every named land/city/river/hill)
- [ ] Constraint extraction (all day-journey / direction pairs)
- [ ] Evidence items: language, artifacts, genetics summaries with citations
- [ ] Public-domain or licensed full BoM text pipeline for Reader

## Phase 2 — Workbench depth
- [ ] Assumption editor with dependency graph (“if A false, claims X,Y drop”)
- [ ] Shared model publishing (accounts + moderation)
- [ ] Tag voting / reuse heat (“this verse used by N models”)
- [ ] Conflict solver suggestions
- [ ] Export/import model JSON packages

## Phase 3 — Real-map testing
- [ ] Leaflet/MapLibre basemap + river/DEM layers
- [ ] Pin internal graph onto lat/lng with scale calibration
- [ ] Terrain cost models (user-selectable)
- [ ] Paleoclimate layer hooks
- [ ] Side-by-side model overlay comparison

## Phase 4 — Scale & quality
- [ ] Community contribution review queue
- [ ] Citation checker
- [ ] Automated constraint consistency tests
- [ ] Book export from catalog (docx/pdf)
- [ ] Mobile fieldwork notes mode

## Effort estimate (honest)

| Workstream | Nature | Rough scale |
| --- | --- | --- |
| Catalog all model verse uses | Research + citation | Large (ongoing; main human effort) |
| Assumption graphs per model | Research design | Medium–large |
| Reader + tagging | Engineering | Medium |
| Constraint Map Lab | Engineering + UX | Large |
| Real GIS overlay | Engineering + data ops | Large |
| Auth + shared models | Engineering + moderation | Medium–large |
| Genetics/language evidence | Scholarly synthesis | Ongoing, sensitive |

**Bottleneck:** Not React—**curated, cited knowledge** and **clear assumption modeling**. Engineering enables testing; it cannot invent primary scholarship.

## Success metrics
- User can fork Baja or Mesoamerica in < 2 minutes  
- User can see *why* a verse supports a claim (assumption chain)  
- User can break a model deliberately and see red constraints  
- Shared insight/verse reuse counts visible  
