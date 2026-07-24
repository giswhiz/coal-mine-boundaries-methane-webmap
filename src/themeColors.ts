import type { ExpressionSpecification } from 'maplibre-gl'
import { FEATURE_CATEGORIES } from './types'

/** Boundary subcategory fill/patch colors. */
export const boundaryFillColor: ExpressionSpecification = [
  'match',
  ['get', 'mine feature subcategory'],
  'underground',
  '#3f3a36',
  'underground and surface',
  '#a16207',
  'surface',
  '#ea580c',
  '#78716c',
]

/**
 * Within-category gradations (same hue family, darker → lighter by subtype role).
 * Category families stay distinct: red / blue / violet.
 */
export const CATEGORY_COLORS = {
  ventilation: {
    base: '#dc2626',
    shaft: '#991b1b',
    vent: '#dc2626',
    rto: '#f87171',
  },
  degasification: {
    base: '#2563eb',
    gasWell: '#1e3a8a',
    drainageStation: '#1d4ed8',
    flare: '#3b82f6',
    gasToElectric: '#60a5fa',
    chp: '#93c5fd',
    pipeline: '#2563eb',
  },
  other: {
    base: '#9333ea',
    slopeAccess: '#6b21a8',
    preparationPlant: '#7e22ce',
    shaft: '#9333ea',
    entrance: '#a855f7',
    adit: '#c084fc',
    coalStorage: '#a855f7',
    dewatering: '#d8b4fe',
    ammonia: '#e9d5ff',
    notRelated: '#f3e8ff',
  },
} as const

export const pointColorBySubcategory: ExpressionSpecification = [
  'match',
  ['get', 'mine feature subcategory'],
  // Ventilation
  'shaft',
  [
    'match',
    ['get', 'mine feature category'],
    FEATURE_CATEGORIES.ventilation,
    CATEGORY_COLORS.ventilation.shaft,
    FEATURE_CATEGORIES.other,
    CATEGORY_COLORS.other.shaft,
    CATEGORY_COLORS.ventilation.shaft,
  ],
  'vent',
  CATEGORY_COLORS.ventilation.vent,
  'regenerative thermal oxidizer (RTO)',
  CATEGORY_COLORS.ventilation.rto,
  // Degasification
  'gas well',
  CATEGORY_COLORS.degasification.gasWell,
  'drainage station',
  CATEGORY_COLORS.degasification.drainageStation,
  'flare',
  CATEGORY_COLORS.degasification.flare,
  'gas to electric station',
  CATEGORY_COLORS.degasification.gasToElectric,
  'combined heat and power plant',
  CATEGORY_COLORS.degasification.chp,
  'drainage pipeline',
  CATEGORY_COLORS.degasification.pipeline,
  // Other
  'slope access or production shaft',
  CATEGORY_COLORS.other.slopeAccess,
  'preparation plant',
  CATEGORY_COLORS.other.preparationPlant,
  'mine entrance or exit',
  CATEGORY_COLORS.other.entrance,
  'adit or drift',
  CATEGORY_COLORS.other.adit,
  'coal storage',
  CATEGORY_COLORS.other.coalStorage,
  'dewatering station',
  CATEGORY_COLORS.other.dewatering,
  'ammonia processing plant',
  CATEGORY_COLORS.other.ammonia,
  'not coal mine related',
  CATEGORY_COLORS.other.notRelated,
  // Fallback by category
  [
    'match',
    ['get', 'mine feature category'],
    FEATURE_CATEGORIES.ventilation,
    CATEGORY_COLORS.ventilation.base,
    FEATURE_CATEGORIES.degasification,
    CATEGORY_COLORS.degasification.base,
    FEATURE_CATEGORIES.other,
    CATEGORY_COLORS.other.base,
    '#57534e',
  ],
]
