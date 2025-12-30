'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import dayjs from 'dayjs'
import * as XLSX from 'xlsx-js-style'
import {
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Select,
  TextField
} from '@mui/material'

/* ---------------- TYPES ---------------- */

type Template = {
  id: 'master' | 'payroll'
  name: string
  description: string
}

/* ---------------- TEMPLATES ---------------- */

const templates: Template[] = [
  {
    id: 'master',
    name: 'Master Attendance (Monthly)',
    description: 'Date-wise IN/OUT, working hours & overtime'
  },
  {
    id: 'payroll',
    name: 'Payroll / Salary Sheet',
    description: 'Salary-ready monthly summary'
  }
]

/* ---------------- HELPERS ---------------- */

function isWeekend(date: dayjs.Dayjs) {
  return date.day() === 0 || date.day() === 6
}

const WEEKEND_FILL = {
  fill: {
    fgColor: { rgb: 'ff6666' } // light red
  }
}


function hoursBetween(inTime?: string, outTime?: string) {
  if (!inTime || !outTime) return 0
  const start = dayjs(inTime)
  const end = dayjs(outTime)
  return Math.max(0, end.diff(start, 'minute') / 60)
}

/* ---------------- MASTER TEMPLATE ---------------- */

function buildMasterAttendanceSheet(data: any[], month: string) {
  const daysInMonth = dayjs(month).daysInMonth()
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const header = [
    'Emp Code',
    'Name',
    'Department',
    ...days.map(d => d.toString()),
    'Total Hours',
    'Overtime'
  ]

  const rows: any[][] = [header]

  const grouped: Record<string, any[]> = {}

  data.forEach(r => {
    const emp = r.employees
    if (!emp) return
    if (!grouped[emp.id]) grouped[emp.id] = []
    grouped[emp.id].push(r)
  })

  Object.values(grouped).forEach(records => {
    const emp = records[0].employees
    const row: any[] = [
      emp.employee_code,
      emp.name,
      emp.department
    ]

    let totalHours = 0

    days.forEach(day => {
      const punches = records.filter(r =>
        dayjs(r.punch_time).date() === day
      )

      if (!punches.length) {
        row.push('A')
        return
      }

      const sorted = punches
        .map(p => p.punch_time)
        .sort()

      const firstIn = sorted[0]
      const lastOut = sorted[sorted.length - 1]

      const hours = hoursBetween(firstIn, lastOut)
      totalHours += hours

      row.push(
        `${dayjs(firstIn).format('HH:mm')} - ${dayjs(lastOut).format('HH:mm')}`
      )
    })

    row.push(totalHours.toFixed(2))
    row.push(Math.max(0, totalHours - 240).toFixed(2)) // 240 = 8h × 30 days

    rows.push(row)
  })

  return rows
}

/* ---------------- PAYROLL TEMPLATE ---------------- */

function buildPayrollSheet(data: any[], month: string) {
  const header = [
    'Emp Code',
    'Name',
    'Department',
    'Working Days',
    'Total Hours',
    'Overtime Hours'
  ]

  const rows: any[][] = [header]

  const grouped: Record<string, any[]> = {}

  data.forEach(r => {
    const emp = r.employees
    if (!emp) return
    if (!grouped[emp.id]) grouped[emp.id] = []
    grouped[emp.id].push(r)
  })

  Object.values(grouped).forEach(records => {
    const emp = records[0].employees

    const daysWorked = new Set(
      records.map(r => dayjs(r.punch_time).format('YYYY-MM-DD'))
    ).size

    let totalHours = 0

    Object.values(
      records.reduce((acc: any, r: any) => {
        const d = dayjs(r.punch_time).format('YYYY-MM-DD')
        acc[d] = acc[d] || []
        acc[d].push(r.punch_time)
        return acc
      }, {})
    ).forEach((times: any[]) => {
      times.sort()
      totalHours += hoursBetween(times[0], times[times.length - 1])
    })

    rows.push([
      emp.employee_code,
      emp.name,
      emp.department,
      daysWorked,
      totalHours.toFixed(2),
      Math.max(0, totalHours - daysWorked * 8).toFixed(2)
    ])
  })

  return rows
}

/* ---------------- PAGE ---------------- */

export default function ReportsPage() {
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'))
  const [template, setTemplate] = useState<'master' | 'payroll'>('master')
  const [loading, setLoading] = useState(false)

  async function exportExcel() {
    setLoading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', userData.user.id)
        .single()

      if (!company) return

      const start = dayjs(month).startOf('month').format('YYYY-MM-DD')
      const end = dayjs(month).endOf('month').format('YYYY-MM-DD')

      const { data } = await supabase
        .from('attendance')
        .select(`
          punch_time,
          employees (
            id,
            name,
            employee_code,
            department
          )
        `)
        .eq('company_id', company.id)
        .gte('punch_time', `${start}T00:00:00`)
        .lte('punch_time', `${end}T23:59:59`)

      if (!data) return

      const sheetData =
        template === 'master'
          ? buildMasterAttendanceSheet(data, month)
          : buildPayrollSheet(data, month)

      const wb = XLSX.utils.book_new()
      const ws = XLSX.utils.aoa_to_sheet(sheetData)

          if (template === 'master') {
            const daysInMonth = dayjs(month).daysInMonth()
            const monthStart = dayjs(month).startOf('month')

            // Date columns start after:
            // Emp Code | Name | Department = 3 columns
            for (let day = 1; day <= daysInMonth; day++) {
              const date = monthStart.add(day - 1, 'day')

              if (!isWeekend(date)) continue

              const colIndex = 3 + (day - 1)
              const colLetter = XLSX.utils.encode_col(colIndex)

              // Apply style to all rows (header + data)
              for (let row = 0; row < sheetData.length; row++) {
                const cellAddress = `${colLetter}${row + 1}`
                const cell = ws[cellAddress]

                if (cell) {
                  cell.s = WEEKEND_FILL
                }
              }
            }
          }



      XLSX.utils.book_append_sheet(
        wb,
        ws,
        template === 'master' ? 'Master Attendance' : 'Payroll'
      )

      XLSX.writeFile(
        wb,
        `${template}_${month}.xlsx`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reports</h1>

      {/* Filters */}
      <Box className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <TextField
          type="month"
          label="Month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />

        <Select
          value={template}
          onChange={e => setTemplate(e.target.value as any)}
        >
          {templates.map(t => (
            <MenuItem key={t.id} value={t.id}>
              {t.name}
            </MenuItem>
          ))}
        </Select>

        <Button
          variant="contained"
          disabled={loading}
          onClick={exportExcel}
        >
          {loading ? 'Generating…' : 'Export Excel'}
        </Button>
      </Box>

      {/* Template Preview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(t => (
          <Card
            key={t.id}
            className={`cursor-pointer border ${
              template === t.id ? 'border-blue-600' : ''
            }`}
            onClick={() => setTemplate(t.id)}
          >
            <CardContent>
              <h2 className="font-semibold">{t.name}</h2>
              <p className="text-sm text-gray-500">{t.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
