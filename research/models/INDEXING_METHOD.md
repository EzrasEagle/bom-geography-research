# How to index a geography model (without losing information)

## The problem
No single model’s book is a perfect dump into our framework. Models mix:
- verse citations
- maps and place IDs
- distance folklore (“day and a half”)
- cultural/archaeological parallels
- silent assumptions never written as equations

If we only fill “our” fields, we drop data. If we only copy prose, we can’t run Map Lab.

## Solution: **Model Index Packs** (discover-as-you-go)

For each model create `research/models/indexes/<model_id>/` with:

| File | Purpose |
| --- | --- |
| `README.md` | Identity, richness score, primary sources, copyright note |
| `sources.yaml` | Every book/article/URL used |
| `places.yaml` | Place dictionary as the model uses it |
| `verse-claims.csv` | Every verse citation found (grows over sessions) |
| `assumptions.yaml` | Explicit + inferred premises |
| `constraints.yaml` | Edges the model implies |
| `parameters-native.yaml` | **Anything the model uses that isn’t in our taxonomy yet** |
| `gaps.md` | What we still need to harvest |
| `CHANGELOG.md` | What was added each session |

### Pass order (repeatable)
1. **Identity pass** — name variants, authors, years, limited vs hemispheric.  
2. **Source inventory** — list all works (no wholesale pirate copies; cite + fair-use notes).  
3. **Place pass** — every named BoM place → model real-world candidate (or “unmapped”).  
4. **Verse harvest** — walk their footnotes/indexes/maps; one CSV row per citation.  
5. **Constraint derivation** — from Alma 22-type passages + their prose distances.  
6. **Parameter discovery** — when you find a new knob, add to `parameters-native.yaml` AND propose taxonomy update.  
7. **Evidence pass** — archaeology, language, climate they cite → `evidence_item` rows.  
8. **Map Lab load** — export constraints/parameters into app catalog or user model JSON.

### Completeness grades
| Grade | Meaning |
| --- | --- |
| G0 | Profile only |
| G1 | Places + core assumptions |
| G2 | Major verse clusters (landing, Alma 22, Cumorah) |
| G3 | Broad verse harvest + constraints |
| G4 | Near-exhaustive vs that model’s published apparatus |

**We do not require G4 before using Map Lab.** G1–G2 is enough to stress-test.

## Copyright / “download everything”
- **Do:** index public web essays, official tables of contents, open maps, our own notes, citation lists.  
- **Don’t:** dump entire copyrighted books (Sorenson, etc.) into git.  
- **Do:** store *structured claims* with page citations so a human with the book can verify.

## Why this fits a richer framework
Your framework will grow **more** parameters than any one model. Indexing captures:
1. what fits today  
2. what is `native` and not yet mapped  
3. what is *absent* (model silent → soft gap, not false zero)
