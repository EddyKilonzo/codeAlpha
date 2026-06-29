"use client"

import { useEffect, useRef } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useProgress } from '@/hooks/useProgress'
import { AchievementToast, LevelUpToast, ModuleCompleteToast } from './AchievementToast'

export function NotificationManager() {
  const { pendingNotifications, clearNotification } = useProgress()
  const confettiRef = useRef<typeof import('canvas-confetti') | null>(null)

  // Load confetti lazily
  useEffect(() => {
    import('canvas-confetti').then((mod) => {
      confettiRef.current = mod.default as unknown as typeof import('canvas-confetti')
    })
  }, [])

  // Fire confetti on module-complete notifications
  useEffect(() => {
    const moduleCompletes = pendingNotifications.filter((n) => n.type === 'module-complete')
    if (moduleCompletes.length > 0 && confettiRef.current) {
      const confetti = confettiRef.current as (opts: Record<string, unknown>) => void
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#16a34a', '#22c55e', '#4ade80', '#fbbf24', '#f59e0b'],
      })
    }
  }, [pendingNotifications])

  // Show at most 3 notifications at once to avoid stacking
  const visible = pendingNotifications.slice(0, 3)

  return (
    <div
      aria-live="polite"
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none"
    >
      <AnimatePresence mode="sync">
        {visible.map((notif) => {
          const dismiss = () => clearNotification(notif.id)
          const style = { pointerEvents: 'auto' as const }

          if (notif.type === 'achievement') {
            return (
              <div key={notif.id} style={style}>
                <AchievementToast achievement={notif.achievement} onDismiss={dismiss} />
              </div>
            )
          }
          if (notif.type === 'level-up') {
            return (
              <div key={notif.id} style={style}>
                <LevelUpToast level={notif.level} title={notif.title} onDismiss={dismiss} />
              </div>
            )
          }
          if (notif.type === 'module-complete') {
            return (
              <div key={notif.id} style={style}>
                <ModuleCompleteToast moduleTitle={notif.moduleTitle} onDismiss={dismiss} />
              </div>
            )
          }
          return null
        })}
      </AnimatePresence>
    </div>
  )
}
