'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import 'leaflet/dist/leaflet.css'
import '@/lib/leafletFix'
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet'


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

  useEffect(() => {
    loadMapData()
  }, [])

  async function loadMapData() {
    setLoading(true)

    const { data: userData } = await supabase.auth.getUser()
    if (!userData.user) return

    // 1️⃣ Get company
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', userData.user.id)
      .maybeSingle()

    if (!company) return

    // 2️⃣ Get latest punch per employee
    const { data, error } = await supabase.rpc('latest_employee_punches', {
      company_uuid: company.id
    })

    if (!error && data) setMarkers(data)

    setLoading(false)
  }

  if (loading) {
    return <div className="p-6">Loading map...</div>
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Employee Attendance Map</h1>

      <div className="h-[600px] rounded-xl overflow-hidden border">
        <MapContainer
          center={[20.5937, 78.9629]} // India center
          zoom={5}
          className="h-full w-full"
        >
          <TileLayer
            attribution="© OpenStreetMap"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {markers.map((m, i) => (
            <Marker key={i} position={[m.latitude, m.longitude]}>
                {/* 👤 Employee name always visible */}
                <Tooltip
                permanent
                direction="top"
                offset={[0, -10]}
                className="employee-label"
                >
                {m.employee_name}
                </Tooltip>

                {/* ℹ️ Details on click */}
                <Popup>
                <div className="text-sm">
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
                </div>
                </Popup>
            </Marker>
            ))}

        </MapContainer>
      </div>
    </div>
  )
}
