/**
 * Unifie les propriétés des transects (fichiers de test vs sortie pipeline TefesSat).
 */

export function getTransectId(properties = {}) {
  return (
    properties.id_troncon ??
    properties.transect_id ??
    properties.id ??
    null
  )
}

/** @returns {{ label: string; dates: string[] }} */
export function getHistorique(properties = {}) {
  if (properties.historique_dates) {
    const dates = String(properties.historique_dates)
      .split(',')
      .map((d) => d.trim())
      .filter(Boolean)
    return { label: 'Dates des traits de côte', dates }
  }

  const debut = properties.premiere_date
  const fin = properties.derniere_date
  if (debut || fin) {
    const dates = [debut, fin].filter(Boolean)
    return {
      label: 'Période d’observation',
      dates,
    }
  }

  return { label: 'Historique', dates: [] }
}

export function getVitesseReculMAn(properties = {}) {
  const v =
    properties.vitesse_recul_m_an ??
    properties.recul_m_an ??
    properties.epr_m_an
  return typeof v === 'number' && !Number.isNaN(v) ? v : null
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

/** Recul cumulé ou estimé affiché en mètres (valeur positive = distance reculée). */
export function getReculEstimeM(properties = {}) {
  if (typeof properties.recul_estime_m === 'number') {
    return properties.recul_estime_m
  }
  if (typeof properties.recul_cumule_2015_2025 === 'number') {
    return properties.recul_cumule_2015_2025
  }
  const vitesse = getVitesseReculMAn(properties)
  if (vitesse != null) return vitesse * 5
  return null
}

export function getBatimentsMenaces(properties = {}) {
  const n =
    properties.batiments_menaces_2030 ??
    properties.batiments_menaces ??
    properties.nb_batiments_menaces
  return typeof n === 'number' && !Number.isNaN(n) ? n : null
}

/**
 * Série temporelle pour le graphique (recul cumulé en m, valeurs négatives = recul vers la mer).
 * @returns {{ year: number; reculM: number }[]}
 */
export function getHistoriqueSeries(properties = {}) {
  const { dates } = getHistorique(properties)
  if (dates.length < 2) return []

  const years = dates
    .map((d) => parseInt(String(d).slice(0, 4), 10))
    .filter((y) => !Number.isNaN(y))
  if (years.length < 2) return []

  const firstYear = years[0]
  const lastYear = years[years.length - 1]
  const span = lastYear - firstYear || 1
  const cumul = getReculEstimeM(properties)
  const vitesse = getVitesseReculMAn(properties)

  return years.map((year) => {
    let reculPos = 0
    if (cumul != null) {
      reculPos = (cumul * (year - firstYear)) / span
    } else if (vitesse != null) {
      reculPos = vitesse * (year - firstYear)
    }
    return { year, reculM: -Math.abs(reculPos) }
  })
}

export function getAlertMessage(properties = {}) {
  if (properties.recommandation) return properties.recommandation
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
