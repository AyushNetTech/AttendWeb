// components/FitBounds.tsx
'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'

type Props = {
  markers: { latitude: number; longitude: number }[]
}

export default function FitBounds({ markers }: Props) {
  const map = useMap()

  useEffect(() => {
    if (!markers || markers.length === 0) return

    if (markers.length === 1) {
      // ✅ Single marker → city-level zoom
      map.setView(
        [markers[0].latitude, markers[0].longitude],
        15
      )
    } else {
      // ✅ Multiple markers → fit all
      const bounds = L.latLngBounds(
        markers.map(m => [m.latitude, m.longitude])
      )
      map.fitBounds(bounds, {
        padding: [50, 50]
      })
    }
  }, [markers, map])

  return null
}
