"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ShieldAlert, Fish, Crosshair, Zap, FileSearch, ShieldCheck,
  Lock, CheckCircle2, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProgress } from '@/hooks/useProgress'
import { MODULES } from '@/data/modules'
import { XPBar } from './XPBar'
import type { LucideIcon } from 'lucide-react'

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldAlert, Fish, Crosshair, Zap, FileSearch, ShieldCheck,
}

export function Sidebar() {
  const pathname = usePathname()
  const { isModuleUnlocked, isModuleCompleted, isHydrated } = useProgress()

  return (
    <div className="flex h-full flex-col border-r border-border bg-surface">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand">
          <ShieldCheck className="h-5 w-5 text-brand-foreground" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground leading-none">PhishGuard</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Awareness Training</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Course Modules
        </p>

        {MODULES.map((module) => {
          const unlocked = isHydrated ? isModuleUnlocked(module.id) : module.order === 1
          const completed = isHydrated ? isModuleCompleted(module.id) : false
          const active = pathname === `/modules/${module.id}`
          const Icon = ICON_MAP[module.icon] ?? ShieldAlert

          return (
            <div key={module.id}>
              {unlocked ? (
                <Link
                  href={`/modules/${module.id}`}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150',
                    active
                      ? 'bg-brand/10 text-brand font-medium'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <div className={cn(
                    'flex h-7 w-7 shrink-0 items-center justify-center rounded-md',
                    completed
                      ? 'bg-brand/10'
                      : active
                        ? 'bg-brand/15'
                        : 'bg-muted group-hover:bg-accent'
                  )}>
                    {completed ? (
                      <CheckCircle2 className="h-4 w-4 text-brand" />
                    ) : (
                      <Icon className={cn('h-4 w-4', active ? 'text-brand' : 'text-muted-foreground group-hover:text-foreground')} />
                    )}
                  </div>
                  <span className="flex-1 truncate">{module.title}</span>
                  {active && <ChevronRight className="h-3.5 w-3.5 text-brand" />}
                </Link>
              ) : (
                <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm opacity-50 cursor-not-allowed select-none">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Lock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="flex-1 truncate text-muted-foreground">{module.title}</span>
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* XP Bar */}
      <div className="border-t border-border">
        <XPBar />
      </div>
    </div>
  )
}
