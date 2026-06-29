"use client"

import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, ChevronRight, Check, X, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { HintSystem } from './HintSystem'
import { QuizResults } from './QuizResults'
import { useProgress } from '@/hooks/useProgress'
import { XP_REWARDS, XP_PENALTIES, PASSING_SCORE } from '@/lib/constants'
import type { Quiz, Question } from '@/types'

// ---------- individual question renderers ----------

function MultipleChoice({
  question,
  selected,
  onSelect,
  submitted,
}: {
  question: Question
  selected: string
  onSelect: (v: string) => void
  submitted: boolean
}) {
  return (
    <div className="space-y-2.5">
      {question.options?.map((opt, i) => {
        const isSelected = selected === opt
        const isCorrect = opt === question.answer
        const showState = submitted

        return (
          <motion.button
            key={opt}
            onClick={() => !submitted && onSelect(opt)}
            disabled={submitted}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.2 }}
            whileHover={!submitted ? { scale: 1.005, transition: { duration: 0.12 } } : {}}
            whileTap={!submitted ? { scale: 0.98, transition: { duration: 0.08 } } : {}}
            className={cn(
              'w-full flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition-colors',
              !showState && !isSelected && 'border-border bg-card hover:bg-accent/40 hover:border-brand/40',
              !showState && isSelected && 'border-brand/50 bg-brand/10',
              showState && isCorrect && 'border-brand bg-brand/10',
              showState && isSelected && !isCorrect && 'border-red-400 bg-red-50 dark:bg-red-950/20',
              showState && !isSelected && !isCorrect && 'border-border/50 bg-card opacity-60',
            )}
          >
            <motion.span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                !showState && isSelected ? 'border-brand bg-brand text-white' : 'border-muted-foreground/40',
                showState && isCorrect ? 'border-brand bg-brand text-white' : '',
                showState && isSelected && !isCorrect ? 'border-red-500 bg-red-500 text-white' : '',
              )}
              animate={showState && isCorrect ? { scale: [1, 1.25, 1] } : {}}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {showState && isCorrect && <Check className="h-3 w-3" />}
              {showState && isSelected && !isCorrect && <X className="h-3 w-3" />}
              {!showState && isSelected && <Circle className="h-2 w-2 fill-current" />}
            </motion.span>
            <span className={cn(
              'font-medium',
              showState && isCorrect ? 'text-brand' : '',
              showState && isSelected && !isCorrect ? 'text-red-600 dark:text-red-400' : 'text-foreground',
            )}>
              {opt}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

function TrueFalse({
  question,
  selected,
  onSelect,
  submitted,
}: {
  question: Question
  selected: string
  onSelect: (v: string) => void
  submitted: boolean
}) {
  return (
    <div className="flex gap-4">
      {['True', 'False'].map((opt) => {
        const isSelected = selected === opt
        const isCorrect = opt === question.answer
        const showState = submitted

        return (
          <motion.button
            key={opt}
            onClick={() => !submitted && onSelect(opt)}
            disabled={submitted}
            whileHover={!submitted ? { scale: 1.02, transition: { duration: 0.15 } } : {}}
            whileTap={!submitted ? { scale: 0.97, transition: { duration: 0.08 } } : {}}
            className={cn(
              'flex-1 rounded-2xl border-2 p-6 text-center font-bold text-lg transition-colors',
              !showState && !isSelected && 'border-border bg-card hover:border-brand/40',
              !showState && isSelected && 'border-brand bg-brand/10 text-brand',
              showState && isCorrect && 'border-brand bg-brand/10 text-brand',
              showState && isSelected && !isCorrect && 'border-red-400 bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400',
              showState && !isSelected && !isCorrect && 'border-border/40 opacity-50',
            )}
          >
            <motion.div
              className="mb-2 flex justify-center"
              animate={showState && isCorrect ? { scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] } : {}}
              transition={{ duration: 0.4, delay: 0.05 }}
            >
              {opt === 'True'
                ? <CheckCircle2 className="h-8 w-8" />
                : <XCircle className="h-8 w-8" />}
            </motion.div>
            {opt}
          </motion.button>
        )
      })}
    </div>
  )
}

function MultipleSelect({
  question,
  selected,
  onToggle,
  submitted,
}: {
  question: Question
  selected: string[]
  onToggle: (v: string) => void
  submitted: boolean
}) {
  const correctAnswers = Array.isArray(question.answer) ? question.answer : [question.answer]

  return (
    <div className="space-y-2.5">
      <p className="text-xs text-muted-foreground mb-4">Select all that apply</p>
      {question.options?.map((opt, i) => {
        const isSelected = selected.includes(opt)
        const isCorrect = correctAnswers.includes(opt)
        const showState = submitted

        return (
          <motion.button
            key={opt}
            onClick={() => !submitted && onToggle(opt)}
            disabled={submitted}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.2 }}
            whileHover={!submitted ? { scale: 1.005, transition: { duration: 0.12 } } : {}}
            whileTap={!submitted ? { scale: 0.98, transition: { duration: 0.08 } } : {}}
            className={cn(
              'w-full flex items-center gap-3 rounded-xl border p-4 text-left text-sm transition-colors',
              !showState && !isSelected && 'border-border bg-card hover:bg-accent/40',
              !showState && isSelected && 'border-brand/50 bg-brand/10',
              showState && isCorrect && 'border-brand bg-brand/10',
              showState && isSelected && !isCorrect && 'border-red-400 bg-red-50 dark:bg-red-950/20',
            )}
          >
            <motion.span
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded border',
                showState && isCorrect ? 'bg-brand border-brand text-white' : isSelected ? 'bg-brand border-brand text-white' : 'border-muted-foreground/40',
              )}
              animate={showState && isCorrect ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {(isSelected || (showState && isCorrect)) && <Check className="h-3 w-3" />}
            </motion.span>
            <span className={cn(
              showState && isCorrect ? 'text-brand font-medium' : 'text-foreground'
            )}>
              {opt}
            </span>
          </motion.button>
        )
      })}
    </div>
  )
}

function UrlRecognition({
  question,
  selected,
  onSelect,
  submitted,
}: {
  question: Question
  selected: string
  onSelect: (v: string) => void
  submitted: boolean
}) {
  return (
    <div className="space-y-2.5">
      <p className="text-xs text-muted-foreground mb-2">Select the phishing URL:</p>
      {question.options?.map((url) => {
        const isSelected = selected === url
        const isCorrect = url === question.answer
        const showState = submitted

        return (
          <button
            key={url}
            onClick={() => !submitted && onSelect(url)}
            disabled={submitted}
            className={cn(
              'w-full rounded-xl border p-4 text-left transition-all',
              !showState && !isSelected && 'border-border bg-card hover:bg-accent/40',
              !showState && isSelected && 'border-brand/50 bg-brand/10',
              showState && isCorrect && 'border-brand bg-brand/10',
              showState && isSelected && !isCorrect && 'border-red-400 bg-red-50 dark:bg-red-950/20',
            )}
          >
            <code className={cn(
              'text-xs break-all leading-relaxed',
              showState && isCorrect ? 'text-brand' : 'text-foreground/80',
              showState && isSelected && !isCorrect ? 'text-red-600 dark:text-red-400' : ''
            )}>
              {url}
            </code>
          </button>
        )
      })}
    </div>
  )
}

function MatchPair({
  question,
  selected,
  onSelect,
  submitted,
}: {
  question: Question
  selected: Record<string, string>
  onSelect: (pairs: Record<string, string>) => void
  submitted: boolean
}) {
  const pairs = question.matchPairs ?? {}
  const keys = Object.keys(pairs)
  const values = Object.values(pairs)

  const [activeKey, setActiveKey] = useState<string | null>(null)

  const handleKeyClick = (key: string) => {
    if (submitted) return
    setActiveKey(activeKey === key ? null : key)
  }

  const handleValueClick = (value: string) => {
    if (submitted || !activeKey) return
    const updated = { ...selected, [activeKey]: value }
    onSelect(updated)
    setActiveKey(null)
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Left column — terms */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Terms</p>
        {keys.map((key) => (
          <button
            key={key}
            onClick={() => handleKeyClick(key)}
            disabled={submitted}
            className={cn(
              'w-full rounded-lg border p-3 text-left text-xs font-medium transition-all',
              activeKey === key ? 'border-brand bg-brand/10 text-brand' : 'border-border bg-card hover:border-brand/30',
              submitted && pairs[key] === selected[key] ? 'border-brand/40 bg-brand/5 text-brand' : '',
              submitted && pairs[key] !== selected[key] && selected[key] ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400' : '',
            )}
          >
            {key}
            {selected[key] && (
              <span className="block text-[10px] text-muted-foreground mt-0.5 truncate">→ {selected[key]}</span>
            )}
          </button>
        ))}
      </div>

      {/* Right column — definitions */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Definitions</p>
        {values.map((value) => {
          const isMatched = Object.values(selected).includes(value)
          return (
            <button
              key={value}
              onClick={() => handleValueClick(value)}
              disabled={submitted || (isMatched && activeKey === null)}
              className={cn(
                'w-full rounded-lg border p-3 text-left text-xs transition-all',
                isMatched ? 'border-brand/30 bg-brand/5 opacity-70' : 'border-border bg-card hover:border-brand/30',
                activeKey ? 'cursor-pointer hover:bg-brand/5 hover:border-brand/40' : '',
              )}
            >
              {value}
            </button>
          )
        })}
      </div>

      {activeKey && (
        <p className="col-span-2 text-xs text-brand">
          Selected: <strong>{activeKey}</strong> — now click the matching definition
        </p>
      )}
    </div>
  )
}

function TimelineOrdering({
  question,
  selected,
  onReorder,
  submitted,
}: {
  question: Question
  selected: string[]
  onReorder: (items: string[]) => void
  submitted: boolean
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null)

  const items = selected.length > 0 ? selected : (question.dragItems ?? [])
  const correct = Array.isArray(question.answer) ? question.answer : []

  const handleDragStart = (i: number) => setDragIndex(i)
  const handleDrop = (i: number) => {
    if (dragIndex === null || dragIndex === i) return
    const updated = [...items]
    const [moved] = updated.splice(dragIndex, 1)
    updated.splice(i, 0, moved)
    onReorder(updated)
    setDragIndex(null)
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground mb-3">Drag to reorder into the correct sequence:</p>
      {items.map((item, i) => {
        const correctIndex = correct.indexOf(item)
        const isCorrectPos = submitted && correctIndex === i
        const isWrongPos = submitted && correctIndex !== i

        return (
          <div
            key={item}
            draggable={!submitted}
            onDragStart={() => handleDragStart(i)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDrop(i)}
            className={cn(
              'flex items-center gap-3 rounded-xl border p-3.5 text-sm cursor-grab active:cursor-grabbing transition-all',
              !submitted && 'border-border bg-card hover:border-brand/30 hover:bg-accent/20',
              isCorrectPos && 'border-brand/40 bg-brand/5',
              isWrongPos && 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-950/10',
            )}
          >
            <span className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold',
              isCorrectPos ? 'bg-brand text-white' : isWrongPos ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground',
            )}>
              {i + 1}
            </span>
            <span className="flex-1 text-xs leading-snug">{item}</span>
            {!submitted && <span className="text-muted-foreground/40 text-xs">⠿</span>}
            {isCorrectPos && <CheckCircle2 className="h-4 w-4 text-brand shrink-0" />}
            {isWrongPos && <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
          </div>
        )
      })}
    </div>
  )
}

function ScenarioOrDecision({
  question,
  selected,
  onSelect,
  submitted,
}: {
  question: Question
  selected: string
  onSelect: (v: string) => void
  submitted: boolean
}) {
  return (
    <div className="space-y-4">
      {question.scenario && (
        <div className="rounded-xl border border-amber-200 dark:border-amber-800/50 bg-amber-50/60 dark:bg-amber-950/20 p-4">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">Scenario</p>
          <p className="text-sm text-foreground/90 leading-relaxed">{question.scenario}</p>
        </div>
      )}
      <MultipleChoice question={question} selected={selected} onSelect={onSelect} submitted={submitted} />
    </div>
  )
}

// ---------- main QuizEngine ----------

interface QuizState {
  phase: 'question' | 'feedback' | 'results'
  currentIndex: number
  answers: Record<string, string | string[] | Record<string, string>>
  hintsUsed: Record<string, number>
  xpDeducted: Record<string, number>
  resultItems: {
    question: Question
    userAnswer: string | string[]
    correct: boolean
    hintsUsed: number
    xpDeducted: number
  }[]
  feedbackCorrect: boolean
  totalXP: number
}

interface QuizEngineProps {
  quiz: Quiz
  onComplete: () => void
}

function normalizeAnswer(val: unknown): string | string[] {
  if (Array.isArray(val)) return val
  if (typeof val === 'object' && val !== null) return Object.values(val as Record<string, string>)
  return String(val ?? '')
}

function checkAnswer(question: Question, userAnswer: unknown): boolean {
  const correct = question.answer
  if (question.type === 'drag-drop') {
    const ua = Array.isArray(userAnswer) ? userAnswer : []
    const ans = Array.isArray(correct) ? correct : []
    return ans.length === ua.length && ans.every((a) => ua.includes(a)) && ua.every((u) => ans.includes(u))
  }
  if (Array.isArray(correct)) {
    const ua = Array.isArray(userAnswer) ? userAnswer : []
    return correct.length === ua.length && correct.every((c) => ua.includes(c)) && ua.every((u) => correct.includes(u))
  }
  if (question.type === 'match-pair') {
    const pairs = question.matchPairs ?? {}
    const ua = userAnswer as Record<string, string>
    return Object.keys(pairs).every((k) => ua[k] === pairs[k])
  }
  if (question.type === 'timeline-ordering') {
    const ua = Array.isArray(userAnswer) ? userAnswer : []
    const ans = Array.isArray(correct) ? correct : []
    return ans.every((a, i) => a === ua[i])
  }
  return String(userAnswer) === String(correct)
}

export function QuizEngine({ quiz, onComplete }: QuizEngineProps) {
  const { addXP, saveQuizScore, completeModule } = useProgress()

  // Cap at 5 questions — pick a random 5 each attempt
  const questions = quiz.questions.slice(0, 5)
  const cappedQuiz = { ...quiz, questions }

  const [state, setState] = useState<QuizState>({
    phase: 'question',
    currentIndex: 0,
    answers: {},
    hintsUsed: {},
    xpDeducted: {},
    resultItems: [],
    feedbackCorrect: false,
    totalXP: 0,
  })

  const question = cappedQuiz.questions[state.currentIndex]
  const currentAnswer = state.answers[question?.id ?? '']
  const isLast = state.currentIndex === cappedQuiz.questions.length - 1

  // Auto-initialize timeline ordering and match-pair so Submit is available on first render
  useEffect(() => {
    if (!question) return
    if (question.type === 'timeline-ordering' && !currentAnswer && question.dragItems?.length) {
      setAnswer(question.id, [...question.dragItems])
    }
    if (question.type === 'match-pair' && !currentAnswer) {
      setAnswer(question.id, {})
    }
  }, [question?.id, question?.type]) // eslint-disable-line react-hooks/exhaustive-deps

  const hasAnswer = useCallback(() => {
    if (!currentAnswer) return false
    if (Array.isArray(currentAnswer)) return currentAnswer.length > 0
    if (typeof currentAnswer === 'object') return Object.keys(currentAnswer).length > 0
    return currentAnswer !== ''
  }, [currentAnswer])

  const setAnswer = (id: string, val: unknown) => {
    setState((s) => ({ ...s, answers: { ...s.answers, [id]: val as string | string[] } }))
  }

  const handleHint = (penalty: number) => {
    setState((s) => ({
      ...s,
      xpDeducted: { ...s.xpDeducted, [question.id]: (s.xpDeducted[question.id] ?? 0) + penalty },
      hintsUsed: { ...s.hintsUsed, [question.id]: (s.hintsUsed[question.id] ?? 0) + 1 },
    }))
  }

  const handleSubmit = () => {
    if (!hasAnswer()) return
    const correct = checkAnswer(question, currentAnswer)
    setState((s) => ({ ...s, phase: 'feedback', feedbackCorrect: correct }))
  }

  const handleNext = () => {
    const correct = checkAnswer(question, currentAnswer)
    const deducted = state.xpDeducted[question.id] ?? 0
    const xpForQuestion = correct ? Math.max(10 - deducted, 0) : 0

    const resultItem = {
      question,
      userAnswer: normalizeAnswer(currentAnswer),
      correct,
      hintsUsed: state.hintsUsed[question.id] ?? 0,
      xpDeducted: deducted,
    }

    if (isLast) {
      const allResults = [...state.resultItems, resultItem]
      const correctCount = allResults.filter((r) => r.correct).length
      const score = Math.round((correctCount / cappedQuiz.questions.length) * 100)
      const passed = score >= PASSING_SCORE
      const baseXP = passed ? XP_REWARDS.QUIZ_PASS : 0
      const perfectBonus = score === 100 ? XP_REWARDS.QUIZ_PERFECT_BONUS : 0
      const totalXP = baseXP + perfectBonus + xpForQuestion

      if (totalXP > 0) addXP(totalXP)
      saveQuizScore({ moduleId: cappedQuiz.moduleId, score, attempts: 1, passed, completedAt: new Date().toISOString(), xpEarned: totalXP })
      if (passed) completeModule(cappedQuiz.moduleId)

      setState((s) => ({
        ...s,
        phase: 'results',
        resultItems: allResults,
        totalXP,
      }))
    } else {
      if (xpForQuestion > 0) addXP(xpForQuestion)
      setState((s) => ({
        ...s,
        phase: 'question',
        currentIndex: s.currentIndex + 1,
        resultItems: [...s.resultItems, resultItem],
        totalXP: s.totalXP + xpForQuestion,
      }))
    }
  }

  const handleRetry = () => {
    setState({
      phase: 'question',
      currentIndex: 0,
      answers: {},
      hintsUsed: {},
      xpDeducted: {},
      resultItems: [],
      feedbackCorrect: false,
      totalXP: 0,
    })
  }

  if (state.phase === 'results') {
    return (
      <QuizResults
        results={state.resultItems}
        totalXP={state.totalXP}
        moduleId={cappedQuiz.moduleId}
        onRetry={handleRetry}
        onContinue={onComplete}
      />
    )
  }

  const progress = ((state.currentIndex) / cappedQuiz.questions.length) * 100

  return (
    <div className="rounded-2xl border border-border/40 bg-card/80 backdrop-blur-sm shadow-sm p-5 sm:p-6 space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Question {state.currentIndex + 1} of {cappedQuiz.questions.length}</span>
          <span className="capitalize text-brand">{question.type.replace(/-/g, ' ')}</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-brand"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Question */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <h3 className="text-base font-semibold text-foreground leading-snug">{question.prompt}</h3>
          </div>

          {/* Question type renderer — shakes on wrong answer */}
          <motion.div
            animate={
              state.phase === 'feedback' && !state.feedbackCorrect
                ? { x: [-10, 10, -7, 7, -4, 4, 0] }
                : { x: 0 }
            }
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            {(question.type === 'multiple-choice' || question.type === 'hotspot') && (
              <MultipleChoice
                question={question}
                selected={currentAnswer as string ?? ''}
                onSelect={(v) => setAnswer(question.id, v)}
                submitted={state.phase === 'feedback'}
              />
            )}
            {question.type === 'true-false' && (
              <TrueFalse
                question={question}
                selected={currentAnswer as string ?? ''}
                onSelect={(v) => setAnswer(question.id, v)}
                submitted={state.phase === 'feedback'}
              />
            )}
            {(question.type === 'multiple-select' || question.type === 'email-inspection') && (
              <MultipleSelect
                question={question}
                selected={currentAnswer as string[] ?? []}
                onToggle={(v) => {
                  const current = (currentAnswer as string[]) ?? []
                  setAnswer(question.id, current.includes(v) ? current.filter((c) => c !== v) : [...current, v])
                }}
                submitted={state.phase === 'feedback'}
              />
            )}
            {question.type === 'url-recognition' && (
              <UrlRecognition
                question={question}
                selected={currentAnswer as string ?? ''}
                onSelect={(v) => setAnswer(question.id, v)}
                submitted={state.phase === 'feedback'}
              />
            )}
            {question.type === 'match-pair' && (
              <MatchPair
                question={question}
                selected={(currentAnswer as Record<string, string>) ?? {}}
                onSelect={(v) => setAnswer(question.id, v)}
                submitted={state.phase === 'feedback'}
              />
            )}
            {question.type === 'timeline-ordering' && (
              <TimelineOrdering
                question={question}
                selected={(currentAnswer as string[]) ?? (question.dragItems ?? [])}
                onReorder={(v) => setAnswer(question.id, v)}
                submitted={state.phase === 'feedback'}
              />
            )}
            {(question.type === 'scenario' || question.type === 'decision') && (
              <ScenarioOrDecision
                question={question}
                selected={currentAnswer as string ?? ''}
                onSelect={(v) => setAnswer(question.id, v)}
                submitted={state.phase === 'feedback'}
              />
            )}
            {question.type === 'drag-drop' && (
              <MultipleSelect
                question={question}
                selected={currentAnswer as string[] ?? []}
                onToggle={(v) => {
                  const current = (currentAnswer as string[]) ?? []
                  setAnswer(question.id, current.includes(v) ? current.filter((c) => c !== v) : [...current, v])
                }}
                submitted={state.phase === 'feedback'}
              />
            )}
          </motion.div>

          {/* Feedback */}
          <AnimatePresence>
            {state.phase === 'feedback' && (
              <motion.div
                initial={{ opacity: 0, height: 0, scale: 0.97 }}
                animate={{ opacity: 1, height: 'auto', scale: 1 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="overflow-hidden"
              >
                <div className={cn(
                  'rounded-xl border p-4 space-y-2',
                  state.feedbackCorrect
                    ? 'border-brand/30 bg-brand/5'
                    : 'border-red-200 dark:border-red-800/50 bg-red-50/60 dark:bg-red-950/20'
                )}>
                  <div className="flex items-center gap-2">
                    <motion.div
                      initial={{ scale: 0, rotate: -20 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.05 }}
                    >
                      {state.feedbackCorrect ? (
                        <CheckCircle2 className="h-5 w-5 text-brand" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </motion.div>
                    <span className={cn(
                      'text-sm font-bold',
                      state.feedbackCorrect ? 'text-brand' : 'text-red-600 dark:text-red-400'
                    )}>
                      {state.feedbackCorrect ? 'Correct!' : 'Not quite right'}
                    </span>
                  </div>
                  <p className="text-xs text-foreground/80 leading-relaxed">{question.explanation}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hints + submit row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <HintSystem
              hints={question.hints}
              onUseHint={handleHint}
              disabled={state.phase === 'feedback'}
            />

            <AnimatePresence mode="wait">
              {state.phase === 'question' ? (
                <motion.div
                  key="submit"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="w-full sm:w-auto"
                  whileHover={hasAnswer() ? { scale: 1.02 } : {}}
                  whileTap={hasAnswer() ? { scale: 0.97 } : {}}
                >
                  <Button
                    onClick={handleSubmit}
                    disabled={!hasAnswer()}
                    className="w-full"
                  >
                    Submit Answer
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="next"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.15 }}
                  className="w-full sm:w-auto"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    onClick={handleNext}
                    className="w-full gap-2"
                  >
                    {isLast ? 'See Results' : 'Next Question'}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

