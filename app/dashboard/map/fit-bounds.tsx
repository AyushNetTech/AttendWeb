'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import type { LatLngBoundsExpression } from 'leaflet'

export default function FitBounds({
  bounds
}: {
  bounds: LatLngBoundsExpression
}) {
  const map = useMap()

  useEffect(() => {
    if (bounds && map) {
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [bounds, map])

  return null
}
