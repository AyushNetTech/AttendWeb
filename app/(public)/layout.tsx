import PublicNavbar from '@/components/PublicNavbar'
import PageTransition from '@/components/PageTransition'


export default function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicNavbar />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>


      <footer className="border-t bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-10 text-sm text-gray-600">
          © {new Date().getFullYear()} AttendOn
        </div>
      </footer>
    </div>
  )
}
