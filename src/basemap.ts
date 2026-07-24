import type { Map as MapLibreMap } from 'maplibre-gl'

/** First-choice vivid basemap (confirmed over Liberty for this demo). */
export const OPENFREEMAP_STYLE_URL =
  'https://tiles.openfreemap.org/styles/bright'

export const TERRAIN_SOURCE_ID = 'aws-terrarium'
export const HILLSHADE_LAYER_ID = 'terrain-hillshade'

/**
 * Soften Bright label contrast so thematic colors stay primary,
 * while keeping the colorful land/water palette.
 */
export function refineBasemapStyle(map: MapLibreMap): void {
  const style = map.getStyle()
  if (!style?.layers) return

  for (const layer of style.layers) {
    if (layer.type !== 'symbol') continue
    const id = layer.id
    try {
      if (map.getPaintProperty(id, 'text-opacity') !== undefined) {
        map.setPaintProperty(id, 'text-opacity', 0.72)
      }
      if (map.getPaintProperty(id, 'text-halo-width') !== undefined) {
        map.setPaintProperty(id, 'text-halo-width', 0.8)
      }
      if (map.getPaintProperty(id, 'icon-opacity') !== undefined) {
        map.setPaintProperty(id, 'icon-opacity', 0.75)
      }
    } catch {
      // Some style layers omit these paint props; skip safely.
    }
  }
}

/**
 * Terrarium hillshade over OpenFreeMap Bright.
 * Stronger landform read, still below thematic layers.
 */
export function addSubtleHillshade(map: MapLibreMap): void {
  if (map.getSource(TERRAIN_SOURCE_ID)) return

  map.addSource(TERRAIN_SOURCE_ID, {
    type: 'raster-dem',
    tiles: [
      'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
    ],
    encoding: 'terrarium',
    tileSize: 256,
    maxzoom: 12,
    attribution:
      '<a href="https://registry.opendata.aws/terrain-tiles/">Terrain</a> © <a href="https://aws.amazon.com/public-datasets/terrain/">AWS Open Data / Mapzen Terrarium</a>',
  })

  const beforeId = map
    .getStyle()
    .layers?.find((layer) => layer.type === 'symbol')?.id

  map.addLayer(
    {
      id: HILLSHADE_LAYER_ID,
      type: 'hillshade',
      source: TERRAIN_SOURCE_ID,
      paint: {
        'hillshade-exaggeration': 0.45,
        'hillshade-shadow-color': '#57534e',
        'hillshade-highlight-color': '#fffbeb',
        'hillshade-accent-color': '#a8a29e',
        'hillshade-illumination-anchor': 'viewport',
      },
    },
    beforeId,
  )
}
