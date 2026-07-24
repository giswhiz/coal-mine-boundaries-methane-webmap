import type {
  ExpressionSpecification,
  FilterSpecification,
  Map as MapLibreMap,
} from 'maplibre-gl'
import { ensureMapIcons, MAP_ICONS } from './mapIcons'
import {
  boundaryFillColor,
  CATEGORY_COLORS,
  pointColorBySubcategory,
} from './themeColors'
import {
  CELL_SOURCE_ID,
  COUNTRIES_SOURCE_ID,
  FEATURE_CATEGORIES,
  LAYER_IDS,
  SOURCE_ID,
} from './types'

export { boundaryFillColor, CATEGORY_COLORS } from './themeColors'

const boundaryFilter: FilterSpecification = [
  '==',
  ['get', 'mine feature category'],
  FEATURE_CATEGORIES.boundary,
]

const methanePointFilter: FilterSpecification = [
  'all',
  ['!=', ['get', 'mine feature category'], FEATURE_CATEGORIES.boundary],
  [
    'any',
    ['==', ['geometry-type'], 'Point'],
    ['==', ['geometry-type'], 'MultiPoint'],
  ],
]

const methaneLineFilter: FilterSpecification = [
  'all',
  ['!=', ['get', 'mine feature category'], FEATURE_CATEGORIES.boundary],
  [
    'any',
    ['==', ['geometry-type'], 'LineString'],
    ['==', ['geometry-type'], 'MultiLineString'],
  ],
]

const pointIcon: ExpressionSpecification = [
  'match',
  ['get', 'mine feature category'],
  FEATURE_CATEGORIES.ventilation,
  MAP_ICONS.circle,
  FEATURE_CATEGORIES.degasification,
  MAP_ICONS.diamond,
  FEATURE_CATEGORIES.other,
  MAP_ICONS.triangle,
  MAP_ICONS.circle,
]

/** ~25% smaller than previous icon-size curve. */
const pointIconSize: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['zoom'],
  1.5,
  0.3,
  4,
  0.36,
  8,
  0.44,
  12,
  0.52,
]

export function addCountryContextLayer(map: MapLibreMap): void {
  map.addLayer({
    id: LAYER_IDS.countryFill,
    type: 'fill',
    source: COUNTRIES_SOURCE_ID,
    paint: {
      'fill-color': [
        'match',
        ['get', 'mineClass'],
        1,
        '#d8f3dc',
        2,
        '#95d5b2',
        3,
        '#52b788',
        4,
        '#2d6a4f',
        '#d8f3dc',
      ],
      'fill-opacity': 0.26,
    },
  })

  map.addLayer({
    id: LAYER_IDS.countryOutline,
    type: 'line',
    source: COUNTRIES_SOURCE_ID,
    paint: {
      'line-color': '#111827',
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        1,
        0.95,
        4,
        1.25,
        8,
        1.5,
      ],
      'line-opacity': 0.9,
    },
  })
}

export function addGemLayers(map: MapLibreMap): void {
  ensureMapIcons(map)

  // Soft area patches at low zoom (blurred circles — not icon markers)
  map.addLayer({
    id: LAYER_IDS.boundaryCells,
    type: 'circle',
    source: CELL_SOURCE_ID,
    paint: {
      'circle-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        1,
        11,
        3,
        13,
        5,
        10,
        6.5,
        4,
      ],
      'circle-color': boundaryFillColor,
      'circle-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        1,
        0.42,
        4,
        0.36,
        5.5,
        0.16,
        6.5,
        0,
      ],
      'circle-blur': 0.65,
      'circle-stroke-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        1,
        0.4,
        5,
        0.6,
        6.5,
        0,
      ],
      'circle-stroke-color': '#1c1917',
      'circle-stroke-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        1,
        0.22,
        5,
        0.18,
        6.5,
        0,
      ],
    },
  })

  map.addLayer({
    id: LAYER_IDS.boundaryFill,
    type: 'fill',
    source: SOURCE_ID,
    filter: boundaryFilter,
    paint: {
      'fill-color': boundaryFillColor,
      'fill-opacity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        1.5,
        0.88,
        4,
        0.75,
        7,
        0.5,
        11,
        0.42,
      ],
    },
  })

  map.addLayer({
    id: LAYER_IDS.boundaryOutline,
    type: 'line',
    source: SOURCE_ID,
    filter: boundaryFilter,
    paint: {
      'line-color': '#111827',
      'line-width': [
        'interpolate',
        ['linear'],
        ['zoom'],
        1.5,
        1.8,
        4,
        2.2,
        7,
        2,
        11,
        2.4,
      ],
      'line-opacity': 0.98,
    },
  })

  map.addLayer({
    id: LAYER_IDS.methaneLines,
    type: 'line',
    source: SOURCE_ID,
    filter: methaneLineFilter,
    paint: {
      'line-color': CATEGORY_COLORS.degasification.pipeline,
      'line-width': 2.2,
      'line-opacity': 0.88,
    },
  })

  map.addLayer({
    id: LAYER_IDS.methanePoints,
    type: 'symbol',
    source: SOURCE_ID,
    filter: methanePointFilter,
    layout: {
      'icon-image': pointIcon,
      'icon-size': pointIconSize,
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
    paint: {
      'icon-color': pointColorBySubcategory,
      'icon-opacity': 0.94,
      'icon-halo-color': '#ffffff',
      'icon-halo-width': 0.9,
    },
  })

  map.addLayer({
    id: LAYER_IDS.selectedCell,
    type: 'circle',
    source: CELL_SOURCE_ID,
    paint: {
      'circle-radius': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        14,
        0,
      ],
      'circle-color': '#0f172a',
      'circle-opacity': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        0.2,
        0,
      ],
      'circle-blur': 0.5,
      'circle-stroke-width': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        1.5,
        0,
      ],
      'circle-stroke-color': '#0f172a',
    },
  })

  map.addLayer({
    id: LAYER_IDS.selectedBoundary,
    type: 'line',
    source: SOURCE_ID,
    filter: boundaryFilter,
    paint: {
      'line-color': '#0f172a',
      'line-width': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        3.5,
        0,
      ],
      'line-opacity': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        1,
        0,
      ],
    },
  })

  map.addLayer({
    id: LAYER_IDS.selectedPoint,
    type: 'symbol',
    source: SOURCE_ID,
    filter: methanePointFilter,
    layout: {
      'icon-image': pointIcon,
      'icon-size': [
        'interpolate',
        ['linear'],
        ['zoom'],
        1.5,
        0.42,
        8,
        0.58,
      ],
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
    paint: {
      'icon-color': '#0f172a',
      'icon-opacity': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        0.22,
        0,
      ],
      'icon-halo-color': '#0f172a',
      'icon-halo-width': [
        'case',
        ['boolean', ['feature-state', 'selected'], false],
        2,
        0,
      ],
    },
  })
}

export const INTERACTIVE_LAYER_IDS = [
  LAYER_IDS.boundaryCells,
  LAYER_IDS.boundaryFill,
  LAYER_IDS.methanePoints,
  LAYER_IDS.methaneLines,
] as const
