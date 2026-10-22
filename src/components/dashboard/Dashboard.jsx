import { useCallback, useMemo, useState } from 'react'
import { GEOJSON_SOURCES } from '../../config/dataSources'
import { BASE_LAYERS } from '../../config/mapConfig'
import { AudioButton } from '../AudioButton'
import { useAudioPlayer } from '../../hooks/useAudioPlayer'
import { useCsv } from '../../hooks/useCsv'
import { useGeoJson } from '../../hooks/useGeoJson'
import {
  getHistoricalSeries,
  getTransectId,
} from '../../utils/transectFeature'
import { DistrictSummary } from './DistrictSummary'
import { MapView } from '../map/MapView'
import { TransectDetailPanel } from '../panel/TransectDetailPanel'

/**
 * Tableau de bord TefesSat : carte + panneau de détail + chargement des GeoJSON.
 */
export function Dashboard() {
  const [language, setLanguage] = useState('fr')
  const [baseLayerId, setBaseLayerId] = useState('osm')
  const [year, setYear] = useState(2035)
  const [showDistrictSummary, setShowDistrictSummary] = useState(false)
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [recenterRequest, setRecenterRequest] = useState(0)
  const { playSequence: playAudio, audioError } = useAudioPlayer()
  const isWolof = language === 'wo'

  const {
    data: transectsGeoJson,
    loading: loadingTransects,
    error: errorTransects,
  } = useGeoJson(GEOJSON_SOURCES.transects)

  const {
    data: bandeGeoJson,
    loading: loadingBande,
    error: errorBande,
  } = useGeoJson(GEOJSON_SOURCES.bandeMenacee[year])

  const {
    data: batimentsGeoJson,
    loading: loadingBatiments,
    error: errorBatiments,
  } = useGeoJson(GEOJSON_SOURCES.batimentsMenaces[year])

  const {
    data: traitsGeoJson,
    loading: loadingTraits,
    error: errorTraits,
  } = useGeoJson(GEOJSON_SOURCES.traitsDeCote)

  const {
    rows: districtRows,
    loading: loadingDistricts,
    error: errorDistricts,
  } = useCsv(GEOJSON_SOURCES.resumeQuartiers)

  const {
    rows: historyAnneeRows,
    loading: loadingHistoryAnnee,
    error: errorHistoryAnnee,
  } = useCsv(GEOJSON_SOURCES.positionsParAnnee)

  const {
    rows: historyDateRows,
    loading: loadingHistoryDate,
    error: errorHistoryDate,
  } = useCsv(GEOJSON_SOURCES.positionsParDate)

  const selectedTransectId = useMemo(
    () =>
      selectedFeature
        ? getTransectId(selectedFeature.properties ?? {})
        : null,
    [selectedFeature],
  )

  const historySeriesAnnee = useMemo(
    () => getHistoricalSeries(historyAnneeRows, selectedTransectId),
    [historyAnneeRows, selectedTransectId],
  )

  const historySeriesDate = useMemo(
    () => getHistoricalSeries(historyDateRows, selectedTransectId),
    [historyDateRows, selectedTransectId],
  )

  const historySeries = historySeriesAnnee.length
    ? historySeriesAnnee
    : historySeriesDate

  const handleSelectTransect = useCallback((feature) => {
    setSelectedFeature(feature)
  }, [])

  const handleClosePanel = useCallback(() => {
    setSelectedFeature(null)
  }, [])

  const isLoading =
    loadingTransects ||
    loadingBande ||
    loadingBatiments ||
    loadingTraits ||
    loadingDistricts ||
    loadingHistoryAnnee ||
    loadingHistoryDate
  const loadErrors = [
    errorTransects,
    errorBande,
    errorBatiments,
    errorTraits,
    errorDistricts,
    errorHistoryAnnee,
    errorHistoryDate,
  ].filter(Boolean)
  const hasMapData = Boolean(
    transectsGeoJson?.features?.length ||
      bandeGeoJson?.features?.length ||
      traitsGeoJson?.features?.length,
  )

  const handleRecenter = useCallback(() => {
    setRecenterRequest((n) => n + 1)
  }, [])

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <p className="dashboard__eyebrow">
            TefesSat · SENSAT 2026 <span className="dashboard__prototype">Prototype</span>
          </p>
          <h1>
            {isWolof
              ? 'Géej gi di jël suuf ci Ndar, ni satellite bi ko gise'
              : 'Recul du trait de côte — Saint-Louis'}
            {isWolof ? (
              <AudioButton
                file="wo_sous_titre"
                playAudio={playAudio}
                label="Géej gi di jël suuf ci Ndar, ni satellite bi ko gise"
              />
            ) : null}
          </h1>
          <p className="dashboard__guidance">
            {isWolof
              ? 'Bësal ci benn pàcc ci tefes bi ngir gis lu ko jëm'
              : 'Cliquez sur un tronçon de côte pour voir son détail'}
            {isWolof ? (
              <AudioButton
                file="wo_consigne_clic"
                playAudio={playAudio}
                label="Bësal ci benn pàcc ci tefes bi ngir gis lu ko jëm"
              />
            ) : null}
          </p>
        </div>
        <div className="dashboard__controls">
          <div className="dashboard__language">
            <span>{isWolof ? 'Làkk' : 'Langue'}</span>
            <div
              className="dashboard__language-options"
              role="group"
              aria-label={isWolof ? 'Làkk' : 'Langue'}
            >
              <button
                type="button"
                className={language === 'fr' ? 'is-active' : ''}
                onClick={() => setLanguage('fr')}
                aria-pressed={language === 'fr'}
              >
                FR
              </button>
              <button
                type="button"
                className={language === 'wo' ? 'is-active' : ''}
                onClick={() => setLanguage('wo')}
                aria-pressed={language === 'wo'}
              >
                WO
              </button>
            </div>
            {isWolof ? (
              <AudioButton file="wo_langue" playAudio={playAudio} label="Làkk" />
            ) : null}
          </div>
          <label className="dashboard__layer-select">
            <span>{isWolof ? 'At mu nekk' : 'Horizon'}</span>
            <select
              value={year}
              onChange={(event) => setYear(Number(event.target.value))}
            >
              <option value={2030}>2030</option>
              <option value={2035}>2035</option>
            </select>
          </label>
          <label className="dashboard__layer-select">
            <span>{isWolof ? 'Nataalu suuf' : 'Fond de carte'}</span>
            <select
              value={baseLayerId}
              onChange={(e) => setBaseLayerId(e.target.value)}
            >
              {Object.values(BASE_LAYERS).map((layer) => (
                <option key={layer.id} value={layer.id}>
                  {isWolof
                    ? layer.id === 'osm'
                      ? 'OpenStreetMap'
                      : 'Satellite (Esri)'
                    : layer.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className="dashboard__recenter"
            onClick={() => setShowDistrictSummary((show) => !show)}
            aria-expanded={showDistrictSummary}
            aria-controls="district-summary-title"
            disabled={!districtRows?.length}
          >
            {showDistrictSummary
              ? isWolof
                ? 'Nëbbal gox yi'
                : 'Masquer les quartiers'
              : isWolof
                ? 'Leeral gox yi'
                : 'Résumé par quartier'}
          </button>
          {isWolof ? (
            <div className="dashboard__message-group">
              <button
                type="button"
                className="dashboard__recenter dashboard__message"
                onClick={() =>
                  playAudio([
                    'message_1_ndeye_fatou',
                    'message_2_abdoulaye',
                    'message_3_malick',
                  ])
                }
              >
                Déglul kàddu gi ci wolof <span aria-hidden="true">▶</span>
              </button>
              <AudioButton
                file="wo_ecouter_message"
                playAudio={playAudio}
                label="Déglul kàddu gi ci wolof"
              />
            </div>
          ) : null}
          <button
            type="button"
            className="dashboard__recenter"
            onClick={handleRecenter}
            disabled={isLoading || !hasMapData}
            title={
              isWolof
                ? `Delloo kaart bi ci transect yi ak fi géej gi mën a jot ci ${year}`
                : `Revenir à l’emprise des transects et de la bande menacée ${year}`
            }
          >
            <span className="dashboard__recenter-icon" aria-hidden="true">
              ⊕
            </span>
            {isWolof ? 'Delloo kaart bi' : 'Recentrer'}
          </button>
        </div>
      </header>

      {isWolof ? (
        <p className="dashboard__data-note">
          Lim yii, ñu ngi leen jële ci nataali satellite Sentinel-2, li dale 2016 ba
          2025
          <AudioButton
            file="wo_donnees_preliminaires"
            playAudio={playAudio}
            label="Lim yii, ñu ngi leen jële ci nataali satellite Sentinel-2, li dale 2016 ba 2025"
          />
        </p>
      ) : null}

      {audioError ? (
        <p className="dashboard__status dashboard__status--error" role="alert">
          {audioError}
        </p>
      ) : null}

      {isLoading ? (
        <p className="dashboard__status" role="status">
          {isWolof ? 'Nataali kaart yi ñu ngi leen yeb…' : 'Chargement des données cartographiques…'}
        </p>
      ) : null}

      {loadErrors.length ? (
        <p className="dashboard__status dashboard__status--error" role="alert">
          {isWolof
            ? 'Yenn nataali xibaar yi manul ñu leen a yeb : '
            : 'Certaines données n’ont pas pu être chargées : '}
          {loadErrors.map((error) => error.message).join(' ; ')}
        </p>
      ) : null}

      <div className="dashboard__body">
        <div className="map-shell">
          <MapView
            language={language}
            playAudio={playAudio}
            baseLayerId={baseLayerId}
            transectsGeoJson={transectsGeoJson}
            bandeGeoJson={bandeGeoJson}
            batimentsGeoJson={batimentsGeoJson}
            traitsGeoJson={traitsGeoJson}
            year={year}
            selectedTransectId={selectedTransectId}
            onSelectTransect={handleSelectTransect}
            recenterRequest={recenterRequest}
          />
          {showDistrictSummary ? (
            <DistrictSummary
              rows={districtRows}
              year={year}
              language={language}
              playAudio={playAudio}
              onClose={() => setShowDistrictSummary(false)}
            />
          ) : null}
          <TransectDetailPanel
            feature={selectedFeature}
            language={language}
            playAudio={playAudio}
            historySeries={historySeries}
            historySeriesAnnee={historySeriesAnnee}
            historySeriesDate={historySeriesDate}
            year={year}
            onClose={handleClosePanel}
          />
        </div>
      </div>
    </div>
  )
}
