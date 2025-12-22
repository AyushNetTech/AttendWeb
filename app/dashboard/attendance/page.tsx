'use client'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function Attendance() {
  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('attendance')
      .select(`
        id,
        punch_type,
        punch_time,
        latitude,
        longitude,
        photo_path,
        employees (
          name,
          employee_code
        )
      `)
      .order('punch_time', { ascending: false })
      .then(({ data }) => setRows(data || []))
  }, [])

  const photoUrl = (path: string) =>
    supabase.storage.from('attendance-photos').getPublicUrl(path).data.publicUrl

  const mapUrl = (lat:number, lng:number) =>
    `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=18/${lat}/${lng}`

  return (
    <table border={1} cellPadding={8}>
      <thead>
        <tr>
          <th>Name</th>
          <th>Code</th>
          <th>Type</th>
          <th>Time</th>
          <th>Photo</th>
          <th>Map</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id}>
            <td>{r.employees?.name}</td>
            <td>{r.employees?.employee_code}</td>
            <td>{r.punch_type}</td>
            <td>{new Date(r.punch_time).toLocaleString()}</td>
            <td>
              <a href={photoUrl(r.photo_path)} target="_blank">
                View Photo
              </a>
            </td>
            <td>
              <a href={mapUrl(r.latitude, r.longitude)} target="_blank">
                View Map
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
