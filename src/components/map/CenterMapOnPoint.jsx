import { useEffect } from 'react'
import { useMap } from 'react-leaflet'

export function CenterMapOnPoint({ request }) {
  const map = useMap()

  useEffect(() => {
    if (
      !request ||
      !Number.isFinite(request.latitude) ||
      !Number.isFinite(request.longitude)
    ) {
      return
    }

    map.flyTo(
      [request.latitude, request.longitude],
      Math.max(map.getZoom(), 14),
      { duration: 0.8 },
    )
  }, [map, request])

  return null
}
