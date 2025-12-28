'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material'
import { Plus } from 'lucide-react'

export default function EmployeesPage() {
  const router = useRouter()

  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
  const [selectedDesignations, setSelectedDesignations] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const shouldShowEmployees =
  selectedDepartments.length > 0 &&
  selectedDesignations.length > 0


  useEffect(() => {
    loadEmployees()
  }, [])

  async function loadEmployees() {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!company) return

    const { data } = await supabase
      .from('employees')
      .select('*')
      .eq('company_id', company.id)
      .order('created_at', { ascending: false })

    setEmployees(data || [])
    setLoading(false)
  }

  /* ---------- Filter helpers ---------- */
  const departments = useMemo(
    () => Array.from(new Set(employees.map(e => e.department).filter(Boolean))),
    [employees]
  )

  const designations = useMemo(() => {
    if (!selectedDepartments.length) return []
    return Array.from(
      new Set(
        employees
          .filter(e => selectedDepartments.includes(e.department))
          .map(e => e.designation)
          .filter(Boolean)
      )
    )
  }, [employees, selectedDepartments])

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => {
      if (selectedDepartments.length && !selectedDepartments.includes(e.department)) return false
      if (selectedDesignations.length && !selectedDesignations.includes(e.designation)) return false
      if (search) {
        const s = search.toLowerCase()
        if (!(`${e.name} ${e.employee_code}`.toLowerCase().includes(s))) return false
      }
      return true
    })
  }, [employees, selectedDepartments, selectedDesignations, search])

  return (
    <div className="h-[calc(100vh-64px)] flex">
      {/* Filters Sidebar */}
      <aside className="w-72 shrink-0 bg-white border-r px-5 py-6 overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>

        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Department</p>
          <FormGroup>
            {departments.map(dep => (
              <FormControlLabel
                key={dep}
                control={
                  <Checkbox
                    size="small"
                    checked={selectedDepartments.includes(dep)}
                    onChange={() =>
                      setSelectedDepartments(prev =>
                        prev.includes(dep)
                          ? prev.filter(d => d !== dep)
                          : [...prev, dep]
                      )
                    }
                  />
                }
                label={<span className="text-sm">{dep}</span>}
              />
            ))}
          </FormGroup>
        </div>

        {selectedDepartments.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-medium mb-2">Designation</p>
            <FormGroup>
              {designations.map(des => (
                <FormControlLabel
                  key={des}
                  control={
                    <Checkbox
                      size="small"
                      checked={selectedDesignations.includes(des)}
                      onChange={() =>
                        setSelectedDesignations(prev =>
                          prev.includes(des)
                            ? prev.filter(d => d !== des)
                            : [...prev, des]
                        )
                      }
                    />
                  }
                  label={<span className="text-sm">{des}</span>}
                />
              ))}
            </FormGroup>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm font-medium mb-2">Name / Code</p>
          <input
            placeholder="Search employee"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 rounded-lg border px-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          onClick={() => {
            setSelectedDepartments([])
            setSelectedDesignations([])
            setSearch('')
          }}
          className="text-sm text-blue-600 hover:underline"
        >
          Clear all filters
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-gray-50 border-b px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Employees</h1>
          <button
            onClick={() => router.push('/dashboard/add-employee')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={16} /> Add Employee
          </button>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <p>Loading...</p>
          ) : !shouldShowEmployees ? (
            <div className="text-gray-500 text-sm">
              Select Department and Designation to view employees.
            </div>
          ) : filteredEmployees.length === 0 ? (
            <p className="text-gray-500">No employees found.</p>
          ) : (
            <div className="grid gap-4">
              {filteredEmployees.map(emp => (
                <EmployeeCard
                  key={emp.id}
                  emp={emp}
                  onEdit={() => router.push(`/dashboard/employees/${emp.id}`)}
                />
              ))}
            </div>
          )}

        </div>
      </main>
    </div>
  )
}

function EmployeeCard({ emp, onEdit }: any) {
  return (
    <div className="bg-white p-5 rounded-2xl border shadow-sm flex justify-between items-center hover:shadow transition">
      <div>
        <p className="font-semibold text-gray-900">{emp.name}</p>
        <p className="text-sm text-gray-500 mt-1">
          Code: {emp.employee_code} · {emp.designation} · {emp.department}
        </p>
      </div>

      <button onClick={onEdit} className="text-blue-600 font-medium hover:underline">
        Edit
      </button>
    </div>
  )
}
