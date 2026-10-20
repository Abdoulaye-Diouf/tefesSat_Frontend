/**
 * Couleurs et épaisseurs des transects selon le niveau de risque.
 * Compatible avec les libellés du pipeline (faible, moyen, élevé, très élevé)
 * et les données de test (Faible, Modéré, Critique, etc.).
 */

const RISK_PALETTE = {
  faible: { color: '#22c55e', label: 'Faible' },
  moyen: { color: '#eab308', label: 'Moyen' },
  eleve: { color: '#f97316', label: 'Élevé' },
  tres_eleve: { color: '#ef4444', label: 'Très élevé' },
  critique: { color: '#7f1d1d', label: 'Critique' },
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

  if (s.includes('critique')) return 'critique'
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
  return label === 'Non classé' ? 'RISQUE NON CLASSÉ' : `RISQUE ${label.toUpperCase()}`
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
  RISK_PALETTE.critique,
]
