'use client'

import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  onClose: () => void
}

export default function Sidebar({ open, onClose }: Props) {
  const router = useRouter()
  const pathname = usePathname()

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

  const go = (path: string) => {
    router.push(path)
    onClose() // 👈 auto close on mobile
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.replace('/')
  }

  const navBtn = (path: string, label: string) => {
    const active = pathname === path
    return (
      <button
        onClick={() => go(path)}
        className={`w-full text-left px-3 py-2 rounded-lg text-m transition
          ${active
            ? 'bg-blue-600 text-white'
            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
          }`}
      >
        {label}
      </button>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed lg:static z-50
          w-64 h-screen
          bg-slate-900 text-white p-4 flex flex-col
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}
      >
        {/* Header */}
        <div className="mb-6 flex justify-between items-start">
          <div>
            <h2 className="text-lg font-bold">{company || 'Company'}</h2>
            <p className="text-xs text-slate-400">{email}</p>
          </div>

          {/* Close button (mobile only) */}
          <button onClick={onClose} className="lg:hidden">
            <X />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navBtn('/dashboard', 'Dashboard')}
          {navBtn('/dashboard/employees', 'Employee Management')}
          {navBtn('/dashboard/attendance', 'Attendance')}
          {navBtn('/dashboard/map', 'Attendance Map')}
          {navBtn('/dashboard/reports', 'Reports')}
          {navBtn('/dashboard/settings', 'Settings')}
          <button
          onClick={signOut}
          className="signout-btn mt-4 text-red-400 hover:text-white px-3 py-2 rounded"
        >
          Sign Out
        </button>
        </nav>

        
      </aside>
    </>
  )
}
