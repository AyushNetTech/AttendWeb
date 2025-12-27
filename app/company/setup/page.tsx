'use client'

import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function CompanySetup() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

const [checking, setChecking] = useState(true)

useEffect(() => {
  const check = async () => {
    const { data: authData } = await supabase.auth.getUser()
    if (!authData?.user) {
      router.replace('/auth')
      return
    }

    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', authData.user.id)
      .single()

    if (company) {
      router.replace('/dashboard')
      return
    }

    setChecking(false)
  }

  check()
}, [router])

if (checking) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      Checking account…
    </div>
  )
}


  const submit = async () => {
    setError(null)

    if (!name.trim()) {
      setError('Company name is required')
      return
    }

    setLoading(true)

    const { data, error: authError } = await supabase.auth.getUser()

    if (authError || !data.user) {
      setError('Not authenticated')
      setLoading(false)
      return
    }

    const user = data.user

    const { error: insertError } = await supabase
      .from('companies')
      .insert({
        owner_id: user.id,
        name,
        address,
        owner_email: user.email
      })

    setLoading(false)

    if (insertError) {
      setError(insertError.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8">
        {/* Header */}
        <h1 className="text-2xl font-semibold text-gray-900">
          Company Setup
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Set up your company to start managing employees
        </p>

        {/* Error */}
        {error && (
          <div className="mt-4 rounded-lg bg-red-50 text-red-700 px-4 py-2 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <div className="mt-6 space-y-4">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Acme Corporation"
              className="w-full rounded-xl border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address (optional)
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Office address"
              className="w-full rounded-xl border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Action */}
        <button
          onClick={submit}
          disabled={loading}
          className={`mt-6 w-full rounded-xl py-3 font-medium text-white transition ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Creating company...' : 'Create Company'}
        </button>
      </div>
    </div>
  )
}
