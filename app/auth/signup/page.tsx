'use client'
import { supabase } from '@/lib/supabaseClient'
import { useState } from 'react'

export default function Signup() {
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')

  const signup = async () => {
    await supabase.auth.signUp({
      email,
      password,
      options:{ emailRedirectTo: `${location.origin}/auth/login` }
    })
    alert('Verify your email')
  }

  return (
    <div>
      <h1>Signup</h1>
      <input onChange={e=>setEmail(e.target.value)} />
      <input type="password" onChange={e=>setPassword(e.target.value)} />
      <button onClick={signup}>Signup</button>
    </div>
  )
}
