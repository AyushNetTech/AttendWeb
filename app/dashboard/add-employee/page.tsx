'use client'

import { supabase } from '@/lib/supabaseClient'
import { notifyError, notifySuccess } from '@/lib/notify'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff } from 'lucide-react'

export default function AddEmployee() {
  const router = useRouter()

  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [passwordError, setPasswordError] = useState('')

  const [form, setForm] = useState({
    name: '',
    employee_code: '',
    designation: '',
    department: '',
    password: ''
  })

  /* ---------- PASSWORD VALIDATION ---------- */
  const validatePassword = (value: string) => {
    if (value.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return false
    }
    setPasswordError('')
    return true
  }

  const submit = async () => {
    if (!form.name || !form.employee_code || !form.password) {
      notifyError('Name, Employee Code and Password are required')
      return
    }

    if (!validatePassword(form.password)) {
      notifyError('Please fix password error')
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
    <div className="max-w-2xl mx-auto px-4 py-6">
      <div className="bg-white rounded-2xl shadow-md p-6 sm:p-8">
        <h1 className="text-2xl font-semibold mb-6">
          Add New Employee
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Employee Name" onChange={v => setForm({ ...form, name: v })} />
          <Input label="Employee Code" onChange={v => setForm({ ...form, employee_code: v })} />
          <Input label="Designation" onChange={v => setForm({ ...form, designation: v })} />
          <Input label="Department" onChange={v => setForm({ ...form, department: v })} />

          {/* PASSWORD */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => {
                  setForm({ ...form, password: e.target.value })
                  validatePassword(e.target.value)
                }}
                className={`w-full rounded-lg border px-4 py-2 pr-10
                  focus:outline-none focus:ring-2
                  ${passwordError
                    ? 'border-red-500 focus:ring-red-400'
                    : 'focus:ring-blue-500'
                  }`}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {passwordError && (
              <p className="text-sm text-red-500 mt-1">
                {passwordError}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-end mt-8 gap-3">
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
