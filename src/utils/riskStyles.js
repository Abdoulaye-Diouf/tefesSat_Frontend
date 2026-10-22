/**
 * Couleurs des transects selon « risque » (pipeline TefesSat, guide section 6).
 */

const RISK_PALETTE = {
  faible: { color: '#2E7D32', label: 'Faible' },
  moyen: { color: '#F9A825', label: 'Moyen' },
  eleve: { color: '#EF6C00', label: 'Élevé' },
  tres_eleve: { color: '#C62828', label: 'Très élevé' },
  non_evalue: { color: '#9E9E9E', label: 'Non évalué' },
  inconnu: { color: '#64748b', label: 'Non classé' },
}

/** Normalise une chaîne de risque vers une clé interne. */
export function normalizeRiskKey(raw) {
  if (raw == null || raw === '') return 'inconnu'
  const s = String(raw)
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')

  if (s.includes('non evalue')) return 'non_evalue'
  if (s.includes('critique')) return 'tres_eleve'
  if (s.includes('tres eleve') || s === 'tres_eleve') return 'tres_eleve'
  if (s.includes('eleve') || s === 'eleve') return 'eleve'
  if (s.includes('modere') || s.includes('moyen')) return 'moyen'
  if (s.includes('faible')) return 'faible'
  return 'inconnu'
}

export function getRiskColor(rawRisk) {
  const key = normalizeRiskKey(rawRisk)
  return (RISK_PALETTE[key] ?? RISK_PALETTE.inconnu).color
}

export function getRiskLabel(rawRisk) {
  const key = normalizeRiskKey(rawRisk)
  return (RISK_PALETTE[key] ?? RISK_PALETTE.inconnu).label
}

/** Libellé bandeau panneau latéral, ex. « RISQUE CRITIQUE ». */
export function getRiskBannerLabel(rawRisk) {
  const label = getRiskLabel(rawRisk)
  if (label === 'Non classé') return 'RISQUE NON CLASSÉ'
  return `RISQUE ${label.toUpperCase()}`
}

export function getRiskWolofLabel(rawRisk) {
  const labels = {
    faible: 'Njàqare tuuti',
    moyen: 'Njàqare bu yem',
    eleve: 'Njàqare bu mag',
    tres_eleve: 'Njàqare bu mag lool',
    non_evalue: 'Xamuñu ko ba léegi',
    inconnu: 'Xamuñu ko ba léegi',
  }
  return labels[normalizeRiskKey(rawRisk)]
}

/** Style Leaflet pour un transect (LineString). */
export function transectLineStyle(feature, { selectedId } = {}) {
  const props = feature?.properties ?? {}
  const id =
    props.id_troncon ?? props.transect_id ?? props.id ?? feature?.id
  const risk = props.risque ?? props.niveau_risque
  const isSelected = selectedId != null && String(id) === String(selectedId)

  return {
    color: getRiskColor(risk),
    weight: isSelected ? 6 : 4,
    opacity: isSelected ? 1 : 0.85,
  }
}

export const LEGEND_ITEMS = [
  RISK_PALETTE.faible,
  RISK_PALETTE.moyen,
  RISK_PALETTE.eleve,
  RISK_PALETTE.tres_eleve,
  RISK_PALETTE.non_evalue,
]
