"use client"

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowDown } from 'lucide-react'

interface Props {
  steps: string[]
}

export function AttackFlowDiagram({ steps }: Props) {
  const [revealed, setRevealed] = useState(0)

  const revealNext = () => setRevealed((r) => Math.min(r + 1, steps.length))
  const revealAll = () => setRevealed(steps.length)
  const reset = () => setRevealed(0)

  return (
    <div className="space-y-4">
      {/* Steps */}
      <div className="space-y-2">
        {steps.map((step, i) => (
          <div key={i} className="relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={i < revealed ? { opacity: 1, scale: 1 } : { opacity: 0.15, scale: 0.98 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
              className="flex items-start gap-3 rounded-xl border border-border bg-card p-4"
            >
              {/* Step number */}
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand/10 text-xs font-bold text-brand">
                {i + 1}
              </div>
              <p className="text-sm text-foreground leading-relaxed pt-0.5">{step}</p>
            </motion.div>

            {/* Arrow connector */}
            {i < steps.length - 1 && (
              <div className="flex justify-center py-0.5">
                <ArrowDown className={`h-4 w-4 transition-colors duration-300 ${i < revealed - 1 ? 'text-brand' : 'text-border'}`} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        {revealed < steps.length ? (
          <>
            <button
              onClick={revealNext}
              className="flex-1 rounded-lg bg-brand/10 border border-brand/30 px-4 py-2 text-sm font-medium text-brand hover:bg-brand/20 transition-colors"
            >
              Next Step ({revealed}/{steps.length})
            </button>
            <button
              onClick={revealAll}
              className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
            >
              Show All
            </button>
          </>
        ) : (
          <button
            onClick={reset}
            className="w-full rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground hover:bg-muted transition-colors"
          >
            ↺ Reset Animation
          </button>
        )}
      </div>
    </div>
  )
}
