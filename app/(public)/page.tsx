
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Online Attendance System for Modern Companies',
  description:
    'Simplify attendance with GPS-based punch-in, photos, employee reports, and live maps. Built for modern teams.',
}

const features=[
      {
                title: 'GPS Based Punch',
                desc: 'Capture exact employee location during punch-in and punch-out.',
              },
              {
                title: 'Photo Verification',
                desc: 'Ensure authenticity with real-time photo capture.',
              },
              {
                title: 'Live Attendance Map',
                desc: 'View all employee locations on a live interactive map.',
              },
              {
                title: 'Powerful Filters',
                desc: 'Search by employee, department, date, and designation.',
              },
              {
                title: 'Reports & Export',
                desc: 'Generate attendance reports instantly.',
              },
              {
                title: 'Secure & Scalable',
                desc: 'Built with Supabase & modern cloud security.',
              },
]

export default function LandingPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.15),transparent_60%)]" />

        <div className="relative max-w-7xl mx-auto px-6 py-28 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
            Smart Attendance
            <br />
            <span className="text-blue-200">For Modern Teams</span>
          </h1>

          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto text-blue-100">
            GPS-based attendance, photo verification, live maps and powerful reports —
            built for growing companies.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/auth"
              className="px-8 py-4 bg-white text-blue-700 font-semibold rounded-lg shadow-lg hover:scale-105 transition"
            >
              Start Free Trial
            </Link>
            <Link
              href="/pricing"
              className="px-8 py-4 border border-white/40 rounded-lg hover:bg-white/10 transition"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>


      {/* FEATURES */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">
            Everything You Need to Manage Attendance
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="rounded-2xl border p-6 bg-white shadow-sm hover:shadow-xl transition"
              >
                <div className="h-12 w-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center mb-4 text-xl">
                  ✓
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-600 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Modernize Attendance?
          </h2>
          <p className="text-gray-600 mb-8">
            Start using AttendOn today and manage your workforce efficiently.
          </p>

          <Link
            href="/auth"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg text-lg"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </>
  )
}
