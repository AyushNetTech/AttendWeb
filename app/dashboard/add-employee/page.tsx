'use client'
import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'

export default function AddEmployee() {
  const [form, setForm] = useState({
    name: '',
    employee_code: '',
    designation: '',
    department: '',
    password: ''
  })

  const submit = async () => {
    if (!form.name || !form.employee_code || !form.password) {
      alert('Name, Employee Code and Password are required')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Not authenticated')
      return
    }

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)
      .maybeSingle()

    if (!company) {
      alert('Company not found')
      return
    }

    const { error } = await supabase
      .from('employees')
      .insert({
        name: form.name,
        employee_code: form.employee_code,
        password: form.password,
        designation: form.designation,
        department: form.department,
        company_id: company.id,
        is_active: true
      })

    if (error) {
      if (error.code === '23505') {
        alert('Employee code already exists in your company')
      } else {
        alert(error.message)
      }
      return
    }

    alert('Employee added successfully')
  }

  return (
    <>
      <input placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
      <input placeholder="Employee Code" onChange={e => setForm({ ...form, employee_code: e.target.value })} />
      <input placeholder="Password" type="password" onChange={e => setForm({ ...form, password: e.target.value })} />
      <input placeholder="Designation" onChange={e => setForm({ ...form, designation: e.target.value })} />
      <input placeholder="Department" onChange={e => setForm({ ...form, department: e.target.value })} />
      <button onClick={submit}>Create</button>
    </>
  )
}
