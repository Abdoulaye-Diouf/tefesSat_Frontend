import { MapContainer, TileLayer } from 'react-leaflet'
import { BASE_LAYERS, DEFAULT_CENTER, DEFAULT_ZOOM } from '../../config/mapConfig'
import { BatimentsMenacesLayer } from './BatimentsMenacesLayer'
import { BandeMenaceeLayer } from './BandeMenaceeLayer'
import { CenterMapOnPoint } from './CenterMapOnPoint'
import { FitMapBounds } from './FitMapBounds'
import { MapLegend } from './MapLegend'
import { TraitsDeCoteLayer } from './TraitsDeCoteLayer'
import { TransectsLayer } from './TransectsLayer'

/**
 * Carte principale du tableau de bord (react-leaflet).
 */
export function MapView({
  language = 'fr',
  playAudio,
  baseLayerId = 'osm',
  transectsGeoJson,
  bandeGeoJson,
  batimentsGeoJson,
  traitsGeoJson,
  year,
  selectedTransectId,
  onSelectTransect,
  recenterRequest,
  mapFocusRequest,
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
        <CenterMapOnPoint request={mapFocusRequest} />
        <BandeMenaceeLayer data={bandeGeoJson} year={year} />
        <BatimentsMenacesLayer data={batimentsGeoJson} year={year} />
        <TraitsDeCoteLayer data={traitsGeoJson} />
        <TransectsLayer
          data={transectsGeoJson}
          selectedId={selectedTransectId}
          language={language}
          onSelectTransect={onSelectTransect}
        />
      </MapContainer>
      <MapLegend
        year={year}
        language={language}
        playAudio={playAudio}
        showBuildings={Boolean(batimentsGeoJson?.features?.length)}
      />
    </div>
  )
}
