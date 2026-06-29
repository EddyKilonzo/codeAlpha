"use client"

import { Shield, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SimulationShell } from './SimulationShell'
import type { Simulation, SimulationFlag } from '@/types'

export function BrowserWarningSimulation({ simulation }: { simulation: Simulation }) {
  const content = simulation.content as {
    url: string; warningTitle: string; warningCode: string; warningDetail: string
  }
  const flagMap = Object.fromEntries(simulation.flags.map((f) => [f.id, f]))

  return (
    <SimulationShell simulation={simulation}>
      {({ onFlag, foundFlags }) => (
        <div className="overflow-hidden rounded-xl border border-border shadow-sm bg-white dark:bg-zinc-900">
          {/* Browser chrome */}
          <div className="border-b border-border bg-zinc-100 dark:bg-zinc-800 px-3 py-2.5 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>

            {/* URL bar */}
            <button
              onClick={() => onFlag('f4')}
              className={cn(
                'flex-1 rounded-md bg-white dark:bg-zinc-700 border border-border px-2.5 py-1 text-left transition-all',
                foundFlags.includes('f4') ? 'ring-2 ring-amber-400 border-amber-400' : 'hover:border-amber-400/50'
              )}
            >
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-3 w-3 text-red-500 shrink-0" />
                <span className="text-[11px] font-mono text-foreground/70 truncate">{content.url}</span>
              </div>
            </button>
          </div>

          {/* Warning content */}
          <div className="flex flex-col items-center p-10 space-y-6 min-h-72 bg-white dark:bg-zinc-900">
            {/* Warning icon */}
            <button
              onClick={() => onFlag('f1')}
              className={cn(
                'flex h-20 w-20 items-center justify-center rounded-full transition-all',
                foundFlags.includes('f1') ? 'bg-red-100 dark:bg-red-950/40 ring-2 ring-red-400' : 'bg-red-50 dark:bg-red-950/20 hover:ring-2 hover:ring-red-300'
              )}
            >
              <Shield className="h-10 w-10 text-red-500" />
            </button>

            {/* Title */}
            <button
              onClick={() => onFlag('f1')}
              className="text-center space-y-2 hover:opacity-80 transition-opacity"
            >
              <h2 className="text-2xl font-bold text-foreground">{content.warningTitle}</h2>
              <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">{content.warningDetail}</p>
              <code className="text-xs text-red-500">{content.warningCode}</code>
            </button>

            {/* Action buttons */}
            <div className="flex gap-3 w-full max-w-xs">
              {/* "Advanced" — malicious path */}
              <button
                onClick={() => onFlag('f2')}
                className={cn(
                  'flex-1 rounded-lg border px-4 py-2.5 text-sm transition-all',
                  foundFlags.includes('f2')
                    ? 'border-red-400 bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 ring-2 ring-red-400'
                    : 'border-border text-foreground hover:bg-muted'
                )}
              >
                Advanced
              </button>

              {/* "Back to safety" — correct action */}
              <button
                onClick={() => onFlag('f3')}
                className={cn(
                  'flex-1 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition-all',
                  foundFlags.includes('f3')
                    ? 'bg-brand ring-2 ring-brand/60'
                    : 'bg-blue-600 hover:bg-blue-700'
                )}
              >
                Back to safety
              </button>
            </div>

            {foundFlags.includes('f2') && (
              <div className="rounded-lg border border-amber-200 dark:border-amber-800/50 bg-amber-50/60 dark:bg-amber-950/20 px-4 py-3 max-w-sm">
                <p className="flex items-start gap-1.5 text-xs text-amber-700 dark:text-amber-300 text-center">
                  <AlertTriangle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                  Clicking "Advanced" and proceeding is the dangerous path — only IT professionals should proceed past certificate warnings.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </SimulationShell>
  )
}
