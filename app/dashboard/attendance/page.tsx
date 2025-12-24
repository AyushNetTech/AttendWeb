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

  useEffect(() => {
    loadFilters()
  }, [])

  useEffect(() => {
    loadAttendance()
  }, [page, fromDate, toDate, name, code, department, designation])

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


    // 📅 Date range filter
    if (fromDate)
      query = query.gte('punch_time', `${fromDate}T00:00:00`)
    if (toDate)
      query = query.lte('punch_time', `${toDate}T23:59:59`)

    if (name) query = query.ilike('employees.name', `%${name}%`)
    if (code) query = query.ilike('employees.employee_code', `%${code}%`)
    if (department !== 'ALL')
      query = query.eq('employees.department', department)
    if (designation !== 'ALL')
      query = query.eq('employees.designation', designation)

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
    <div className="p-6 flex flex-col h-full">
      <h1 className="text-2xl font-bold mb-4">Attendance</h1>

      {/* 🔎 Filters */}
      <div className="bg-white border rounded-xl p-4 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">

          {/* From Date */}
          <div>
            <label className="block text-sm font-medium mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* To Date */}
          <div>
            <label className="block text-sm font-medium mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={e => setToDate(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Employee Name */}
          <div>
            <label className="block text-sm font-medium mb-1">Employee Name</label>
            <input
              placeholder="Search by name"
              value={name}
              onChange={e => setName(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Employee Code */}
          <div>
            <label className="block text-sm font-medium mb-1">Employee Code</label>
            <input
              placeholder="Search by code"
              value={code}
              onChange={e => setCode(e.target.value)}
              className="border p-2 rounded w-full"
            />
          </div>

          {/* Department */}
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              value={department}
              onChange={e => setDepartment(e.target.value)}
              className="border p-2 rounded w-full"
            >
              {departments.map(d => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Designation */}
          <div>
            <label className="block text-sm font-medium mb-1">Designation</label>
            <select
              value={designation}
              onChange={e => setDesignation(e.target.value)}
              className="border p-2 rounded w-full"
            >
              {designations.map(d => (
                <option key={d} value={d}>
                  {d === 'ALL' ? 'All Designations' : d}
                </option>
              ))}
            </select>
          </div>

          {/* Buttons */}
          <div className="flex items-end gap-2">
            <button
              onClick={() => setPage(1)}
              className="bg-blue-600 text-white rounded px-4 py-2 w-full"
            >
              Apply
            </button>

            <button
              onClick={() => {
                setFromDate('')
                setToDate('')
                setName('')
                setCode('')
                setDepartment('ALL')
                setDesignation('ALL')
                setPage(1)
              }}
              className="border rounded px-4 py-2 w-full"
            >
              Clear
            </button>
          </div>

        </div>
      </div>


      {/* 📜 Scrollable Table */}
      <div className="flex-1 overflow-auto border rounded-xl bg-white">
        <table className="w-full">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="p-3">Name</th>
              <th>Code</th>
              <th>Dept</th>
              <th>Designation</th>
              <th>Type</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="p-6 text-center text-gray-500 italic"
                >
                  No attendance records found
                </td>
              </tr>
            ) : (
              rows.map(r => {
                const emp = r.employees


                return (
                  <tr key={r.id} className="border-t">
                    <td className="p-3">{emp?.name || '-'}</td>
                    <td>{emp?.employee_code || '-'}</td>
                    <td>{emp?.department || '-'}</td>
                    <td>{emp?.designation || '-'}</td>
                    <td>{r.punch_type}</td>
                    <td>{new Date(r.punch_time).toLocaleString()}</td>
                    <td className="space-x-2">
                      <button
                        onClick={() => openPhoto(r.photo_path)}
                        className="px-3 py-1 bg-blue-600 text-white rounded"
                      >
                        Photo
                      </button>
                      <button
                        onClick={() => openMap(r.latitude, r.longitude)}
                        className="px-3 py-1 bg-green-600 text-white rounded"
                      >
                        Map
                      </button>
                    </td>
                  </tr>
                )
              })

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

        <span>
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
