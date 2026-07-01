"use client"

import { useState, useCallback, useEffect, useLayoutEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, ChevronRight, Check, X, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { HintSystem } from './HintSystem'
import { QuizResults } from './QuizResults'
import { useProgress } from '@/hooks/useProgress'
import { XP_REWARDS, XP_PENALTIES, PASSING_SCORE } from '@/lib/constants'
import type { Quiz, Question, EmailContent } from '@/types'

// ---------- individual question renderers ----------

function EmailPreview({ email }: { email: EmailContent }) {
  return (
    <div className="rounded-xl border border-border bg-white dark:bg-zinc-900 overflow-hidden text-[12px] shadow-sm mb-4">
      {/* Email client chrome */}
      <div className="bg-muted/60 border-b border-border px-3 py-2 flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <span className="ml-2 text-[11px] text-muted-foreground font-medium">Mail — Inbox</span>
      </div>

      {/* Headers */}
      <div className="border-b border-border/60 px-4 py-3 space-y-1.5 bg-card">
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground w-12 shrink-0 text-right text-[11px] mt-0.5">From:</span>
          <span className="font-medium text-foreground">
            {email.fromDisplay}{' '}
            <span className="font-normal text-orange-600 dark:text-orange-400 font-mono text-[11px]">
              &lt;{email.fromAddr}&gt;
            </span>
          </span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground w-12 shrink-0 text-right text-[11px] mt-0.5">Subject:</span>
          <span className="font-semibold text-foreground">{email.subject}</span>
        </div>
        <div className="flex items-start gap-2">
          <span className="text-muted-foreground w-12 shrink-0 text-right text-[11px] mt-0.5">Date:</span>
          <span className="text-muted-foreground">{email.date}</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-4 py-4 space-y-3 bg-white dark:bg-zinc-900">
        {/* Fake Amazon logo bar */}
        <div className="flex items-center gap-2 pb-3 border-b border-border/40">
          <div className="flex items-center gap-1">
            <span className="font-black text-[18px] text-[#FF9900] tracking-tight">amazon</span>
            <span className="text-[10px] text-muted-foreground mt-1">.com</span>
          </div>
        </div>

        {email.body.greeting && (
          <p className="text-foreground">{email.body.greeting}</p>
        )}

        {email.body.paragraphs.map((p, i) => (
          <p key={i} className={cn(
            'text-foreground leading-relaxed',
            p.includes('24 hours') && 'font-semibold text-red-700 dark:text-red-400',
          )}>
            {p}
          </p>
        ))}

        {email.body.linkText && email.body.linkUrl && (
          <div className="py-1">
            <span className="inline-block bg-[#FF9900] text-black text-[11px] font-bold px-4 py-2 rounded cursor-default">
              {email.body.linkText}
            </span>
            <p className="mt-1.5 text-[10px] font-mono text-blue-600 dark:text-blue-400 break-all">
              {email.body.linkUrl}
            </p>
          </div>
        )}

        {email.body.signoff && (
          <p className="text-muted-foreground pt-1 border-t border-border/40">{email.body.signoff}</p>
        )}
      </div>
    </div>
  )
}

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
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
              'flex-1 rounded-2xl border-2 p-4 sm:p-6 text-center font-bold text-base sm:text-lg transition-colors',
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

const MATCH_COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444']

type ArrowLine = {
  key: string
  x1: number; y1: number; x2: number; y2: number
  colorIdx: number; correct?: boolean
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
  const allValues = Object.values(pairs)

  // Shuffle definitions once per mount (component is re-keyed per question)
  const [shuffledValues] = useState(() => [...allValues].sort(() => Math.random() - 0.5))

  const [activeKey, setActiveKey] = useState<string | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const termRefs = useRef<(HTMLButtonElement | null)[]>([])
  const defRefs = useRef<(HTMLButtonElement | null)[]>([])
  const [arrows, setArrows] = useState<ArrowLine[]>([])

  // Serialize selected so the effect only reruns when content actually changes
  const selectedStr = JSON.stringify(selected)

  // Redraw arrows when selections or submitted state change (not on every render)
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return
    const rect = container.getBoundingClientRect()
    const next: ArrowLine[] = []
    keys.forEach((key, ki) => {
      if (!selected[key]) return
      const termEl = termRefs.current[ki]
      const vi = shuffledValues.indexOf(selected[key])
      const defEl = vi >= 0 ? defRefs.current[vi] : null
      if (!termEl || !defEl) return
      const tr = termEl.getBoundingClientRect()
      const dr = defEl.getBoundingClientRect()
      next.push({
        key,
        x1: tr.right - rect.left,
        y1: tr.top - rect.top + tr.height / 2,
        x2: dr.left - rect.left,
        y2: dr.top - rect.top + dr.height / 2,
        colorIdx: ki,
        correct: pairs[key] === selected[key], // always compute — live feedback
      })
    })
    setArrows(next)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStr, submitted]) // stable primitives — won't loop

  const handleKeyClick = (key: string) => {
    if (submitted) return
    setActiveKey(prev => prev === key ? null : key)
  }

  const handleValueClick = (value: string) => {
    if (submitted || !activeKey) return
    const updated: Record<string, string> = {}
    for (const k of Object.keys(selected)) {
      if (selected[k] !== value) updated[k] = selected[k]
    }
    updated[activeKey] = value
    onSelect(updated)
    setActiveKey(null)
  }

  return (
    <div className="space-y-2">
      {/* Instruction bar */}
      <div className="text-center text-[11px] min-h-[20px]">
        {!submitted && (
          activeKey
            ? <span className="font-medium text-brand">
                &ldquo;{activeKey}&rdquo; selected &mdash; now click its definition
              </span>
            : <span className="text-muted-foreground">Click a term, then click its matching definition</span>
        )}
      </div>

      {/* Three-column layout: terms | arrow lane | definitions */}
      <div ref={containerRef} className="relative grid grid-cols-[1fr_48px_1fr] gap-y-0">

        {/* SVG arrow overlay */}
        <svg
          className="pointer-events-none absolute inset-0 overflow-visible"
          style={{ width: '100%', height: '100%', zIndex: 2 }}
          aria-hidden="true"
        >
          <defs>
            <marker id="mah-ok" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,1 L7,4 L0,7 Z" fill="#16a34a" />
            </marker>
            <marker id="mah-err" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
              <path d="M0,1 L7,4 L0,7 Z" fill="#ef4444" />
            </marker>
          </defs>
          {arrows.map((a) => {
            const col = a.correct ? '#16a34a' : '#ef4444'
            const mid = (a.x1 + a.x2) / 2
            const markerId = a.correct ? 'mah-ok' : 'mah-err'
            return (
              <path
                key={a.key}
                d={`M${a.x1},${a.y1} C${mid},${a.y1} ${mid},${a.y2} ${a.x2},${a.y2}`}
                stroke={col}
                strokeWidth="2"
                fill="none"
                strokeDasharray={submitted ? undefined : '5 3'}
                markerEnd={`url(#${markerId})`}
                opacity={0.9}
              />
            )
          })}
        </svg>

        {/* Left: Terms */}
        <div className="col-start-1 space-y-2 pr-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pb-0.5">Terms</p>
          {keys.map((key, i) => {
            const isActive = activeKey === key
            const isMatched = !!selected[key]
            const isCorrect = isMatched && pairs[key] === selected[key]
            const isWrong = isMatched && !isCorrect
            return (
              <button
                key={key}
                ref={el => { termRefs.current[i] = el }}
                onClick={() => handleKeyClick(key)}
                disabled={submitted}
                className={cn(
                  'relative w-full rounded-lg border p-2 sm:p-2.5 text-left text-[11px] sm:text-xs font-semibold transition-all',
                  !isActive && !isMatched && 'border-border bg-card hover:border-brand/40 hover:bg-brand/5 cursor-pointer',
                  isActive && 'border-brand bg-brand/10 text-brand ring-2 ring-brand/20',
                  isCorrect && !isActive && 'border-brand/60 bg-brand/5 text-brand',
                  isWrong && !isActive && 'border-red-400 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400',
                  submitted && 'cursor-default',
                  !isMatched && !isActive && !submitted && 'cursor-pointer',
                )}
              >
                {key}
                {isMatched && !isActive && (
                  isCorrect
                    ? <CheckCircle2 className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand" />
                    : <XCircle className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-red-500" />
                )}
              </button>
            )
          })}
        </div>

        {/* Middle: arrow lane */}
        <div className="col-start-2" />

        {/* Right: Definitions (shuffled) */}
        <div className="col-start-3 space-y-2 pl-1">
          <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pb-0.5">Definitions</p>
          {shuffledValues.map((value, vi) => {
            const matchedKey = Object.keys(selected).find(k => selected[k] === value)
            const isCorrect = !!matchedKey && pairs[matchedKey] === value
            const isWrong = !!matchedKey && !isCorrect
            const canClick = !!activeKey && !submitted
            return (
              <button
                key={value}
                ref={el => { defRefs.current[vi] = el }}
                onClick={() => handleValueClick(value)}
                disabled={submitted || (!activeKey && !!matchedKey)}
                className={cn(
                  'relative w-full rounded-lg border p-2 sm:p-2.5 text-left text-[11px] sm:text-xs transition-all leading-snug',
                  !matchedKey && !canClick && 'border-border bg-card cursor-default',
                  !matchedKey && canClick && 'border-border bg-card cursor-pointer hover:bg-brand/5 hover:border-brand/40',
                  isCorrect && 'border-brand/60 bg-brand/5',
                  isWrong && 'border-red-400 bg-red-50 dark:bg-red-950/30',
                  matchedKey && canClick && 'cursor-pointer',
                  submitted && !matchedKey && 'opacity-40',
                )}
              >
                {value}
              </button>
            )
          })}
        </div>
      </div>

      {/* After submit: show correct answers for wrong pairs */}
      {submitted && (
        <div className="space-y-1 pt-1">
          {keys.filter(k => pairs[k] !== selected[k]).map(k => (
            <p key={k} className="text-[10px] text-muted-foreground">
              <span className="font-semibold text-foreground">{k}</span>
              {' → '}
              <span className="text-brand">{pairs[k]}</span>
            </p>
          ))}
        </div>
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

function normalizeAnswer(val: unknown, question?: Question): string | string[] {
  if (Array.isArray(val)) return val
  if (typeof val === 'object' && val !== null) {
    if (question?.type === 'match-pair' && question.matchPairs) {
      const pairs = val as Record<string, string>
      return Object.keys(question.matchPairs).map((k) => `${k} → ${pairs[k] ?? '(not answered)'}`)
    }
    return Object.values(val as Record<string, string>)
  }
  return String(val ?? '')
}

function checkAnswer(question: Question, userAnswer: unknown): boolean {
  const correct = question.answer
  if (question.type === 'drag-drop') {
    const ua = Array.isArray(userAnswer) ? userAnswer : []
    const ans = Array.isArray(correct) ? correct : []
    return ans.length === ua.length && ans.every((a) => ua.includes(a)) && ua.every((u) => ans.includes(u))
  }
  // match-pair must come before Array.isArray(correct) — its answer field is an array of keys
  if (question.type === 'match-pair') {
    const pairs = question.matchPairs ?? {}
    const ua = userAnswer as Record<string, string>
    return Object.keys(pairs).every((k) => ua[k] === pairs[k])
  }
  if (Array.isArray(correct)) {
    const ua = Array.isArray(userAnswer) ? userAnswer : []
    return correct.length === ua.length && correct.every((c) => ua.includes(c)) && ua.every((u) => correct.includes(u))
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
    if (typeof currentAnswer === 'object') {
      if (question?.type === 'match-pair' && question.matchPairs) {
        const keys = Object.keys(question.matchPairs)
        const ans = currentAnswer as Record<string, string>
        return keys.length > 0 && keys.every((k) => ans[k])
      }
      return Object.keys(currentAnswer).length > 0
    }
    return currentAnswer !== ''
  }, [currentAnswer, question])

  const setAnswer = (id: string, val: unknown) => {
    setState((s) => ({ ...s, answers: { ...s.answers, [id]: val as string | string[] } }))
  }

  const handleHint = (penalty: number) => {
    addXP(-penalty)
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
    const xpForQuestion = correct ? 10 : 0

    const resultItem = {
      question,
      userAnswer: normalizeAnswer(currentAnswer, question),
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
            {question.type === 'email-inspection' && question.emailContent && (
              <EmailPreview email={question.emailContent} />
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
                key={question.id}
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

