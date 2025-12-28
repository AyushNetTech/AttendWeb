'use client'

import { Menu } from 'lucide-react'

export default function MobileHeader({
  onOpen
}: {
  onOpen: () => void
}) {
  return (
    <header className="lg:hidden flex items-center justify-between px-4 h-14 bg-white border-b">
      <button onClick={onOpen}>
        <Menu />
      </button>

      <h1 className="font-semibold">AttendOn</h1>
    </header>
  )
}
