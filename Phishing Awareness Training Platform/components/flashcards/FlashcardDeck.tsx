"use client"

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Shuffle, CheckCircle2, Clock, RotateCcw, Trophy } from 'lucide-react'
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
    setTimeout(() => setDeck(shuffleArray(cards)), 150)
  }

  const handleMarkKnown = () => {
    if (!current) return
    setFlashcardKnown(moduleId, current.id)
    goNext()

    // Check if all cards are now known
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

  if (!current) return null

  const progressPct = (knownCount / totalCards) * 100

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              Card {index + 1} of {deck.length}
            </span>
            <CardStatusBadge card={current} moduleId={moduleId} knownIds={knownIds} reviewIds={reviewIds} />
          </div>
          <div className="flex items-center gap-3">
            <div className="relative h-1.5 w-40 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-brand"
                animate={{ width: `${progressPct}%` }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              />
            </div>
            <span className="text-xs text-muted-foreground">
              {knownCount}/{totalCards} known
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isDeckComplete && (
            <span className="flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
              <Trophy className="h-3 w-3" /> Completed
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={handleShuffle} className="h-8 gap-1.5 text-xs">
            <Shuffle className="h-3.5 w-3.5" />
            Shuffle
          </Button>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-8 gap-1.5 text-xs">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {/* Card area */}
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={`${current.id}-${deck.indexOf(current)}`}
            initial={{ opacity: 0, x: direction === 'forward' ? 40 : -40, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: direction === 'forward' ? -40 : 40, scale: 0.97 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            <FlashCard
              card={current}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped((f) => !f)}
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
              <div className="text-center space-y-2">
                <Trophy className="h-12 w-12 text-brand mx-auto" />
                <p className="text-lg font-bold text-brand">Deck Complete!</p>
                <p className="text-sm text-muted-foreground">+{XP_REWARDS.FLASHCARD_COMPLETE} XP earned</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation row */}
      <div className="flex items-center justify-between gap-4">
        <Button
          variant="outline"
          size="sm"
          onClick={goPrev}
          disabled={index === 0}
          className="gap-1.5"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </Button>

        {/* Action buttons */}
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
            <Clock className="h-3.5 w-3.5" />
            Review Later
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
            <CheckCircle2 className="h-3.5 w-3.5" />
            Mark Known
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={goNext}
          disabled={index === deck.length - 1}
          className="gap-1.5"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-[11px] text-muted-foreground/60">
        ← → arrow keys to navigate · Space to flip
      </p>
    </div>
  )
}
