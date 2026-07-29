# Book of Mormon Geography Research Atlas

**Repo:** [EzrasEagle/bom-geography-research](https://github.com/EzrasEagle/bom-geography-research)

Dual-track research system for studying Book of Mormon geography:

1. **Models track** — How each published model uses each verse (claim + why + citations).  
2. **Insights track** — Independent facts (travel routes, climate, crops, hydrology, history) that help readers evaluate evidence.

The web app and the book both read the same hybrid core: **Markdown + YAML frontmatter** and **CSV catalogs**.

## Quick orientation

| Path | Purpose |
| --- | --- |
| `research/verses/` | Verse-level geographic records |
| `research/models/` | Model profiles |
| `research/insights/` | Independent research notes |
| `research/schema/` | Data contracts + tags |
| `data/catalog/` | Spreadsheet-friendly CSV mirrors |
| `book/` | Manuscript chapters |
| `prompts/` | Natural-language rebuild & session specs (AI-future-proofing) |
| `src/` | Research atlas web app |

## Principles
- Catalog before conclude.
- Readers weigh evidence; core data stays comparative.
- Small Plates vs Mormon abridgment tagging matters.
- GitHub is source of truth; Google Drive folder **BoM Geography Research** is backup.

## App
Research atlas UI: Framework, Verses, Models, Insights, Sources, Compare.

## Continue a research session
Open `prompts/session/CONTINUE.md` or invoke the `bom-geography` skill.

## Rebuild with future AI
Start from `prompts/rebuild/MASTER_SPEC.md`.
