'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Attendance() {
  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (!company) return

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
        .eq('company_id', company.id)
        .order('punch_time', { ascending: false })

      setRows(data || [])
    }

    load()
  }, [])

  const openMap = (lat: number, lng: number) => {
    window.open(`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}`, '_blank')
  }

  const openPhoto = (path: string) => {
    const url = supabase.storage
      .from('attendance-photos')
      .getPublicUrl(path).data.publicUrl
    window.open(url, '_blank')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Page title (fixed) */}
      <h1 className="text-2xl font-bold mb-4">Attendance</h1>

      {/* Scrollable table container */}
      <div className="flex-1 overflow-y-auto rounded-xl bg-white shadow">
        <table className="w-full">
          <thead className="sticky top-0 bg-gray-100 z-10">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="text-left">Code</th>
              <th className="text-left">Type</th>
              <th className="text-left">Time</th>
              <th className="text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.map(r => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-3">{r.employees.name}</td>
                <td>{r.employees.employee_code}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      r.punch_type === 'IN'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {r.punch_type}
                  </span>
                </td>
                <td>{new Date(r.punch_time).toLocaleString()}</td>
                <td className="space-x-2">
                  <button
                    onClick={() => openPhoto(r.photo_path)}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm"
                  >
                    Photo
                  </button>
                  <button
                    onClick={() => openMap(r.latitude, r.longitude)}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm"
                  >
                    Map
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Empty state */}
        {!rows.length && (
          <div className="p-6 text-center text-gray-500">
            No attendance records found
          </div>
        )}
      </div>
    </div>
  )
}
