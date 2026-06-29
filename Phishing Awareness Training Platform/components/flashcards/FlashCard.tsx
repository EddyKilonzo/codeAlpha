"use client"

import { motion, AnimatePresence } from 'framer-motion'
import { RotateCcw, Target, CheckCircle2, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Flashcard } from '@/types'

interface Props {
  card: Flashcard
  isFlipped: boolean
  onFlip: () => void
}

export function FlashCard({ card, isFlipped, onFlip }: Props) {
  return (
    <div
      className="relative w-full cursor-pointer"
      style={{ perspective: 1200 }}
      onClick={onFlip}
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        {/* FRONT */}
        <div
          className="rounded-2xl border border-border bg-card shadow-lg p-8 min-h-[280px] flex flex-col items-center justify-center text-center"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
            <Target className="h-6 w-6 text-brand" />
          </div>
          <h3 className="text-xl font-bold text-foreground leading-tight max-w-sm">
            {card.front}
          </h3>
          <div className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
            <RotateCcw className="h-3 w-3" />
            <span>Click to reveal</span>
          </div>
        </div>

        {/* BACK */}
        <div
          className="absolute inset-0 rounded-2xl border border-brand/30 bg-gradient-to-br from-brand/5 to-brand/10 shadow-lg p-8 flex flex-col items-start justify-center"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <div className="w-full space-y-4">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-[10px] font-semibold text-brand uppercase tracking-widest">
              Answer
            </div>
            <p className="text-sm font-medium text-foreground leading-relaxed">
              {card.back}
            </p>
            {card.example && (
              <div className="rounded-lg border border-border/60 bg-background/60 p-3">
                <p className="text-[11px] font-semibold text-brand uppercase tracking-wider mb-1">Example</p>
                <p className="text-xs text-muted-foreground leading-relaxed italic">{card.example}</p>
              </div>
            )}
            <p className="text-[10px] text-muted-foreground/70 pt-2">Click to flip back</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

interface StatusBadgeProps {
  card: Flashcard
  moduleId: string
  knownIds: string[]
  reviewIds: string[]
}

export function CardStatusBadge({ card, knownIds, reviewIds }: StatusBadgeProps) {
  const isKnown = knownIds.includes(card.id)
  const isReview = reviewIds.includes(card.id)

  if (isKnown) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-semibold text-brand">
      <CheckCircle2 className="h-3 w-3" /> Known
    </span>
  )
  if (isReview) return (
    <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/30 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
      <Clock className="h-3 w-3" /> Review Later
    </span>
  )
  return null
}
