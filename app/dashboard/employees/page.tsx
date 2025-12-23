'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

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

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employee Management</h1>
        <button
          onClick={() => router.push('/dashboard/add-employee')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg"
        >
          + Add Employee
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <p>Loading...</p>
      ) : employees.length === 0 ? (
        <p className="text-gray-500">No employees added yet.</p>
      ) : (
        <div className="grid gap-4">
          {employees.map(emp => (
            <EmployeeCard
              key={emp.id}
              emp={emp}
              onEdit={() => router.push(`/dashboard/employees/${emp.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function EmployeeCard({ emp, onEdit }: any) {
  return (
    <div className="bg-white p-5 rounded-xl shadow flex justify-between items-center">
      <div>
        <p className="font-semibold">{emp.name}</p>
        <p className="text-sm text-gray-500">
          Code: {emp.employee_code} · {emp.designation} · {emp.department}
        </p>
      </div>

      <button
        onClick={onEdit}
        className="text-blue-600 font-medium"
      >
        Edit
      </button>
    </div>
  )
}
