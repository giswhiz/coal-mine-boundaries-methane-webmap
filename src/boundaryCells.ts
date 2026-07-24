import type { GemFeatureProperties } from './types'
import { FEATURE_CATEGORIES } from './types'

type Position = [number, number]

function ringCentroid(ring: Position[]): Position | null {
  if (!ring.length) return null
  const coords =
    ring.length > 1 &&
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1]
      ? ring.slice(0, -1)
      : ring
  if (!coords.length) return null

  let sx = 0
  let sy = 0
  for (const [x, y] of coords) {
    sx += x
    sy += y
  }
  return [sx / coords.length, sy / coords.length]
}

function geometryCentroid(geometry: {
  type: string
  coordinates: unknown
} | null | undefined): Position | null {
  if (!geometry) return null
  if (geometry.type === 'Polygon') {
    const rings = geometry.coordinates as Position[][]
    return ringCentroid(rings[0] ?? [])
  }
  if (geometry.type === 'MultiPolygon') {
    const polygons = geometry.coordinates as Position[][][]
    let best: Position[] | null = null
    for (const polygon of polygons) {
      const ring = polygon[0] ?? []
      if (!best || ring.length > best.length) best = ring
    }
    return best ? ringCentroid(best) : null
  }
  if (geometry.type === 'Point') {
    return geometry.coordinates as Position
  }
  return null
}

/**
 * One Point per mine-boundary polygon, for low-zoom square/cell markers.
 * Preserves original component properties (including `id`) for popup/selection.
 */
export function buildBoundaryCellCollection(collection: {
  features: Array<{
    properties?: Record<string, unknown> | null
    geometry?: { type: string; coordinates: unknown } | null
  }>
}): {
  type: 'FeatureCollection'
  features: Array<{
    type: 'Feature'
    properties: Record<string, unknown>
    geometry: { type: 'Point'; coordinates: Position }
  }>
} {
  const features: Array<{
    type: 'Feature'
    properties: Record<string, unknown>
    geometry: { type: 'Point'; coordinates: Position }
  }> = []

  for (const feature of collection.features) {
    const props = (feature.properties ?? {}) as GemFeatureProperties
    if (props['mine feature category'] !== FEATURE_CATEGORIES.boundary) {
      continue
    }
    const center = geometryCentroid(feature.geometry)
    if (!center) continue

    features.push({
      type: 'Feature',
      properties: { ...(props as Record<string, unknown>) },
      geometry: {
        type: 'Point',
        coordinates: center,
      },
    })
  }

  return { type: 'FeatureCollection', features }
}
