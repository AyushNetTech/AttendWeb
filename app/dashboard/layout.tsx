'use client'

import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import { Menu } from 'lucide-react'

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar open={open} onClose={() => setOpen(false)} />

      <main className="flex-1 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white shadow-sm">
          <button onClick={() => setOpen(true)}>
            <Menu />
          </button>
          <span className="font-semibold">Dashboard</span>
        </div>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto p-2 sm:p-4">
          {children}
        </div>
      </main>
    </div>
  )
}
