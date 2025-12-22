'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

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

  const openMap = (lat:number, lng:number) => {
    window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}`, '_blank')
  }

  const openPhoto = (path:string) => {
    const url = supabase.storage
      .from('attendance-photos')
      .getPublicUrl(path).data.publicUrl
    window.open(url, '_blank')
  }

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Attendance</h1>

      <table className="w-full bg-white rounded-xl shadow overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Name</th>
            <th>Code</th>
            <th>Type</th>
            <th>Time</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} className="border-t">
              <td className="p-3">{r.employees.name}</td>
              <td>{r.employees.employee_code}</td>
              <td>{r.punch_type}</td>
              <td>{new Date(r.punch_time).toLocaleString()}</td>
              <td className="space-x-2">
                <button
                  onClick={()=>openPhoto(r.photo_path)}
                  className="px-3 py-1 bg-blue-600 text-white rounded"
                >
                  Photo
                </button>
                <button
                  onClick={()=>openMap(r.latitude, r.longitude)}
                  className="px-3 py-1 bg-green-600 text-white rounded"
                >
                  Map
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}
