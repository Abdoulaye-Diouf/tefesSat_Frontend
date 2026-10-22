import { getCsvNumber } from '../../utils/csv'
import { AudioButton } from '../AudioButton'

const numberFormat = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 1,
})

function formatNumber(value, suffix = '') {
  const number = getCsvNumber(value)
  return number == null ? '—' : `${numberFormat.format(number)}${suffix}`
}

function formatRate(value) {
  const number = getCsvNumber(value)
  if (number == null) return '—'
  const label = number > 0 ? 'recul' : number < 0 ? 'avancée' : 'stable'
  return `${numberFormat.format(Math.abs(number))} m/an (${label})`
}

function formatBuildingCount(value, row, year, isWolof) {
  const number = getCsvNumber(value)
  if (number == null) return '—'

  const unassessed = getCsvNumber(row.troncons_non_evalues) ?? 0
  const transects = getCsvNumber(row.transects) ?? 0
  const assessed = Math.max(0, transects - unassessed)
  if (assessed === 0) return isWolof ? 'Xayma bi amul' : 'Non évalué'

  const partialNote =
    unassessed > 0
      ? isWolof
        ? ` (${unassessed} pàcc yu xayma amul)`
        : ` (${unassessed} tronçon${unassessed > 1 ? 's' : ''} non évalué${unassessed > 1 ? 's' : ''})`
      : ''

  if (number === 0) {
    return isWolof
      ? `Amul kër yu géej gi jot${partialNote}`
      : `Aucun bâtiment atteint d’ici ${year}${partialNote}`
  }

  const formatted = numberFormat.format(number)
  return isWolof
    ? `${formatted} kër yu géej gi jot${partialNote}`
    : `${formatted} bâtiment${number > 1 ? 's' : ''} atteint${number > 1 ? 's' : ''}${partialNote}`
}

export function DistrictSummary({
  rows,
  year,
  language = 'fr',
  playAudio,
  onClose,
}) {
  const isWolof = language === 'wo'
  const suffix = `_${year}`
  const metrics = [
    { key: `marge_min${suffix}_m`, label: `Marge min. ${year}`, suffix: ' m' },
    { key: `batiments_menaces${suffix}`, label: `Bâtiments ${year}` },
    { key: `habitants_menaces${suffix}`, label: `Habitants ${year}` },
    { key: `equipements_menaces${suffix}`, label: `Équipements ${year}` },
  ]

  return (
    <section
      className="district-summary"
      aria-labelledby="district-summary-title"
    >
      <button
        type="button"
        className="district-summary__close"
        onClick={onClose}
        aria-label={isWolof ? 'Tëj leeralu gox yi' : 'Fermer le résumé par quartier'}
      >
        ×
      </button>
      <h2 id="district-summary-title" className="district-summary__title">
        {isWolof ? 'Leeral gox yi' : 'Indicateurs par quartier'}
      </h2>
      <p className="district-summary__subtitle">
        {isWolof ? `At mu nekk ${year}` : `Exposition projetée à l’horizon ${year}`}
        {isWolof ? (
          <AudioButton file="wo_quartier" playAudio={playAudio} label="Gox" />
        ) : null}
      </p>
      {rows?.length ? (
        <div className="district-summary__table-wrap">
          <table className="district-summary__table">
            <thead>
              <tr>
                <th scope="col">
                  {isWolof ? 'Gox' : 'Quartier'}
                  {isWolof ? (
                    <AudioButton file="wo_quartier" playAudio={playAudio} label="Gox" />
                  ) : null}
                </th>
                <th scope="col">{isWolof ? 'Pàcc yi' : 'Transects'}</th>
                <th scope="col">{isWolof ? 'Recul moyen' : 'Recul moyen'}</th>
                <th scope="col">{isWolof ? 'Vitesse max.' : 'Vitesse max.'}</th>
                <th scope="col">{isWolof ? 'Altitude médiane' : 'Altitude médiane'}</th>
                {metrics.map((metric) => (
                  <th key={metric.key} scope="col">
                    {isWolof
                      ? metric.key.includes('batiments')
                        ? `Kër yi ${year}`
                        : metric.key.includes('habitants')
                          ? `Nit ñi ${year}`
                          : metric.key.includes('equipements')
                            ? `Lekool, jàkka ak bërëbu faju ${year}`
                            : `Diggante géej gi ak kër yi ${year}`
                      : metric.label}
                    {isWolof ? (
                      <AudioButton
                        file={
                          metric.key.includes('batiments')
                            ? 'wo_maisons_menacees'
                            : metric.key.includes('habitants')
                              ? 'wo_habitants_menaces'
                              : metric.key.includes('equipements')
                                ? 'wo_equipements_menaces'
                                : 'wo_marge_maisons'
                        }
                        playAudio={playAudio}
                        label={metric.label}
                      />
                    ) : null}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.quartier}>
                  <th scope="row">{row.quartier || (isWolof ? 'Xamuñu' : 'Non renseigné')}</th>
                  <td>{formatNumber(row.transects)}</td>
                  <td>{formatRate(row.recul_moyen_m_an)}</td>
                  <td>{formatRate(row.recul_max_m_an)}</td>
                  <td>{formatNumber(row.altitude_mediane_m, ' m')}</td>
                  {metrics.map((metric) => (
                    <td key={metric.key}>
                      {metric.key.includes('batiments')
                        ? formatBuildingCount(
                            row[metric.key],
                            row,
                            year,
                            isWolof,
                          )
                        : formatNumber(row[metric.key], metric.suffix)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="district-summary__empty" role="status">
          {isWolof ? 'Leeralu gox yi amul.' : 'Le résumé par quartier n’est pas disponible.'}
        </p>
      )}
      <p className="district-summary__note">
        {isWolof
          ? 'Lim yu yokku : jël suuf. Lim yu wàcc : yokku suuf.'
          : 'Vitesses positives : recul vers la terre. Vitesses négatives : avancée.'}
      </p>
    </section>
  )
}
