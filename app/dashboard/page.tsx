'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis
} from 'recharts'
import { useRouter } from 'next/navigation'
import { Users, CheckCircle, XCircle } from 'lucide-react'

const PIE_COLORS = ['#22c55e', '#ef4444']

export default function Dashboard() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  const [stats, setStats] = useState({ total: 0, present: 0, absent: 0 })
  const [weekly, setWeekly] = useState<any[]>([])
  const [departments, setDepartments] = useState<any[]>([])

  useEffect(() => {
    const init = async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth?.user) return router.replace('/auth')

      const { data: company } = await supabase
        .from('companies')
        .select('id')
        .eq('owner_id', auth.user.id)
        .maybeSingle()

      if (!company) return router.replace('/company/setup')

      await loadData(company.id)
      setChecking(false)
    }

    init()
  }, [router])

  async function loadData(companyId: string) {
    /* EMPLOYEES */
    const { data: employees } = await supabase
      .from('employees')
      .select('id, department')
      .eq('company_id', companyId)

    const ids = employees?.map(e => e.id) || []
    if (!ids.length) return

    /* TODAY */
    const today = new Date().toISOString().slice(0, 10)
    const { data: todayPunches } = await supabase
      .from('attendance')
      .select('employee_id')
      .gte('punch_time', today)
      .in('employee_id', ids)

    const presentSet = new Set(todayPunches?.map(p => p.employee_id))

    setStats({
      total: ids.length,
      present: presentSet.size,
      absent: ids.length - presentSet.size
    })

    /* REAL WEEKLY DATA */
    /* REAL WEEKLY DATA (FIXED) */
const todayDate = new Date()
todayDate.setHours(0, 0, 0, 0)

const last7Days = Array.from({ length: 7 }).map((_, i) => {
  const d = new Date(todayDate)
  d.setDate(d.getDate() - (6 - i))
  return d
})

const fromDate = last7Days[0].toISOString()

const { data: weeklyPunches } = await supabase
  .from('attendance')
  .select('employee_id, punch_time')
  .gte('punch_time', fromDate)
  .in('employee_id', ids)

/* Map date → unique present employees */
const dayMap: Record<string, Set<string>> = {}

weeklyPunches?.forEach(p => {
  const d = new Date(p.punch_time)
  d.setHours(0, 0, 0, 0)
  const key = d.toISOString().slice(0, 10)

  if (!dayMap[key]) dayMap[key] = new Set()
  dayMap[key].add(p.employee_id)
})

/* Final chart data */
setWeekly(
  last7Days.map(d => {
    const key = d.toISOString().slice(0, 10)
    const count = dayMap[key]?.size || 0

    return {
      day: d.toLocaleDateString('en-US', { weekday: 'short' }),
      percent: ids.length ? Math.round((count / ids.length) * 100) : 0,
      count
    }
  })
)


    /* DEPARTMENT WISE (TODAY) */
    const deptMap: any = {}
    employees?.forEach(e => {
      if (!deptMap[e.department]) deptMap[e.department] = 0
      if (presentSet.has(e.id)) deptMap[e.department]++
    })

    setDepartments(
      Object.entries(deptMap).map(([name, value]) => ({
        name,
        value
      }))
    )
  }

  if (checking) return null

  const pieData = [
    { name: 'Present', value: stats.present },
    { name: 'Absent', value: stats.absent }
  ]

  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gray-50 overflow-y-auto">

      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <StatCard
          title="Total Employees"
          value={stats.total}
          icon={<Users />}
          gradient="from-blue-500 to-blue-600"
        />
        <StatCard
          title="Present Today"
          value={stats.present}
          icon={<CheckCircle />}
          gradient="from-green-500 to-green-600"
        />
        <StatCard
          title="Absent Today"
          value={stats.absent}
          icon={<XCircle />}
          gradient="from-red-500 to-red-600"
        />
      </div>

      {/* CHARTS */}
      <div className="
        grid 
        grid-cols-1 
        md:grid-cols-2 
        xl:grid-cols-3 
        gap-4
      ">

        {/* PIE */}
        <ChartCard title="Today Attendance">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                innerRadius="45%"
                outerRadius="70%"
                label={({ percent }) =>
                  percent !== undefined ? `${Math.round(percent * 100)}%` : ''
                }

              >
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* WEEKLY */}
        <ChartCard title="Weekly Attendance Trend">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weekly} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
              <XAxis dataKey="day" 
                angle={-70}
                textAnchor="end"
                height={30}
                tick={{ fontSize: 12 }}
              />
              <YAxis domain={[0, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip
                formatter={(v, _, p) => [`${p.payload.count}`, 'Present']}
              />
              <Line
                type="monotone"
                dataKey="percent"
                stroke="#3b82f6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* DEPARTMENT */}
        <ChartCard title="Department Wise (Today)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={departments}>
              <XAxis
                dataKey="name"
                interval={0}
                angle={-30}
                textAnchor="end"
                height={50}
                tick={{ fontSize: 10 }}
              />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#22c55e"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

/* COMPONENTS */
function StatCard({ title, value, icon, gradient }: any) {
  return (
    <div
      className={`rounded-2xl p-5 text-white shadow bg-gradient-to-r ${gradient}
      flex justify-between items-center`}
    >
      <div>
        <p className="text-sm opacity-90">{title}</p>
        <p className="text-3xl font-bold">{value}</p>
      </div>
      <div className="opacity-90">{icon}</div>
    </div>
  )
}

function ChartCard({ title, children }: any) {
  return (
    <div className="
      bg-white 
      rounded-2xl 
      shadow 
      p-4 
      flex 
      flex-col
      min-h-[260px] sm:min-h-[320px] md:min-h-[360px]
    ">
      <h2 className="font-semibold mb-2">{title}</h2>
      <div className="flex-1">{children}</div>
    </div>
  )
}
