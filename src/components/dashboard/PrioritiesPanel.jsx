import { getCsvNumber } from '../../utils/csv'
import { getDistrictPdfUrl } from '../../utils/districtFiles'

const numberFormat = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 0,
})

export function PrioritiesPanel({ rows, language = 'fr', onFocus, onClose }) {
  const isWolof = language === 'wo'

  return (
    <section
      id="priorities-panel"
      className="priorities-panel"
      aria-labelledby="priorities-panel-title"
    >
      <header className="priorities-panel__header">
        <div>
          <p className="priorities-panel__eyebrow">
            {isWolof ? 'Njàngat yi' : 'Pour les décideurs'}
          </p>
          <h2 id="priorities-panel-title">
            {isWolof ? 'Fan lañu njëkk a jëf ?' : 'Où agir en premier ?'}
          </h2>
        </div>
        <button
          type="button"
          className="priorities-panel__close"
          onClick={onClose}
          aria-label={isWolof ? 'Tëj njàngat yi' : 'Fermer les priorités'}
        >
          ×
        </button>
      </header>
      {rows?.length ? (
        <ol className="priorities-panel__list">
          {rows.map((row, index) => {
            const priority = getCsvNumber(row.priorite)
            const latitude = getCsvNumber(row.latitude)
            const longitude = getCsvNumber(row.longitude)
            const buildings = getCsvNumber(row.batiments)
            const residents = getCsvNumber(row.habitants)
            const alertYear = getCsvNumber(row.annee_alerte)
            const districtPdf = getDistrictPdfUrl(
              row.quartier_osm || row.quartier,
            )
            const priorityClass =
              priority === 1 ? 'priorities-panel__item--urgent' : 'priorities-panel__item--high'

            return (
              <li
                key={`${row.quartier}-${row.troncons}-${index}`}
                className={`priorities-panel__item ${priorityClass}`}
              >
                <button
                  type="button"
                  className="priorities-panel__focus"
                  onClick={() => onFocus({ latitude, longitude })}
                  disabled={latitude == null || longitude == null}
                  aria-label={`Centrer la carte sur ${row.quartier}, tronçons ${row.troncons}`}
                >
                  <span className="priorities-panel__rank">
                    {isWolof ? `Jëf ${priority ?? index + 1}` : `Priorité ${priority ?? index + 1}`}
                  </span>
                  <strong className="priorities-panel__zone">
                    {row.quartier}
                    {row.troncons ? ` · tronçons ${row.troncons}` : ''}
                  </strong>
                  {alertYear != null ? (
                    <span className="priorities-panel__alert">
                      {isWolof ? 'Atum njàqare' : 'Alerte estimée vers'}{' '}
                      {alertYear}
                    </span>
                  ) : null}
                  <span className="priorities-panel__exposure">
                    {buildings != null
                      ? `${numberFormat.format(buildings)} bâtiment${buildings > 1 ? 's' : ''}`
                      : 'Bâtiments non renseignés'}
                    {residents != null
                      ? ` · environ ${numberFormat.format(residents)} habitant${residents > 1 ? 's' : ''}`
                      : ''}
                  </span>
                </button>
                {districtPdf ? (
                  <a
                    className="priorities-panel__pdf"
                    href={districtPdf}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {isWolof ? 'Fiche PDF' : 'Fiche du quartier (PDF)'}
                  </a>
                ) : null}
              </li>
            )
          })}
        </ol>
      ) : (
        <p className="priorities-panel__empty" role="status">
          {isWolof
            ? 'Xibaaru njàngat yi amul.'
            : 'Aucune priorité n’est disponible pour le moment.'}
        </p>
      )}
    </section>
  )
}
