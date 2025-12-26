'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function PublicNavbar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const links = [
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* LOGO */}
        <Link href="/" className="text-xl font-bold">
          Attend<span className="text-blue-600">On</span>
        </Link>

        {/* DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`relative hover:text-blue-600 transition ${
                pathname === l.href ? 'text-blue-600 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:bg-blue-600' : ''
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="hidden md:flex gap-3">
          <Link href="/auth" className="px-4 py-2 text-sm rounded hover:bg-gray-100">
            Login
          </Link>
          <Link
            href="/auth"
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded"
          >
            Sign up
          </Link>
        </div>

        {/* MOBILE BUTTON */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-2xl"
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden border-t bg-white">
          <div className="px-6 py-4 flex flex-col gap-4 text-sm">
            {links.map(l => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={pathname === l.href ? 'font-semibold text-blue-600' : ''}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/auth" className="px-4 py-2 rounded border text-center">Login</Link>
            <Link href="/auth" className="px-4 py-2 rounded bg-blue-600 text-white text-center">
              Sign up
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
