'use client'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function Attendance() {
  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Get company id of logged-in owner
      const { data: companies } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (!companies) return

      const { data } = await supabase
        .from('attendance')
        .select(`
          id,
          punch_type,
          punch_time,
          latitude,
          longitude,
          photo_path,
          employees ( name, employee_code )
        `)
        .eq('company_id', companies.id)
        .order('punch_time', { ascending: false })

      setRows(data || [])
    }

    load()
  }, [])

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
        {rows.map((r) => (
          <tr key={r.id}>
            <td>{r.employees?.name}</td>
            <td>{r.employees?.employee_code}</td>
            <td>{r.punch_type}</td>
            <td>{new Date(r.punch_time).toLocaleString('en-IN', {
                  timeZone: 'Asia/Kolkata'
                })}
            </td>

            <td>
              <a
                href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/attendance-photos/${r.photo_path}`}
                target="_blank"
              >
                View Photo
              </a>
            </td>

            <td>
              <a
                href={`https://www.openstreetmap.org/?mlat=${r.latitude}&mlon=${r.longitude}#map=18/${r.latitude}/${r.longitude}`}
                target="_blank"
              >
                View Map
              </a>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
