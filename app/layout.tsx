import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'AttendOn – Online Attendance Management System',
    template: '%s | AttendOn',
  },
  description:
    'AttendOn is a modern online attendance system with employee tracking, live location punch-in, photos, reports, and maps.',
  keywords: [
    'online attendance system',
    'employee attendance',
    'attendance management software',
    'GPS attendance',
    'photo attendance',
    'attendance app for companies',
  ],
  authors: [{ name: 'AttendOn' }],
  creator: 'AttendOn',
  metadataBase: new URL('https://attendOn.com'), // change when live
  openGraph: {
    title: 'AttendOn – Online Attendance Management System',
    description:
      'Track employee attendance with GPS, photos, maps, and real-time reports.',
    url: 'https://attendOn.com',
    siteName: 'AttendOn',
    images: [
      {
        url: '/og-image.png', // optional
        width: 1200,
        height: 630,
        alt: 'AttendOn Attendance System',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AttendOn – Online Attendance Management System',
    description:
      'Modern attendance system with GPS, photos, reports, and maps.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
