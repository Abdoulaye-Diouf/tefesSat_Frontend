import { GeoJSON } from 'react-leaflet'

const bandeStyle = {
  color: '#2563eb',
  weight: 2,
  fillColor: '#3b82f6',
  fillOpacity: 0.25,
}

/**
 * Polygone de la bande menacée d'ici 2030 (submersion / érosion projetée).
 */
export function BandeMenaceeLayer({ data }) {
  if (!data?.features?.length) return null

  return (
    <GeoJSON
      key={data.features.length}
      data={data}
      style={() => bandeStyle}
    />
  )
}
