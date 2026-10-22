import { GeoJSON } from 'react-leaflet'

const bandeStyle = {
  color: '#b91c1c',
  weight: 1,
  fillColor: '#dc2626',
  fillOpacity: 0.22,
}

/**
 * Polygones de la bande menacée (2035 par défaut, voir dataSources).
 */
export function BandeMenaceeLayer({ data, year }) {
  if (!data?.features?.length) return null

  return (
    <GeoJSON
      key={year}
      data={data}
      style={() => bandeStyle}
    />
  )
}
