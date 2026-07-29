# Object categories: organize without locking the graph

## Decision
Use **soft layers** (filters + labels), not exclusive type systems that forbid links.

| Do | Don’t |
| --- | --- |
| Filter object picker by Settlements / Rivers / Climate | Put whirlwinds in the same flat list with no filter |
| Allow Zarahemla → affected_by → whirlwind | Force climate into a separate database that can’t touch cities |
| Draw Sidon path from all places that *mention* Sidon | Assume one hard polyline before the text is surveyed |
| Tag up_to / down_to as elevation relations | Treat “up to Nephi” as always pure elevation *or* always pure idiom |

## Layers
settlement · region · hydro · coast_sea · corridor · topo · climate · season · other

## Relation kinds (beyond travel constraints)
| Kind | Use |
| --- | --- |
| `along` | City/land lies on river/coast path |
| `mentions` | Text associates two objects |
| `affected_by` | Hazard/climate hits a place (whirlwind sphere) |
| `up_to` / `down_to` | Elevation or directional idiom |
| `near` | Soft adjacency |

## Sphere of influence
For object X: all places linked by relations (either direction).  
Example: whirlwind sphere includes Zarahemla (3 Ne 8).  
Example: Sidon path candidates = all `along`/`mentions` → sidon.

## Elevation on the map
- Each place may have `elevationBand` (highland / lowland / coastal / unknown)
- Edges `up_to` / `down_to` show rise/fall requirements
- Future: numeric DEM delta when Terrain Lab is on

## Flexibility
New object? Add id + layer.  
New link type? Add RelationKind.  
Never require re-categorizing the whole graph.
