"use client"

import { cn } from '@/lib/utils'
import { SimulationShell } from './SimulationShell'
import type { Simulation, SimulationFlag } from '@/types'

export function SMSSimulation({ simulation }: { simulation: Simulation }) {
  const content = simulation.content as {
    sender: string
    messages: { from: string; text: string; time: string }[]
  }

  const flagMap = Object.fromEntries(simulation.flags.map((f) => [f.id, f]))

  // Group the text into flag-relevant segments
  const messageText = content.messages[0]?.text ?? ''

  return (
    <SimulationShell simulation={simulation}>
      {({ onFlag, foundFlags }) => (
        <div className="mx-auto max-w-sm">
          {/* Phone frame */}
          <div className="rounded-3xl border-4 border-zinc-800 dark:border-zinc-600 bg-zinc-900 overflow-hidden shadow-2xl">
            {/* Status bar */}
            <div className="flex items-center justify-between px-5 py-2 bg-zinc-900">
              <span className="text-[10px] text-white font-medium">9:41</span>
              <div className="flex gap-1 items-center">
                <div className="h-2 w-4 rounded-sm border border-white/60 relative">
                  <div className="absolute inset-y-0 left-0 w-3/4 bg-white/80 rounded-sm" />
                </div>
              </div>
            </div>

            {/* SMS header */}
            <div className="bg-zinc-800 px-4 py-3 flex items-center gap-3">
              <button className="text-xs text-blue-400">‹ Messages</button>
              <div className="flex-1 text-center">
                {/* Sender — FLAG f1 */}
                <button
                  onClick={() => onFlag('f1')}
                  className={cn(
                    'rounded px-2 py-0.5 text-xs font-medium text-white transition-all',
                    foundFlags.includes('f1') ? 'ring-2 ring-red-400 bg-red-500/20' : 'hover:bg-red-500/10'
                  )}
                >
                  {content.sender}
                </button>
              </div>
              <span className="text-xs text-zinc-500 w-14 text-right">Details</span>
            </div>

            {/* Messages area */}
            <div className="bg-zinc-900 px-4 py-4 min-h-48 space-y-3">
              {content.messages.map((msg, i) => (
                <div key={i} className="flex justify-start">
                  <div className="max-w-[85%] space-y-2">
                    {/* Parse message segments */}
                    {messageText.split(/(http\S+|\£[\d.]+|\d+ hours)/).map((segment, si) => {
                      if (segment.startsWith('http')) {
                        return (
                          <button
                            key={si}
                            onClick={() => onFlag('f2')}
                            className={cn(
                              'block rounded-xl px-4 py-2.5 text-left',
                              foundFlags.includes('f2')
                                ? 'bg-red-600/80 ring-2 ring-red-400'
                                : 'bg-blue-600 hover:bg-blue-500',
                              'text-white text-[11px] break-all'
                            )}
                          >
                            {segment}
                          </button>
                        )
                      }
                      if (segment.startsWith('£') || segment.includes('hours')) {
                        return (
                          <button
                            key={si}
                            onClick={() => onFlag('f4')}
                            className={cn(
                              'inline rounded-xl px-4 py-2.5',
                              foundFlags.includes('f4')
                                ? 'bg-amber-600/80 text-white ring-2 ring-amber-400'
                                : 'bg-zinc-700 text-white hover:bg-zinc-600',
                              'text-[11px]'
                            )}
                          >
                            {segment}
                          </button>
                        )
                      }
                      if (segment.includes('customs fee') || segment.includes('could not be delivered')) {
                        return (
                          <button
                            key={si}
                            onClick={() => onFlag('f3')}
                            className={cn(
                              'block rounded-xl px-4 py-2.5 text-left w-full',
                              foundFlags.includes('f3')
                                ? 'bg-red-700/80 text-white ring-2 ring-red-400'
                                : 'bg-zinc-700 text-white hover:bg-zinc-600',
                              'text-[11px]'
                            )}
                          >
                            {segment}
                          </button>
                        )
                      }
                      if (segment.trim()) {
                        return (
                          <span
                            key={si}
                            className="block rounded-xl bg-zinc-700 px-4 py-2.5 text-[11px] text-white"
                          >
                            {segment}
                          </span>
                        )
                      }
                      return null
                    })}
                    <p className="text-[10px] text-zinc-500 px-1">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message input */}
            <div className="bg-zinc-800 px-3 py-3 flex items-center gap-2">
              <div className="flex-1 rounded-full bg-zinc-700 px-4 py-2 text-[11px] text-zinc-400">
                iMessage
              </div>
            </div>
          </div>

          <p className="mt-3 text-center text-[11px] text-muted-foreground">
            Tap the suspicious parts of the message to flag them
          </p>
        </div>
      )}
    </SimulationShell>
  )
}
