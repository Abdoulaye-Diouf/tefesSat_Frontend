import { MapContainer, TileLayer } from 'react-leaflet'
import { BASE_LAYERS, DEFAULT_CENTER, DEFAULT_ZOOM } from '../../config/mapConfig'
import { BandeMenaceeLayer } from './BandeMenaceeLayer'
import { FitMapBounds } from './FitMapBounds'
import { MapLegend } from './MapLegend'
import { TransectsLayer } from './TransectsLayer'

/**
 * Carte principale du tableau de bord (react-leaflet).
 */
export function MapView({
  baseLayerId = 'osm',
  transectsGeoJson,
  bandeGeoJson,
  selectedTransectId,
  onSelectTransect,
  recenterRequest,
}) {
  const base = BASE_LAYERS[baseLayerId] ?? BASE_LAYERS.osm

  return (
    <div className="map-shell">
      <MapContainer
        center={DEFAULT_CENTER}
        zoom={DEFAULT_ZOOM}
        className="map-container"
        scrollWheelZoom
      >
        <TileLayer
          attribution={base.attribution}
          url={base.url}
          maxZoom={base.maxZoom}
        />
        <FitMapBounds
          transectsGeoJson={transectsGeoJson}
          bandeGeoJson={bandeGeoJson}
          recenterRequest={recenterRequest}
        />
        <BandeMenaceeLayer data={bandeGeoJson} />
        <TransectsLayer
          data={transectsGeoJson}
          selectedId={selectedTransectId}
          onSelectTransect={onSelectTransect}
        />
      </MapContainer>
      <MapLegend />
    </div>
  )
}
