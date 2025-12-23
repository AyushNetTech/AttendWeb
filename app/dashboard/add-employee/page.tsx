'use client'

import { supabase } from '@/lib/supabaseClient'
import { notifyError, notifySuccess } from '@/lib/notify'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddEmployee() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    employee_code: '',
    designation: '',
    department: '',
    password: ''
  })

  const submit = async () => {
    if (!form.name || !form.employee_code || !form.password) {
      notifyError('Name, Employee Code and Password are required')
      return
    }

    setLoading(true)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      notifyError('Not authenticated')
      setLoading(false)
      return
    }

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!company) {
      notifyError('Company not found')
      setLoading(false)
      return
    }

    const { error } = await supabase.from('employees').insert({
      name: form.name,
      employee_code: form.employee_code,
      password: form.password,
      designation: form.designation,
      department: form.department,
      company_id: company.id,
      is_active: true
    })

    if (error) {
      notifyError(
        error.code === '23505'
          ? 'Employee code already exists in your company'
          : error.message
      )
      setLoading(false)
      return
    }

    notifySuccess('Employee added successfully')

    setTimeout(() => {
      router.push('/dashboard/employees')
    }, 800)

    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-8">
        <h1 className="text-2xl font-semibold mb-6">
          Add New Employee
        </h1>

        <div className="grid grid-cols-2 gap-4">
          <Input label="Employee Name" onChange={v => setForm({ ...form, name: v })} />
          <Input label="Employee Code" onChange={v => setForm({ ...form, employee_code: v })} />
          <Input label="Designation" onChange={v => setForm({ ...form, designation: v })} />
          <Input label="Department" onChange={v => setForm({ ...form, department: v })} />

          <div className="col-span-2">
            <Input
              label="Password"
              type="password"
              onChange={v => setForm({ ...form, password: v })}
            />
          </div>
        </div>

        <div className="flex justify-end mt-8 gap-4">
          <button
            onClick={() => router.back()}
            className="px-6 py-2 rounded-lg border hover:bg-gray-100"
          >
            Cancel
          </button>

          <button
            onClick={submit}
            disabled={loading}
            className={`px-6 py-2 rounded-lg text-white font-medium transition
              ${loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {loading ? 'Creating...' : 'Create Employee'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ---------- Reusable Input ---------- */

function Input({
  label,
  type = 'text',
  onChange
}: {
  label: string
  type?: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">
        {label}
      </label>
      <input
        type={type}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-lg border px-4 py-2
          focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  )
}
