"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Swords, Search, Zap, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CaseStudyTimelineEvent } from '@/types'

const EVENT_CONFIG: Record<CaseStudyTimelineEvent['type'], {
  icon: React.ElementType
  color: string
  bg: string
  border: string
  label: string
}> = {
  attack:     { icon: Swords,       color: 'text-red-600 dark:text-red-400',     bg: 'bg-red-50 dark:bg-red-950/30',     border: 'border-red-200 dark:border-red-800/50',     label: 'Attack' },
  discovery:  { icon: Search,       color: 'text-yellow-600 dark:text-yellow-400', bg: 'bg-yellow-50 dark:bg-yellow-950/30', border: 'border-yellow-200 dark:border-yellow-800/50', label: 'Discovery' },
  response:   { icon: Zap,          color: 'text-blue-600 dark:text-blue-400',   bg: 'bg-blue-50 dark:bg-blue-950/30',   border: 'border-blue-200 dark:border-blue-800/50',   label: 'Response' },
  impact:     { icon: AlertTriangle, color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/30', border: 'border-orange-200 dark:border-orange-800/50', label: 'Impact' },
  resolution: { icon: CheckCircle2, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-950/30', border: 'border-green-200 dark:border-green-800/50', label: 'Resolution' },
}

interface Props {
  events: CaseStudyTimelineEvent[]
}

export function InteractiveTimeline({ events }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)

  return (
    <div className="relative">
      {/* Vertical line */}
      <div className="absolute left-5 top-5 bottom-5 w-px bg-border" aria-hidden />

      <ol className="space-y-3">
        {events.map((event, i) => {
          const config = EVENT_CONFIG[event.type]
          const Icon = config.icon
          const isActive = activeIndex === i

          return (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <button
                onClick={() => setActive(i, isActive)}
                className="relative w-full flex items-start gap-4 text-left"
              >
                {/* Icon bubble */}
                <div className={cn(
                  'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
                  isActive
                    ? `${config.bg} ${config.border} scale-110 shadow-md`
                    : 'bg-background border-border hover:border-muted-foreground/40'
                )}>
                  <Icon className={cn('h-4 w-4 transition-colors', isActive ? config.color : 'text-muted-foreground')} />
                </div>

                {/* Content */}
                <div className={cn(
                  'flex-1 min-w-0 rounded-xl border p-4 transition-all duration-200',
                  isActive ? `${config.bg} ${config.border} shadow-sm` : 'border-transparent hover:border-border hover:bg-muted/30'
                )}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn('text-[10px] font-bold uppercase tracking-wider', isActive ? config.color : 'text-muted-foreground')}>
                          {config.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground font-mono">{event.date}</span>
                      </div>
                      <p className="text-sm font-semibold text-foreground">{event.title}</p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isActive && (
                      <motion.p
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 text-sm text-foreground/80 leading-relaxed overflow-hidden"
                      >
                        {event.description}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            </motion.li>
          )

          function setActive(index: number, isCurrentlyActive: boolean) {
            setActiveIndex(isCurrentlyActive ? null : index)
          }
        })}
      </ol>
    </div>
  )
}
