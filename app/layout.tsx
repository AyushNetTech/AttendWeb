import './globals.css'

export default function RootLayout({ children }) {
  return (
    <html>
      <body className="p-4 bg-gray-100">{children}</body>
    </html>
  )
}
