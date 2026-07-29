# External data & forks policy

## Goals
- Rivers, topography, and paleoclimate layers must be **available to the app and book** as research context.
- Keep **upstream identity** clear so we can pull improvements.
- Avoid dumping multi-GB rasters into this git repo.

## Recommended integration patterns

| Pattern | When |
| --- | --- |
| **Citation + fetch script** | Official USGS NHD, 3DEP, HydroSHEDS |
| **Git submodule** | Small active BoM geography code repos we adapt |
| **Documented fork** | We must patch upstream; track `upstream` remote |
| **Reference only** | Inspiration / license-incompatible code |

## Priority targets
1. North American + Mexican river networks (NHD + HydroSHEDS).  
2. Topography (USGS 3DEP via py3dep or cloud COGs).  
3. Paleoclimate proxies / reconstructions relevant to ~600 BC (document uncertainty).  
4. Existing BoM constraint/map repos as adapters into our verse graph.

## License checklist (before vendoring)
Record license in `research/external/licenses/<name>.md` before copying code or data.
