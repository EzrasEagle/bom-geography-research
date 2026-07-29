# Fork & upstream tracking

## Purpose
Record every external repo or dataset we **fork, submodule, adapt, or only cite**, so we can:
- Pull improvements from upstream
- Avoid license mistakes
- Know what powers Map Lab / GIS / model graphs

## Status legend
| Status | Meaning |
| --- | --- |
| `watch` | Track only; no code in our tree |
| `reference` | Read for ideas; no copy |
| `adapter` | Thin code of ours calling their formats |
| `submodule` | Git submodule pinned to commit |
| `fork` | Our GitHub fork; track `upstream` remote |
| `data-pipeline` | Download scripts; data not in git |

## Registry

See also machine-readable: [`tracked-repos.yaml`](./tracked-repos.yaml)

### Book of Mormon geography

| Name | Upstream | Status | Why track | Our action |
| --- | --- | --- | --- | --- |
| Map-BofM-Geography | https://github.com/vwolfley/Map-BofM-Geography | reference | Map UI ideas | Watch releases |
| Book-of-Mormon-Geography | https://github.com/BillPrisbrey/Book-of-Mormon-Geography | adapter candidate | Place graph DB | Evaluate schema map → our gazetteer |
| book-of-mormon-geography-atlas | https://github.com/StephenCranney/book-of-mormon-geography-atlas | reference | Atlas layout | Watch |
| bom-map-constraints | https://github.com/edwardsjohnmartin/bom-map-constraints | adapter candidate | Distance/direction constraints | Import constraint types |

### City-builder / placement UX (inspiration only — not product core)

| Name | Upstream | Status | Why track | Our action |
| --- | --- | --- | --- | --- |
| simcity-threejs-clone | https://github.com/dgreenheck/simcity-threejs-clone | reference | Settlement placement UX | Do **not** fork as geography core |
| isometric-city / IsoCity | https://github.com/amilich/isometric-city | reference | Isometric builder patterns | Optional UX study |
| OpenSC2K | https://github.com/nicholas-ochoa/OpenSC2K | watch | Classic sim open attempt | Low priority |

### Maps & GIS libraries

| Name | Upstream | Status | Why track | Our action |
| --- | --- | --- | --- | --- |
| react-leaflet | https://github.com/PaulLeCam/react-leaflet | adapter planned | Real basemap overlay | Phase 3 Map Lab |
| deck.gl | https://github.com/visgl/deck.gl | watch | Large geospatial layers | Optional |
| awesome-gis list | https://github.com/sshuair/awesome-gis | watch | Catalog of tools | Periodic scan |

### Hydrography & topography

| Name | Upstream | Status | Why track | Our action |
| --- | --- | --- | --- | --- |
| USGS NHD | https://www.usgs.gov/national-hydrography | data-pipeline | Authoritative US rivers | Fetch scripts later |
| HydroSHEDS | https://www.hydrosheds.org/ | data-pipeline | Global basins/rivers (MX, SA) | Fetch scripts later |
| py3dep | https://github.com/hyriver/py3dep | tool_dependency_docs | US elevation | Docs + offline notebooks |
| wh2o-vue | https://github.com/AmericanWhitewater/wh2o-vue | reference | River map UX | Watch |

### Paleoclimate / science

| Name | Upstream | Status | Why track | Our action |
| --- | --- | --- | --- | --- |
| NOAA Paleoclimatology | https://www.ncei.noaa.gov/products/paleoclimatology | data-pipeline | Proxies near 600 BC | Manual curation into insights |
| paleoda_sa | https://github.com/mchoblet/paleoda_sa | reference_methods | SA hydroclimate methods | Methods only |

## How to add a fork

1. Add row to this file + entry in `tracked-repos.yaml`.
2. Record **license** in `licenses/<name>.md`.
3. Prefer submodule or adapter over copy-paste.
4. Set `upstream` remote if forked on GitHub.
5. Open issue title `upstream-sync:<name>` when refreshing.
6. Log pull notes in `CHANGELOG.md`.

## Sync cadence
- Monthly: check upstream commits on adapter/fork rows  
- Quarterly: scan awesome-gis + BoM geography search for new repos  
- On each research session: skill may recommend new upstreams  
