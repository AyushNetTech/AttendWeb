
import Link from 'next/link'

import type { Metadata } from 'next'
import { FadeIn, FadeUp } from '@/components/Motion'

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Simple and transparent pricing for AttendOn online attendance system.',
}

export default function PricingPage() {
  return (
<section className="py-24 bg-gray-50">
  <div className="max-w-7xl mx-auto px-6">
    <FadeUp>
      <h2 className="text-4xl font-bold text-center mb-4">
        Simple, Transparent Pricing
      </h2>
    </FadeUp>

    <FadeIn delay={0.1}>
      <p className="text-center text-gray-600 mb-16">
        Choose a plan that fits your team size
      </p>
    </FadeIn>

    <div className="grid md:grid-cols-3 gap-8">
      {[
        {
          name: 'Starter',
          price: '₹0',
          desc: 'For small teams getting started',
          features: [
            'GPS Punch In/Out',
            'Photo Verification',
            'Basic Reports',
          ],
          highlight: false,
        },
        {
          name: 'Pro',
          price: '₹999',
          desc: 'Best for growing companies',
          features: [
            'Everything in Starter',
            'Live Attendance Map',
            'Advanced Reports',
            'Employee Filters',
          ],
          highlight: true,
        },
        {
          name: 'Enterprise',
          price: 'Custom',
          desc: 'For large organizations',
          features: [
            'Unlimited Employees',
            'Dedicated Support',
            'Custom Integrations',
            'Priority SLA',
          ],
          highlight: false,
        },
      ].map((plan, i) => (
        <FadeUp key={plan.name} delay={i * 0.15}>
          <div
            className={`relative rounded-3xl border bg-white p-8 shadow-sm transition
              hover:shadow-2xl hover:-translate-y-2
              ${plan.highlight ? 'ring-2 ring-blue-600 scale-[1.03]' : ''}`}
          >
            {plan.highlight && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs px-4 py-1 rounded-full">
                Most Popular
              </span>
            )}

            <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
            <p className="text-gray-600 text-sm mb-6">{plan.desc}</p>

            <div className="text-4xl font-bold mb-6">
              {plan.price}
              {plan.price !== 'Custom' && (
                <span className="text-sm font-normal text-gray-500"> /month</span>
              )}
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              {plan.features.map(f => (
                <li key={f} className="flex items-center gap-2">
                  <span className="text-green-600">✔</span>
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/auth"
              className={`block text-center py-3 rounded-xl font-medium transition
                ${
                  plan.highlight
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'border hover:bg-gray-100'
                }`}
            >
              Get Started
            </Link>
          </div>
        </FadeUp>
      ))}
    </div>
  </div>
</section>

  )
}
