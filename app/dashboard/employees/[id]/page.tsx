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
    <div className="max-w-2xl mx-auto px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <h1 className="text-2xl font-semibold text-gray-900">
          Edit Employee
        </h1>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border shadow-sm p-8">
        <div className="grid gap-5">
          {/* Name */}
          <Field
            label="Employee Name"
            value={form.name}
            onChange={(v) => setForm({ ...form, name: v })}
          />

          {/* Code */}
          <Field
            label="Employee Code"
            value={form.employee_code}
            onChange={(v) => setForm({ ...form, employee_code: v })}
          />

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password || ''}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="w-full h-11 rounded-xl border border-gray-300 px-4 pr-11 text-sm
                           focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Designation */}
          <Field
            label="Designation"
            value={form.designation || ''}
            onChange={(v) => setForm({ ...form, designation: v })}
          />

          {/* Department */}
          <Field
            label="Department"
            value={form.department || ''}
            onChange={(v) => setForm({ ...form, department: v })}
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between mt-10">
          <button
            onClick={deleteEmployee}
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Delete Employee
          </button>

          <button
            onClick={updateEmployee}
            disabled={loading}
            className={`h-11 px-6 rounded-xl text-sm font-medium text-white transition
              ${loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
              }`}
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
