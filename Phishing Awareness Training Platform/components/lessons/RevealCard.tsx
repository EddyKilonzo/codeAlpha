"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LessonCard } from '@/data/content/attacker-operations'

interface Props {
  card: LessonCard
}

export function RevealCard({ card }: Props) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      {/* Header */}
      <button
        onClick={() => setRevealed((v) => !v)}
        className="w-full flex items-start gap-4 p-6 text-left group hover:bg-accent/50 transition-colors"
        aria-expanded={revealed}
      >
        <div className={cn(
          'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
          revealed ? 'bg-brand text-brand-foreground' : 'bg-muted text-muted-foreground group-hover:bg-brand/10 group-hover:text-brand'
        )}>
          {revealed ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">{card.title}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{card.summary}</p>
        </div>
        <ChevronDown className={cn(
          'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 mt-1',
          revealed && 'rotate-180'
        )} />
      </button>

      {/* Revealed content */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 border-t border-border pt-6 space-y-4">
              <p className="text-sm text-foreground leading-relaxed">{card.detail}</p>

              {card.example && (
                <div className="rounded-xl bg-brand/5 border border-brand/20 p-5">
                  <p className="text-xs font-semibold text-brand mb-1 uppercase tracking-wide">Real-World Example</p>
                  <p className="text-sm text-foreground/90 leading-relaxed italic">{card.example}</p>
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
