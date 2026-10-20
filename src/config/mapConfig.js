/** Vue par défaut : Saint-Louis (Langue de Barbarie / Guet Ndar). */
export const DEFAULT_CENTER = [16.03, -16.5]
export const DEFAULT_ZOOM = 14

/** Options passées à map.fitBounds lors du zoom automatique sur les données. */
export const FIT_BOUNDS_OPTIONS = {
  padding: [48, 48],
  maxZoom: 15,
}

/** Fonds de carte disponibles dans l'interface. */
export const BASE_LAYERS = {
  osm: {
    id: 'osm',
    label: 'Plan (OpenStreetMap)',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  esriSatellite: {
    id: 'esriSatellite',
    label: 'Satellite (Esri)',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri — Source: Esri, Maxar, Earthstar Geographics',
    maxZoom: 19,
  },
}
