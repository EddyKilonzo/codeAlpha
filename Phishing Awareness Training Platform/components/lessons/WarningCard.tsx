"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertTriangle, ChevronDown, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LessonCard } from '@/data/content/attacker-operations'

interface Props {
  card: LessonCard
}

export function WarningCard({ card }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-2xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-950/10 shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-4 p-6 text-left group"
        aria-expanded={open}
      >
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40 mt-0.5">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Warning</span>
          </div>
          <p className="text-sm font-semibold text-foreground">{card.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{card.summary}</p>
        </div>
        <ChevronDown className={cn(
          'h-4 w-4 shrink-0 text-amber-500 transition-transform duration-200 mt-1',
          open && 'rotate-180'
        )} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 border-t border-amber-200 dark:border-amber-800/40 pt-6 space-y-4">
              <p className="text-sm text-foreground leading-relaxed">{card.detail}</p>

              {card.items && (
                <ul className="space-y-2">
                  {card.items.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-amber-500 mt-0.5" />
                      <span className="text-foreground/90">{item}</span>
                    </li>
                  ))}
                </ul>
              )}

              {card.example && (
                <div className="rounded-lg bg-white/70 dark:bg-black/20 border border-amber-200 dark:border-amber-800/40 p-4">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Example</p>
                  <p className="text-sm text-foreground/90 leading-relaxed font-mono text-xs">{card.example}</p>
                </div>
              )}

              {card.source && (
                <p className="text-xs text-muted-foreground">Source: {card.source}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
