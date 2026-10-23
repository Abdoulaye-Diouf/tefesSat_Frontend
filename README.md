# TefesSat — Tableau de bord web

Interface interactive du projet **TefesSat** (hackathon SENSAT « Du satellite à la solution », octobre 2026) pour visualiser le **recul du trait de côte** à Saint-Louis (Langue de Barbarie).

Carte **Leaflet** (react-leaflet) + panneau de détail par transect, alimenté par des fichiers **GeoJSON** produits par la chaîne Python du dépôt voisin `TefesSat`.

## Fonctionnalités

- Carte plein écran centrée sur Saint-Louis (~16,03°N, −16,50°W), avec fond **OpenStreetMap** ou **Esri Satellite**
- Couche **transects** (segments perpendiculaires à la côte) colorés selon le **niveau de risque**
- Couches **bande menacée** et **bâtiments menacés**, sélectionnables pour 2030 ou 2035
- **Résumé par quartier** : vitesses, altitude, marge avant les maisons et exposition
- Panneau **« Où agir en premier ? »** avec les zones prioritaires; un clic centre la carte sur la zone concernée
- Liens vers la fiche PDF de la mairie et vers les fiches PDF disponibles par quartier
- Vidéo de présentation ouverte dans une fenêtre intégrée avec commandes de lecture
- **Clic** sur un transect → fiche latérale (risque, vitesse et recul net, bâtiments menacés, période d’observation, alerte)
- Projections des bâtiments en **2030 et 2035** distinguant les bâtiments et habitants concernés, l’absence d’atteinte avec la marge projetée, et les projections non évaluées avec leur motif et la marge actuelle
- Courbe historique fondée sur les positions mesurées dans `positions_par_annee.csv` et `positions_par_date.csv`
- **Zoom automatique** sur l’emprise des données + bouton **Recentrer**
- Légende des niveaux de risque
- Bascule **FR | WO** et lecture des textes wolof associés aux vocaux disponibles dans `public/audio/` ; le message d’introduction est joué en trois parties
- Mention **Prototype** visible dans l’en-tête

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
│   dataSources.js    # chemins des GeoJSON et CSV du pipeline
│   mapConfig.js        # centre, zoom, fonds de carte, options fitBounds
├── data/               # données GeoJSON locales
├── hooks/
│   useGeoJson.js       # chargement async des GeoJSON
│   useCsv.js           # chargement et parsing CSV
├── components/
│   dashboard/          # en-tête, contrôles, orchestration
│   map/                # carte, couches, légende, cadrage
│   panel/              # fiche et graphique historique
└── utils/              # styles de risque, propriétés unifiées, bbox
```

## Ressources pour la mairie et le public

Les ressources placées dans `public/` sont servies directement par Vite :

| Ressource | Emplacement |
|-----------|-------------|
| Fiche générale destinée à la mairie | `public/fiches/fiche_mairie.pdf` |
| Fiches disponibles par quartier | `public/fiches/fiche_<quartier>.pdf` |
| Vidéo de présentation | `public/video_tefessat.mp4` |
| Zones prioritaires et coordonnées de la carte | `public/resultats/priorites_mairie.csv` |

Les liens de quartier ne sont affichés que pour les fiches PDF disponibles. Les indicateurs présentés dans les cartes de priorité sont volontairement limités au quartier, aux tronçons, à l’échéance estimée et aux bâtiments et habitants concernés.

## Brancher les GeoJSON du pipeline TefesSat

1. Exposer le dossier `resultats/` du repo Python :
   - **Recommandé (dev)** : junction Windows / symlink vers `../TefesSat/resultats` dans `public/resultats` (PowerShell : `New-Item -ItemType Junction -Path public/resultats -Target ..\TefesSat\resultats`)
   - **Déploiement** : copier les GeoJSON dans `public/resultats/`

2. Les chemins sont définis dans `src/config/dataSources.js` :
   - `transects_resultats.geojson`
   - `bande_menacee_2030.geojson` / `bande_menacee_2035.geojson`
   - `batiments_menaces_2030.geojson` / `batiments_menaces_2035.geojson`
   - `traits_de_cote_projetes.geojson`
   - `resume_par_quartier.csv`
   - `positions_par_annee.csv`
   - `positions_par_date.csv`
   - `priorites_mairie.csv`

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
| Période et nombre d’images | `historique_dates` ou `premiere_date` / `derniere_date`, `nb_dates` |
| Message d’alerte | `recommandation` (sinon texte selon le risque) |

La vitesse et le recul net sont affichés avec une convention commune : une valeur positive signifie un recul vers la terre. Le champ pipeline `epr_m_an` est converti depuis sa convention opposée ; `nsm_m` est également inversé pour l’affichage du recul net.

La courbe du transect utilise les données de `positions_par_annee.csv` (synthèse médiane annuelle) et `positions_par_date.csv` (dates de chaque observation satellite), exprimées en recul par rapport à la première observation. Les valeurs positives indiquent un déplacement vers la terre, donc un recul. Un sélecteur permet de basculer entre la vue annuelle et la vue détaillée par passage satellite.

## Paramètres carte

Dans `src/config/mapConfig.js` :

- `DEFAULT_CENTER`, `DEFAULT_ZOOM` — vue initiale avant chargement des données
- `FIT_BOUNDS_OPTIONS` — marge et zoom max lors du cadrage automatique
- `BASE_LAYERS` — URLs des fonds de carte

## Lien avec le dépôt d’analyse

La chaîne de calcul (transects, vitesses EPR/LRR, projections 2030/2035, etc.) est documentée dans le README du projet **`../TefesSat`**.

---

Équipe TefesSat — Ndèye Fatou SOW, Abdoulaye DIOUF, Malick FALL.
