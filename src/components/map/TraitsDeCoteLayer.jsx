import { useCallback, useMemo } from 'react'
import { GeoJSON } from 'react-leaflet'

const STYLES_BY_YEAR = {
  2030: {
    color: '#0284c7',
    weight: 2,
    opacity: 0.85,
    dashArray: '10 8',
  },
  2035: {
    color: '#b91c1c',
    weight: 2,
    opacity: 0.9,
    dashArray: '6 6',
  },
}

/**
 * Traits de côte projetés (2030 / 2035), ligne pointillée (guide TefesSat).
 */
export function TraitsDeCoteLayer({ data }) {
  const style = useCallback((feature) => {
    const annee = feature?.properties?.annee
    return STYLES_BY_YEAR[annee] ?? {
      color: '#64748b',
      weight: 2,
      opacity: 0.7,
      dashArray: '4 6',
    }
  }, [])

  const layerKey = useMemo(
    () => `${data?.features?.length ?? 0}`,
    [data],
  )

  if (!data?.features?.length) return null

  return (
    <GeoJSON key={layerKey} data={data} style={style} />
  )
}
