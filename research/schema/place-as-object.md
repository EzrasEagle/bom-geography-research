# Geographic objects: connection-first view

## Question
Can each place/feature be viewed as an **object** with all connections listed?

## Answer
**Yes — without restructuring the core data model.** We already use place ids as nodes.

| Existing piece | Role for object view |
| --- | --- |
| `places[]` | Object identity (id, name, kind) |
| `constraints[]` | Directed connections (from → to) |
| `placeDossiers` | Scriptures, related features, assumption ids |
| `scripture-corpus` featureIds | Verse hits attached to object |
| `ModelMapPackage.layout` | Spatial instance of the object on a model map |
| Reader tags `featureIds` | User-made connections (personal graph layer) |

## What we did *not* need to change
- No rewrite of verse catalog or model profiles  
- No new primary key scheme  
- Edges stay as constraints; objects stay as place ids  

## What we add
- **Assembler** `getPlaceConnectionBundle(id)` — joins edges + dossier + corpus  
- **Map Lab “Object box”** — UI that always shows the selected object’s full connection list  
- Optional later: serialize bundles to `research/models/indexes/*/places.yaml` for git  

## Optional future enrichments (additive)
- Bidirectional soft “mentions” edges from word index (Zarahemla in verse X)  
- Climate objects already use same place id system  
- `user-edges` for personal connections  
