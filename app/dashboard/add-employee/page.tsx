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
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('Not authenticated')
      return
    }

    const { data: companies, error } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', user.id)

    if (error || !companies || companies.length === 0) {
      alert('Company not found')
      return
    }

    const companyId = companies[0].id

    const { error: insertError } = await supabase
      .from('employees')
      .insert({
        name: form.name,
        employee_code: form.employee_code,
        password: form.password, // ✅ IMPORTANT
        designation: form.designation,
        department: form.department,
        company_id: companyId,
        is_active: true
      })

    if (insertError) {
      alert(insertError.message)
      return
    }

    alert('Employee added successfully')
  }

  return (
    <>
      <input placeholder="Name" onChange={e=>setForm({...form,name:e.target.value})}/>
      <input placeholder="Employee Code" onChange={e=>setForm({...form,employee_code:e.target.value})}/>
      <input placeholder="Password" type="password" onChange={e=>setForm({...form,password:e.target.value})}/>
      <input placeholder="Designation" onChange={e=>setForm({...form,designation:e.target.value})}/>
      <input placeholder="Department" onChange={e=>setForm({...form,department:e.target.value})}/>
      <button onClick={submit}>Create</button>
    </>
  )
}
