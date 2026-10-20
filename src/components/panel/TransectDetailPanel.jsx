import { getRiskBannerLabel, normalizeRiskKey } from '../../utils/riskStyles'
import {
  getAlertMessage,
  getBatimentsMenaces,
  getHistoriqueSeries,
  getNiveauRisque,
  getReculEstimeM,
  getTronconTitle,
  getVitesseReculMAn,
} from '../../utils/transectFeature'
import { TransectHistoryChart } from './TransectHistoryChart'

function IconTrendDown() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 18h16M8 14l4 4 4-4M12 6v12"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconArrowExpand() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M8 3H3v5M16 21h5v-5M3 16l5-5M21 8l-5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconBuilding() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 20V6l8-3 8 3v14H4zm4-2h2v-4H8v4zm4 0h2v-7h-2v7zm4 0h2v-5h-2v5z"
        fill="currentColor"
      />
    </svg>
  )
}

function IconWarning() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3L2 21h20L12 3zm0 6v6m0 3h.01"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}

/**
 * Fiche détaillée du transect (panneau latéral type maquette TefesSat).
 */
export function TransectDetailPanel({ feature, onClose }) {
  if (!feature) {
    return (
      <aside className="detail-panel detail-panel--empty" aria-hidden="true">
        <p className="detail-panel__hint">
          Sélectionnez un transect sur la carte pour afficher le détail.
        </p>
      </aside>
    )
  }

  const props = feature.properties ?? {}
  const title = getTronconTitle(props)
  const risque = getNiveauRisque(props)
  const riskKey = normalizeRiskKey(risque)
  const vitesse = getVitesseReculMAn(props)
  const reculM = getReculEstimeM(props)
  const batiments = getBatimentsMenaces(props)
  const series = getHistoriqueSeries(props)
  const alertMessage = getAlertMessage(props)

  const vitesseDisplay =
    vitesse != null ? `-${Math.abs(vitesse).toFixed(1)} m/an` : '—'
  const reculDisplay =
    reculM != null ? `-${Math.abs(reculM).toFixed(1)} m` : '—'

  return (
    <aside className="detail-panel detail-panel--active" aria-live="polite">
      <button
        type="button"
        className="detail-panel__close"
        onClick={onClose}
        aria-label="Fermer la fiche"
      >
        ×
      </button>

      <p className="detail-panel__kicker">Tronçon côtier</p>
      <h2 className="detail-panel__title">{title}</h2>

      <div
        className={`detail-panel__risk-banner detail-panel__risk-banner--${riskKey}`}
      >
        {getRiskBannerLabel(risque)}
      </div>

      <div className="detail-panel__metrics">
        <div className="detail-panel__metric-card">
          <div className="detail-panel__metric-head">
            <span>Vitesse de recul</span>
            <IconTrendDown />
          </div>
          <p className="detail-panel__metric-value">{vitesseDisplay}</p>
        </div>
        <div className="detail-panel__metric-card">
          <div className="detail-panel__metric-head">
            <span>Recul estimé</span>
            <IconArrowExpand />
          </div>
          <p className="detail-panel__metric-value">{reculDisplay}</p>
        </div>
      </div>

      {batiments != null ? (
        <div className="detail-panel__buildings">
          <div className="detail-panel__metric-head">
            <span>Bâtiments menacés</span>
            <IconBuilding />
          </div>
          <p className="detail-panel__buildings-count">{batiments}</p>
        </div>
      ) : null}

      <div className="detail-panel__chart-wrap">
        <TransectHistoryChart series={series} />
      </div>

      <footer className="detail-panel__alert">
        <IconWarning />
        <p>{alertMessage}</p>
      </footer>
    </aside>
  )
}
