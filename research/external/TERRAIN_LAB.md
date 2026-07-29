# Better than SimCity: Terrain / Region Lab

## Why not SimCity
City-builders optimize **zoning, budgets, traffic**. You need:
- real **elevation**
- **rivers/coasts**
- place pins + travel corridors
- constraint satisfaction  
= **GIS + terrain viewer + annotation**, not a mayoral sim.

## Recommended stack (phased)

| Layer | Tech | Role |
| --- | --- | --- |
| Basemap | MapLibre GL JS or Leaflet | Slippy map, select region |
| Terrain | MapLibre terrain (DEM tiles) / free elevation APIs | Real topography |
| Vectors | GeoJSON places + corridors | BoM places / edges |
| Edit | mapdraw-like drawing / our Map Lab | Micro edge edits |
| 3D optional | MapLibre free-camera or Cesium | Fly the landscape |
| Export | GeoJSON + model JSON | Share overlays |

### Upstream to track
- https://github.com/PaulLeCam/react-leaflet (or MapLibre React)
- https://github.com/mapdraw/mapdraw — draw paths/areas on real maps
- https://github.com/joewdavies/awesome-frontend-gis
- USGS 3DEP / py3dep, HydroSHEDS — elevation & rivers
- TouchTerrain / DEM renderers — 3D prints & heightmaps (offline)

## User flow you described
1. Choose a real region on topographic basemap.  
2. Load DEM so hills/valleys match reality.  
3. Drop internal places (from a model fork).  
4. Apply **macro** scale/rotation/day-miles.  
5. Adjust **micro** edge days/terrain.  
6. Red/yellow where constraints fail against real distances.

Map Lab v1 (now) = internal abstract graph + macro/micro.  
Terrain Lab v1 (next) = same graph on real DEM.
