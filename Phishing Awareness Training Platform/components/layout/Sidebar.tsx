"use client"

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShieldAlert, Fish, Crosshair, Zap, FileSearch, ShieldCheck, Lock, CheckCircle2, Trophy,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useProgress } from '@/hooks/useProgress'
import { MODULES } from '@/data/modules'
import { XPBar } from './XPBar'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldAlert, Fish, Crosshair, Zap, FileSearch, ShieldCheck,
}

interface SidebarProps {
  onNavigate?: () => void
}

export function Sidebar({ onNavigate }: SidebarProps = {}) {
  const pathname = usePathname()
  const { isModuleUnlocked, isModuleCompleted, isHydrated } = useProgress()

  return (
    <div
      className="flex h-full flex-col border-r"
      style={{
        background: 'var(--glass-bg-subtle)',
        borderColor: 'var(--glass-border)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
    >
      {/* Brand header */}
      <div
        className="flex h-16 items-center gap-3 px-4"
        style={{ borderBottom: '1px solid var(--glass-border-inner)' }}
      >
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl overflow-hidden bg-white border border-border">
          <Image src="/logo.png" alt="PhishShield" width={36} height={36} className="object-contain" priority />
        </div>
        <div>
          <p className="text-[15px] font-extrabold text-foreground tracking-tight leading-none">PhishShield</p>
          <p className="text-[10px] text-muted-foreground mt-0.5 font-medium tracking-wide">Awareness Training</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <p className="px-3 pb-2.5 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/50">
          Modules
        </p>

        <div className="space-y-0.5">
          {MODULES.map((module) => {
            const unlocked = isHydrated ? isModuleUnlocked(module.id) : module.order === 1
            const completed = isHydrated ? isModuleCompleted(module.id) : false
            const active = pathname === `/modules/${module.id}`
            const Icon = ICON_MAP[module.icon] ?? ShieldAlert

            if (!unlocked) {
              return (
                <div
                  key={module.id}
                  className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 opacity-35 cursor-not-allowed select-none"
                >
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className="text-[13px] text-muted-foreground truncate flex-1">{module.title}</span>
                </div>
              )
            }

            return (
              <Link key={module.id} href={`/modules/${module.id}`} onClick={onNavigate}>
                <div
                  className={cn(
                    'relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors duration-150 group',
                    active ? 'text-brand' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {/* Active pill */}
                  {active && (
                    <motion.div
                      layoutId="nav-active-pill"
                      className="absolute inset-0 rounded-xl"
                      style={{
                        background: 'rgba(22,163,74,0.09)',
                        border: '1px solid rgba(22,163,74,0.18)',
                      }}
                      transition={{ type: 'spring', stiffness: 400, damping: 36 }}
                    />
                  )}

                  {/* Hover (non-active) */}
                  {!active && (
                    <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-muted/50" />
                  )}

                  {/* Icon */}
                  <div className={cn(
                    'relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                    completed ? 'bg-brand/10' : active ? 'bg-brand/[0.12]' : 'bg-muted group-hover:bg-muted/80'
                  )}>
                    {completed ? (
                      <CheckCircle2 className="h-4 w-4 text-brand" />
                    ) : (
                      <Icon className={cn(
                        'h-4 w-4',
                        active ? 'text-brand' : 'text-muted-foreground group-hover:text-foreground'
                      )} />
                    )}
                  </div>

                  <span className={cn(
                    'relative flex-1 truncate text-[13px] transition-colors',
                    active ? 'font-semibold text-brand' : 'font-medium'
                  )}>
                    {module.title}
                  </span>

                  {completed && !active && (
                    <span className="relative h-1.5 w-1.5 rounded-full bg-brand/50 shrink-0" />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Achievements link */}
      <div style={{ borderTop: '1px solid var(--glass-border-inner)' }} className="px-3 py-2">
        <Link href="/achievements" onClick={onNavigate}>
          <div className={cn(
            'relative flex items-center gap-3 rounded-xl px-3 py-2 transition-colors duration-150 group',
            pathname === '/achievements' ? 'text-brand' : 'text-muted-foreground hover:text-foreground'
          )}>
            {pathname === '/achievements' && (
              <motion.div
                layoutId="nav-active-pill"
                className="absolute inset-0 rounded-xl"
                style={{ background: 'rgba(22,163,74,0.09)', border: '1px solid rgba(22,163,74,0.18)' }}
                transition={{ type: 'spring', stiffness: 400, damping: 36 }}
              />
            )}
            {pathname !== '/achievements' && (
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity bg-muted/50" />
            )}
            <div className={cn(
              'relative flex h-7 w-7 shrink-0 items-center justify-center rounded-lg',
              pathname === '/achievements' ? 'bg-brand/[0.12]' : 'bg-muted group-hover:bg-muted/80'
            )}>
              <Trophy className={cn(
                'h-4 w-4',
                pathname === '/achievements' ? 'text-brand' : 'text-muted-foreground group-hover:text-foreground'
              )} />
            </div>
            <span className={cn(
              'relative text-[13px]',
              pathname === '/achievements' ? 'font-semibold text-brand' : 'font-medium'
            )}>
              Achievements
            </span>
          </div>
        </Link>
      </div>

      {/* XP Bar */}
      <div style={{ borderTop: '1px solid var(--glass-border-inner)' }}>
        <XPBar />
      </div>
    </div>
  )
}
