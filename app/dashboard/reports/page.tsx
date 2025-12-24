'use client'
import { useRouter } from 'next/navigation'

const reports = [
  { title: 'Master Attendance Report', path: '/dashboard/reports/master' },
  { title: 'Monthly Summary', path: '/dashboard/reports/monthly' },
  { title: 'Daily Attendance', path: '/dashboard/reports/daily' },
  { title: 'Late & Early Report', path: '/dashboard/reports/late-early' },
  { title: 'Leave Report', path: '/dashboard/reports/leave' },
  { title: 'Absent / Missing Punch', path: '/dashboard/reports/absent' }
]

export default function ReportsHome() {
  const router = useRouter()

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Reports</h1>

      <div className="grid grid-cols-3 gap-6">
        {reports.map(r => (
          <div
            key={r.title}
            onClick={() => router.push(r.path)}
            className="cursor-pointer rounded-xl border bg-white p-6 shadow hover:shadow-lg transition"
          >
            <h2 className="font-semibold text-lg">{r.title}</h2>
            <p className="text-sm text-gray-500 mt-2">
              View & export detailed {r.title.toLowerCase()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
