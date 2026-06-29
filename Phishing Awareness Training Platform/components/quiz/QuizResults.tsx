"use client"

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, XCircle, RotateCcw, ChevronRight, Star, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { PASSING_SCORE } from '@/lib/constants'
import type { Question } from '@/types'

interface ResultItem {
  question: Question
  userAnswer: string | string[]
  correct: boolean
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
  const score = Math.round((correct / total) * 100)
  const passed = score >= PASSING_SCORE

  useEffect(() => {
    if (passed) {
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.6 }, colors: ['#16a34a', '#22c55e', '#4ade80'] })
      })
    }
  }, [passed])

  return (
    <div className="space-y-8">
      {/* Score card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: 'backOut' }}
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
              transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-brand/10"
            >
              <Trophy className="h-10 w-10 text-brand" />
            </motion.div>
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30">
              <XCircle className="h-10 w-10 text-red-500" />
            </div>
          )}

          <div>
            <h2 className="text-4xl font-black text-foreground">{score}%</h2>
            <p className={cn('text-lg font-semibold mt-1', passed ? 'text-brand' : 'text-red-500')}>
              {passed ? 'Quiz Passed!' : 'Not Passed Yet'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {correct} of {total} correct · Need {PASSING_SCORE}% to pass
            </p>
          </div>

          {/* XP earned */}
          <div className="flex items-center gap-2 rounded-full bg-background/80 border border-border px-5 py-2">
            <Star className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-bold text-foreground">+{totalXP} XP earned</span>
          </div>
        </div>
      </motion.div>

      {/* Per-question breakdown */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Question Breakdown</h3>
        {results.map((result, i) => (
          <motion.div
            key={result.question.id}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 + i * 0.05 }}
            className={cn(
              'rounded-xl border p-4 space-y-2',
              result.correct
                ? 'border-brand/20 bg-brand/5'
                : 'border-red-200/60 dark:border-red-800/30 bg-red-50/40 dark:bg-red-950/10'
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <span className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full',
                  result.correct ? 'bg-brand text-white' : 'bg-red-500 text-white'
                )}>
                  {result.correct ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                </span>
                <p className="text-xs font-medium text-foreground leading-snug">{result.question.prompt}</p>
              </div>
              {result.hintsUsed > 0 && (
                <span className="shrink-0 text-[10px] text-amber-600 dark:text-amber-400">
                  −{result.xpDeducted} XP (hints)
                </span>
              )}
            </div>

            {!result.correct && (
              <div className="pl-7 space-y-1">
                <p className="text-[11px] text-red-600 dark:text-red-400">
                  Your answer: {Array.isArray(result.userAnswer) ? result.userAnswer.join(', ') : result.userAnswer || 'No answer'}
                </p>
                <p className="text-[11px] text-brand">
                  Correct: {Array.isArray(result.question.answer) ? result.question.answer.join(', ') : result.question.answer}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed pt-1">
                  {result.question.explanation}
                </p>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onRetry} className="flex-1 gap-2">
          <RotateCcw className="h-4 w-4" />
          Retry Quiz
        </Button>
        {passed && (
          <Button onClick={onContinue} className="flex-1 gap-2 bg-brand hover:bg-brand/90 text-white">
            Continue
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}
