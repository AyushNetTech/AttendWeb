'use client'

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function CompanySetup() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [address, setAddress] = useState('')

  const submit = async () => {
    const { data, error } = await supabase.auth.getUser()

    if (error || !data.user) {
      alert('Not authenticated')
      return
    }
    if (!name.trim()) {
      alert('Company name is required')
      return
    }


    const user = data.user   // ✅ now user is guaranteed

    const { error: insertError } = await supabase
      .from('companies')
      .insert({
        owner_id: user.id,
        name,
        address,
        owner_email: user.email // ✅ FIX
      })

    if (insertError) {
      alert(insertError.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <>
      <input placeholder="Company name" onChange={e => setName(e.target.value)} />
      <input placeholder="Address" onChange={e => setAddress(e.target.value)} />
      <button onClick={submit}>Create Company</button>
    </>
  )
}
