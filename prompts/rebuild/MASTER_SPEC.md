# MASTER SPEC — Rebuild this entire project from text

You are rebuilding **bom-geography-research**: a dual-track Book of Mormon geography research atlas (book + web app + data core).

## Mission
1. Catalog every BoM verse with geographic signal at Book/Chapter/Verse (and optional word-span) granularity.
2. Attach **every major model’s claim** + citation + why — neutrally.
3. Maintain a parallel **insights** track (travel, climate, flora, history, hydrology) not owned by one model.
4. Produce a readable **book** path and a **web app** to browse evidence so readers weigh models themselves.
5. Keep **GitHub** as source of truth; **Google Drive** as backup; document sync.
6. Preserve **natural-language prompts** (this folder) so future AI can modify the system.

## Stack (app)
- React 19 + TypeScript + Vite + TanStack Start/Router/Query + Tailwind v4 + shadcn/Radix patterns
- Serve `0.0.0.0:8080` in dev
- Data loaded from `/research` markdown + `/data/catalog` CSV (and JSON derived as needed)
- No multiplayer requirement

## Repository layout (do not invent a conflicting tree)
See `prompts/rebuild/DIRECTORY_TREE.md` and root `README.md`.

## Data contracts
- Schemas: `research/schema/*.schema.json`
- Tags: `research/schema/tags.md`
- Verse records: markdown with YAML frontmatter under `research/verses/<book>/`
- Models: `research/models/<id>.md` + `_index.yaml`
- Insights: `research/insights/**` + `_index.yaml`
- Spreadsheet mirror: `data/catalog/*.csv` (must stay in sync with markdown frontmatter)

## Neutrality rule
Core data never silently privileges one geography model. Editorial arguments belong in labeled book chapters, not in claim records.

## Sync rule
After meaningful research sessions: commit to GitHub; mirror key trees to Drive folder “BoM Geography Research”.

## Definition of done for a rebuild
- [ ] App runs and shows Framework, Verses, Models, Insights
- [ ] Sample verses 1 Ne 17:5, 18:23, 18:24 render with model claims
- [ ] CSVs parse; schemas validate conceptually
- [ ] README + this MASTER_SPEC remain accurate
