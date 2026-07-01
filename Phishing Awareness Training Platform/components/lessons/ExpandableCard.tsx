"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, CheckCircle2, XCircle, AlertTriangle, Circle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LessonCard } from '@/data/content/attacker-operations'

interface ItemStyle {
  icon: React.ReactNode
  text: string
  color: string
}

function resolveItemStyle(item: string): ItemStyle {
  if (/^BYPASSED:/i.test(item) || /^WEAKEST:/i.test(item) || /^WEAK:/i.test(item)) {
    return { icon: <XCircle className="h-4 w-4" />, text: item, color: 'text-red-500' }
  }
  if (/^RESISTANT:/i.test(item) || /^PHISHING-RESISTANT:/i.test(item) || /^STRONG:/i.test(item)) {
    return { icon: <CheckCircle2 className="h-4 w-4" />, text: item, color: 'text-brand' }
  }
  if (/^MODERATE:/i.test(item) || /^WARNING:/i.test(item)) {
    return { icon: <AlertTriangle className="h-4 w-4" />, text: item, color: 'text-amber-500' }
  }
  return { icon: <Circle className="h-2 w-2 fill-current mt-1" />, text: item, color: 'text-brand' }
}

interface Props {
  card: LessonCard
}

export function ExpandableCard({ card }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn(
      'rounded-2xl border overflow-hidden shadow-sm transition-colors duration-200',
      open ? 'border-brand/40 bg-card' : 'border-border bg-card'
    )}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-4 p-6 text-left group"
        aria-expanded={open}
      >
        <div className={cn(
          'mt-0.5 flex h-2 w-2 shrink-0 rounded-full mt-2 transition-colors',
          open ? 'bg-brand' : 'bg-muted-foreground/40 group-hover:bg-brand/60'
        )} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{card.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{card.summary}</p>
        </div>
        <ChevronDown className={cn(
          'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 mt-1',
          open && 'rotate-180 text-brand'
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
            <div className="px-8 pb-8 border-t border-border/60 pt-6 space-y-4">
              <p className="text-sm text-foreground leading-relaxed">{card.detail}</p>

              {card.items && card.items.length > 0 && (
                <ul className="space-y-2">
                  {card.items.map((item, i) => {
                    const { icon, text, color } = resolveItemStyle(item)
                    return (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <span className={cn('mt-0.5 shrink-0', color)}>{icon}</span>
                        <span className="text-foreground/90 leading-relaxed">{text}</span>
                      </li>
                    )
                  })}
                </ul>
              )}

              {card.example && (
                <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 p-4">
                  <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1 uppercase tracking-wide">
                    Example
                  </p>
                  <p className="text-sm text-foreground/90 leading-relaxed">{card.example}</p>
                </div>
              )}

              {card.source && (
                <p className="text-xs text-muted-foreground border-t border-border/50 pt-3">
                  Source: {card.source}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
