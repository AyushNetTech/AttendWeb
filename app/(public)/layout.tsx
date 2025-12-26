'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navLinks = [
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="text-xl font-bold tracking-tight">
            Attend<span className="text-blue-600">On</span>
          </Link>

          {/* DESKTOP NAV */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative hover:text-blue-600 transition ${
                  pathname === link.href
                    ? 'text-blue-600 after:absolute after:-bottom-1 after:left-0 after:h-[2px] after:w-full after:bg-blue-600'
                    : ''
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* DESKTOP ACTIONS */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/auth"
              className="text-sm px-4 py-2 rounded hover:bg-gray-100"
            >
              Login
            </Link>
            <Link
              href="/auth"
              className="text-sm px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Sign up
            </Link>
          </div>

          {/* MOBILE BUTTON */}
          <button
            onClick={() => setOpen(v => !v)}
            className="md:hidden p-2 rounded hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>

        {/* MOBILE MENU */}
        {open && (
          <div className="md:hidden border-t bg-white">
            <div className="px-6 py-4 flex flex-col gap-4 text-sm">
              {navLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={pathname === link.href ? 'font-semibold text-blue-600' : ''}
                >
                  {link.label}
                </Link>
              ))}

              <hr />

              <Link
                href="/auth"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded border text-center"
              >
                Login
              </Link>
              <Link
                href="/auth"
                onClick={() => setOpen(false)}
                className="px-4 py-2 rounded bg-blue-600 text-white text-center"
              >
                Sign up
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* CONTENT */}
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <footer className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-3 gap-8 text-sm text-gray-600">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">AttendOn</h3>
            <p>Modern online attendance management system.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Product</h4>
            <ul className="space-y-1">
              <li><Link href="/pricing">Pricing</Link></li>
              <li><Link href="/about">About</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Legal</h4>
            <p>© {new Date().getFullYear()} AttendOn</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
