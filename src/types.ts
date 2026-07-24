export const COUNTRIES_URL = '/data/affected-countries.geojson'
export const COUNTRIES_SOURCE_ID = 'affected-countries'

export const DATA_URL = '/data/coal-mine-boundaries-methane.geojson'
export const SOURCE_ID = 'gem-mines'
export const CELL_SOURCE_ID = 'gem-boundary-cells'

export const LAYER_IDS = {
  countryFill: 'affected-countries-fill',
  countryOutline: 'affected-countries-outline',
  boundaryCells: 'mine-boundary-cells',
  boundaryFill: 'mine-boundary-fill',
  boundaryOutline: 'mine-boundary-outline',
  methanePoints: 'methane-points',
  methaneLines: 'methane-lines',
  selectedBoundary: 'selected-boundary-outline',
  selectedCell: 'selected-boundary-cell',
  selectedPoint: 'selected-methane-point',
} as const

/** Authoritative thematic categories in this dataset. */
export const FEATURE_CATEGORIES = {
  boundary: 'mine boundary',
  ventilation: 'ventilation system',
  degasification: 'degasification system',
  other: 'other',
} as const

export const GEM_ATTRIBUTION =
  'Data © <a href="https://globalenergymonitor.org/">Global Energy Monitor</a> — Coal Mine Boundaries and Methane Sources v1.0.2'

/**
 * Raw GeoJSON property keys from the GEM combined dataset.
 * Feature identity is component-level (`id`); mine identity is `GEM Mine ID`.
 * One mine can own many component features (boundaries + methane locations).
 */
export interface GemFeatureProperties {
  id?: string
  'mine feature category'?: string
  'mine feature subcategory'?: string
  description?: string
  'GEM Mine ID'?: string
  'Mine Name'?: string
  'Country / Area'?: string
  'Coal Grade'?: string
  Owners?: string
  'Parent Company'?: string
  'Last researched'?: string
  'GEM Wiki Page (ENG)'?: string
  [key: string]: unknown
}

/** Mine-level attributes shared across all components of a mine. */
export interface MineSummary {
  gemMineId: string
  mineName: string
  countryArea: string
  coalGrade: string
  owners: string
  parentCompany: string
  lastResearched: string
  wikiPageEng: string
}

/**
 * One spatial component belonging to a mine (boundary polygon, vent, well, etc.).
 * Step 1 shows this minimally; later relatedComponents can be attached by gemMineId.
 */
export interface MineComponent {
  featureId: string
  category: string
  subcategory: string
  description: string
  geometryType: string
}

/**
 * Selection model for popup / future detail panels.
 * Designed so relatedComponents can be populated later without changing MineSummary.
 */
export interface FeatureSelection {
  mine: MineSummary
  /** The component that was clicked / activated. */
  component: MineComponent
  /**
   * Reserved for later: other components sharing the same GEM Mine ID.
   * Step 1 leaves this empty.
   */
  relatedComponents: MineComponent[]
}

export interface DatasetSummary {
  mineCount: number
  methaneFeatureCount: number
  countryCount: number
}
