'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip
} from 'recharts'

const COLORS = ['#22c55e', '#ef4444']

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    present: 0,
    absent: 0
  })

  useEffect(() => {
    loadStats()
  }, [])

  async function loadStats() {
    const { data: employees } = await supabase
      .from('employees')
      .select('id')

    const today = new Date().toISOString().slice(0, 10)

    const { data: punches } = await supabase
      .from('attendance')
      .select('employee_id')
      .gte('punch_time', today)

    const presentIds = new Set(punches?.map(p => p.employee_id))

    setStats({
      total: employees?.length || 0,
      present: presentIds.size,
      absent: (employees?.length || 0) - presentIds.size
    })
  }

  const pieData = [
    { name: 'Present', value: stats.present },
    { name: 'Absent', value: stats.absent }
  ]

  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      {/* Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        <Card title="Total Employees" value={stats.total} />
        <Card title="Present Today" value={stats.present} green />
        <Card title="Absent Today" value={stats.absent} red />
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow p-6 w-full max-w-xl">
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
