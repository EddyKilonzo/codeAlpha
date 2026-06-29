"use client"

import { useState, useEffect } from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from 'next-themes'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useProgress } from '@/hooks/useProgress'
import { MobileNav } from './MobileNav'
import { MODULES } from '@/data/modules'
import { cn } from '@/lib/utils'

const LEVEL_TITLES: Record<number, string> = {
  1: 'Rookie', 2: 'Learner', 3: 'Aware', 4: 'Vigilant', 5: 'Defender',
  6: 'Analyst', 7: 'Guardian', 8: 'Expert', 9: 'Specialist', 10: 'Cyber Guardian',
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const { progress, isHydrated, overallProgress } = useProgress()
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const el = document.getElementById('main-content')
    if (!el) return
    const handler = () => setScrolled(el.scrollTop > 8)
    el.addEventListener('scroll', handler, { passive: true })
    return () => el.removeEventListener('scroll', handler)
  }, [])

  const pct = isHydrated ? overallProgress() : 0

  const moduleId = pathname.startsWith('/modules/') ? pathname.split('/modules/')[1] : null
  const module = moduleId ? MODULES.find(m => m.id === moduleId) : null
  const pageTitle = module ? module.title : 'Dashboard'

  return (
    <header
      className={cn(
        'sticky top-0 z-40 flex h-14 items-center gap-4 px-4 lg:px-6 border-b transition-all duration-300',
        scrolled && 'shadow-[0_1px_20px_rgba(0,0,0,0.06)]'
      )}
      style={{
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        borderColor: scrolled ? 'var(--glass-border)' : 'transparent',
      }}
    >
      {/* Brand accent line */}
      <div className={cn(
        'pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand/20 to-transparent transition-opacity duration-300',
        scrolled ? 'opacity-100' : 'opacity-0'
      )} />

      <MobileNav />

      {/* Page context */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-bold text-foreground truncate tracking-tight">
          {pageTitle}
        </p>
        {module && (
          <p className="text-[10px] text-muted-foreground truncate font-medium">
            Module {module.order} of {MODULES.length}
          </p>
        )}
      </div>

      {/* Center: course progress bar */}
      <div className="hidden md:flex flex-col items-center gap-1.5 w-44">
        <div className="flex items-center justify-between w-full">
          <span className="text-[10px] font-medium text-muted-foreground">Progress</span>
          <span className="text-[10px] font-bold text-brand tabular-nums font-mono">{pct}%</span>
        </div>
        <div className="relative h-1 w-full rounded-full bg-muted overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand to-emerald-400 transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Right: level badge + theme toggle */}
      <div className="flex items-center gap-2 shrink-0">
        {isHydrated && (
          <Badge
            variant="outline"
            className="hidden sm:flex border-brand/25 bg-brand/[0.06] text-brand text-[10px] font-bold px-2.5 py-0.5"
          >
            Lv.{progress.level} · {LEVEL_TITLES[progress.level] ?? 'Rookie'}
          </Badge>
        )}

        <motion.button
          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors overflow-hidden"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          whileTap={{ scale: 0.88 }}
          aria-label="Toggle dark mode"
        >
          <AnimatePresence mode="wait" initial={false}>
            {theme === 'dark' ? (
              <motion.span
                key="sun"
                initial={{ rotate: -90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: 90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <Sun className="h-4 w-4" />
              </motion.span>
            ) : (
              <motion.span
                key="moon"
                initial={{ rotate: 90, opacity: 0, scale: 0.6 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                exit={{ rotate: -90, opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <Moon className="h-4 w-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </motion.button>
      </div>
    </header>
  )
}
