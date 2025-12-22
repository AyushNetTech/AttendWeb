'use client'
import { useRouter } from 'next/navigation'

export default function Dashboard() {
  const router = useRouter()
  return (
    <>
      <h1>Dashboard</h1>
      <button onClick={()=>router.push('/dashboard/add-employee')}>Add Employee</button>
      <button onClick={()=>router.push('/dashboard/attendance')}>Attendance</button>
    </>
  )
}
