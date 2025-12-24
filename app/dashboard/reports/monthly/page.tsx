'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function MonthlySummary() {
  const [rows, setRows] = useState<any[]>([])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    load()
  }, [month, year])

  async function load() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // 1️⃣ Get company ID
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!company) return

    // 2️⃣ Call RPC with REQUIRED params
    const { data, error } = await supabase.rpc(
      'report_monthly_summary',
      {
        p_company_id: company.id,
        p_month: month,
        p_year: year
      }
    )

    if (error) {
      console.error(error)
      return
    }

    setRows(data || [])
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        Monthly Attendance Summary
      </h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="border p-2 rounded"
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString('default', { month: 'long' })}
            </option>
          ))}
        </select>

        <select
          value={year}
          onChange={e => setYear(Number(e.target.value))}
          className="border p-2 rounded"
        >
          {[2024, 2025, 2026].map(y => (
            <option key={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <table className="w-full bg-white rounded-xl overflow-hidden">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Employee</th>
            <th>Code</th>
            <th>Present</th>
            <th>Absent</th>
            <th>Avg Hours / Day</th>
          </tr>
        </thead>

        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-gray-500">
                No data found
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-3">{r.employee_name}</td>
                <td>{r.employee_code}</td>
                <td>{r.present_days}</td>
                <td>{r.absent_days}</td>
                <td>{r.avg_work_hours ?? '-'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
