'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type MasterRow = {
  employee_name: string
  attendance_date: string
  in_time: string | null
  out_time: string | null
  work_hours: number | null
}

export default function MasterAttendance() {
  const [rows, setRows] = useState<MasterRow[]>([])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    load()
  }, [month, year])

  async function load() {
    setLoading(true)

    const { data: auth } = await supabase.auth.getUser()
    if (!auth?.user) {
      setLoading(false)
      return
    }

    const { data: company, error } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', auth.user.id)
      .maybeSingle()

    if (!company || error) {
      console.error('Company not found')
      setLoading(false)
      return
    }

    const { data } = await supabase.rpc('report_master_attendance', {
      p_company_id: company.id,
      p_month: month,
      p_year: year
    })

    setRows(data || [])
    setLoading(false)
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">
        Master Attendance Report
      </h1>

      {/* Filters */}
      <div className="flex gap-4 mb-4">
        <select
          value={month}
          onChange={e => setMonth(Number(e.target.value))}
          className="border p-2 rounded"
        >
          {Array.from({ length: 12 }, (_, i) => (
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
          {[2023, 2024, 2025].map(y => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-auto border rounded-xl bg-white">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Employee</th>
              <th>Date</th>
              <th>IN</th>
              <th>OUT</th>
              <th>Work Hours</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  No data found
                </td>
              </tr>
            ) : (
              rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="p-3">{r.employee_name}</td>
                  <td>{r.attendance_date}</td>
                  <td>{r.in_time ?? '-'}</td>
                  <td>{r.out_time ?? '-'}</td>
                  <td>{r.work_hours?.toFixed(2) ?? '0.00'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
