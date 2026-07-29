# Limitations

## Scholarly
- Major models disagree; the app will not “solve” geography.
- Genetics and language evidence are often **overclaimed** in popular materials—UI must show uncertainty and sample bias.
- Many model books are copyrighted; we store **claims + citations**, not wholesale republished books.
- Full official LDS edition scripture text is copyrighted; Reader must use public-domain text, short excerpts, and/or official links—not pirate the modern edition.

## Technical (this sandbox / deploy target)
- Multi-GB river/DEM tiles: stream from providers; do not commit to git.
- True multi-user sharing needs auth + backend (possible later with Postgres); v0 uses **localStorage** for personal models.
- Full SimCity clone is the wrong core problem; we use constraint graphs + optional placement UX inspiration only.
- Automatic “match internal map to real Earth” is underdetermined: many embeddings satisfy the same constraints.

## Process
- Exhaustive verse lists for every model require reading primary model sources—seed lists are starting points.
- Drive API here creates folders easily; bulk file upload may still need manual/sync script steps.
