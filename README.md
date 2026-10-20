# TefesSat — Tableau de bord web

Interface interactive du projet **TefesSat** (hackathon SENSAT « Du satellite à la solution », octobre 2026) pour visualiser le **recul du trait de côte** à Saint-Louis (Langue de Barbarie).

Carte **Leaflet** (react-leaflet) + panneau de détail par transect, alimenté par des fichiers **GeoJSON** produits par la chaîne Python du dépôt voisin `TefesSat`.

## Fonctionnalités

- Carte plein écran centrée sur Saint-Louis (~16,03°N, −16,50°W), avec fond **OpenStreetMap** ou **Esri Satellite**
- Couche **transects** (segments perpendiculaires à la côte) colorés selon le **niveau de risque**
- Couche **bande menacée 2030** (polygone semi-transparent)
- **Clic** sur un transect → fiche latérale (risque, vitesse de recul, bâtiments menacés, graphique d’évolution, alerte)
- **Zoom automatique** sur l’emprise des données + bouton **Recentrer**
- Légende des niveaux de risque

## Stack

| Outil | Rôle |
|--------|------|
| [React 19](https://react.dev/) | Interface |
| [Vite 8](https://vite.dev/) | Build et dev server |
| [Leaflet](https://leafletjs.com/) / [react-leaflet](https://react-leaflet.js.org/) | Cartographie |
| [Oxlint](https://oxc.rs/docs/guide/usage/linter.html) | Lint |

## Installation

```bash
npm install
```

## Scripts

```bash
npm run dev      # serveur de développement (http://localhost:5173)
npm run build    # build de production dans dist/
npm run preview  # prévisualiser le build
npm run lint     # oxlint
```

## Structure du projet

```
src/
├── config/
│   dataSources.js    # chemins des GeoJSON (point de branchement)
│   mapConfig.js        # centre, zoom, fonds de carte, options fitBounds
├── data/               # jeux de test (GeoJSON)
├── hooks/
│   useGeoJson.js       # chargement async des GeoJSON
├── components/
│   dashboard/          # en-tête, contrôles, orchestration
│   map/                # carte, couches, légende, cadrage
│   panel/              # fiche transect + graphique SVG
└── utils/              # styles de risque, propriétés unifiées, bbox
```

## Données de test

Fichiers actuels dans `src/data/` :

| Fichier | Description |
|---------|-------------|
| `transects_test.geojson` | Transects fictifs (Guet Ndar) |
| `bande_menacee_test.geojson` | Polygone de zone menacée (test) |

**Ces données sont fictives** : à remplacer par les sorties réelles du pipeline avant présentation au jury.

## Brancher les GeoJSON du pipeline TefesSat

1. Copier les fichiers générés (dossier `resultats/` du repo Python) vers `public/resultats/`, par exemple :
   - `transects_resultats.geojson`
   - `bande_menacee_2030.geojson`

2. Modifier `src/config/dataSources.js` :

```javascript
export const GEOJSON_SOURCES = {
  transects: '/resultats/transects_resultats.geojson',
  bandeMenacee: '/resultats/bande_menacee_2030.geojson',
}
```

Les sorties pipeline sont en **WGS84** (EPSG:4326), compatibles Leaflet.

### Propriétés reconnues par le tableau de bord

Le code accepte à la fois les champs des **fichiers de test** et ceux du **pipeline** :

| Affichage | Propriétés possibles |
|-----------|----------------------|
| Identifiant | `id_troncon`, `transect_id`, `id` |
| Quartier | `quartier`, `nom_quartier` |
| Risque | `risque`, `niveau_risque` (faible, moyen, élevé, très élevé, critique…) |
| Vitesse (m/an) | `recul_m_an`, `vitesse_recul_m_an`, `epr_m_an` |
| Recul cumulé / estimé | `recul_cumule_2015_2025`, `recul_estime_m` |
| Bâtiments menacés | `batiments_menaces_2030`, `batiments_menaces` |
| Historique (graphique) | `historique_dates` ou `premiere_date` / `derniere_date` |
| Message d’alerte | `recommandation` (sinon texte selon le risque) |

Pour un graphique basé sur des **mesures réelles par date** (positions sur transect), il faudra étendre `getHistoriqueSeries()` dans `src/utils/transectFeature.js` lorsque ces champs seront exportés en GeoJSON.

## Paramètres carte

Dans `src/config/mapConfig.js` :

- `DEFAULT_CENTER`, `DEFAULT_ZOOM` — vue initiale avant chargement des données
- `FIT_BOUNDS_OPTIONS` — marge et zoom max lors du cadrage automatique
- `BASE_LAYERS` — URLs des fonds de carte

## Lien avec le dépôt d’analyse

La chaîne de calcul (transects, vitesses EPR/LRR, projections 2030/2035, etc.) est documentée dans le README du projet **`../TefesSat`**.

---

Équipe TefesSat — Ndèye Fatou SOW, Abdoulaye DIOUF, Malick FALL.
