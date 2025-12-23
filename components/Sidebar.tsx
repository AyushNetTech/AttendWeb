'use client'

import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

export default function Sidebar() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [company, setCompany] = useState('')

  useEffect(() => {
    const loadUser = async () => {
      const { data } = await supabase.auth.getUser()
      if (!data.user) return

      setEmail(data.user.email || '')

      const { data: companyData } = await supabase
        .from('companies')
        .select('name')
        .eq('owner_id', data.user.id)
        .maybeSingle()

      if (companyData) setCompany(companyData.name)
    }

    loadUser()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/auth')
  }

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-4 flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg font-bold">{company || 'Company'}</h2>
        <p className="text-xs text-slate-400">{email}</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-2">
        <button className="nav-btn" onClick={() => router.push('/dashboard')}>
          Dashboard
        </button>

        <button className="nav-btn" onClick={() => router.push('/dashboard/add-employee')}>
          Add Employee
        </button>

        <button className="nav-btn" onClick={() => router.push('/dashboard/attendance')}>
          Attendance
        </button>

        <button className="nav-btn" onClick={() => router.push('/dashboard/reports')}>
          Reports
        </button>

        <button className="nav-btn" onClick={() => router.push('/dashboard/settings')}>
          Settings
        </button>

        <button
          onClick={signOut}
          className="signout-btn mt-4 text-red-400 hover:text-white px-3 py-2 rounded"
        >
          Sign Out
        </button>
      </nav>
    </aside>
  )
}
