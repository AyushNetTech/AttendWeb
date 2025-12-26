'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen flex flex-col">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 backdrop-blur bg-white/80 border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* LOGO */}
          <Link href="/" className="text-xl font-bold tracking-tight">
            Attend<span className="text-blue-600">On</span>
          </Link>

          {/* NAV */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            {[
              { href: '/pricing', label: 'Pricing' },
              { href: '/about', label: 'About' },
              { href: '/contact', label: 'Contact' },
            ].map(link => (
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

          {/* ACTIONS */}
          <div className="flex items-center gap-3">
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
        </div>
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
