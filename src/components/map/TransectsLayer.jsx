import { useCallback, useMemo } from 'react'
import { GeoJSON } from 'react-leaflet'
import { transectLineStyle } from '../../utils/riskStyles'
import { getTransectId } from '../../utils/transectFeature'

/**
 * Transects perpendiculaires à la côte, colorés selon le risque et cliquables.
 */
export function TransectsLayer({ data, selectedId, onSelectTransect }) {
  const style = useCallback(
    (feature) => transectLineStyle(feature, { selectedId }),
    [selectedId],
  )

  const onEachFeature = useCallback(
    (feature, layer) => {
      layer.on({
        click: () => {
          onSelectTransect?.(feature)
        },
      })
      layer.bindTooltip(
        () => {
          const id = getTransectId(feature.properties)
          const risque =
            feature.properties?.risque ??
            feature.properties?.niveau_risque ??
            '—'
          return `<strong>${id ?? 'Transect'}</strong><br/>Risque : ${risque}`
        },
        { sticky: true, direction: 'top' },
      )
    },
    [onSelectTransect],
  )

  const layerKey = useMemo(
    () => `${data?.features?.length ?? 0}-${selectedId ?? 'none'}`,
    [data, selectedId],
  )

  if (!data?.features?.length) return null

  return (
    <GeoJSON
      key={layerKey}
      data={data}
      style={style}
      onEachFeature={onEachFeature}
    />
  )
}
