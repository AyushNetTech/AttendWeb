
import Link from 'next/link'

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple and transparent pricing for AttendOn online attendance system.',
}

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="text-4xl font-bold text-center mb-4">
        Simple & Transparent Pricing
      </h1>
      <p className="text-center text-gray-600 mb-12">
        Choose a plan that fits your business
      </p>

      <div className="grid md:grid-cols-3 gap-8">
        {/* BASIC */}
        <div className="border rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Basic</h2>
          <p className="text-4xl font-bold mb-4">₹0</p>
          <p className="text-gray-500 mb-6">For small teams</p>

          <ul className="space-y-2 mb-6 text-sm">
            <li>✔ GPS Attendance</li>
            <li>✔ Photo Punch</li>
            <li>✔ Up to 5 Employees</li>
          </ul>

          <Link
            href="/auth"
            className="block w-full px-4 py-2 border rounded"
          >
            Get Started
          </Link>
        </div>

        {/* PRO */}
        <div className="border-2 border-blue-600 rounded-xl p-8 text-center shadow-lg">
          <h2 className="text-xl font-semibold mb-2">Pro</h2>
          <p className="text-4xl font-bold mb-4">₹199</p>
          <p className="text-gray-500 mb-6">per employee / month</p>

          <ul className="space-y-2 mb-6 text-sm">
            <li>✔ Everything in Basic</li>
            <li>✔ Live Map View</li>
            <li>✔ Reports & Filters</li>
            <li>✔ Unlimited Employees</li>
          </ul>

          <Link
            href="/auth"
            className="block w-full px-4 py-2 bg-blue-600 text-white rounded"
          >
            Start Free Trial
          </Link>
        </div>

        {/* ENTERPRISE */}
        <div className="border rounded-xl p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Enterprise</h2>
          <p className="text-4xl font-bold mb-4">Custom</p>
          <p className="text-gray-500 mb-6">For large organizations</p>

          <ul className="space-y-2 mb-6 text-sm">
            <li>✔ Dedicated Support</li>
            <li>✔ Custom Integrations</li>
            <li>✔ SLA & Compliance</li>
          </ul>

          <button className="block w-full px-4 py-2 border rounded">
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  )
}
