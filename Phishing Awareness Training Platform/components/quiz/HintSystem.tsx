"use client"

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lightbulb, X, ChevronRight, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Hint } from '@/types'

interface Props {
  hints: Hint[]
  onUseHint: (penalty: number) => void
  disabled?: boolean
}

export function HintSystem({ hints, onUseHint, disabled }: Props) {
  const [revealed, setRevealed] = useState(0)   // how many hints used
  const [open, setOpen] = useState(false)
  const [justRevealed, setJustRevealed] = useState(false)
  const [popPulse, setPopPulse] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  const nextHint = hints[revealed] as Hint | undefined
  const allUsed = revealed >= hints.length

  // Close when clicking outside
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setOpen(false)
        setJustRevealed(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleBulbClick = () => {
    if (disabled || allUsed) return
    setOpen((o) => !o)
    setJustRevealed(false)
  }

  const handleReveal = () => {
    if (!nextHint) return
    setRevealed((r) => r + 1)
    onUseHint(nextHint.xpPenalty)
    setJustRevealed(true)
    // pulse the bulb
    setPopPulse(true)
    setTimeout(() => setPopPulse(false), 600)
  }

  const handleClose = () => {
    setOpen(false)
    setJustRevealed(false)
  }

  return (
    <div className="relative" ref={popoverRef}>
      {/* Lightbulb trigger button */}
      <motion.button
        type="button"
        onClick={handleBulbClick}
        disabled={disabled || allUsed}
        animate={popPulse ? { scale: [1, 1.25, 1] } : {}}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className={cn(
          'relative flex items-center gap-2 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all select-none outline-none',
          !disabled && !allUsed && [
            'border-amber-300 dark:border-amber-700/60',
            'bg-amber-50 dark:bg-amber-950/20',
            'text-amber-700 dark:text-amber-400',
            'hover:bg-amber-100 dark:hover:bg-amber-950/40',
            'hover:border-amber-400 dark:hover:border-amber-600',
            open && 'bg-amber-100 dark:bg-amber-950/40 border-amber-400',
          ],
          (disabled || allUsed) && 'border-border text-muted-foreground opacity-40 cursor-not-allowed',
        )}
        aria-label="Show hint"
      >
        <motion.span
          animate={open && !allUsed ? { rotate: [0, -15, 15, -10, 0] } : {}}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <Lightbulb className={cn('h-3.5 w-3.5', open && !allUsed && 'text-amber-500')} />
        </motion.span>
        <span>
          {allUsed ? 'All hints used' : `Hint ${revealed + 1}/${hints.length}`}
        </span>

      </motion.button>

      {/* Popover card */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="hint-popover"
            initial={{ opacity: 0, scale: 0.92, y: 8, transformOrigin: 'bottom left' }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 8 }}
            transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
            className="absolute bottom-full mb-3 left-0 z-50 w-80"
          >
            {/* Glass card */}
            <div className="relative overflow-hidden rounded-2xl border border-amber-200/80 dark:border-amber-700/40 bg-white/95 dark:bg-zinc-900/95 shadow-xl backdrop-blur-md">
              {/* Shimmer overlay */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-50/40 via-transparent to-transparent dark:from-amber-900/10" />

              {/* Header */}
              <div className="relative flex items-center justify-between border-b border-amber-100 dark:border-amber-800/40 px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/40">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    Hint {revealed + 1} of {hints.length}
                  </span>
                  <div className="flex gap-1 ml-1">
                    {hints.map((_, i) => (
                      <span
                        key={i}
                        className={cn(
                          'h-1.5 w-5 rounded-full transition-colors',
                          i < revealed ? 'bg-amber-400' : 'bg-muted'
                        )}
                      />
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground hover:bg-muted transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Body */}
              <div className="relative px-4 py-4 space-y-3">
                <AnimatePresence mode="wait">
                  {!justRevealed ? (
                    /* Pre-reveal state */
                    <motion.div
                      key="pre-reveal"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="space-y-3"
                    >
                      {/* XP cost warning */}
                      <div className="flex items-center gap-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-800/30 px-3 py-2">
                        <Zap className="h-4 w-4 shrink-0 text-amber-500" />
                        <div>
                          <p className="text-xs font-bold text-amber-700 dark:text-amber-300">
                            Costs {nextHint?.xpPenalty} XP
                          </p>
                          <p className="text-[10px] text-amber-600/80 dark:text-amber-400/70">
                            This hint will deduct XP from your score
                          </p>
                        </div>
                      </div>

                      {/* Blurred preview */}
                      <div className="relative rounded-xl border border-border overflow-hidden">
                        <p className="select-none blur-sm text-xs text-foreground/80 p-3 leading-relaxed">
                          {nextHint?.text}
                        </p>
                        <div className="absolute inset-0 flex items-center justify-center bg-background/20 backdrop-blur-[1px]">
                          <span className="text-[10px] font-medium text-muted-foreground">Click reveal to show</span>
                        </div>
                      </div>

                      {/* Reveal button */}
                      <motion.button
                        type="button"
                        onClick={handleReveal}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-600 px-4 py-2.5 text-sm font-bold text-white transition-colors"
                      >
                        <Lightbulb className="h-4 w-4" />
                        Reveal Hint (−{nextHint?.xpPenalty} XP)
                        <ChevronRight className="h-4 w-4" />
                      </motion.button>
                    </motion.div>
                  ) : (
                    /* Post-reveal state */
                    <motion.div
                      key="post-reveal"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="space-y-3"
                    >
                      {/* Hint text */}
                      <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-700/30 p-3">
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-3.5 w-3.5 shrink-0 text-amber-500 mt-0.5" />
                          <p className="text-xs font-medium text-amber-900 dark:text-amber-100 leading-relaxed">
                            {hints[revealed - 1]?.text}
                          </p>
                        </div>
                      </div>

                      {/* More hints available? */}
                      {revealed < hints.length ? (
                        <button
                          type="button"
                          onClick={() => setJustRevealed(false)}
                          className="w-full rounded-xl border border-border py-2 text-xs text-muted-foreground hover:bg-muted transition-colors"
                        >
                          Need another hint? ({hints.length - revealed} left)
                        </button>
                      ) : (
                        <p className="text-center text-[10px] text-muted-foreground">
                          All hints revealed
                        </p>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Arrow pointing down to button */}
            <div className="absolute -bottom-1.5 left-5 h-3 w-3 rotate-45 border-b border-r border-amber-200/80 dark:border-amber-700/40 bg-white/95 dark:bg-zinc-900/95" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
