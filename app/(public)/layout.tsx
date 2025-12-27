'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import PublicNavbar from '@/components/PublicNavbar'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
const [checking, setChecking] = useState(true)

useEffect(() => {
  const checkSession = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) router.replace('/dashboard')
    else setChecking(false)
  }
  checkSession()
}, [])

if (checking) return null

  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">{children}</main>

      <footer className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-10 text-sm text-gray-600">
          © {new Date().getFullYear()} AttendOn
        </div>
      </footer>
    </div>
  )
}
