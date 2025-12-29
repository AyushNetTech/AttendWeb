'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useParams } from 'next/navigation'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { toast } from 'react-toastify'

export default function EditEmployee() {
  const { id } = useParams()
  const router = useRouter()

  const [form, setForm] = useState<any>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadEmployee()
  }, [])

  async function loadEmployee() {
    const { data } = await supabase
      .from('employees')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    setForm(data)
  }

  async function updateEmployee() {
    setLoading(true)

    const { error } = await supabase
      .from('employees')
      .update({
        name: form.name,
        employee_code: form.employee_code,
        password: form.password,
        designation: form.designation,
        department: form.department
      })
      .eq('id', id)

    setLoading(false)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Employee updated successfully')
    router.push('/dashboard/employees')
  }

  async function deleteEmployee() {
    const ok = confirm('Are you sure you want to delete this employee?')
    if (!ok) return

    const { error } = await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error(error.message)
      return
    }

    toast.success('Employee deleted')
    router.push('/dashboard/employees')
  }

  if (!form) return null

  return (
    <div className="max-w-2xl mx-auto px-3 py-4">
  {/* Header */}
  <div className="flex items-center gap-4 mb-5">
    <button
      onClick={() => router.back()}
      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-gray-100"
    >
      <ArrowLeft size={16} /> Back
    </button>

    <h1 className="text-xl sm:text-2xl font-semibold">Edit Employee</h1>
  </div>

  <div className="bg-white rounded-2xl border shadow-sm p-5">
    <div className="grid gap-4">
      <Field label="Employee Name" value={form.name} onChange={v => setForm({ ...form, name: v })} />
      <Field label="Employee Code" value={form.employee_code} onChange={v => setForm({ ...form, employee_code: v })} />

      {/* Password */}
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={form.password || ''}
            onChange={e => setForm({ ...form, password: e.target.value })}
            className="w-full h-11 rounded-xl border px-4 pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      <Field label="Designation" value={form.designation || ''} onChange={v => setForm({ ...form, designation: v })} />
      <Field label="Department" value={form.department || ''} onChange={v => setForm({ ...form, department: v })} />
    </div>

    {/* Actions */}
    <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
      <button
        onClick={deleteEmployee}
        className="text-red-600 text-sm font-medium"
      >
        Delete Employee
      </button>

      <button
        onClick={updateEmployee}
        disabled={loading}
        className="h-11 px-6 rounded-xl bg-blue-600 text-white"
      >
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </div>
  </div>
</div>

  )
}

/* ---------- Clean Field Component ---------- */
function Field({
  label,
  value,
  onChange
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-11 rounded-xl border border-gray-300 px-4 text-sm
                   focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
      />
    </div>
  )
}
