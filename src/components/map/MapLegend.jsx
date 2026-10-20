import { LEGEND_ITEMS } from '../../utils/riskStyles'

export function MapLegend() {
  return (
    <div className="map-legend" aria-label="Légende des niveaux de risque">
      <p className="map-legend__title">Risque d’érosion (2030)</p>
      <ul>
        {LEGEND_ITEMS.map((item) => (
          <li key={item.label}>
            <span
              className="map-legend__swatch"
              style={{ backgroundColor: item.color }}
            />
            {item.label}
          </li>
        ))}
      </ul>
      <p className="map-legend__bande">
        <span className="map-legend__swatch map-legend__swatch--bande" />
        Bande menacée 2030
      </p>
    </div>
  )
}
