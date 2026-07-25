import {
  Map,
  NavigationControl,
  Popup,
  ScaleControl,
  setWorkerUrl,
  type MapGeoJSONFeature,
  type MapLayerMouseEvent,
  type MapMouseEvent,
} from 'maplibre-gl'
// ?worker&url bundles the worker + maplibre-gl-shared.mjs into one asset.
// Plain ?url only copies the worker stub, which 404s on shared.mjs in production.
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'
import 'maplibre-gl/dist/maplibre-gl.css'

import { addSubtleHillshade, OPENFREEMAP_STYLE_URL, refineBasemapStyle } from './basemap'
import { buildBoundaryCellCollection } from './boundaryCells'
import { buildCountryChoropleth } from './choropleth'
import {
  addCountryContextLayer,
  addGemLayers,
  INTERACTIVE_LAYER_IDS,
} from './layers'
import { renderLegend } from './legend'
import { selectionFromMapFeature } from './mineModel'
import {
  rankParentCompaniesByCumulativeStake,
  renderInsightPanel,
} from './parentCompanies'
import { renderPopupHtml, renderPreviewHtml } from './popup'
import { computeDatasetSummary, renderSummaryPanel } from './summary'
import {
  CELL_SOURCE_ID,
  COUNTRIES_SOURCE_ID,
  COUNTRIES_URL,
  DATA_URL,
  GEM_ATTRIBUTION,
  SOURCE_ID,
} from './types'
import './style.css'

// MapLibre treats URLs ending in .mjs as module workers; Vite's ?worker&url
// asset may not end in .mjs, so append a hash fragment that preserves the suffix.
setWorkerUrl(`${maplibreWorkerUrl}#.mjs`)

const mapContainer = document.querySelector<HTMLElement>('#map')
const legendContainer = document.querySelector<HTMLElement>('#legend')
const summaryContainer = document.querySelector<HTMLElement>('#summary')
const insightContainer = document.querySelector<HTMLElement>('#insight')

if (
  !mapContainer ||
  !legendContainer ||
  !summaryContainer ||
  !insightContainer
) {
  throw new Error('Missing #map, #legend, #summary, or #insight container')
}

const map = new Map({
  container: mapContainer,
  style: OPENFREEMAP_STYLE_URL,
  center: [20, 20],
  zoom: 1.6,
  attributionControl: {
    compact: true,
    customAttribution: [
      GEM_ATTRIBUTION,
      '<a href="https://openfreemap.org/">OpenFreeMap</a> · © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    ],
  },
})

map.addControl(new NavigationControl({ visualizePitch: false }), 'top-right')
map.addControl(new ScaleControl({ unit: 'metric' }))

const pinnedPopup = new Popup({
  closeButton: true,
  closeOnClick: true,
  maxWidth: '300px',
  className: 'mine-popup',
  focusAfterOpen: true,
})

const previewPopup = new Popup({
  closeButton: false,
  closeOnClick: false,
  maxWidth: '280px',
  className: 'mine-preview',
  offset: 12,
})

let selectedFeatureId: string | number | undefined
let pinnedOpen = false
let hoverEnabled = window.matchMedia('(hover: hover) and (pointer: fine)').matches

window
  .matchMedia('(hover: hover) and (pointer: fine)')
  .addEventListener('change', (event) => {
    hoverEnabled = event.matches
    if (!hoverEnabled) previewPopup.remove()
  })

function featureKey(feature: MapGeoJSONFeature): string {
  const id = feature.id ?? feature.properties?.id
  return id == null ? '' : String(id)
}

function setSelectedState(featureId: string | number, selected: boolean): void {
  map.setFeatureState({ source: SOURCE_ID, id: featureId }, { selected })
  if (map.getSource(CELL_SOURCE_ID)) {
    map.setFeatureState({ source: CELL_SOURCE_ID, id: featureId }, { selected })
  }
}

function clearSelection(): void {
  if (selectedFeatureId !== undefined) {
    setSelectedState(selectedFeatureId, false)
    selectedFeatureId = undefined
  }
}

function selectFeature(featureId: string | number | undefined): void {
  clearSelection()
  if (featureId === undefined || featureId === null || featureId === '') return
  selectedFeatureId = featureId
  setSelectedState(featureId, true)
}

pinnedPopup.on('close', () => {
  pinnedOpen = false
  clearSelection()
})

map.on('load', async () => {
  refineBasemapStyle(map)
  addSubtleHillshade(map)

  const [mineResponse, countriesResponse] = await Promise.all([
    fetch(DATA_URL),
    fetch(COUNTRIES_URL),
  ])
  const mineData = (await mineResponse.json()) as {
    type: 'FeatureCollection'
    features: Array<{
      properties?: Record<string, unknown> | null
      geometry?: { type: string; coordinates: unknown } | null
    }>
  }
  const countriesData = await countriesResponse.json()

  const choropleth = buildCountryChoropleth(mineData.features, countriesData)

  renderLegend(legendContainer, choropleth.classes)
  renderSummaryPanel(summaryContainer, computeDatasetSummary(mineData))
  renderInsightPanel(
    insightContainer,
    rankParentCompaniesByCumulativeStake(mineData.features, 10),
  )

  map.addSource(COUNTRIES_SOURCE_ID, {
    type: 'geojson',
    data: choropleth.enrichedCountries as never,
  })
  addCountryContextLayer(map)

  map.addSource(SOURCE_ID, {
    type: 'geojson',
    data: mineData as never,
    promoteId: 'id',
  })

  map.addSource(CELL_SOURCE_ID, {
    type: 'geojson',
    data: buildBoundaryCellCollection(mineData) as never,
    promoteId: 'id',
  })

  addGemLayers(map)

  for (const layerId of INTERACTIVE_LAYER_IDS) {
    map.on('mouseenter', layerId, () => {
      map.getCanvas().style.cursor = 'pointer'
    })
    map.on('mouseleave', layerId, () => {
      map.getCanvas().style.cursor = ''
    })

    map.on('mousemove', layerId, (event: MapLayerMouseEvent) => {
      if (!hoverEnabled) return
      const feature = event.features?.[0]
      if (!feature) {
        previewPopup.remove()
        return
      }

      if (
        pinnedOpen &&
        selectedFeatureId != null &&
        featureKey(feature) === String(selectedFeatureId)
      ) {
        previewPopup.remove()
        return
      }

      const selection = selectionFromMapFeature(feature)
      if (!selection) return

      previewPopup
        .setLngLat(event.lngLat)
        .setHTML(renderPreviewHtml(selection))
        .addTo(map)
    })

    map.on('mouseleave', layerId, () => {
      previewPopup.remove()
    })
  }
})

function interactiveLayersPresent(): string[] {
  return INTERACTIVE_LAYER_IDS.filter((layerId) => map.getLayer(layerId) != null)
}

map.on('click', (event: MapMouseEvent) => {
  previewPopup.remove()

  const layers = interactiveLayersPresent()
  if (layers.length === 0) return

  const features = map.queryRenderedFeatures(event.point, { layers })
  const feature = features[0]
  if (!feature) {
    pinnedPopup.remove()
    pinnedOpen = false
    clearSelection()
    return
  }

  const selection = selectionFromMapFeature(feature)
  if (!selection) return

  const featureId =
    feature.id ?? (feature.properties?.id as string | number | undefined)
  selectFeature(featureId)
  pinnedOpen = true

  pinnedPopup
    .setLngLat(event.lngLat)
    .setHTML(renderPopupHtml(selection))
    .addTo(map)
})
