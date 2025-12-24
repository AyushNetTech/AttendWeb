'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import * as XLSX from 'xlsx'

type Row = {
  punch_time: string
  punch_type: string
  employees: {
    name: string | null
    employee_code: string | null
    department: string | null
    designation: string | null
  }
}

export default function Reports() {
  const [rows, setRows] = useState<Row[]>([])
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [format, setFormat] = useState('FORMAT_A')

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .single()

    if (!company) return

    let query = supabase
      .from('attendance')
      .select(`
        punch_time,
        punch_type,
        employees!inner (
          name,
          employee_code,
          department,
          designation
        )
      `)
      .eq('company_id', company.id)

    if (fromDate) query = query.gte('punch_time', `${fromDate}T00:00:00`)
    if (toDate) query = query.lte('punch_time', `${toDate}T23:59:59`)

    const { data } = await query.order('punch_time', { ascending: true })
    setRows(data || [])
  }

  function buildExportData() {
    if (format === 'FORMAT_A') {
      return rows.map(r => ({
        Name: r.employees?.name,
        Code: r.employees?.employee_code,
        Date: new Date(r.punch_time).toLocaleDateString(),
        Type: r.punch_type,
        Time: new Date(r.punch_time).toLocaleTimeString()
      }))
    }

    if (format === 'FORMAT_B') {
      return rows.map(r => ({
        Date: new Date(r.punch_time).toLocaleDateString(),
        Name: r.employees?.name,
        Department: r.employees?.department,
        Type: r.punch_type,
        Time: new Date(r.punch_time).toLocaleTimeString()
      }))
    }

    return []
  }

  function exportExcel() {
    const data = buildExportData()
    if (data.length === 0) return alert('No data')

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance')

    XLSX.writeFile(workbook, 'attendance-report.xlsx')
  }

  function exportCSV() {
    const data = buildExportData()
    if (data.length === 0) return alert('No data')

    const worksheet = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(worksheet)

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = 'attendance-report.csv'
    a.click()
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border p-2" />
        <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border p-2" />

        <select value={format} onChange={e => setFormat(e.target.value)} className="border p-2">
          <option value="FORMAT_A">Format A (Name, Code, Date, Type)</option>
          <option value="FORMAT_B">Format B (Date, Dept, Type)</option>
        </select>

        <button onClick={loadData} className="bg-blue-600 text-white rounded px-4">
          Load Data
        </button>
      </div>

      <div className="space-x-3">
        <button onClick={exportExcel} className="bg-green-600 text-white px-4 py-2 rounded">
          Export Excel
        </button>

        <button onClick={exportCSV} className="bg-gray-700 text-white px-4 py-2 rounded">
          Export CSV
        </button>
      </div>
    </div>
  )
}
