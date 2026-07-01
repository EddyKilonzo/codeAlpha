"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Menu, X, ShieldAlert, Fish, Crosshair, Zap, FileSearch, ShieldCheck,
  Lock, CheckCircle2, Trophy,
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { useProgress } from '@/hooks/useProgress'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { MODULES } from '@/data/modules'
import { getLevelFromXP, getLevelInfo } from '@/lib/levelUtils'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldAlert, Fish, Crosshair, Zap, FileSearch, ShieldCheck,
}

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const { progress, isHydrated, isModuleUnlocked, isModuleCompleted } = useProgress()
  const drawerRef = useRef<HTMLDivElement>(null)

  // Close on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Keyboard accessibility: trap focus in the drawer, Esc closes, focus restored.
  useFocusTrap(open, drawerRef, () => setOpen(false))

  // Lock main-content scroll while open (body doesn't scroll — #main-content does)
  useEffect(() => {
    const main = document.getElementById('main-content')
    if (!main) return
    if (open) {
      main.style.overflow = 'hidden'
    } else {
      main.style.overflow = ''
    }
    return () => {
      const el = document.getElementById('main-content')
      if (el) el.style.overflow = ''
    }
  }, [open])

  const levelInfo = getLevelInfo(getLevelFromXP(progress.xp))

  return (
    <>
      {/* Hamburger — 44px tap target */}
      <button
        onClick={() => setOpen(true)}
        className="lg:hidden flex h-11 w-11 items-center justify-center rounded-xl text-foreground hover:bg-muted transition-colors active:scale-95"
        aria-label="Open navigation menu"
        aria-expanded={open}
      >
        <Menu className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-[2px]"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />

            {/* Drawer */}
            <motion.div
              ref={drawerRef}
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 340, damping: 36, mass: 0.8 }}
              className="fixed inset-y-0 left-0 z-[101] flex flex-col w-72 max-w-[85vw]"
              style={{
                background: 'var(--glass-bg, hsl(0 0% 100%))',
                borderRight: '1px solid var(--glass-border)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              }}
            >
              {/* Header row */}
              <div
                className="flex h-16 items-center justify-between gap-3 px-4 shrink-0"
                style={{ borderBottom: '1px solid var(--glass-border-inner)' }}
              >
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 min-w-0"
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white border border-border shadow-sm">
                    <Image src="/logo.png" alt="PhishShield" width={36} height={36} className="object-contain" priority />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[15px] font-extrabold text-foreground tracking-tight leading-none truncate">PhishShield</p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">Awareness Training</p>
                  </div>
                </Link>
                <button
                  onClick={() => setOpen(false)}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground transition-colors active:scale-95"
                  aria-label="Close navigation"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Quick stats */}
              {isHydrated && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                  className="mx-3 mt-3 grid grid-cols-3 gap-px rounded-xl border border-border/60 bg-border/30 overflow-hidden shrink-0"
                >
                  {[
                    { label: 'XP', value: progress.xp.toLocaleString(), accent: true },
                    { label: levelInfo.title, value: `Lv.${levelInfo.level}`, accent: false },
                    { label: 'Streak', value: `${progress.streak}d`, accent: false },
                  ].map(({ label, value, accent }) => (
                    <div key={label} className="flex flex-col items-center justify-center py-2.5 bg-card/80">
                      <span className={cn('text-[13px] font-bold tabular-nums', accent ? 'text-brand' : 'text-foreground')}>
                        {value}
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">{label}</span>
                    </div>
                  ))}
                </motion.div>
              )}

              {/* Module list */}
              <nav className="flex-1 min-h-0 overflow-y-auto py-4 px-3" aria-label="Modules">
                <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
                  Modules
                </p>
                <div className="space-y-0.5">
                  {MODULES.map((module, i) => {
                    const unlocked = isHydrated ? isModuleUnlocked(module.id) : module.order === 1
                    const completed = isHydrated ? isModuleCompleted(module.id) : false
                    const active = pathname === `/modules/${module.id}`
                    const Icon = ICON_MAP[module.icon] ?? ShieldAlert

                    return (
                      <motion.div
                        key={module.id}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.035 + 0.12, duration: 0.22 }}
                      >
                        {unlocked ? (
                          <Link
                            href={`/modules/${module.id}`}
                            onClick={() => setOpen(false)}
                            className={cn(
                              'flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-150',
                              active
                                ? 'bg-brand/10 border border-brand/20 text-brand'
                                : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                            )}
                          >
                            <div className={cn(
                              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                              completed ? 'bg-brand/10' : active ? 'bg-brand/[0.12]' : 'bg-muted'
                            )}>
                              {completed
                                ? <CheckCircle2 className="h-4 w-4 text-brand" />
                                : <Icon className={cn('h-4 w-4', active ? 'text-brand' : 'text-muted-foreground')} />
                              }
                            </div>
                            <span className={cn(
                              'flex-1 truncate text-[13px]',
                              active ? 'font-semibold' : 'font-medium'
                            )}>
                              {module.title}
                            </span>
                            {completed && !active && (
                              <span className="h-1.5 w-1.5 rounded-full bg-brand/60 shrink-0" />
                            )}
                          </Link>
                        ) : (
                          <div className="flex items-center gap-3 rounded-xl px-3 py-3 opacity-35 cursor-not-allowed select-none">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <span className="flex-1 truncate text-[13px] text-muted-foreground font-medium">
                              {module.title}
                            </span>
                          </div>
                        )}
                      </motion.div>
                    )
                  })}
                </div>
              </nav>

              {/* Achievements + dashboard footer */}
              <div
                className="px-3 pb-4 pt-3 space-y-0.5 shrink-0"
                style={{ borderTop: '1px solid var(--glass-border-inner)' }}
              >
                <Link
                  href="/achievements"
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-150',
                    pathname === '/achievements'
                      ? 'bg-brand/10 border border-brand/20 text-brand'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  <div className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    pathname === '/achievements' ? 'bg-brand/[0.12]' : 'bg-muted'
                  )}>
                    <Trophy className={cn('h-4 w-4', pathname === '/achievements' ? 'text-brand' : 'text-muted-foreground')} />
                  </div>
                  <span className={cn(
                    'text-[13px]',
                    pathname === '/achievements' ? 'font-semibold' : 'font-medium'
                  )}>
                    Achievements
                  </span>
                </Link>
                <Link
                  href="/dashboard"
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-3 transition-colors duration-150',
                    pathname === '/dashboard'
                      ? 'bg-brand/10 border border-brand/20 text-brand'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  <div className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                    pathname === '/dashboard' ? 'bg-brand/[0.12]' : 'bg-muted'
                  )}>
                    <ShieldCheck className={cn('h-4 w-4', pathname === '/dashboard' ? 'text-brand' : 'text-muted-foreground')} />
                  </div>
                  <span className={cn(
                    'text-[13px]',
                    pathname === '/dashboard' ? 'font-semibold' : 'font-medium'
                  )}>
                    Dashboard
                  </span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
