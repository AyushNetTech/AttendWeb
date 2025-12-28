'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { notifyError, notifySuccess } from '@/lib/notify'

export default function AuthPage() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading] = useState(false)
  const router = useRouter()

  const handleAuth = async () => {
  if (!email || !password) {
    notifyError('Email and password are required')
    return
  }

  try {
    if (isSignup) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${location.origin}/auth`
        }
      })

      if (error) {
        notifyError(error.message)
        return
      }

      notifySuccess('Verify your email before logging in')
      setIsSignup(false)
      return
    }

    // 🔹 LOGIN
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) {
      // 🔥 EMAIL NOT VERIFIED
      if (
        error.message.toLowerCase().includes('email') &&
        error.message.toLowerCase().includes('confirm')
      ) {
        notifyError('Please verify your email before logging in')
      } else {
        notifyError(error.message)
      }
      return
    }

    // 🔹 Get logged-in user
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) {
      notifyError('Authentication failed')
      return
    }

    // 🔹 Check company
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', authData.user.id)
      .maybeSingle()

    notifySuccess('Login successful')

    router.replace(company ? '/dashboard' : '/company/setup')

  } catch (err) {
    notifyError('Something went wrong. Try again.')
  }
}



  return (
    <div className="max-w-sm mx-auto mt-24 p-6 bg-white rounded shadow">
      <h1 className="text-xl font-bold mb-4">
        {isSignup ? 'Create Account' : 'Login'}
      </h1>

      <input
        className="border p-2 w-full mb-3"
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
      />

      <input
        type="password"
        className="border p-2 w-full mb-3"
        placeholder="Password"
        onChange={e => setPassword(e.target.value)}
      />

      <button
        onClick={handleAuth}
        disabled={loading}
        className="bg-blue-600 text-white w-full p-2 rounded disabled:opacity-60"
      >
        {loading ? 'Please wait…' : isSignup ? 'Sign up' : 'Login'}
      </button>

      <p className="text-sm text-center mt-4">
        {isSignup ? 'Already have an account?' : 'New user?'}{' '}
        <button
          className="text-blue-600"
          onClick={() => setIsSignup(!isSignup)}
        >
          {isSignup ? 'Login' : 'Sign up'}
        </button>
      </p>
    </div>
  )
}
