import type {
  FeatureSelection,
  GemFeatureProperties,
  MineComponent,
  MineSummary,
} from './types'

function text(value: unknown): string {
  if (value == null) return ''
  const s = String(value).trim()
  return s
}

export function toMineSummary(props: GemFeatureProperties): MineSummary {
  return {
    gemMineId: text(props['GEM Mine ID']),
    mineName: text(props['Mine Name']),
    countryArea: text(props['Country / Area']),
    coalGrade: text(props['Coal Grade']),
    owners: text(props.Owners),
    parentCompany: text(props['Parent Company']),
    lastResearched: text(props['Last researched']),
    wikiPageEng: text(props['GEM Wiki Page (ENG)']),
  }
}

export function toMineComponent(
  props: GemFeatureProperties,
  geometryType: string,
): MineComponent {
  return {
    featureId: text(props.id),
    category: text(props['mine feature category']),
    subcategory: text(props['mine feature subcategory']),
    description: text(props.description),
    geometryType,
  }
}

/**
 * Build a selection from a clicked MapLibre feature.
 * relatedComponents is intentionally empty in step 1; index-by-mine can fill it later.
 */
export function selectionFromMapFeature(feature: {
  properties?: Record<string, unknown> | null
  geometry?: { type?: string } | null
}): FeatureSelection | null {
  const props = (feature.properties ?? {}) as GemFeatureProperties
  const gemMineId = text(props['GEM Mine ID'])
  if (!gemMineId && !text(props['Mine Name'])) return null

  return {
    mine: toMineSummary(props),
    component: toMineComponent(props, feature.geometry?.type ?? 'Unknown'),
    relatedComponents: [],
  }
}

export function displayOrDash(value: string): string {
  return value || '—'
}
