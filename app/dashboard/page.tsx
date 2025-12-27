'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { useRouter } from 'next/navigation'

const COLORS = ['#22c55e', '#ef4444']

export default function Dashboard() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0
  })

  useEffect(() => {
    const init = async () => {
      // 1️⃣ Auth check
      const { data: authData } = await supabase.auth.getUser()

      if (!authData?.user) {
        router.replace('/auth')
        return
      }

      // 2️⃣ Company check
      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', authData.user.id)
        .maybeSingle()

      if (!company) {
        router.replace('/company/setup')
        return
      }

      // 3️⃣ Load dashboard data only if allowed
      await loadStats(authData.user.id)
      setChecking(false)
    }

    init()
  }, [router])

  async function loadStats(userId: string) {
    const { data: company } = await supabase
      .from('companies')
      .select('id')
      .eq('owner_id', userId)
      .single()

    if (!company) return

    const { data: employees } = await supabase
      .from('employees')
      .select('id')
      .eq('company_id', company.id)

    const employeeIds = employees?.map(e => e.id) || []

    if (employeeIds.length === 0) {
      setStats({ total: 0, present: 0, absent: 0 })
      return
    }

    const today = new Date().toISOString().slice(0, 10)

    const { data: punches } = await supabase
      .from('attendance')
      .select('employee_id')
      .gte('punch_time', today)
      .in('employee_id', employeeIds)

    const presentIds = new Set(punches?.map(p => p.employee_id))

    setStats({
      total: employeeIds.length,
      present: presentIds.size,
      absent: employeeIds.length - presentIds.size
    })
  }

  // 🚫 BLOCK render until checks complete
  if (checking) return null
  // or return <FullPageLoader />

  const pieData = [
    { name: 'Present', value: stats.present },
    { name: 'Absent', value: stats.absent }
  ]

  return (
    <>
      <h1 className="text-2xl font-bold mb-6 m-6">Dashboard</h1>

      <div className="grid grid-cols-3 gap-6 mb-6 m-6">
        <Card title="Total Employees" value={stats.total} />
        <Card title="Present Today" value={stats.present} green />
        <Card title="Absent Today" value={stats.absent} red />
      </div>

      <div className="bg-white rounded-xl shadow p-6 w-full max-w-xl m-6">
        <h2 className="font-semibold mb-4">Today Attendance</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie data={pieData} dataKey="value" outerRadius={100}>
              {pieData.map((_, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}

function Card({ title, value, green, red }: any) {
  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`text-3xl font-bold ${
        green ? 'text-green-600' : red ? 'text-red-600' : ''
      }`}>
        {value}
      </p>
    </div>
  )
}
