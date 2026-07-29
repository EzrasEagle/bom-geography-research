# App UI rebuild prompt

Build a polished research atlas UI (not a toy):

## Routes
- `/` — Home: mission, dual-track explanation, stats (verse count, model count, insight count)
- `/framework` — Textual composition framework (from book/00-framework)
- `/verses` — Browse/filter verses by book, tag, plate_source
- `/verses/$id` — Verse detail: text, clues, tags, model claims table, linked insights
- `/models` — Model cards grid
- `/models/$id` — Model profile full page
- `/insights` — Insight list
- `/insights/$id` — Insight body
- `/sources` — Bibliography + external repos
- `/compare` — Pick 2–3 models and compare claims on shared verses

## UX
- Serif for scripture excerpts; clean sans for UI
- Warm parchment/ink academic palette — not generic purple AI gradient
- Mobile usable (~390px)
- Search box for verse id / tag
- Explicit labels: “Model claim” vs “Independent insight”

## Data loading
Import CSV/JSON from `src/data` (build step may copy from `data/catalog` and parse markdown frontmatter into `src/data/generated.ts`). For first scaffold, embed typed TypeScript mirrors of the catalog so the app works offline in preview.
