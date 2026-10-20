import { useCallback, useMemo, useState } from 'react'
import { GEOJSON_SOURCES } from '../../config/dataSources'
import { BASE_LAYERS } from '../../config/mapConfig'
import { useGeoJson } from '../../hooks/useGeoJson'
import { getTransectId } from '../../utils/transectFeature'
import { MapView } from '../map/MapView'
import { TransectDetailPanel } from '../panel/TransectDetailPanel'

/**
 * Tableau de bord TefesSat : carte + panneau de détail + chargement des GeoJSON.
 */
export function Dashboard() {
  const [baseLayerId, setBaseLayerId] = useState('osm')
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [recenterRequest, setRecenterRequest] = useState(0)

  const {
    data: transectsGeoJson,
    loading: loadingTransects,
    error: errorTransects,
  } = useGeoJson(GEOJSON_SOURCES.transects)

  const {
    data: bandeGeoJson,
    loading: loadingBande,
    error: errorBande,
  } = useGeoJson(GEOJSON_SOURCES.bandeMenacee)

  const selectedTransectId = useMemo(
    () =>
      selectedFeature
        ? getTransectId(selectedFeature.properties ?? {})
        : null,
    [selectedFeature],
  )

  const handleSelectTransect = useCallback((feature) => {
    setSelectedFeature(feature)
  }, [])

  const handleClosePanel = useCallback(() => {
    setSelectedFeature(null)
  }, [])

  const isLoading = loadingTransects || loadingBande
  const loadError = errorTransects ?? errorBande
  const hasMapData = Boolean(
    transectsGeoJson?.features?.length || bandeGeoJson?.features?.length,
  )

  const handleRecenter = useCallback(() => {
    setRecenterRequest((n) => n + 1)
  }, [])

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">TefesSat · SENSAT 2026</p>
          <h1>Recul du trait de côte — Saint-Louis</h1>
        </div>
        <div className="dashboard__controls">
          <label className="dashboard__layer-select">
            <span>Fond de carte</span>
            <select
              value={baseLayerId}
              onChange={(e) => setBaseLayerId(e.target.value)}
            >
              {Object.values(BASE_LAYERS).map((layer) => (
                <option key={layer.id} value={layer.id}>
                  {layer.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="dashboard__recenter"
            onClick={handleRecenter}
            disabled={isLoading || !hasMapData}
            title="Revenir à l’emprise des transects et de la bande menacée"
          >
            <span className="dashboard__recenter-icon" aria-hidden="true">
              ⊕
            </span>
            Recentrer
          </button>
        </div>
      </header>

      {isLoading ? (
        <p className="dashboard__status" role="status">
          Chargement des données cartographiques…
        </p>
      ) : null}

      {loadError ? (
        <p className="dashboard__status dashboard__status--error" role="alert">
          Impossible de charger les GeoJSON : {loadError.message}
        </p>
      ) : null}

      <div className="dashboard__body">
        <div className="map-shell">
          <MapView
            baseLayerId={baseLayerId}
            transectsGeoJson={transectsGeoJson}
            bandeGeoJson={bandeGeoJson}
            selectedTransectId={selectedTransectId}
            onSelectTransect={handleSelectTransect}
            recenterRequest={recenterRequest}
          />
          <TransectDetailPanel
            feature={selectedFeature}
            onClose={handleClosePanel}
          />
        </div>
      </div>
    </div>
  )
}
