'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter, useParams } from 'next/navigation'

export default function EditEmployee() {
  const { id } = useParams()
  const router = useRouter()
  const [form, setForm] = useState<any>(null)

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
    await supabase
      .from('employees')
      .update({
        name: form.name,
        employee_code: form.employee_code,
        designation: form.designation,
        department: form.department
      })
      .eq('id', id)

    router.push('/dashboard/employees')
  }

  async function deleteEmployee() {
    await supabase
      .from('employees')
      .delete()
      .eq('id', id)

    router.push('/dashboard/employees')
  }

  if (!form) return null

  return (
    <div className="p-6 max-w-xl">
      <h1 className="text-xl font-bold mb-4">Edit Employee</h1>

      <input value={form.name}
        onChange={e=>setForm({...form,name:e.target.value})}
        placeholder="Name" />

      <input value={form.employee_code}
        onChange={e=>setForm({...form,employee_code:e.target.value})}
        placeholder="Employee Code" />

      <input value={form.designation}
        onChange={e=>setForm({...form,designation:e.target.value})}
        placeholder="Designation" />

      <input value={form.department}
        onChange={e=>setForm({...form,department:e.target.value})}
        placeholder="Department" />

      <div className="flex gap-4 mt-4">
        <button onClick={updateEmployee} className="bg-blue-600 text-white px-4 py-2 rounded">
          Save
        </button>

        <button onClick={deleteEmployee} className="text-red-600">
          Delete
        </button>
      </div>
    </div>
  )
}
