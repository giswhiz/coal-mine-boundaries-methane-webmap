import type { Map as MapLibreMap } from 'maplibre-gl'

const FOOTPRINT_ICON = 'mine-footprint-soft'
const ICON_CIRCLE = 'sym-circle'
const ICON_DIAMOND = 'sym-diamond'
const ICON_TRIANGLE = 'sym-triangle'

function canvasContext(size: number): CanvasRenderingContext2D | null {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  return canvas.getContext('2d')
}

/**
 * Soft organic footprint silhouette (smooth rounded lease-like blob), SDF white.
 */
function createFootprintIcon(): ImageData | null {
  const size = 64
  const ctx = canvasContext(size)
  if (!ctx) return null

  ctx.clearRect(0, 0, size, size)
  ctx.translate(32, 32)
  ctx.rotate(-0.2)
  ctx.beginPath()
  // Smooth closed blob via bezier ring
  ctx.moveTo(0, -20)
  ctx.bezierCurveTo(14, -22, 22, -12, 20, -2)
  ctx.bezierCurveTo(24, 10, 14, 20, 2, 18)
  ctx.bezierCurveTo(-10, 22, -22, 12, -18, 0)
  ctx.bezierCurveTo(-22, -12, -12, -20, 0, -20)
  ctx.closePath()
  ctx.fillStyle = '#ffffff'
  ctx.fill()

  return ctx.getImageData(0, 0, size, size)
}

function createCircleIcon(): ImageData | null {
  const size = 64
  const ctx = canvasContext(size)
  if (!ctx) return null
  ctx.clearRect(0, 0, size, size)
  ctx.beginPath()
  ctx.arc(32, 32, 18, 0, Math.PI * 2)
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  return ctx.getImageData(0, 0, size, size)
}

function createDiamondIcon(): ImageData | null {
  const size = 64
  const ctx = canvasContext(size)
  if (!ctx) return null
  ctx.clearRect(0, 0, size, size)
  ctx.beginPath()
  ctx.moveTo(32, 10)
  ctx.lineTo(52, 32)
  ctx.lineTo(32, 54)
  ctx.lineTo(12, 32)
  ctx.closePath()
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  return ctx.getImageData(0, 0, size, size)
}

function createTriangleIcon(): ImageData | null {
  const size = 64
  const ctx = canvasContext(size)
  if (!ctx) return null
  ctx.clearRect(0, 0, size, size)
  ctx.beginPath()
  ctx.moveTo(32, 10)
  ctx.lineTo(54, 50)
  ctx.lineTo(10, 50)
  ctx.closePath()
  ctx.fillStyle = '#ffffff'
  ctx.fill()
  return ctx.getImageData(0, 0, size, size)
}

export function ensureMapIcons(map: MapLibreMap): void {
  const icons: Array<[string, ImageData | null]> = [
    [FOOTPRINT_ICON, createFootprintIcon()],
    [ICON_CIRCLE, createCircleIcon()],
    [ICON_DIAMOND, createDiamondIcon()],
    [ICON_TRIANGLE, createTriangleIcon()],
  ]

  for (const [id, image] of icons) {
    if (!image || map.hasImage(id)) continue
    map.addImage(id, image, { sdf: true })
  }
}

export const MAP_ICONS = {
  footprint: FOOTPRINT_ICON,
  circle: ICON_CIRCLE,
  diamond: ICON_DIAMOND,
  triangle: ICON_TRIANGLE,
} as const
