import type { DatasetSummary, GemFeatureProperties } from './types'
import { FEATURE_CATEGORIES } from './types'

export function computeDatasetSummary(collection: {
  features: Array<{ properties?: Record<string, unknown> | null }>
}): DatasetSummary {
  const mines = new Set<string>()
  const countries = new Set<string>()
  let methaneFeatureCount = 0

  for (const feature of collection.features) {
    const props = (feature.properties ?? {}) as GemFeatureProperties
    const mineId = String(props['GEM Mine ID'] ?? '').trim()
    if (mineId) mines.add(mineId)

    const country = String(props['Country / Area'] ?? '').trim()
    if (country) countries.add(country)

    const category = String(props['mine feature category'] ?? '')
    if (category && category !== FEATURE_CATEGORIES.boundary) {
      methaneFeatureCount += 1
    }
  }

  return {
    mineCount: mines.size,
    methaneFeatureCount,
    countryCount: countries.size,
  }
}

export function renderSummaryPanel(
  container: HTMLElement,
  summary: DatasetSummary,
): void {
  container.innerHTML = `
    <h2 class="summary__title">Dataset summary</h2>
    <dl class="summary__stats">
      <div class="summary__stat">
        <dt>Mines</dt>
        <dd>${summary.mineCount.toLocaleString()}</dd>
      </div>
      <div class="summary__stat">
        <dt>Methane features</dt>
        <dd>${summary.methaneFeatureCount.toLocaleString()}</dd>
      </div>
      <div class="summary__stat">
        <dt>Countries</dt>
        <dd>${summary.countryCount.toLocaleString()}</dd>
      </div>
    </dl>
  `
}
