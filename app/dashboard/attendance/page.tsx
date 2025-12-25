'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

type AttendanceRow = {
  id: number
  punch_type: 'IN' | 'OUT'
  punch_time: string
  latitude: number
  longitude: number
  photo_path: string
  employees: {
    name: string | null
    employee_code: string | null
    department: string | null
    designation: string | null
  } | null
}

const PAGE_SIZE = 10
const DEBOUNCE_MS = 400

export default function Attendance() {
  const [rows, setRows] = useState<AttendanceRow[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)

  // 🔎 Filters
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [department, setDepartment] = useState('ALL')
  const [designation, setDesignation] = useState('ALL')

  const [departments, setDepartments] = useState<string[]>([])
  const [designations, setDesignations] = useState<string[]>([])

  // ⏳ Debounced values
  const [debouncedFilters, setDebouncedFilters] = useState({
    fromDate,
    toDate,
    name,
    code,
    department,
    designation
  })

  useEffect(() => {
    loadFilters()
  }, [])

  // ✅ Debounce filter changes
  useEffect(() => {
    const t = setTimeout(() => {
      setPage(1)
      setDebouncedFilters({
        fromDate,
        toDate,
        name,
        code,
        department,
        designation
      })
    }, DEBOUNCE_MS)

    return () => clearTimeout(t)
  }, [fromDate, toDate, name, code, department, designation])

  // 🔄 Load data when page OR debounced filters change
  useEffect(() => {
    loadAttendance()
  }, [page, debouncedFilters])

  async function loadFilters() {
    const { data } = await supabase
      .from('employees')
      .select('department, designation')

    if (data) {
      setDepartments([
        'ALL',
        ...Array.from(new Set(data.map(e => e.department).filter(Boolean)))
      ])
      setDesignations([
        'ALL',
        ...Array.from(new Set(data.map(e => e.designation).filter(Boolean)))
      ])
    }
  }

  async function loadAttendance() {
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
      .select(
        `
        id,
        punch_type,
        punch_time,
        latitude,
        longitude,
        photo_path,
        employees!inner (
          name,
          employee_code,
          department,
          designation
        )
      `,
        { count: 'exact' }
      )
      .eq('company_id', company.id)

    const f = debouncedFilters

    if (f.fromDate)
      query = query.gte('punch_time', `${f.fromDate}T00:00:00`)
    if (f.toDate)
      query = query.lte('punch_time', `${f.toDate}T23:59:59`)
    if (f.name) query = query.ilike('employees.name', `%${f.name}%`)
    if (f.code) query = query.ilike('employees.employee_code', `%${f.code}%`)
    if (f.department !== 'ALL')
      query = query.eq('employees.department', f.department)
    if (f.designation !== 'ALL')
      query = query.eq('employees.designation', f.designation)

    const from = (page - 1) * PAGE_SIZE
    const to = from + PAGE_SIZE - 1

    const { data, count } = await query
      .order('punch_time', { ascending: false })
      .range(from, to)
      .returns<AttendanceRow[]>()

    setRows(data ?? [])
    setTotal(count ?? 0)
  }

  const openMap = (lat: number, lng: number) => {
    window.open(
      `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}`,
      '_blank'
    )
  }

  const openPhoto = (path: string) => {
    const url = supabase.storage
      .from('attendance-photos')
      .getPublicUrl(path).data.publicUrl
    window.open(url, '_blank')
  }

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="p-4 md:p-6 flex flex-col h-full">
      <h1 className="text-xl md:text-2xl font-bold mb-2">Attendance</h1>

      {/* 🔎 Filters */}
      <div className="bg-white border rounded-xl p-2 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-7 gap-2">

          <input
            type="date"
            value={fromDate}
            onChange={e => setFromDate(e.target.value)}
            className="border p-2 rounded"
            placeholder="From"
          />

          <input
            type="date"
            value={toDate}
            onChange={e => setToDate(e.target.value)}
            className="border p-2 rounded"
            placeholder="To"
          />

          <input
            placeholder="Employee name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="border p-2 rounded"
          />

          <input
            placeholder="Employee code"
            value={code}
            onChange={e => setCode(e.target.value)}
            className="border p-2 rounded"
          />

          <select
            value={department}
            onChange={e => setDepartment(e.target.value)}
            className="border p-2 rounded"
          >
            {departments.map(d => (
              <option key={d} value={d}>
                {d === 'ALL' ? 'All Departments' : d}
              </option>
            ))}
          </select>

          <select
            value={designation}
            onChange={e => setDesignation(e.target.value)}
            className="border p-2 rounded"
          >
            {designations.map(d => (
              <option key={d} value={d}>
                {d === 'ALL' ? 'All Designations' : d}
              </option>
            ))}
          </select>

          <button
          onClick={() => {
            setFromDate('')
            setToDate('')
            setName('')
            setCode('')
            setDepartment('ALL')
            setDesignation('ALL')
          }}
          className="border p-2 rounded bg-red-500 text-white"
        >
          Clear Filters
        </button>

        </div>
      </div>

      {/* 📜 Table */}
      <div className="flex-1 overflow-auto border rounded-xl bg-white">
        <table className="min-w-[900px] w-full">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="text-center">Code</th>
              <th className="text-center">Dept</th>
              <th className="text-center">Designation</th>
              <th className="text-center">Type</th>
              <th className="text-center">Time</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-red-500">
                  No records found
                </td>
              </tr>
            ) : (
              rows.map(r => (
                <tr key={r.id} className="border-t">
                  <td className="p-2">{r.employees?.name ?? '-'}</td>
                  <td className="text-center">{r.employees?.employee_code ?? '-'}</td>
                  <td className="text-center">{r.employees?.department ?? '-'}</td>
                  <td className="text-center">{r.employees?.designation ?? '-'}</td>
                  <td className="text-center">{r.punch_type}</td>
                  <td className="text-center">{new Date(r.punch_time).toLocaleString()}</td>
                  <td className="space-x-2 text-center">
                    <button
                      onClick={() => openPhoto(r.photo_path)}
                      className="px-2 py-1 bg-blue-600 text-white rounded"
                    >
                      Photo
                    </button>
                    <button
                      onClick={() => openMap(r.latitude, r.longitude)}
                      className="px-2 py-1 bg-green-600 text-white rounded"
                    >
                      Map
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 🔢 Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage(p => p - 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="text-sm">
          Page {page} of {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage(p => p + 1)}
          className="px-4 py-2 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}
