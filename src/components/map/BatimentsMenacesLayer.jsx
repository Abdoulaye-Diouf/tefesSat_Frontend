import { GeoJSON } from 'react-leaflet'

const buildingStyle = {
  color: '#7f1d1d',
  weight: 1.25,
  fillColor: '#f97316',
  fillOpacity: 0.8,
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    }
    return entities[character]
  })
}

export function BatimentsMenacesLayer({ data, year }) {
  if (!data?.features?.length) return null

  const onEachFeature = (feature, layer) => {
    const source = feature.properties?.source
    const inhabitants = Number(feature.properties?.habitants)
    const details = [
      `Bâtiment menacé en ${year}`,
      source ? `Source : ${escapeHtml(source)}` : null,
      Number.isFinite(inhabitants)
        ? `Habitants estimés : ${inhabitants.toLocaleString('fr-FR', { maximumFractionDigits: 1 })}`
        : null,
    ]
      .filter(Boolean)
      .join('<br/>')

    layer.bindTooltip(details)
  }

  return (
    <GeoJSON
      key={year}
      data={data}
      style={() => buildingStyle}
      onEachFeature={onEachFeature}
    />
  )
}
