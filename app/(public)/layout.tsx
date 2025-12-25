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
      <header className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            AttendOn
          </Link>

          <nav className="flex gap-6 items-center">
            <Link href="/pricing" className={pathname === '/pricing' ? 'font-semibold' : ''}>
              Pricing
            </Link>
            <Link href="/about" className={pathname === '/about' ? 'font-semibold' : ''}>
              About
            </Link>
            <Link href="/contact" className={pathname === '/contact' ? 'font-semibold' : ''}>
              Contact
            </Link>
            <Link href="/auth" className="px-4 py-2 border rounded">
              Login
            </Link>
            <Link
              href="/auth"
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Sign Up
            </Link>
          </nav>
        </div>
      </header>

      {/* CONTENT */}
      <main className="flex-1">{children}</main>

      {/* FOOTER */}
      <footer className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-6 text-sm text-gray-500">
          © {new Date().getFullYear()} AttendOn · Online Attendance System
        </div>
      </footer>
    </div>
  )
}
