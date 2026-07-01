import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { NotificationManager } from '@/components/gamification/NotificationManager'
import { PageTransition } from '@/components/layout/PageTransition'
import { AppLoader } from '@/components/loading/AppLoader'
import { SiteFooter } from '@/components/layout/SiteFooter'

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
      <div className="flex flex-col flex-1 lg:pl-64 min-w-0">
        <Header />
        <main id="main-content" className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden flex flex-col">
          <div className="flex-1">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
          <SiteFooter />
        </main>
      </div>

      {/* Gamification notifications — rendered above everything */}
      <NotificationManager />

      {/* Full-screen loader — sits above everything on first visit */}
      <AppLoader />
    </div>
  )
}
