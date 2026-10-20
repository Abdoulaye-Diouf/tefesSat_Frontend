/**
 * Chemins des jeux de données GeoJSON affichés sur la carte.
 * Pour brancher les sorties du pipeline Python, remplacez les imports
 * par les fichiers dans public/ (ex. /resultats/transects_resultats.geojson)
 * ou par des URLs ?url vers de nouveaux fichiers dans src/data/.
 */
import transectsTest from '../data/transects_test.geojson?url'
import bandeMenaceeTest from '../data/bande_menacee_test.geojson?url'

/** @type {{ transects: string; bandeMenacee: string }} */
export const GEOJSON_SOURCES = {
  transects: transectsTest,
  bandeMenacee: bandeMenaceeTest,
}
