"use client"

import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, AlertTriangle, CheckCircle2, Info, Trophy, Eye } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Simulation, SimulationFlag } from '@/types'

interface Props {
  simulation: Simulation
  children: (props: {
    onFlag: (flagId: string) => void
    foundFlags: string[]
    isComplete: boolean
  }) => React.ReactNode
}

export function SimulationShell({ simulation, children }: Props) {
  const [foundFlags, setFoundFlags] = useState<string[]>([])
  const [lastFound, setLastFound] = useState<SimulationFlag | null>(null)
  const [isComplete, setIsComplete] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  const totalPoints = simulation.flags.reduce((s, f) => s + f.pointValue, 0)
  const earnedPoints = foundFlags.reduce((s, id) => {
    const flag = simulation.flags.find((f) => f.id === id)
    return s + (flag?.pointValue ?? 0)
  }, 0)

  const onFlag = useCallback((flagId: string) => {
    if (foundFlags.includes(flagId)) return
    const flag = simulation.flags.find((f) => f.id === flagId)
    if (!flag) return

    const next = [...foundFlags, flagId]
    setFoundFlags(next)
    setLastFound(flag)

    setTimeout(() => setLastFound(null), 3500)

    if (next.length === simulation.flags.length) {
      setTimeout(() => {
        setIsComplete(true)
        setShowSummary(true)
      }, 800)
    }
  }, [foundFlags, simulation.flags])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-foreground">{simulation.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{simulation.description}</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="text-xs font-bold text-foreground">{foundFlags.length}/{simulation.flags.length}</div>
            <div className="text-[10px] text-muted-foreground">flags found</div>
          </div>
          <div className="relative h-10 w-10">
            <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(var(--muted))" strokeWidth="2.5" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="hsl(var(--brand))" strokeWidth="2.5"
                strokeDasharray={`${(foundFlags.length / simulation.flags.length) * 100} 100`}
                strokeLinecap="round"
              />
            </svg>
            <Shield className="absolute inset-0 m-auto h-4 w-4 text-brand" />
          </div>
        </div>
      </div>

      {/* Instruction bar */}
      <div className="flex items-center gap-2 rounded-lg border border-blue-200 dark:border-blue-800/50 bg-blue-50/60 dark:bg-blue-950/20 px-3 py-2">
        <Eye className="h-3.5 w-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Click on suspicious elements to identify phishing red flags. Find all {simulation.flags.length} flags to complete.
        </p>
      </div>

      {/* Simulation content */}
      <div className="relative">
        {children({ onFlag, foundFlags, isComplete })}

        {/* Floating feedback toast */}
        <AnimatePresence>
          {lastFound && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.95 }}
              className={cn(
                'absolute top-3 right-3 z-50 max-w-xs rounded-xl border p-3.5 shadow-lg backdrop-blur-sm',
                lastFound.type === 'malicious' && 'border-red-300 dark:border-red-700 bg-red-50/95 dark:bg-red-950/90',
                lastFound.type === 'warning' && 'border-amber-300 dark:border-amber-700 bg-amber-50/95 dark:bg-amber-950/90',
                lastFound.type === 'safe' && 'border-brand/40 bg-brand/5',
              )}
            >
              <div className="flex items-start gap-2">
                {lastFound.type === 'malicious' && <AlertTriangle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />}
                {lastFound.type === 'warning' && <Info className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />}
                {lastFound.type === 'safe' && <CheckCircle2 className="h-4 w-4 shrink-0 text-brand mt-0.5" />}
                <div>
                  <p className={cn(
                    'text-xs font-bold',
                    lastFound.type === 'malicious' ? 'text-red-700 dark:text-red-300' :
                    lastFound.type === 'warning' ? 'text-amber-700 dark:text-amber-300' : 'text-brand'
                  )}>
                    +{lastFound.pointValue} pts — {lastFound.label}
                  </p>
                  <p className="text-[11px] text-foreground/80 mt-0.5 leading-snug">{lastFound.description}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Flag legend */}
      {foundFlags.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Found so far:</p>
          <div className="space-y-1.5">
            {simulation.flags
              .filter((f) => foundFlags.includes(f.id))
              .map((flag) => (
                <div key={flag.id} className={cn(
                  'flex items-start gap-2 rounded-lg border px-3 py-2',
                  flag.type === 'malicious' ? 'border-red-200 dark:border-red-800/40 bg-red-50/60 dark:bg-red-950/10' :
                  flag.type === 'warning' ? 'border-amber-200 dark:border-amber-800/40 bg-amber-50/60 dark:bg-amber-950/10' :
                  'border-brand/20 bg-brand/5'
                )}>
                  {flag.type === 'malicious' && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-red-500 mt-0.5" />}
                  {flag.type === 'warning' && <Info className="h-3.5 w-3.5 shrink-0 text-amber-500 mt-0.5" />}
                  {flag.type === 'safe' && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-brand mt-0.5" />}
                  <div>
                    <p className="text-xs font-semibold text-foreground">{flag.label}</p>
                    <p className="text-[11px] text-muted-foreground leading-snug mt-0.5">{flag.description}</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      )}

      {/* Completion banner */}
      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-brand/30 bg-gradient-to-br from-brand/5 to-brand/10 p-5 text-center space-y-2"
          >
            <Trophy className="h-8 w-8 text-brand mx-auto" />
            <p className="font-bold text-brand text-lg">Simulation Complete!</p>
            <p className="text-sm text-muted-foreground">
              You found all {simulation.flags.length} phishing indicators and earned {earnedPoints}/{totalPoints} points.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
