/**
 * Unifie les propriétés des transects (fichiers de test vs sortie pipeline TefesSat).
 */

import { getCsvNumber } from './csv.js'

export function getTransectId(properties = {}) {
  return (
    properties.id_troncon ??
    properties.transect_id ??
    properties.id ??
    null
  )
}

/** Dates et nombre d’images réellement disponibles dans les propriétés du transect ou déduites de seriesDate. */
export function getObservationSummary(properties = {}, seriesDate = []) {
  let dates = []
  if (properties.historique_dates) {
    dates = String(properties.historique_dates)
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean)
  } else {
    dates = [properties.premiere_date, properties.derniere_date].filter(Boolean)
  }

  const rawCount = properties.nb_dates
  let count =
    typeof rawCount === 'number' && Number.isFinite(rawCount)
      ? rawCount
      : dates.length || null

  let firstDate = dates[0] ?? null
  let lastDate = dates.at(-1) ?? null

  if ((!firstDate || !lastDate || !count) && seriesDate?.length) {
    const valid = seriesDate.filter((pt) => pt.reculM != null)
    if (valid.length) {
      firstDate = firstDate ?? valid[0].date
      lastDate = lastDate ?? valid.at(-1).date
      count = count ?? valid.length
    }
  }

  return { firstDate, lastDate, count }
}

/** Position mesurée sur le transect, convertie en déplacement vers la terre (recul net).
 * Gère à la fois le format long (positions_par_date.csv : transect_id, date, distance_m)
 * et le format pivot/large (positions_par_annee.csv : transect_id, 2015, 2016, ...).
 */
export function getHistoricalSeries(rows, transectId) {
  if (!rows?.length || transectId == null) return []

  const targetId = String(transectId).trim()

  // Format long : positions_par_date.csv (colonnes : transect_id, date, distance_m)
  if (rows[0] && ('distance_m' in rows[0] || ('date' in rows[0] && !('2016' in rows[0])))) {
    const transectRows = rows
      .filter((item) => String(item.transect_id).trim() === targetId)
      .sort((a, b) => String(a.date).localeCompare(String(b.date)))

    if (!transectRows.length) return []

    const measurements = transectRows.map((item) => ({
      date: item.date,
      positionM: getCsvNumber(item.distance_m ?? item.position_m ?? item.value),
    }))

    const firstPosition = measurements.find((m) => m.positionM != null)?.positionM
    if (firstPosition == null) return []

    return measurements.map(({ date, positionM }) => ({
      date,
      reculM:
        positionM == null
          ? null
          : Math.round((firstPosition - positionM) * 10) / 10,
    }))
  }

  // Format pivot / large : positions_par_annee.csv ou ancien positions_pivot.csv
  const row = rows.find(
    (item) => String(item.transect_id).trim() === targetId,
  )
  if (!row) return []

  const measurements = Object.entries(row)
    .filter(([date]) => date !== 'transect_id')
    .map(([date, value]) => ({ date, positionM: getCsvNumber(value) }))

  const firstPosition = measurements.find(
    (measurement) => measurement.positionM != null,
  )?.positionM

  if (firstPosition == null) return []

  return measurements.map(({ date, positionM }) => ({
    date,
    reculM:
      positionM == null
        ? null
        : Math.round((firstPosition - positionM) * 10) / 10,
  }))
}

export function getVitesseReculMAn(properties = {}) {
  const recul = properties.recul_m_an ?? properties.vitesse_recul_m_an
  if (typeof recul === 'number' && Number.isFinite(recul)) return recul

  const epr = properties.epr_m_an
  return typeof epr === 'number' && Number.isFinite(epr) ? -epr : null
}

/** Convention d’affichage unifiée : positif = recul, négatif = avancée. */
export function formatVitesseReculMAn(vitesse) {
  if (vitesse == null) return '—'
  const v = vitesse
  if (v > 0) return `${v.toFixed(2)} m/an (recul)`
  if (v < 0) return `${Math.abs(v).toFixed(2)} m/an (avancée)`
  return '0 m/an'
}

export function getMargeBatimentsM(properties = {}, year = 2035) {
  const fallbackYear = year === 2035 ? 2030 : 2035
  const margin =
    properties[`marge_batiments_${year}_m`] ??
    properties[`marge_batiments_${fallbackYear}_m`]
  return typeof margin === 'number' && Number.isFinite(margin) ? margin : null
}

export function getNiveauRisque(properties = {}) {
  return properties.risque ?? properties.niveau_risque ?? '—'
}

export function getQuartier(properties = {}) {
  return properties.quartier ?? properties.nom_quartier ?? null
}

/** Titre affiché : « Tronçon n°12 — Guet Ndar ». */
export function getTronconTitle(properties = {}) {
  const id = getTransectId(properties)
  const quartier = getQuartier(properties)
  let tronconLabel = 'Tronçon'

  if (id != null) {
    const match = String(id).match(/(\d+)/)
    if (match) {
      tronconLabel = `Tronçon n°${parseInt(match[1], 10)}`
    } else {
      tronconLabel = `Tronçon ${id}`
    }
  }

  return quartier ? `${tronconLabel} — ${quartier}` : tronconLabel
}

/** Recul net : le NSM du pipeline est positif vers la mer, donc négatif lors d’un recul. */
export function getReculEstimeM(properties = {}) {
  if (typeof properties.nsm_m === 'number' && Number.isFinite(properties.nsm_m)) {
    return -properties.nsm_m
  }
  if (
    typeof properties.recul_estime_m === 'number' &&
    Number.isFinite(properties.recul_estime_m)
  ) {
    return properties.recul_estime_m
  }
  if (
    typeof properties.recul_cumule_2015_2025 === 'number' &&
    Number.isFinite(properties.recul_cumule_2015_2025)
  ) {
    return properties.recul_cumule_2015_2025
  }
  return null
}

/** Convention d’affichage unifiée : positif = recul vers la terre. */
export function formatReculNetM(reculM) {
  if (reculM == null) return '—'
  if (reculM > 0) return `${reculM.toFixed(1)} m (recul)`
  if (reculM < 0) return `${Math.abs(reculM).toFixed(1)} m (avancée)`
  return '0 m'
}

export function getBatimentsMenaces(properties = {}, year = 2035) {
  const fallbackYear = year === 2035 ? 2030 : 2035
  const n =
    properties[`batiments_menaces_${year}`] ??
    properties[`batiments_menaces_${fallbackYear}`] ??
    properties.batiments_menaces ??
    properties.nb_batiments_menaces
  return typeof n === 'number' && Number.isFinite(n) ? n : null
}

export function getBuildingProjection(properties = {}, year) {
  const buildingCount = getCsvNumber(
    properties[`batiments_menaces_${year}`],
  )
  const residents = getCsvNumber(properties[`habitants_menaces_${year}`])
  const margin = getCsvNumber(properties[`marge_batiments_${year}_m`])
  const currentMargin = getCsvNumber(properties.marge_batiments_actuelle_m)
  const reason = properties.motif_non_evalue
    ? String(properties.motif_non_evalue).trim()
    : ''
  const projectionUnavailable =
    properties.projection_fiable === false ||
    String(properties.projection_fiable).toLowerCase() === 'false' ||
    Boolean(reason)

  if (projectionUnavailable) {
    return {
      status: 'not-evaluated',
      reason,
      currentMargin,
      buildingCount,
      residents,
      margin,
    }
  }

  if (buildingCount == null) {
    return {
      status: 'unavailable',
      reason,
      currentMargin,
      buildingCount,
      residents,
      margin,
    }
  }

  return {
    status: 'evaluated',
    reason,
    currentMargin,
    buildingCount,
    residents,
    margin,
  }
}

export function getAlertMessage(properties = {}, year = 2035) {
  if (properties.recommandation) return properties.recommandation
  if (properties.rupture && properties.date_rupture) {
    return `Zone de brèche : rupture du trait de côte le ${properties.date_rupture}`
  }
  const marge = getMargeBatimentsM(properties, year)
  if (marge != null && marge <= 50) {
    return `Marge mer – maisons en ${year} : ${marge.toFixed(0)} m — surveillance prioritaire`
  }
  const key = String(properties.risque ?? properties.niveau_risque ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
  if (key.includes('critique') || key.includes('tres eleve')) {
    return 'Zone hautement vulnérable nécessitant une intervention prioritaire'
  }
  if (key.includes('eleve') || key.includes('modere') || key.includes('moyen')) {
    return 'Surveillance renforcée et mesures d’adaptation recommandées'
  }
  return 'Situation stable à court terme — poursuivre le suivi satellite'
}
