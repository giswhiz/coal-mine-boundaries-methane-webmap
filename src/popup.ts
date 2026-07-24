import type { FeatureSelection } from './types'
import { displayOrDash } from './mineModel'

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function row(label: string, value: string): string {
  const shown = displayOrDash(value)
  return `<div class="popup-row">
    <span class="popup-label">${escapeHtml(label)}</span>
    <span class="popup-value">${escapeHtml(shown)}</span>
  </div>`
}

/**
 * Mine-first popup HTML.
 * Component block stays minimal; relatedComponents can be listed in a later step.
 */
export function renderPopupHtml(selection: FeatureSelection): string {
  const { mine, component } = selection
  const title = mine.mineName || mine.gemMineId || 'Mine'
  const wiki = mine.wikiPageEng

  const wikiHtml = wiki
    ? `<a class="popup-wiki" href="${escapeHtml(wiki)}" target="_blank" rel="noopener noreferrer">Open GEM Wiki (EN)</a>`
    : ''

  const componentLabel = [component.category, component.subcategory]
    .filter(Boolean)
    .join(' · ')

  return `
    <article class="popup-card" aria-label="Mine summary">
      <header class="popup-header">
        <h2>${escapeHtml(title)}</h2>
        <p class="popup-id">${escapeHtml(displayOrDash(mine.gemMineId))}</p>
      </header>

      <div class="popup-body">
        ${row('Country / Area', mine.countryArea)}
        ${row('Coal Grade', mine.coalGrade)}
        ${row('Owners', mine.owners)}
        ${row('Parent Company', mine.parentCompany)}
        ${row('Last researched', mine.lastResearched)}
        ${wikiHtml}
      </div>

      <footer class="popup-footer">
        <p class="popup-footer-label">Selected component</p>
        <p class="popup-component-type">${escapeHtml(displayOrDash(componentLabel))}</p>
        <p class="popup-component-desc">${escapeHtml(displayOrDash(component.description))}</p>
      </footer>
    </article>
  `
}

/** Lightweight hover preview (not pinned). */
export function renderPreviewHtml(selection: FeatureSelection): string {
  const { mine, component } = selection
  const title = mine.mineName || mine.gemMineId || 'Mine'
  const componentLabel = [component.category, component.subcategory]
    .filter(Boolean)
    .join(' · ')

  return `
    <div class="preview-card" aria-label="Feature preview">
      <p class="preview-title">${escapeHtml(title)}</p>
      ${previewRow('Country', mine.countryArea)}
      ${previewRow('Owner', mine.owners)}
      ${previewRow('Parent Company', mine.parentCompany)}
      ${previewRow('Description', component.description)}
      <p class="preview-component">${escapeHtml(displayOrDash(componentLabel))}</p>
    </div>
  `
}

function previewRow(label: string, value: string): string {
  return `<div class="preview-row">
    <span class="preview-label">${escapeHtml(label)}</span>
    <span class="preview-value">${escapeHtml(displayOrDash(value))}</span>
  </div>`
}
