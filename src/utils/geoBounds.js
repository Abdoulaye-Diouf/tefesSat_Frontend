import L from 'leaflet'
import { FIT_BOUNDS_OPTIONS } from '../config/mapConfig'

/**
 * Calcule l'emprise (bbox) englobant une ou plusieurs FeatureCollection GeoJSON.
 * @param {...(import('geojson').FeatureCollection | null | undefined)} collections
 * @returns {L.LatLngBounds | null}
 */
export function getGeoJsonBounds(...collections) {
  const layers = collections
    .filter((c) => c?.features?.length)
    .map((c) => L.geoJSON(c))

  if (!layers.length) return null

  const group = L.featureGroup(layers)
  const bounds = group.getBounds()
  return bounds.isValid() ? bounds : null
}

/**
 * Cadre la carte sur l'emprise des collections fournies.
 * @returns {boolean} true si fitBounds a été appliqué
 */
export function fitMapToGeoJson(map, ...collections) {
  const bounds = getGeoJsonBounds(...collections)
  if (!bounds) return false
  map.fitBounds(bounds, FIT_BOUNDS_OPTIONS)
  return true
}
