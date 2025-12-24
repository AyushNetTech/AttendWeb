'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LateEarlyReport() {
  const [rows, setRows] = useState<any[]>([])

  useEffect(() => {
    load()
  }, [])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!company) return

    const { data } = await supabase.rpc(
      'report_late_early',
      { p_company_id: company.id }
    )

    setRows(data || [])
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        Late / Early Attendance
      </h1>

      <table className="w-full bg-white rounded-xl">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Employee</th>
            <th>Date</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="p-3">{r.employee_name}</td>
              <td>{r.date}</td>
              <td>{r.type}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
