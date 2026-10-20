/** @param {{ x: number; y: number }[]} points */
function buildSmoothLinePath(points) {
  if (points.length === 0) return ''
  if (points.length === 1) return `M ${points[0].x},${points[0].y}`

  let d = `M ${points[0].x},${points[0].y}`
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    const cp1x = p1.x + (p2.x - p0.x) / 6
    const cp1y = p1.y + (p2.y - p0.y) / 6
    const cp2x = p2.x - (p3.x - p1.x) / 6
    const cp2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`
  }
  return d
}

const MAX_Y_TICKS = 5
const MIN_TICK_LABEL_GAP_PX = 24

/** Pas « rond » pour limiter le nombre de graduations (évite le chevauchement). */
function niceStepSize(span, maxTicks) {
  const rough = span / Math.max(maxTicks - 1, 1)
  if (rough <= 0 || !Number.isFinite(rough)) return 1
  const exp = Math.floor(Math.log10(rough))
  const base = 10 ** exp
  const frac = rough / base
  let niceFrac = 10
  if (frac <= 1) niceFrac = 1
  else if (frac <= 2) niceFrac = 2
  else if (frac <= 5) niceFrac = 5
  return niceFrac * base
}

function formatYTick(value, step) {
  if (step >= 1) return String(Math.round(value))
  if (step >= 0.1) return value.toFixed(1)
  return value.toFixed(2)
}

function computeYScale(values) {
  const dataMin = Math.min(...values)
  const dataMax = Math.max(...values, 0)
  const rawSpan = dataMax - dataMin || 1
  const margin = rawSpan * 0.06

  let yMin = dataMin - margin
  let yMax = dataMax + margin
  let step = niceStepSize(yMax - yMin, MAX_Y_TICKS)

  yMin = Math.floor(yMin / step) * step
  yMax = Math.ceil(yMax / step) * step

  let ticks = []
  for (let v = yMin; v <= yMax + step * 0.001; v += step) {
    ticks.push(Math.round(v * 1000) / 1000)
  }

  while (ticks.length > MAX_Y_TICKS) {
    step *= 2
    yMin = dataMin - margin
    yMax = dataMax + margin
    yMin = Math.floor(yMin / step) * step
    yMax = Math.ceil(yMax / step) * step
    ticks = []
    for (let v = yMin; v <= yMax + step * 0.001; v += step) {
      ticks.push(Math.round(v * 1000) / 1000)
    }
  }

  return { yMin, yMax, ticks, step }
}

/** Ne garde que les ticks suffisamment espacés en pixels. */
function filterTicksForDisplay(ticks, toY, innerHeight) {
  if (ticks.length <= 2) return ticks

  const minGap = Math.max(
    MIN_TICK_LABEL_GAP_PX,
    innerHeight / (MAX_Y_TICKS - 1),
  )

  const filtered = []
  let lastY = null
  for (const tick of ticks) {
    const y = toY(tick)
    if (lastY == null || Math.abs(y - lastY) >= minGap * 0.85) {
      filtered.push(tick)
      lastY = y
    }
  }

  if (filtered.length >= 2) return filtered
  return [ticks[0], ticks[ticks.length - 1]]
}

/**
 * Courbe d’évolution du recul (area chart SVG, style maquette).
 */
export function TransectHistoryChart({ series }) {
  if (!series?.length) {
    return (
      <p className="detail-panel__chart-empty">
        Historique insuffisant pour le graphique
      </p>
    )
  }

  const width = 288
  const height = 148
  const pad = { top: 12, right: 10, bottom: 28, left: 42 }
  const innerW = width - pad.left - pad.right
  const innerH = height - pad.top - pad.bottom

  const years = series.map((p) => p.year)
  const values = series.map((p) => p.reculM)
  const { yMin, yMax, step, ticks: scaleTicks } = computeYScale(values)
  const ySpan = yMax - yMin || 1
  const xSpan = years[years.length - 1] - years[0] || 1

  const toX = (year) => pad.left + ((year - years[0]) / xSpan) * innerW
  const toY = (v) => pad.top + ((yMax - v) / ySpan) * innerH

  const ticks = filterTicksForDisplay(scaleTicks, toY, innerH)

  const points = series.map((p) => ({ x: toX(p.year), y: toY(p.reculM) }))
  const linePath = buildSmoothLinePath(points)
  const baselineY = toY(yMin)
  const areaPath = `${linePath} L ${points[points.length - 1].x},${baselineY} L ${points[0].x},${baselineY} Z`

  const gradientId = 'transect-recul-gradient'

  return (
    <svg
      className="detail-panel__chart"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Évolution du recul du trait de côte"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
        </linearGradient>
      </defs>

      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={pad.left}
            x2={width - pad.right}
            y1={toY(tick)}
            y2={toY(tick)}
            className="detail-panel__chart-grid"
          />
          <text
            x={pad.left - 8}
            y={toY(tick) + 3}
            className="detail-panel__chart-axis detail-panel__chart-axis--y"
            textAnchor="end"
          >
            {formatYTick(tick, step)}
          </text>
        </g>
      ))}

      <path d={areaPath} className="detail-panel__chart-area" fill={`url(#${gradientId})`} />
      <path d={linePath} className="detail-panel__chart-line" fill="none" />

      {years.map((year) => (
        <text
          key={year}
          x={toX(year)}
          y={height - 8}
          className="detail-panel__chart-axis detail-panel__chart-axis--x"
          textAnchor="middle"
        >
          {year}
        </text>
      ))}
    </svg>
  )
}
