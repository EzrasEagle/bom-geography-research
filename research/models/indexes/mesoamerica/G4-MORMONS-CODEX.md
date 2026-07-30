# G4 target: *Mormon’s Codex* (Sorenson 2013)

**Purpose:** Define what “G4 — near-exhaustive vs. this model’s published apparatus” means for Limited Mesoamerica, and how it differs from our **G3** install.

**Book:** John L. Sorenson, *Mormon’s Codex: An Ancient American Book* (Deseret Book / Neal A. Maxwell Institute, 2013).  
**Fair use:** Index *structured claims* + citations only — do not dump full text into git.

---

## What the book actually is

Not only a place-list. Sorenson’s own FAIR summary frames two steps:

1. **Internal map** — rebuild “Mormon’s map” from **~500 geography passages** in the BoM (consistent relative layout).  
2. **External fit** — match that map + culture to **Mesoamerica**, then list **~420 correspondences** (he says “more than 400”) between the text and Mesoamerican situations.

Public summaries describe the codex as:

| Layer | Rough scale | Role for our app |
| --- | --- | --- |
| **Geography / map features** | **~25 pointed map correspondences** near Tehuantepec theater | Places, constraints, Map Lab edges |
| **Cultural / historical correspondences** | **~400+** across writing, war, society, ideology, archaeology periods | `evidence_item` rows + assumptions (not all become map pins) |
| **Chronological archaeology parts** | Pre-600 BC → AD 200–400 chapters | Time-sliced evidence, not only lat/lng |

So **G4 ≠ 420 cities on a map**. G4 = harvest of the apparatus *as Sorenson organizes it*: map set + correspondence catalog + time-period archaeology claims.

---

## Core external geography (Codex / AAS tradition)

| BoM | Common Sorenson correlation |
| --- | --- |
| Narrow neck | Isthmus of Tehuantepec |
| Land of Nephi | Highlands of southern Guatemala |
| City of Nephi | Often **Kaminaljuyú** (Valley of Guatemala) |
| Land of Zarahemla | Grijalva basin / adjacent southern Mexico |
| City of Zarahemla | Often **Santa Rosa** (upper Grijalva; site now under reservoir — still used as correlation) |
| Land northward | N/W of Tehuantepec |
| Hill Cumorah / Ramah | Often **Cerro El Vigía**, Tuxtla Mts., Veracruz |
| City of Mulek | Sometimes **La Venta** (isthmian) |
| Jerusalem (Lamanite) | Tradition of submerged ruins **Lake Atitlán** (highly speculative / contested) |
| Sidon | **Grijalva** (primary); Usumacinta is a known *variant* tradition |

**25 map correspondences** (examples Sorenson highlights publicly):

1. Narrow **pass** within the neck ↔ elevated dry corridor through Tehuantepec flood zone.  
2. Alma 2 battle micro-topography (hill east of Sidon → Gideon → ford) ↔ upper Grijalva basin geometry.  
3. Ramah/Cumorah ↔ Cerro El Vigía region.

The rest of the 25 are the systematic place/terrain matches in the geography section of the book (to be rowed out with page cites in a G4 pass).

---

## Correspondence categories (for evidence taxonomy)

From Sorenson’s public outline of Codex correspondences (~420 total):

| Domain | Approx. count (his buckets) | Atlas storage |
| --- | --- | --- |
| Geography / map | ~25 “pointed” | places + constraints |
| Writing & records | multiple systems; lineage histories | evidence_item |
| Human biology / art | phenotype depictions (contested) | evidence_item (weak/contested) |
| Political economy | elite, tribute | evidence_item |
| Society / class / faction | | evidence_item |
| Material culture | ~37 (cement, highways, “silk/linen” plants, metallurgy claims…) | evidence_item |
| Government | ~8 | evidence_item |
| Warfare | ~33 | evidence_item + season tags |
| Ideology & religion | ~34 | evidence_item (highly interpretive) |
| Archaeology by era | Pre-600; 600–1 BC (two parts); AD 1–200; AD 200–400 | evidence_item + time range |

**Ranking rule for our framework:**  
`text_explicit` (verse) > `text_implied` > **map correspondence** > **cultural parallel** > weak art/biology claims.

---

## G3 (what we have) vs G4 (Codex-complete)

| | **G3 now** | **G4 Codex target** |
| --- | --- | --- |
| Places | 27 named | Full Codex/AAS gazetteer + all 25 map correspondences as rows |
| Verse claims | 44 high-signal | Approach **~500 geography passages** (many one-line; Clark/Sorenson internal map lists) |
| Constraints | 14 | Every hard Alma 22 / war / neck / Sidon edge Sorenson uses |
| Assumptions | 9 core | + Codex-specific knobs (two-Cumorah, directional skew, day-mile band, limited Olmec carryover…) |
| Evidence items | Minimal | **~400 correspondence IDs** with domain, era, strength, page cite |
| Native parameters | Partial | Full `parameters-native.yaml` from Codex (cement date window, Hagoth west-sea port, etc.) |

---

## Practical G4 harvest plan (sessions)

### Pass A — Geography core (highest Map Lab value)
1. Row all **25 map correspondences** → `places.csv` + `constraints.yaml` + Map Lab edges.  
2. Expand secondary cities (Ammonihah graph, east-sea chain, Mormon retreat line) with **page cites**.  
3. Micro-route Alma 2 / Alma 43 / Alma 50 as path objects (already partially started).

### Pass B — Internal 500 passages
1. Use *Mormon’s Map* (2000) + *Geography of Book of Mormon Events: A Source Book* (1990) as harvest indexes (public/FARMS apparatus).  
2. One CSV row per passage: `ref, feature, relation, strength, sorenson_note, page`.  
3. Do **not** require a real-world pin for every passage.

### Pass C — 400 correspondences
1. Spreadsheet columns: `id, domain, era, claim, bom_refs[], meso_cite, confidence, contested`.  
2. Import as `evidence_item`s; link to verses when explicit.  
3. Flag **contested** (elephants/mastodons, metallurgy, skin-color art) so Map Lab doesn’t treat them as hard constraints.

### Pass D — Time-sliced archaeology
1. Period tables: Pre-600 / 600–1 BC / AD 1–200 / AD 200–400.  
2. Site correlations (Kaminaljuyú wall, Santa Rosa, La Venta, San Lorenzo “great city by neck”, etc.) as optional layers.

---

## Copyright / method (non-negotiable)

- **Do:** structured claims, page numbers, public essays, FAIR/BMC summaries, our notes.  
- **Don’t:** OCR/upload the full Codex PDF into the repo.  
- Human with the book verifies page cites; app stores the index.

---

## Implications for the Atlas

1. **Map Lab** should stay driven by Pass A–B (places + verses + constraints).  
2. **Evidence browser** (future) holds Pass C–D so 400 parallels don’t clutter the map.  
3. **Strength ranking** must keep cultural parallels from “winning” over text when they conflict.  
4. **Usumacinta-Sidon** = alternate **sub-pack**, not a silent overwrite of Grijalva default.

---

## Status (2026-07-29)
- **Pass A: LOADED (25/25)**
- **Pass B: EXPANDED** (~300+ passages; target 500) — continue for G4 completeness
- Pass C/D: not started

## Resume checklist for next G4 session

- [ ] Create `correspondences.csv` template (420 rows empty IDs by domain) — Pass C  
- [x] Encode all 25 map correspondences (public apparatus; page cites still optional)  
- [ ] Link Kaminaljuyú / Santa Rosa / El Vigía / La Venta as optional site pins (confidence low–medium)  
- [ ] Import *Mormon’s Map* chapter outline as internal-only constraints  
- [ ] Add contested flags for biology/metallurgy/elephant claims  

*Last updated: 2026-07-29 — exploration pass (no full book dump).*
