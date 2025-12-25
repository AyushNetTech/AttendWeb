'use client'

export const dynamic = 'force-dynamic' // ✅ CRITICAL FIX

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import 'leaflet/dist/leaflet.css'
import { applyLeafletFix } from '@/lib/leafletFix'
import dynamicImport from 'next/dynamic'

// 🚫 SSR disabled for react-leaflet
const MapContainer = dynamicImport(
  () => import('react-leaflet').then(m => m.MapContainer),
  { ssr: false }
)
const TileLayer = dynamicImport(
  () => import('react-leaflet').then(m => m.TileLayer),
  { ssr: false }
)
const Marker = dynamicImport(
  () => import('react-leaflet').then(m => m.Marker),
  { ssr: false }
)
const Popup = dynamicImport(
  () => import('react-leaflet').then(m => m.Popup),
  { ssr: false }
)
const Tooltip = dynamicImport(
  () => import('react-leaflet').then(m => m.Tooltip),
  { ssr: false }
)

// 🚫 SSR disabled for FitBounds (VERY IMPORTANT)
const FitBounds = dynamicImport(
  () => import('@/components/FitBounds'),
  { ssr: false }
)

type MarkerData = {
  employee_name: string
  punch_type: 'IN' | 'OUT'
  latitude: number
  longitude: number
  punch_time: string
}

export default function EmployeeMap() {
  const [markers, setMarkers] = useState<MarkerData[]>([])
  const [loading, setLoading] = useState(true)
  const [icons, setIcons] = useState<{
    greenIcon: any
    redIcon: any
  } | null>(null)

  // ✅ Init Leaflet icons (client only)
  useEffect(() => {
    let mounted = true

    async function init() {
      if (typeof window === 'undefined') return

      await applyLeafletFix()
      const L = await import('leaflet')

      const greenIcon = new L.Icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
        shadowUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })

      const redIcon = new L.Icon({
        iconUrl:
          'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
        shadowUrl:
          'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })

      if (mounted) setIcons({ greenIcon, redIcon })
    }

    init()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    loadMapData()
  }, [])

  async function loadMapData() {
    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', userData.user.id)
      .maybeSingle()

    if (!company) return

    const { data } = await supabase.rpc('latest_employee_punches', {
      company_uuid: company.id
    })

    setMarkers(data || [])
    setLoading(false)
  }

  if (loading || !icons) {
    return <div className="p-6">Loading map...</div>
  }

  return (
    <div className="p-6 h-[calc(100vh_-_70px)]">
      <h1 className="text-2xl font-semibold mb-4">
        Employee Attendance Map
      </h1>

      <div className="h-full rounded-xl overflow-hidden border">
        <MapContainer className="h-full w-full">
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* ✅ AUTO CENTER & ZOOM */}
          <FitBounds markers={markers} />

          {markers.map((m, i) => (
            <Marker
              key={i}
              position={[m.latitude, m.longitude]}
              icon={m.punch_type === 'IN' ? icons.greenIcon : icons.redIcon}
            >
              <Tooltip permanent direction="top" offset={[0, -28]}>
                {m.employee_name}
              </Tooltip>

              <Popup>
                <p className="font-semibold">{m.employee_name}</p>
                <p>
                  Status:{' '}
                  <span
                    className={
                      m.punch_type === 'IN'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }
                  >
                    {m.punch_type}
                  </span>
                </p>
                <p>
                  {new Date(m.punch_time).toLocaleString('en-IN', {
                    timeZone: 'Asia/Kolkata'
                  })}
                </p>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  )
}
