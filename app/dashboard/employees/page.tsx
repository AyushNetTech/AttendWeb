'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { Checkbox, FormControlLabel, FormGroup } from '@mui/material'
import { Plus, Filter } from 'lucide-react'

export default function EmployeesPage() {
  const router = useRouter()

  type Employee = {
  id: string
  name: string
  employee_code: string
  designation: string
  department: string
}

const [employees, setEmployees] = useState<any[]>([])
const [loading, setLoading] = useState(true)

const [selectedDepartments, setSelectedDepartments] = useState<string[]>([])
const [selectedDesignations, setSelectedDesignations] = useState<string[]>([])
const [search, setSearch] = useState('')

  const [showFilters, setShowFilters] = useState(false)

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

  const departments = useMemo<string[]>(
  () => Array.from(new Set(employees.map(e => e.department).filter(Boolean))),
  [employees]
)

const designations = useMemo<string[]>(() => {
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
      if (search && !(`${e.name} ${e.employee_code}`.toLowerCase().includes(search.toLowerCase())))
        return false
      return true
    })
  }, [employees, selectedDepartments, selectedDesignations, search])

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-gray-50 border-b px-4 py-3 flex justify-between items-center">
        <h1 className="text-xl sm:text-2xl font-bold">Employees</h1>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(v => !v)}
            className="sm:hidden flex items-center gap-2 px-3 py-2 border rounded-lg"
          >
            <Filter size={16} /> Filters
          </button>

          <button
            onClick={() => router.push('/dashboard/add-employee')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            <Plus size={16} /> Add
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Filters */}
        <aside className="hidden sm:block w-72 bg-white border-r p-5 overflow-y-auto">
          <Filters {...{
            departments,
            designations,
            selectedDepartments,
            selectedDesignations,
            setSelectedDepartments,
            setSelectedDesignations,
            search,
            setSearch
          }} />
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Mobile Filters */}
          {showFilters && (
            <div className="sm:hidden mb-4 bg-white border rounded-xl p-4">
              <Filters {...{
                departments,
                designations,
                selectedDepartments,
                selectedDesignations,
                setSelectedDepartments,
                setSelectedDesignations,
                search,
                setSearch
              }} />
            </div>
          )}

          {loading ? (
            <p>Loading...</p>
          ) : !shouldShowEmployees ? (
            <p className="text-gray-500 text-sm">
              Select Department & Designation to view employees.
            </p>
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
        </main>
      </div>
    </div>
  )
}

/* ---------- Filters ---------- */
function Filters({
  departments,
  designations,
  selectedDepartments,
  selectedDesignations,
  setSelectedDepartments,
  setSelectedDesignations,
  search,
  setSearch
}: any) {
  return (
    <>
      <p className="font-semibold mb-2">Filters</p>

      <p className="text-sm font-medium mb-1">Department</p>
      <FormGroup>
        {departments.map((dep: string) => (
          <FormControlLabel
            key={dep}
            control={
              <Checkbox
                size="small"
                checked={selectedDepartments.includes(dep)}
                onChange={() =>
                  setSelectedDepartments((prev: string[]) =>
                    prev.includes(dep)
                      ? prev.filter((d: string) => d !== dep)
                      : [...prev, dep]
                  )
                }
              />
            }
            label={<span className="text-sm">{dep}</span>}
          />
        ))}


      </FormGroup>

      {selectedDepartments.length > 0 && (
        <>
          <p className="text-sm font-medium mt-3 mb-1">Designation</p>
          <FormGroup>
            {designations.map((des: string) => (
            <FormControlLabel
              key={des}
              control={
                <Checkbox
                  size="small"
                  checked={selectedDesignations.includes(des)}
                  onChange={() =>
                    setSelectedDesignations((prev: string[]) =>
                      prev.includes(des)
                        ? prev.filter((d: string) => d !== des)
                        : [...prev, des]
                    )
                  }
                />
              }
              label={<span className="text-sm">{des}</span>}
            />
          ))}


          </FormGroup>
        </>
      )}

      <input
        value={search}
        onChange={e => setSearch(e.target.value)}
        placeholder="Search name or code"
        className="mt-3 w-full h-10 rounded-lg border px-3 text-sm"
      />
    </>
  )
}

/* ---------- Employee Card ---------- */
function EmployeeCard({ emp, onEdit }: any) {
  return (
    <div className="bg-white p-4 rounded-2xl border shadow-sm flex flex-col sm:flex-row justify-between gap-3">
      <div>
        <p className="font-semibold">{emp.name}</p>
        <p className="text-sm text-gray-500">
          {emp.employee_code} · {emp.designation} · {emp.department}
        </p>
      </div>

      <button onClick={onEdit} className="text-blue-600 font-medium self-start sm:self-center">
        Edit
      </button>
    </div>
  )
}
