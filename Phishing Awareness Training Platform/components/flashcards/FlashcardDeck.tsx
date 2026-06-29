"use client"

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Shuffle, CheckCircle2, Clock, RotateCcw, Trophy, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { FlashCard, CardStatusBadge } from './FlashCard'
import { useProgress } from '@/hooks/useProgress'
import { XP_REWARDS } from '@/lib/constants'
import type { Flashcard } from '@/types'

interface Props {
  cards: Flashcard[]
  moduleId: string
}

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function FlashcardDeck({ cards, moduleId }: Props) {
  const { progress: userProgress, setFlashcardKnown, setFlashcardReview, completeFlashcards, addXP } = useProgress()
  const [deck, setDeck] = useState(cards)
  const [index, setIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [celebrating, setCelebrating] = useState(false)
  const [shuffling, setShuffling] = useState(false)
  const isDragging = useRef(false)

  const progress = userProgress.flashcardProgress[moduleId]
  const knownIds = progress?.knownIds ?? []
  const reviewIds = progress?.reviewLaterIds ?? []
  const isDeckComplete = progress?.completed ?? false

  const current = deck[index]
  const knownCount = knownIds.length
  const totalCards = cards.length

  const goNext = useCallback(() => {
    if (index < deck.length - 1) {
      setDirection('forward')
      setIsFlipped(false)
      setTimeout(() => setIndex((i) => i + 1), 80)
    }
  }, [index, deck.length])

  const goPrev = useCallback(() => {
    if (index > 0) {
      setDirection('backward')
      setIsFlipped(false)
      setTimeout(() => setIndex((i) => i - 1), 80)
    }
  }, [index])

  const handleShuffle = () => {
    setIsFlipped(false)
    setIndex(0)
    setShuffling(true)
    setTimeout(() => {
      setDeck(shuffleArray(cards))
      setShuffling(false)
    }, 420)
  }

  const handleMarkKnown = () => {
    if (!current) return
    setFlashcardKnown(moduleId, current.id)
    goNext()

    const newKnownCount = knownIds.includes(current.id) ? knownIds.length : knownIds.length + 1
    if (newKnownCount >= totalCards && !isDeckComplete) {
      completeFlashcards(moduleId)
      addXP(XP_REWARDS.FLASHCARD_COMPLETE)
      setCelebrating(true)
      setTimeout(() => setCelebrating(false), 3000)
    }
  }

  const handleReviewLater = () => {
    if (!current) return
    setFlashcardReview(moduleId, current.id)
    goNext()
  }

  const handleReset = () => {
    setIsFlipped(false)
    setIndex(0)
    setDeck(cards)
  }

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') goNext()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === ' ') { e.preventDefault(); setIsFlipped((f) => !f) }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev])

  if (!current) {
    return (
      <div className="space-y-5">
        {/* Progress header skeleton */}
        <div className="flex items-center justify-between gap-3 animate-pulse">
          <div className="space-y-2">
            <div className="h-4 w-20 rounded bg-muted" />
            <div className="h-1.5 w-36 rounded-full bg-muted" />
          </div>
          <div className="flex gap-1.5">
            <div className="h-8 w-20 rounded-lg bg-muted" />
            <div className="h-8 w-16 rounded-lg bg-muted" />
          </div>
        </div>
        {/* Card skeleton */}
        <div className="h-64 sm:h-72 w-full rounded-2xl border border-border bg-muted/30 animate-pulse" />
        {/* Action buttons skeleton */}
        <div className="grid grid-cols-2 gap-2 sm:hidden animate-pulse">
          <div className="h-12 rounded-xl bg-muted" />
          <div className="h-12 rounded-xl bg-muted" />
        </div>
        <div className="hidden sm:flex items-center justify-between gap-4 animate-pulse">
          <div className="h-8 w-16 rounded-lg bg-muted" />
          <div className="flex gap-2">
            <div className="h-8 w-28 rounded-lg bg-muted" />
            <div className="h-8 w-24 rounded-lg bg-muted" />
          </div>
          <div className="h-8 w-16 rounded-lg bg-muted" />
        </div>
      </div>
    )
  }

  const progressPct = (knownCount / totalCards) * 100

  return (
    <div className="space-y-5">
      {/* Progress header */}
      <div className="flex items-center justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              {index + 1} / {deck.length}
            </span>
            <CardStatusBadge card={current} moduleId={moduleId} knownIds={knownIds} reviewIds={reviewIds} />
            {isDeckComplete && (
              <span className="flex items-center gap-1 rounded-full bg-brand/10 px-2.5 py-0.5 text-[10px] font-semibold text-brand">
                <Trophy className="h-3 w-3" /> Done
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <div className="relative h-1.5 w-32 sm:w-40 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-brand"
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {knownCount}/{totalCards} known
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="sm" onClick={handleShuffle} disabled={shuffling} className="h-8 gap-1.5 text-xs px-2.5">
            <motion.span
              animate={shuffling ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            >
              <Shuffle className="h-3.5 w-3.5" />
            </motion.span>
            <span className="hidden sm:inline">{shuffling ? 'Shuffling…' : 'Shuffle'}</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1.5 text-xs px-2.5">
            <RotateCcw className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
        </div>
      </div>

      {/* Card area with swipe gesture support */}
      <div className="relative select-none">
        <motion.div
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          style={{ touchAction: 'pan-y' }}
          onDragStart={() => { isDragging.current = true }}
          onDragEnd={(_, info) => {
            const swipedLeft  = info.offset.x < -60 || info.velocity.x < -400
            const swipedRight = info.offset.x > 60  || info.velocity.x > 400
            if (swipedLeft) goNext()
            else if (swipedRight) goPrev()
            // Allow click only if not a swipe
            setTimeout(() => { isDragging.current = false }, 0)
          }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={`${current.id}-${deck.indexOf(current)}`}
              initial={{ opacity: 0, x: direction === 'forward' ? 36 : -36, scale: 0.97 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction === 'forward' ? -36 : 36, scale: 0.97 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <FlashCard
                card={current}
                isFlipped={isFlipped}
                onFlip={() => { if (!isDragging.current) setIsFlipped((f) => !f) }}
              />
            </motion.div>
          </AnimatePresence>

          {/* Celebration overlay */}
          <AnimatePresence>
            {celebrating && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute inset-0 flex items-center justify-center rounded-2xl bg-brand/10 backdrop-blur-sm border border-brand/30"
              >
                <div className="text-center space-y-2 p-6">
                  <Trophy className="h-12 w-12 text-brand mx-auto" />
                  <p className="text-lg font-bold text-brand">Deck Complete!</p>
                  <p className="text-sm text-muted-foreground">+{XP_REWARDS.FLASHCARD_COMPLETE} XP earned</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Swipe edge hints — mobile only */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background/40 to-transparent rounded-l-2xl sm:hidden" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 bg-gradient-to-l from-background/40 to-transparent rounded-r-2xl sm:hidden" />
      </div>

      {/* ── Mobile action layout (< sm) ────────────────────────────────── */}
      <div className="flex flex-col gap-3 sm:hidden">
        {/* Mark buttons — full width grid */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            onClick={handleReviewLater}
            className={cn(
              'h-12 gap-2 border-amber-300 text-amber-700 hover:bg-amber-50',
              'dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30',
              reviewIds.includes(current.id) && 'bg-amber-50 dark:bg-amber-950/30'
            )}
          >
            <Clock className="h-4 w-4" />
            Review Later
          </Button>
          <Button
            variant="outline"
            onClick={handleMarkKnown}
            className={cn(
              'h-12 gap-2 border-brand/40 text-brand hover:bg-brand/5',
              knownIds.includes(current.id) && 'bg-brand/10'
            )}
          >
            <CheckCircle2 className="h-4 w-4" />
            Got It
          </Button>
        </div>

        {/* Prev / counter / Next */}
        <div className="flex items-center justify-between gap-2">
          <Button variant="outline" onClick={goPrev} disabled={index === 0} className="h-11 px-5 gap-1">
            <ChevronLeft className="h-4 w-4" /> Prev
          </Button>
          <span className="text-sm font-mono text-muted-foreground tabular-nums">
            {index + 1} / {deck.length}
          </span>
          <Button variant="outline" onClick={goNext} disabled={index === deck.length - 1} className="h-11 px-5 gap-1">
            Next <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* ── Desktop action layout (≥ sm) ───────────────────────────────── */}
      <div className="hidden sm:flex items-center justify-between gap-4">
        <Button variant="outline" size="sm" onClick={goPrev} disabled={index === 0} className="gap-1.5">
          <ChevronLeft className="h-4 w-4" /> Prev
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReviewLater}
            className={cn(
              'gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50',
              'dark:border-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30',
              reviewIds.includes(current.id) && 'bg-amber-50 dark:bg-amber-950/30'
            )}
          >
            <Clock className="h-3.5 w-3.5" /> Review Later
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleMarkKnown}
            className={cn(
              'gap-1.5 border-brand/40 text-brand hover:bg-brand/5',
              knownIds.includes(current.id) && 'bg-brand/10'
            )}
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Mark Known
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={goNext} disabled={index === deck.length - 1} className="gap-1.5">
          Next <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Interaction hint */}
      <p className="text-center text-[11px] text-muted-foreground/50">
        <span className="sm:hidden">Swipe left/right to navigate · Tap card to flip</span>
        <span className="hidden sm:inline">← → arrow keys to navigate · Space to flip</span>
      </p>
    </div>
  )
}
