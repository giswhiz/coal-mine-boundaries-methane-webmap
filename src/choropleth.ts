export const CHOROPLETH_COLORS = [
  '#d8f3dc',
  '#95d5b2',
  '#52b788',
  '#2d6a4f',
] as const

export interface ChoroplethClass {
  classIndex: number
  min: number
  max: number
  color: string
  label: string
}

export interface ChoroplethResult {
  classes: ChoroplethClass[]
  countsByCountry: Map<string, number>
  enrichedCountries: {
    type: 'FeatureCollection'
    features: Array<{
      type: 'Feature'
      properties: Record<string, unknown>
      geometry: unknown
    }>
  }
}

function uniqueMinesPerCountry(
  features: Array<{ properties?: Record<string, unknown> | null }>,
): Map<string, number> {
  const minesByCountry = new Map<string, Set<string>>()

  for (const feature of features) {
    const props = feature.properties ?? {}
    const country = String(props['Country / Area'] ?? '').trim()
    const mineId = String(props['GEM Mine ID'] ?? '').trim()
    if (!country || !mineId) continue

    let set = minesByCountry.get(country)
    if (!set) {
      set = new Set()
      minesByCountry.set(country, set)
    }
    set.add(mineId)
  }

  const counts = new Map<string, number>()
  for (const [country, set] of minesByCountry) {
    counts.set(country, set.size)
  }
  return counts
}

/** Inclusive quantile breaks for a small set of country counts. */
function quartileBreaks(sortedCounts: number[]): [number, number, number] {
  const n = sortedCounts.length
  if (n === 0) return [0, 0, 0]
  const at = (p: number) => {
    const i = (n - 1) * p
    const lo = Math.floor(i)
    const hi = Math.ceil(i)
    if (lo === hi) return sortedCounts[lo]
    return sortedCounts[lo] + (sortedCounts[hi] - sortedCounts[lo]) * (i - lo)
  }
  return [at(0.25), at(0.5), at(0.75)]
}

function classIndexForCount(
  count: number,
  breaks: [number, number, number],
): number {
  const [q1, q2, q3] = breaks
  if (count <= q1) return 1
  if (count <= q2) return 2
  if (count <= q3) return 3
  return 4
}

function classRanges(
  sortedCounts: number[],
  breaks: [number, number, number],
): ChoroplethClass[] {
  const members: number[][] = [[], [], [], []]
  for (const c of sortedCounts) {
    members[classIndexForCount(c, breaks) - 1].push(c)
  }

  const minAll = sortedCounts[0] ?? 0
  const maxAll = sortedCounts[sortedCounts.length - 1] ?? 0

  return [1, 2, 3, 4].map((classIndex) => {
    const vals = members[classIndex - 1]
    const min = vals.length ? Math.min(...vals) : classIndex === 1 ? minAll : 0
    const max = vals.length ? Math.max(...vals) : classIndex === 4 ? maxAll : 0
    const color = CHOROPLETH_COLORS[classIndex - 1]
    const label =
      min === max
        ? `${min} mine${min === 1 ? '' : 's'}`
        : `${min}–${max} mines`
    return { classIndex, min, max, color, label }
  })
}

/**
 * Soft country choropleth from unique GEM Mine ID counts.
 * Attaches mineCount + mineClass onto country features.
 */
export function buildCountryChoropleth(
  mineFeatures: Array<{ properties?: Record<string, unknown> | null }>,
  countries: {
    type: string
    features: Array<{
      type: string
      properties?: Record<string, unknown> | null
      geometry?: unknown
    }>
  },
): ChoroplethResult {
  const countsByCountry = uniqueMinesPerCountry(mineFeatures)
  const sortedCounts = [...countsByCountry.values()].sort((a, b) => a - b)
  const breaks = quartileBreaks(sortedCounts)
  const classes = classRanges(sortedCounts, breaks)

  const enrichedCountries = {
    type: 'FeatureCollection' as const,
    features: countries.features.map((feature) => {
      const name = String(feature.properties?.name ?? '').trim()
      const mineCount = countsByCountry.get(name) ?? 0
      const mineClass = mineCount
        ? classIndexForCount(mineCount, breaks)
        : 0
      return {
        type: 'Feature' as const,
        properties: {
          ...(feature.properties ?? {}),
          mineCount,
          mineClass,
        },
        geometry: feature.geometry,
      }
    }),
  }

  return { classes, countsByCountry, enrichedCountries }
}
