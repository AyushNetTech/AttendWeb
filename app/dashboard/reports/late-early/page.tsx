'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LateEarlyReport() {
  const [rows, setRows] = useState<any[]>([])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    load()
  }, [month, year])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    const { data } = await supabase.rpc('report_late_early', {
      p_company_id: company.id,
      p_month: month,
      p_year: year
    })

    setRows(data || [])
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Late & Early Report</h1>

      <table className="w-full bg-white rounded-xl">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Employee</th>
            <th>Date</th>
            <th>Late By (min)</th>
            <th>Early By (min)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="p-3">{r.employee_name}</td>
              <td>{r.attendance_date}</td>
              <td>{r.late_minutes || 0}</td>
              <td>{r.early_minutes || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
