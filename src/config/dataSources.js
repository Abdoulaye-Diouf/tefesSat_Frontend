/**
 * Chemins des jeux de données GeoJSON (dossier public/resultats/, lié au dépôt TefesSat).
 * Après un git pull sur TefesSat, les fichiers sont servis automatiquement en local.
 */
/** @type {{ transects: string; bandeMenacee: Record<number, string>; batimentsMenaces: Record<number, string>; traitsDeCote: string; resumeQuartiers: string; positionsParAnnee: string; positionsParDate: string; positionsPivot: string; prioritesMairie: string }} */
export const GEOJSON_SOURCES = {
  transects: '/resultats/transects_resultats.geojson',
  bandeMenacee: {
    2030: '/resultats/bande_menacee_2030.geojson',
    2035: '/resultats/bande_menacee_2035.geojson',
  },
  batimentsMenaces: {
    2030: '/resultats/batiments_menaces_2030.geojson',
    2035: '/resultats/batiments_menaces_2035.geojson',
  },
  traitsDeCote: '/resultats/traits_de_cote_projetes.geojson',
  resumeQuartiers: '/resultats/resume_par_quartier.csv',
  positionsParAnnee: '/resultats/positions_par_annee.csv',
  positionsParDate: '/resultats/positions_par_date.csv',
  positionsPivot: '/resultats/positions_par_annee.csv',
  prioritesMairie: '/resultats/priorites_mairie.csv',
}
