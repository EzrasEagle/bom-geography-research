# Data taxonomy — terms for every kind of input

Use these **record types** and **parameter families** when indexing a model.  
If a model introduces something new, add a term here first, then store the data.

## Record types (what we store)

| Term | Definition | Example |
| --- | --- | --- |
| **verse_unit** | Scripture span (book/ch/verse or word span) | Alma 22:27–34 |
| **clue** | Raw geographic signal extracted from text | “sea on the east and on the west” |
| **place** | Named location entity in the text | Zarahemla, Sidon, narrow neck |
| **place_mapping** | Model’s identification of a place with a real-world candidate | Sidon → Grijalva |
| **assumption** | Explicit premise the model needs | day-march = 15 mi |
| **constraint** | Relationship between places (or place and feature) | Bountiful adjacent to Desolation |
| **claim** | How a model uses a verse_unit given assumptions | “supports Tehuantepec neck” |
| **evidence_item** | External fact (not pure verse) | Hopewell date range; date-palm climate |
| **parameter** | Typed numeric/categorical control (macro or micro) | `day_miles`, `edge.c6.days` |
| **overlay** | Placement of internal graph on real map | rotation, scale, anchor lat/lng |
| **conflict** | Constraint set that cannot be satisfied under current parameters | red edge |
| **user_delta** | Personal override of any of the above | user sets edge c6 = 2.0 days |

## Parameter families (knobs)

### Macro (apply to whole model / whole graph)
| ID | Meaning |
| --- | --- |
| `day_miles_open` | Miles per day on open ground |
| `day_miles_mountain` | Miles per day in mountains |
| `day_miles_jungle` | Miles per day in jungle/forest |
| `day_miles_default` | Fallback day scale |
| `direction_rotation_deg` | Rotate entire internal “north” relative to true north |
| `global_scale` | Stretch/shrink all distances uniformly |
| `roads_mode` | `unknown` \| `roads` \| `no_roads` |
| `default_terrain` | Default corridor terrain between places |
| `allow_duplicate_names` | Multiple cities may share a name |
| `sea_level_delta_m` | Experimental: past sea level offset (advanced) |

### Micro (point-to-point / per-entity)
| ID | Meaning |
| --- | --- |
| `edge.<id>.days` | Travel time for one connection |
| `edge.<id>.miles` | Fixed distance if known |
| `edge.<id>.direction` | Required bearing or textual direction |
| `edge.<id>.terrain` | open/mountain/jungle/river/coast |
| `edge.<id>.roads` | override roads for this edge |
| `edge.<id>.strength` | hard \| soft |
| `edge.<id>.enabled` | include/exclude constraint |
| `place.<id>.kind` | city/land/river/hill/sea… |
| `place.<id>.real_world` | lat/lng or feature name (mapping) |
| `place.<id>.elevation_band` | highland/lowland/coastal |
| `verse.<id>.weight` | how strongly this verse loads the model |
| `verse.<id>.enabled` | use/ignore this verse claim |

## Evidence domains (external)
`textual_geography` · `climate_botany` · `hydrology_topo` · `archaeology_artifacts` · `language_onomastics` · `genetics` · `historical_routes` · `paleoclimate` · `transport` · `culture_demography`

## Provenance fields (always)
`source_model` · `source_citation` · `page_or_url` · `confidence` · `notes` · `discovered_during_index` (bool)

## Rule
**Index → discover parameters → extend taxonomy → store.**  
Never force a model into missing knobs; mark `unmapped_native_field` until the taxonomy grows.
