'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function DailyAttendance() {
  const [rows, setRows] = useState<any[]>([])
  const [date, setDate] = useState(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    load()
  }, [date])

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
      'report_daily_attendance',
      {
        p_company_id: company.id,
        p_date: date,
      }
    )

    setRows(data || [])
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Daily Attendance</h1>

      <input
        type="date"
        value={date}
        onChange={e => setDate(e.target.value)}
        className="border p-2 rounded mb-4"
      />

      <table className="w-full bg-white rounded-xl">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3">Employee</th>
            <th>Code</th>
            <th>Status</th>
            <th>In</th>
            <th>Out</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} className="border-t">
              <td className="p-3">{r.employee_name}</td>
              <td>{r.employee_code}</td>
              <td>{r.status}</td>
              <td>{r.in_time}</td>
              <td>{r.out_time}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
