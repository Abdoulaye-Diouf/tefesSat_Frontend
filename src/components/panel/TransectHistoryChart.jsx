import { AudioButton } from '../AudioButton'

const WIDTH = 320
const HEIGHT = 160
const PADDING = { top: 16, right: 12, bottom: 32, left: 48 }

function createLineSegments(points) {
  const segments = []
  let current = []

  points.forEach((point) => {
    if (!point) {
      if (current.length) segments.push(current)
      current = []
    } else {
      current.push(point)
    }
  })

  if (current.length) segments.push(current)
  return segments
}

function formatAxisDate(d) {
  if (!d) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d.slice(0, 7)
  return d
}

export function TransectHistoryChart({
  series,
  mode = 'annee',
  language = 'fr',
  playAudio,
}) {
  const isWolof = language === 'wo'
  const valid = series
    ?.map((point, index) =>
      point.reculM == null ? null : { ...point, index },
    )
    .filter(Boolean)

  if (!valid?.length) {
    return (
      <p className="detail-panel__chart-empty">
        {isWolof
          ? 'Amul limu tefes bi ci pàcc bii.'
          : 'Aucune mesure historique disponible pour ce transect.'}
      </p>
    )
  }

  const values = valid.map((point) => point.reculM)
  const dataMin = Math.min(0, ...values)
  const dataMax = Math.max(0, ...values)
  const span = dataMax - dataMin || 1
  const yMin = dataMin - span * 0.08
  const yMax = dataMax + span * 0.08
  const innerWidth = WIDTH - PADDING.left - PADDING.right
  const innerHeight = HEIGHT - PADDING.top - PADDING.bottom
  const toX = (index) =>
    PADDING.left +
    (series.length > 1 ? (index / (series.length - 1)) * innerWidth : innerWidth / 2)
  const toY = (value) =>
    PADDING.top + ((yMax - value) / (yMax - yMin)) * innerHeight
  const points = series.map((point, index) =>
    point.reculM == null
      ? null
      : { x: toX(index), y: toY(point.reculM), value: point.reculM },
  )
  const segments = createLineSegments(points)
  const tickValues = [yMin, (yMin + yMax) / 2, yMax]
  const labelIndexes = [
    0,
    Math.round((series.length - 1) / 2),
    series.length - 1,
  ]
  const format = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 })

  return (
    <div className="detail-panel__chart-container">
      <p className="detail-panel__chart-title">
        {isWolof
          ? 'Fi tefes bi nekkoon at mu nekk'
          : mode === 'date'
            ? 'Recul mesuré par passage satellite (m)'
            : 'Recul mesuré depuis 2015 (médiane annuelle, m)'}
        {isWolof ? (
          <AudioButton
            file="wo_historique"
            playAudio={playAudio}
            label="Fi tefes bi nekkoon at mu nekk"
          />
        ) : null}
      </p>
      <svg
        className="detail-panel__chart"
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label={
          isWolof
            ? 'Soppi gi ci fi tefes bi nekkoon'
            : 'Évolution mesurée de la position du trait de côte'
        }
      >
        {tickValues.map((tick) => (
          <g key={tick}>
            <line
              x1={PADDING.left}
              x2={WIDTH - PADDING.right}
              y1={toY(tick)}
              y2={toY(tick)}
              className="detail-panel__chart-grid"
            />
            <text
              x={PADDING.left - 6}
              y={toY(tick) + 3}
              className="detail-panel__chart-axis"
              textAnchor="end"
            >
              {format.format(tick)}
            </text>
          </g>
        ))}
        {segments.map((segment, index) =>
          segment.length > 1 ? (
            <polyline
              key={`segment-${index}`}
              points={segment.map((point) => `${point.x},${point.y}`).join(' ')}
              className="detail-panel__chart-line"
            />
          ) : null,
        )}
        {points.map((point, index) =>
          point ? (
            <circle
              key={`${series[index].date}-${index}`}
              cx={point.x}
              cy={point.y}
              r="2.5"
              className="detail-panel__chart-point"
            >
              <title>{`${series[index].date} : ${point.value > 0 ? '+' : ''}${format.format(point.value)} m`}</title>
            </circle>
          ) : null,
        )}
        {labelIndexes.map((index) => (
          <text
            key={`${index}-${series[index]?.date}`}
            x={toX(index)}
            y={HEIGHT - 8}
            className="detail-panel__chart-axis"
            textAnchor={
              index === 0
                ? 'start'
                : index === series.length - 1
                  ? 'end'
                  : 'middle'
            }
          >
            {formatAxisDate(series[index]?.date)}
          </text>
        ))}
      </svg>
      <p className="detail-panel__chart-note">
        {isWolof
          ? 'Lim yu yokku : tefes bi jëm ci suuf si.'
          : 'Valeurs positives : déplacement vers la terre (recul net).'}
      </p>
    </div>
  )
}
