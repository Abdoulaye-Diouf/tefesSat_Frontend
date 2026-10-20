import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import { fitMapToGeoJson } from '../../utils/geoBounds'

/**
 * Ajuste le zoom et le centre de la carte sur l'emprise des données chargées.
 * Se déclenche lorsque les GeoJSON changent (ex. remplacement des fichiers de test).
 */
export function FitMapBounds({
  transectsGeoJson,
  bandeGeoJson,
  /** Incrémenté par le bouton « Recentrer » pour relancer le cadrage. */
  recenterRequest = 0,
}) {
  const map = useMap()

  useEffect(() => {
    fitMapToGeoJson(map, transectsGeoJson, bandeGeoJson)
  }, [map, transectsGeoJson, bandeGeoJson, recenterRequest])

  return null
}
