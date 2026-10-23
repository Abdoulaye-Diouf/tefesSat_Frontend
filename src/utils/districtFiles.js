const AVAILABLE_DISTRICT_SLUGS = new Set([
  'doun',
  'goxumbaac',
  'guet_n_dar',
  'hydrobase',
  'ndar_toute',
  'ndiebene_gandiol',
  'santhiaba',
  'tare',
  'tassinere',
])

function normalizeDistrictSlug(name) {
  return String(name ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/['’]/g, '_')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export function getDistrictPdfUrl(name) {
  const slug = normalizeDistrictSlug(name)
  if (!AVAILABLE_DISTRICT_SLUGS.has(slug)) return null
  return `${import.meta.env.BASE_URL}fiches/fiche_${slug}.pdf`
}
