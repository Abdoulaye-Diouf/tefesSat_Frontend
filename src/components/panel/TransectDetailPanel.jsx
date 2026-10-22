import { useMemo, useState } from 'react'
import {
  getRiskBannerLabel,
  getRiskWolofLabel,
  normalizeRiskKey,
} from '../../utils/riskStyles'
import { AudioButton } from '../AudioButton'
import {
  getAlertMessage,
  getBuildingProjection,
  formatReculNetM,
  formatVitesseReculMAn,
  getObservationSummary,
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

const projectionNumberFormat = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 1,
})

function ProjectionYearCard({ properties, year, isWolof, playAudio }) {
  const projection = getBuildingProjection(properties, year)
  const number = (value) =>
    value == null ? null : projectionNumberFormat.format(value)

  let message
  let audioFile
  if (projection.status === 'not-evaluated') {
    const isDikeReason = /digue/i.test(projection.reason)
    message = isWolof
      ? `Amul xayma ci ${year}${projection.reason ? ` : ${projection.reason}` : ''}`
      : `Projection non évaluée pour ${year}${projection.reason ? ` : ${projection.reason}` : ''}`
    audioFile = isWolof
      ? isDikeReason
        ? 'wo_non_projete_digue'
        : 'wo_non_projete_serie'
      : null
  } else if (projection.status === 'unavailable') {
    message = isWolof
      ? `Xibaaru xayma bi amul ci ${year}.`
      : `Données de projection indisponibles pour ${year}.`
  } else if (projection.buildingCount > 0) {
    message = isWolof
      ? `${number(projection.buildingCount)} kër yu géej gi mën a jot ba ${year}`
      : `${number(projection.buildingCount)} bâtiment${projection.buildingCount > 1 ? 's' : ''} atteint${projection.buildingCount > 1 ? 's' : ''} d’ici ${year}`
    audioFile = isWolof ? 'wo_maisons_menacees' : null
  } else {
    message = isWolof
      ? `Amul kër yu géej gi jot ba ${year}`
      : `Aucun bâtiment atteint d’ici ${year}`
  }

  const marginLabel =
    projection.status === 'not-evaluated'
      ? isWolof
        ? 'Diggante géej gi ak kër yi tey'
        : 'Distance mer – maisons aujourd’hui'
      : isWolof
        ? `Diggante fi géej gi mën a nekk ak kër yi ci ${year}`
        : `Distance entre la côte projetée et la maison la plus proche en ${year}`
  const margin =
    projection.status === 'not-evaluated'
      ? projection.currentMargin
      : projection.margin
  const marginAudio =
    projection.status === 'not-evaluated'
      ? 'wo_marge_actuelle'
      : 'wo_marge_maisons'

  return (
    <article className="detail-panel__projection-card">
      <h4 className="detail-panel__projection-year">{year}</h4>
      <p className="detail-panel__projection-message">
        {message}
        {isWolof && audioFile ? (
          <AudioButton file={audioFile} playAudio={playAudio} label={message} />
        ) : null}
      </p>
      {projection.status === 'evaluated' && projection.buildingCount > 0 ? (
        <p className="detail-panel__projection-residents">
          {projection.residents == null
            ? isWolof
              ? 'Lim nit ñi amul.'
              : 'Nombre d’habitants non renseigné.'
            : isWolof
              ? `Lu tollu ci ${number(projection.residents)} nit ñoo ci nekk`
              : `Environ ${number(projection.residents)} habitant${projection.residents > 1 ? 's' : ''} concerné${projection.residents > 1 ? 's' : ''}`}
          {isWolof && projection.residents != null ? (
            <AudioButton
              file="wo_habitants_menaces"
              playAudio={playAudio}
              label={`Lu tollu ci ${number(projection.residents)} nit ñoo ci nekk`}
            />
          ) : null}
        </p>
      ) : null}
      {projection.status !== 'unavailable' &&
      (projection.status === 'not-evaluated' ||
        projection.buildingCount === 0) ? (
        <p className="detail-panel__projection-margin">
          <span>{marginLabel} : </span>
          {margin == null
            ? isWolof
              ? 'xamuñu ko'
              : 'distance non disponible'
            : `${number(margin)} m`}
          {isWolof && margin != null ? (
            <AudioButton
              file={marginAudio}
              playAudio={playAudio}
              label={`${marginLabel} : ${number(margin)} m`}
            />
          ) : null}
        </p>
      ) : null}
    </article>
  )
}

/**
 * Fiche détaillée du transect (panneau latéral type maquette TefesSat).
 */
export function TransectDetailPanel({
  feature,
  historySeries,
  historySeriesAnnee = [],
  historySeriesDate = [],
  year,
  language = 'fr',
  playAudio,
  onClose,
}) {
  const [historyMode, setHistoryMode] = useState('annee')

  const activeSeries = useMemo(() => {
    if (historyMode === 'date' && historySeriesDate?.length) {
      return historySeriesDate
    }
    if (historyMode === 'annee' && historySeriesAnnee?.length) {
      return historySeriesAnnee
    }
    if (historySeriesAnnee?.length) return historySeriesAnnee
    if (historySeriesDate?.length) return historySeriesDate
    return historySeries ?? []
  }, [historyMode, historySeriesAnnee, historySeriesDate, historySeries])

  const props = feature?.properties
  const observations = useMemo(
    () => getObservationSummary(props ?? {}, historySeriesDate),
    [props, historySeriesDate],
  )

  if (!feature) {
    return (
      <aside className="detail-panel detail-panel--empty" aria-hidden="true">
        <p className="detail-panel__hint">
          Sélectionnez un transect sur la carte pour afficher le détail.
        </p>
      </aside>
    )
  }

  const isWolof = language === 'wo'
  const title = isWolof
    ? getTronconTitle(props).replace(/^Tronçon/, 'Pàcc')
    : getTronconTitle(props)
  const risque = getNiveauRisque(props)
  const riskKey = normalizeRiskKey(risque)
  const vitesse = getVitesseReculMAn(props)
  const reculM = getReculEstimeM(props)
  const alertMessage = getAlertMessage(props, year)
  const riskAudio = {
    faible: 'wo_faible',
    moyen: 'wo_moyen',
    eleve: 'wo_eleve',
    tres_eleve: 'wo_tres_eleve',
    non_evalue: 'wo_non_evalue',
    inconnu: 'wo_non_evalue',
  }[riskKey]

  const vitesseDisplay = formatVitesseReculMAn(vitesse)
  const reculDisplay = formatReculNetM(reculM)
  const rateAudio =
    vitesse == null
      ? null
      : vitesse > 0
        ? 'wo_cote_recule'
        : vitesse < 0
          ? 'wo_cote_avance'
          : 'wo_cote_stable'
  const rateText =
    vitesse == null
      ? '—'
      : vitesse > 0
        ? `Géej gi dafay jël ${Math.abs(vitesse).toFixed(2)} meetar at mu nekk`
        : vitesse < 0
          ? `Suuf si dafay yokku ${Math.abs(vitesse).toFixed(2)} meetar at mu nekk`
          : 'Tefes bi dafa dal'
  const riskLabel = isWolof
    ? getRiskWolofLabel(risque)
    : getRiskBannerLabel(risque)

  const hasBothModes = Boolean(
    historySeriesAnnee?.length && historySeriesDate?.length,
  )

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

      <p className="detail-panel__kicker">
        {isWolof ? 'Pàcc ci tefes bi' : 'Tronçon côtier'}
      </p>
      <h2 className="detail-panel__title">{title}</h2>

      <div
        className={`detail-panel__risk-banner detail-panel__risk-banner--${riskKey}`}
      >
        {riskLabel}
        {isWolof ? (
          <AudioButton
            file={riskAudio}
            playAudio={playAudio}
            label={riskLabel}
          />
        ) : null}
      </div>

      <div className="detail-panel__metrics">
        <div className="detail-panel__metric-card">
          <div className="detail-panel__metric-head">
            <span>{isWolof ? 'Géej gi di jël suuf' : 'Vitesse de recul'}</span>
            <IconTrendDown />
          </div>
          <p className="detail-panel__metric-value">
            {isWolof ? rateText : vitesseDisplay}
            {isWolof && rateAudio ? (
              <AudioButton file={rateAudio} playAudio={playAudio} label={rateText} />
            ) : null}
          </p>
        </div>
        <div className="detail-panel__metric-card">
          <div className="detail-panel__metric-head">
            <span>{isWolof ? 'Jël suuf ci jamono jii' : 'Recul net (période)'}</span>
            <IconArrowExpand />
          </div>
          <p className="detail-panel__metric-value">{reculDisplay}</p>
        </div>
      </div>

      <section
        className="detail-panel__projections"
        aria-label={
          isWolof
            ? 'Xayma ci kër yi ci 2030 ak 2035'
            : 'Projections des bâtiments menacés en 2030 et 2035'
        }
      >
        <h3 className="detail-panel__projections-title">
          {isWolof ? 'Xayma ci kër yi' : 'Maisons et habitants concernés'}
        </h3>
        {[2030, 2035].map((projectionYear) => (
          <ProjectionYearCard
            key={projectionYear}
            properties={props}
            year={projectionYear}
            isWolof={isWolof}
            playAudio={playAudio}
          />
        ))}
      </section>

      <section
        className="detail-panel__observations"
        aria-label={isWolof ? 'Nataali satellite' : 'Période d’observation'}
      >
        <h3 className="detail-panel__observations-title">
          {isWolof ? 'Nataali satellite' : 'Observations satellite'}
        </h3>
        {observations.firstDate || observations.lastDate ? (
          <p className="detail-panel__observations-period">
            {isWolof ? 'Période : ' : 'Période : '}
            {observations.firstDate ?? 'date inconnue'} –{' '}
            {observations.lastDate ?? 'date inconnue'}
          </p>
        ) : null}
        <p className="detail-panel__observations-count">
          {observations.count != null
            ? isWolof
              ? `${observations.count} nataal yu jëfandikoo`
              : `${observations.count} images utilisées`
            : isWolof
              ? 'Xamuñu limu nataal yi'
              : 'Nombre d’images non précisé'}
        </p>
      </section>

      <div className="detail-panel__chart-wrap">
        {hasBothModes ? (
          <div className="detail-panel__chart-header">
            <span className="detail-panel__chart-header-label">
              {isWolof ? 'Jumtukaay :' : 'Granularité :'}
            </span>
            <div
              className="detail-panel__granularity-toggle"
              role="group"
              aria-label={isWolof ? 'Jumtukaay bu cosaan' : 'Granularité historique'}
            >
              <button
                type="button"
                className={`detail-panel__granularity-btn ${historyMode === 'annee' ? 'is-active' : ''}`}
                onClick={() => setHistoryMode('annee')}
                title={isWolof ? 'Lim bu at mu nekk' : 'Synthèse annuelle (médiane)'}
              >
                {isWolof ? 'At' : 'Par an'}
              </button>
              <button
                type="button"
                className={`detail-panel__granularity-btn ${historyMode === 'date' ? 'is-active' : ''}`}
                onClick={() => setHistoryMode('date')}
                title={isWolof ? 'Nataali satellite yi' : 'Toutes les observations satellites datées'}
              >
                {isWolof ? 'Bés' : 'Par date'}
              </button>
            </div>
          </div>
        ) : null}
        <TransectHistoryChart
          series={activeSeries}
          mode={historyMode}
          language={language}
          playAudio={playAudio}
        />
      </div>

      <footer className="detail-panel__alert">
        <IconWarning />
        <p>
          {isWolof ? (
            <>
              Su yëf yi soppikuwul
              <AudioButton
                file="wo_si_tendance_continue"
                playAudio={playAudio}
                label="Su yëf yi soppikuwul"
              />
              {' — Am na fi des : léegi lañu wara jëf'}
            </>
          ) : alertMessage}
          {isWolof ? (
            <AudioButton
              file="wo_appel_action"
              playAudio={playAudio}
              label="Am na fi des : léegi lañu wara jëf"
            />
          ) : null}
        </p>
      </footer>
    </aside>
  )
}
