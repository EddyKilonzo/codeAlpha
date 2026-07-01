"use client"

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, XCircle, RotateCcw, ChevronRight, Star, Check, X, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PASSING_SCORE } from '@/lib/constants'
import { haptics } from '@/lib/haptics'
import { computeScore } from '@/lib/quizScoring'
import { useCountUp } from '@/hooks/useCountUp'
import type { Question } from '@/types'

interface ResultItem {
  question: Question
  userAnswer: string | string[]
  correct: boolean
  /** Fractional credit toward the score (1 = full, 0 = none, between = partial). */
  credit?: number
  hintsUsed: number
  xpDeducted: number
}

interface Props {
  results: ResultItem[]
  totalXP: number
  moduleId: string
  onRetry: () => void
  onContinue: () => void
}

export function QuizResults({ results, totalXP, moduleId, onRetry, onContinue }: Props) {
  const correct = results.filter((r) => r.correct).length
  const total = results.length
  // Score uses fractional credit so partially-correct multi-answer questions
  // count proportionally (e.g. 4 of 5 = 0.8) instead of as a zero.
  const score = computeScore(results)
  const passed = score >= PASSING_SCORE
  const scoreHasDecimals = !Number.isInteger(score)

  // Animated count-ups — start at 0 and count to final values
  const animatedScore = useCountUp(score, 900, true, scoreHasDecimals ? 2 : 0)
  const animatedXP = useCountUp(totalXP, 1100)

  useEffect(() => {
    if (passed) {
      haptics.success()
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#16a34a', '#22c55e', '#4ade80'] })
      })
    } else {
      haptics.error()
    }
  }, [passed])

  return (
    <div
      className="space-y-8 rounded-2xl p-4 sm:p-6"
      style={{ boxShadow: 'rgba(50, 50, 93, 0.25) 0px 50px 100px -20px, rgba(0, 0, 0, 0.3) 0px 30px 60px -30px, rgba(10, 37, 64, 0.35) 0px -2px 6px 0px inset' }}
    >
      {/* Score card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          'relative overflow-hidden rounded-2xl border p-8 text-center',
          passed
            ? 'border-brand/30 bg-gradient-to-br from-brand/5 to-brand/10'
            : 'border-red-200 dark:border-red-800/50 bg-gradient-to-br from-red-50/50 to-red-50/20 dark:from-red-950/20 dark:to-red-950/10'
        )}
      >
        <div className="flex flex-col items-center space-y-4">
          {passed ? (
            <motion.div
              initial={{ rotate: -20, scale: 0 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 22 }}
              className="relative flex h-20 w-20 items-center justify-center rounded-full bg-brand/10"
            >
              {/* Glow ring on pass */}
              <motion.div
                className="absolute inset-0 rounded-full bg-brand/20"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                style={{ filter: 'blur(10px)' }}
              />
              <Trophy className="relative h-10 w-10 text-brand" />
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 22 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30"
            >
              <XCircle className="h-10 w-10 text-red-500" />
            </motion.div>
          )}

          <div>
            {/* Animated score percentage */}
            <motion.h2
              className="text-4xl font-black text-foreground tabular-nums"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              {scoreHasDecimals ? animatedScore.toFixed(2) : animatedScore}%
            </motion.h2>
            <p className={cn('text-lg font-semibold mt-1', passed ? 'text-brand' : 'text-red-500')}>
              {passed ? 'Quiz Passed!' : 'Not Passed Yet'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {correct} of {total} correct · Need {PASSING_SCORE}% to pass
            </p>
          </div>

          {/* Animated XP earned */}
          {totalXP > 0 && (
            <motion.div
              className="flex items-center gap-2 rounded-full bg-background/80 border border-brand/25 px-5 py-2"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, type: 'spring', stiffness: 300, damping: 22 }}
            >
              <Star className="h-4 w-4 text-brand" />
              <span className="text-sm font-bold text-brand font-mono">+{animatedXP} XP earned</span>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Per-question breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Question Breakdown</h3>
        {results.map((result, i) => {
          const isMultiAnswer = ['multiple-select', 'email-inspection', 'drag-drop'].includes(result.question.type)
          const correctAnswers = isMultiAnswer && Array.isArray(result.question.answer) ? result.question.answer : []
          const ua = isMultiAnswer && Array.isArray(result.userAnswer) ? result.userAnswer : []
          const gotRight  = correctAnswers.filter(a => ua.includes(a))
          const wrongPick = ua.filter(a => !correctAnswers.includes(a))
          const missed    = correctAnswers.filter(a => !ua.includes(a))
          const isPartial = isMultiAnswer && !result.correct && gotRight.length > 0

          return (
            <motion.div
              key={result.question.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className={cn(
                'rounded-xl border p-4 space-y-2',
                result.correct && 'border-brand/20 bg-brand/5',
                isPartial     && 'border-amber-400/40 bg-amber-50/30 dark:bg-amber-950/10',
                !result.correct && !isPartial && 'border-red-200/60 dark:border-red-800/30 bg-red-50/40 dark:bg-red-950/10',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2">
                  <span className={cn(
                    'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                    result.correct && 'bg-brand text-white',
                    isPartial     && 'bg-amber-500 text-white',
                    !result.correct && !isPartial && 'bg-red-500 text-white',
                  )}>
                    {result.correct && <Check className="h-3 w-3" />}
                    {isPartial     && <AlertCircle className="h-3 w-3" />}
                    {!result.correct && !isPartial && <X className="h-3 w-3" />}
                  </span>
                  <div>
                    <p className="text-xs font-medium text-foreground leading-snug">{result.question.prompt}</p>
                    {isPartial && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                        {gotRight.length} of {correctAnswers.length} correct
                      </p>
                    )}
                  </div>
                </div>
                {result.hintsUsed > 0 && (
                  <span className="shrink-0 text-[10px] text-muted-foreground">
                    −{result.xpDeducted} XP (hints)
                  </span>
                )}
              </div>

              {/* Partial: per-answer breakdown */}
              {isPartial && (
                <div className="pl-7 space-y-1.5">
                  {gotRight.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {gotRight.map(a => (
                        <span key={a} className="inline-flex items-center gap-1 text-[10px] bg-brand/10 text-brand border border-brand/25 rounded-md px-1.5 py-0.5 font-medium">
                          <Check className="h-2.5 w-2.5" />{a}
                        </span>
                      ))}
                    </div>
                  )}
                  {wrongPick.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {wrongPick.map(a => (
                        <span key={a} className="inline-flex items-center gap-1 text-[10px] bg-red-50 text-red-600 border border-red-200/70 rounded-md px-1.5 py-0.5 dark:bg-red-950/20 dark:text-red-400 dark:border-red-800/40 font-medium">
                          <X className="h-2.5 w-2.5" />{a}
                        </span>
                      ))}
                    </div>
                  )}
                  {missed.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {missed.map(a => (
                        <span key={a} className="inline-flex items-center gap-1 text-[10px] bg-amber-50 text-amber-700 border border-amber-200/70 rounded-md px-1.5 py-0.5 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-800/40 font-medium">
                          missed: {a}
                        </span>
                      ))}
                    </div>
                  )}
                  <p className="text-[11px] text-muted-foreground leading-relaxed pt-0.5">
                    {result.question.explanation}
                  </p>
                </div>
              )}

              {/* Fully wrong: show correct answer */}
              {!result.correct && !isPartial && (
                <div className="pl-7 space-y-1">
                  <p className="text-[11px] text-red-600 dark:text-red-400">
                    Your answer: {Array.isArray(result.userAnswer) ? result.userAnswer.join(' · ') : result.userAnswer || 'No answer'}
                  </p>
                  <p className="text-[11px] text-brand">
                    Correct:{' '}
                    {result.question.type === 'match-pair' && result.question.matchPairs
                      ? Object.entries(result.question.matchPairs).map(([k, v]) => `${k} → ${v}`).join(' · ')
                      : Array.isArray(result.question.answer)
                        ? result.question.answer.join(', ')
                        : result.question.answer}
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                    {result.question.explanation}
                  </p>
                </div>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onRetry} className="flex-1 gap-2">
          <RotateCcw className="h-4 w-4" />
          Retry Quiz
        </Button>
        {passed && (
          <Button onClick={onContinue} className="flex-1 gap-2">
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
