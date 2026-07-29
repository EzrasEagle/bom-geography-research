# Sync: GitHub + Google Drive + Grok project

## Source of truth
**GitHub** repo `EzrasEagle/bom-geography-research` (branch `main`).

## Backup
**Google Drive** folder: `BoM Geography Research` with subfolders mirroring:
- `research/`
- `book/`
- `data/`
- `prompts/`

## Grok project
Keep conversation project linked to this repo purpose. On each research session, skill should:
1. Pull latest git state if available
2. Apply catalog edits
3. Push to GitHub
4. List Drive folder and note what should be re-uploaded (API may only create folders/read; document manual or future upload path)
5. Recommend next verses and missing model citations

## Skill location
`.grok/skills/bom-geography/SKILL.md`
