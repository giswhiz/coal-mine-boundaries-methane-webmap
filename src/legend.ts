import type { ChoroplethClass } from './choropleth'
import { CATEGORY_COLORS } from './themeColors'

export function renderLegend(
  container: HTMLElement,
  choroplethClasses: ChoroplethClass[] = [],
): void {
  const v = CATEGORY_COLORS.ventilation
  const d = CATEGORY_COLORS.degasification
  const o = CATEGORY_COLORS.other

  const choroplethBlock =
    choroplethClasses.length === 0
      ? `<li><span class="swatch swatch--poly swatch--country" style="--swatch:#95d5b2"></span> Country with mapped mines</li>`
      : choroplethClasses
          .map(
            (c) => `
        <li>
          <span class="swatch swatch--poly swatch--choropleth" style="--swatch:${c.color}"></span>
          ${escapeHtml(c.label)}
        </li>`,
          )
          .join('')

  container.innerHTML = `
    <div class="legend__head">
      <h2 class="legend__title">Legend</h2>
      <p class="legend__tagline">Soft patches at world view · exact boundaries when zoomed in</p>
    </div>
    <div class="legend__columns">
      <div class="legend__group">
        <h3 class="legend__group-title">Mines per country</h3>
        <ul class="legend__list">
          ${choroplethBlock}
        </ul>
      </div>

      <div class="legend__group">
        <h3 class="legend__group-title">Mine areas &amp; types</h3>
        <ul class="legend__list">
          <li><span class="swatch swatch--patch" style="--swatch:#44403c"></span> Areas (zoomed out)</li>
          <li><span class="swatch swatch--poly" style="--swatch:#44403c"></span> Boundaries (zoomed in)</li>
          <li><span class="swatch swatch--poly" style="--swatch:#3f3a36"></span> Underground</li>
          <li><span class="swatch swatch--poly" style="--swatch:#a16207"></span> Underground and surface</li>
          <li><span class="swatch swatch--poly" style="--swatch:#ea580c"></span> Surface</li>
        </ul>
      </div>

      <div class="legend__group">
        <h3 class="legend__group-title">Ventilation <span class="legend__shape">(circle · red)</span></h3>
        <ul class="legend__list">
          <li><span class="swatch swatch--circle" style="--swatch:${v.shaft}"></span> Shaft</li>
          <li><span class="swatch swatch--circle" style="--swatch:${v.vent}"></span> Vent</li>
          <li><span class="swatch swatch--circle" style="--swatch:${v.rto}"></span> RTO</li>
        </ul>
      </div>

      <div class="legend__group">
        <h3 class="legend__group-title">Degasification <span class="legend__shape">(diamond · blue)</span></h3>
        <ul class="legend__list">
          <li><span class="swatch swatch--diamond" style="--swatch:${d.gasWell}"></span> Gas well</li>
          <li><span class="swatch swatch--diamond" style="--swatch:${d.drainageStation}"></span> Drainage station</li>
          <li><span class="swatch swatch--diamond" style="--swatch:${d.flare}"></span> Flare</li>
          <li><span class="swatch swatch--diamond" style="--swatch:${d.gasToElectric}"></span> Gas to electric</li>
          <li><span class="swatch swatch--diamond" style="--swatch:${d.chp}"></span> CHP plant</li>
          <li><span class="swatch swatch--line" style="--swatch:${d.pipeline}"></span> Drainage pipeline</li>
        </ul>
      </div>

      <div class="legend__group">
        <h3 class="legend__group-title">Other sites <span class="legend__shape">(triangle · violet)</span></h3>
        <ul class="legend__list legend__list--dense">
          <li><span class="swatch swatch--triangle" style="--swatch:${o.slopeAccess}"></span> Slope / production shaft</li>
          <li><span class="swatch swatch--triangle" style="--swatch:${o.preparationPlant}"></span> Preparation plant</li>
          <li><span class="swatch swatch--triangle" style="--swatch:${o.shaft}"></span> Shaft</li>
          <li><span class="swatch swatch--triangle" style="--swatch:${o.entrance}"></span> Entrance / exit</li>
          <li><span class="swatch swatch--triangle" style="--swatch:${o.adit}"></span> Adit or drift</li>
          <li><span class="swatch swatch--triangle" style="--swatch:${o.coalStorage}"></span> Coal storage</li>
          <li><span class="swatch swatch--triangle" style="--swatch:${o.dewatering}"></span> Dewatering station</li>
          <li><span class="swatch swatch--triangle" style="--swatch:${o.ammonia}"></span> Ammonia plant</li>
          <li><span class="swatch swatch--triangle" style="--swatch:${o.notRelated}"></span> Not coal-related</li>
        </ul>
      </div>
    </div>
  `
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}
