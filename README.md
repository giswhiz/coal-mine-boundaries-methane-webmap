# Coal Mine Boundaries and Methane Sources — Demo Web Map

Interactive thematic web map of **Global Energy Monitor (GEM)** research on coal mine boundaries and potential coal mine methane (CMM) sources.

**Live map:** https://giswhiz.github.io/coal-mine-boundaries-methane-webmap/

**Methodology & research documentation:**  
[Coal Mine Boundaries and Methane Sources (GEM Wiki)](https://www.gem.wiki/Coal_Mine_Boundaries_and_Methane_Sources)

---

## About the data

This map visualizes GEM’s **Coal Mine Boundaries and Methane Sources** dataset (v1.0.2). The research supports coal mine methane attribution and mitigation analysis, including work connected to UNEP IMEO’s Steel Methane Programme.

Features in the dataset include:

- **Mine boundaries** — underground, surface, or mixed mining types
- **Ventilation systems** — e.g. VAM exhaust, air intakes, related infrastructure
- **Degasification systems** — e.g. wells, drainage stations, flares, power generation
- **Other** potential methane-related sites — e.g. mine entrances, handling plants, storage

Boundary geometries may be **reported**, **extracted**, or **estimated** from permits, GIS resources, maps/figures, and satellite imagery. Methane-related features are identified from documents, GIS, and imagery. Coordinates are stored in **WGS84**.

Full method notes and inclusion criteria are described on the [GEM Wiki page](https://www.gem.wiki/Coal_Mine_Boundaries_and_Methane_Sources).

---

## What this map shows

- Country choropleth by number of unique mines
- Mine areas (soft patches at world view; exact boundaries when zoomed in)
- Methane-related sites styled by category (shape + color)
- Hover preview and click-to-pin mine details
- Dataset summary and approximate top parent companies by cumulative stake
- Compact legend and method/data notes

---

## Technologies

| Component | Technology |
|-----------|------------|
| App | Vite + TypeScript |
| Mapping | MapLibre GL JS |
| Basemap | OpenFreeMap Bright |
| Hillshade | AWS Open Data / Mapzen Terrarium |
| Data | GeoJSON |

---

## Datasets included in this repo

| File | Description |
|------|-------------|
| `public/data/coal-mine-boundaries-methane.geojson` | GEM Coal Mine Boundaries and Methane Sources v1.0.2 (combined features) |
| `public/data/affected-countries.geojson` | Country polygons used for the mines-per-country choropleth |

Basemap tiles are loaded at runtime from OpenFreeMap (© OpenStreetMap contributors). Hillshade uses AWS Terrarium terrain tiles.

---

## Run locally

Requirements: [Node.js](https://nodejs.org/) (v20+ recommended)

```bash
npm install
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`).

Production build (static site written to `docs/` for GitHub Pages):

```bash
npm run build
npm run preview
```

---

## Share the map

- **Easiest:** share the live GitHub Pages link above.
- **Source code:** share this repository URL.
- **Offline static files:** after `npm run build`, the `docs/` folder is a complete static site. Host it on any static file server (do not rely on opening `index.html` via `file://` — browsers block local data fetches).

---

## Attribution

- Research data and map content: © [Global Energy Monitor](https://globalenergymonitor.org/) — Coal Mine Boundaries and Methane Sources v1.0.2  
- Methodology: [GEM Wiki](https://www.gem.wiki/Coal_Mine_Boundaries_and_Methane_Sources)  
- Basemap: [OpenFreeMap](https://openfreemap.org/) · © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors  
- Terrain: AWS Open Data / Mapzen Terrarium  

Please follow GEM’s terms and the dataset’s Creative Commons licensing as published by Global Energy Monitor when reusing the data.
