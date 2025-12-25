
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Online Attendance System for Modern Companies',
  description:
    'Simplify attendance with GPS-based punch-in, photos, employee reports, and live maps. Built for modern teams.',
}


export default function LandingPage() {
  return (
    <>
      {/* HERO */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Smart Online Attendance System
          </h1>
          <p className="text-lg md:text-xl mb-8 max-w-3xl mx-auto">
            Track employee attendance with GPS, photos, real-time dashboards,
            and powerful reports — all in one platform.
          </p>

          <div className="flex justify-center gap-4">
            <Link
              href="/auth"
              className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg"
            >
              Get Started Free
            </Link>
            <Link
              href="/pricing"
              className="px-6 py-3 border border-white rounded-lg"
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
            {[
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
            ].map((f, i) => (
              <div
                key={i}
                className="border rounded-xl p-6 hover:shadow-lg transition"
              >
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-600">{f.desc}</p>
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
