'use client'
import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Setup() {
  const [name,setName]=useState('')
  const [address,setAddress]=useState('')
  const router = useRouter()

  const createCompany = async () => {
    const { data:{ user }} = await supabase.auth.getUser()
    await supabase.from('companies').insert({
      owner_id: user.id,
      name, address
    })
    router.push('/dashboard')
  }

  return (
    <>
      <h1>Company Setup</h1>
      <input onChange={e=>setName(e.target.value)} />
      <input onChange={e=>setAddress(e.target.value)} />
      <button onClick={createCompany}>Create</button>
    </>
  )
}
