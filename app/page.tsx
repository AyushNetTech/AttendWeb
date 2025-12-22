'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function HomePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      // ❌ Not logged in
      if (!user) {
        router.replace('/auth')

        return
      }

      // ✅ Logged in → check company
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (!company) {
        router.replace('/company/setup')
      } else {
        router.replace('/dashboard')
      }

      setLoading(false)
    }

    checkUser()
  }, [router])

  if (loading) return <p>Loading...</p>

  return null
}
