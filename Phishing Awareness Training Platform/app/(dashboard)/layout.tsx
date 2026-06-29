import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { NotificationManager } from '@/components/gamification/NotificationManager'
import { PageTransition } from '@/components/layout/PageTransition'
import { AppLoader } from '@/components/loading/AppLoader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30">
        <Sidebar />
      </aside>

      {/* Main content area */}
      <div className="flex flex-col flex-1 lg:pl-64 min-h-screen">
        <Header />
        <main id="main-content" className="flex-1 overflow-y-auto">
          <PageTransition>
            {children}
          </PageTransition>
        </main>
      </div>

      {/* Gamification notifications — rendered above everything */}
      <NotificationManager />

      {/* Full-screen loader — sits above everything on first visit */}
      <AppLoader />
    </div>
  )
}
