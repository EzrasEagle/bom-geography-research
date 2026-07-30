# Associations, hierarchy, time, rivers (design)

## Association kinds (Association Builder)

| Kind | Use when |
| --- | --- |
| **path** | Ordered travel / journey (A → wilderness → B) |
| **contains** | Feature *inside* a land/place (forests in promised land) |
| **proximity** | Near, without claiming containment or travel |
| **same_region** | Two places in the **same area/cluster** without a path (e.g. east-sea cities; city + land when not using hierarchy yet) |
| **river** | Place related to a watercourse (bank, through, head) — see hydro-relations |

**same_region** answers: “these belong together geographically” without inventing a journey. Prefer hierarchy (`city_in_land`) when one *contains* the other as settlement-in-land; use **same_region** for peer cities in a theater (Lehi / Morianton / Mulek).

## Time layer

Every association can carry a `chronology` span (start/end year BC/AD, quality, source).  
Default: chapter-heading estimates from `chronology.ts`.  
Why: Zarahemla ~90 BC ≠ Zarahemla ~AD 200 for size, wars, population — overlay and conflict checks need a time slice later.

## Land vs city (models)

- **Internal IDs stay stable:** `nephi` = land of Nephi (region); `city-nephi` = city of Nephi.
- **Models only project** ids → real-world sites/polygons. They do not redefine whether city ≠ land.
- Seeded models that conflate land/city keep both linked; user can split pins on the map without breaking verse tags.

## Size & non-overlap

- `sizeTier` + radius hints drive default Map Lab areas (city < land < greater land).
- Lands group cities via `hierarchyLinks`.
- Default layout: soft non-overlap; allow overlap for contested sovereignty (Lamanite/Nephite).
- Later: boundaries snap to rivers/mountains on real basemap.

## Rivers

- `hydro-relations.ts`: flow direction + ordered place links + bank/placement.
- Map Lab can polyline Sidon through ordered places; real-world overlay replaces abstract order with DEM/river centerlines when testing models.

## Real-world overlay path

Internal graph (associations + hierarchy + hydro + chronology) is **model-agnostic**.  
Each model supplies a **projection** (id → lat/lng or polygon). Scoring = how many hard constraints survive on real terrain.
