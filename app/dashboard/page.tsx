'use client'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function Dashboard() {
  const router = useRouter()

  const logout = async () => {
    await supabase.auth.signOut()
    router.replace('/auth/login')
  }

  return (
    <>
      <h1>Dashboard</h1>

      <button onClick={() => router.push('/dashboard/add-employee')}>
        Add Employee
      </button>

      <button onClick={() => router.push('/dashboard/attendance')}>
        Attendance
      </button>

      <br /><br />

      <button
        onClick={logout}
        style={{ background: 'red', color: 'white' }}
      >
        Sign Out
      </button>
    </>
  )
}
