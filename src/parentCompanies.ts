export interface ParentStakeRow {
  name: string
  cumulativeStake: number
}

interface ParsedStake {
  name: string
  stake: number
}

function trimName(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim()
}

/**
 * Parse GEM `Parent Company` text into stake fractions for one mine.
 * Rules:
 * - split on `;`
 * - `Name [xx%]` → xx/100
 * - single name, no % → 1.0
 * - multiple names, no % → equal split 1/n
 * - mixed known % + one unnamed → residual to that unnamed party
 */
export function parseParentCompanyStakes(raw: string): ParsedStake[] {
  const text = trimName(raw)
  if (!text) return []

  const parts = text
    .split(';')
    .map((part) => trimName(part))
    .filter(Boolean)

  if (parts.length === 0) return []

  const parsed = parts.map((part) => {
    const match = part.match(/^(.*?)\s*\[(\d+(?:\.\d+)?)%\]\s*$/)
    if (match) {
      return {
        name: trimName(match[1]),
        pct: Number.parseFloat(match[2]),
      }
    }
    return { name: part, pct: null as number | null }
  })

  const known = parsed.filter((p) => p.pct != null)
  const unknown = parsed.filter((p) => p.pct == null)

  if (known.length === 0) {
    const share = 1 / parsed.length
    return parsed.map((p) => ({ name: p.name, stake: share }))
  }

  const result: ParsedStake[] = known.map((p) => ({
    name: p.name,
    stake: (p.pct as number) / 100,
  }))

  const assignedPct = known.reduce((sum, p) => sum + (p.pct as number), 0)
  if (unknown.length === 1) {
    const residual = Math.max(0, 100 - assignedPct) / 100
    if (residual > 0) {
      result.push({ name: unknown[0].name, stake: residual })
    }
  }

  return result.filter((row) => row.name && row.stake > 0)
}

/**
 * One row per GEM Mine ID, using Parent Company text only.
 * Cumulative stake = sum of per-mine ownership fractions (mine-equivalents).
 */
export function rankParentCompaniesByCumulativeStake(
  features: Array<{ properties?: Record<string, unknown> | null }>,
  topN = 5,
): ParentStakeRow[] {
  const byMine = new Map<string, string>()

  for (const feature of features) {
    const props = feature.properties ?? {}
    const mineId = String(props['GEM Mine ID'] ?? '').trim()
    if (!mineId || byMine.has(mineId)) continue
    byMine.set(mineId, String(props['Parent Company'] ?? ''))
  }

  const totals = new Map<string, number>()

  for (const parentText of byMine.values()) {
    for (const { name, stake } of parseParentCompanyStakes(parentText)) {
      totals.set(name, (totals.get(name) ?? 0) + stake)
    }
  }

  return [...totals.entries()]
    .map(([name, cumulativeStake]) => ({ name, cumulativeStake }))
    .sort(
      (a, b) =>
        b.cumulativeStake - a.cumulativeStake || a.name.localeCompare(b.name),
    )
    .slice(0, topN)
}

export function renderInsightPanel(
  container: HTMLElement,
  rows: ParentStakeRow[],
): void {
  const max = rows.reduce((m, row) => Math.max(m, row.cumulativeStake), 0) || 1

  const chart =
    rows.length === 0
      ? `<p class="insight__empty">No parent-company stakes available.</p>`
      : `<ol class="insight__chart">
          ${rows
            .map((row, index) => {
              const pct = Math.max(6, (row.cumulativeStake / max) * 100)
              return `
            <li class="insight__bar-row">
              <div class="insight__bar-label">
                <span class="insight__rank">${index + 1}</span>
                <span class="insight__name" title="${escapeHtml(row.name)}">${escapeHtml(row.name)}</span>
                <span class="insight__value">${row.cumulativeStake.toFixed(1)}</span>
              </div>
              <div class="insight__bar-track" aria-hidden="true">
                <div class="insight__bar-fill" style="width:${pct.toFixed(1)}%"></div>
              </div>
            </li>`
            })
            .join('')}
        </ol>`

  container.innerHTML = `
    <h2 class="insight__title">Top 10 parent companies (approx. cumulative stake)</h2>
    <p class="insight__note">
      Approximate cumulative stake from parsed parent-company text
      (mine-equivalents).
    </p>
    ${chart}
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
