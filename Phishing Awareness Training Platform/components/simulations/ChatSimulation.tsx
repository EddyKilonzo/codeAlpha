"use client"

import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SimulationShell } from './SimulationShell'
import type { Simulation, SimulationFlag } from '@/types'

interface ChatMessage {
  from: 'sender' | 'you'
  text: string
  time: string
}

interface FlagZoneProps {
  flag: SimulationFlag
  onFlag: (id: string) => void
  found: boolean
  children: React.ReactNode
  className?: string
}

function FlagZone({ flag, onFlag, found, children, className }: FlagZoneProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onFlag(flag.id)}
      onKeyDown={(e) => e.key === 'Enter' && onFlag(flag.id)}
      className={cn(
        'cursor-pointer rounded-lg transition-all',
        !found && 'hover:ring-2 hover:ring-red-400/50',
        found && 'ring-2 ring-red-400/60',
        className
      )}
    >
      {children}
    </div>
  )
}

export function TeamsSimulation({ simulation }: { simulation: Simulation }) {
  const content = simulation.content as {
    sender: string; avatar: string; messages: ChatMessage[]
  }
  const flagMap = Object.fromEntries(simulation.flags.map((f) => [f.id, f]))

  return (
    <SimulationShell simulation={simulation}>
      {({ onFlag, foundFlags }) => (
        <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
          {/* Teams header */}
          <div className="flex items-center gap-3 border-b border-border bg-[#201f40] px-4 py-3">
            <div className="text-[10px] font-bold text-purple-300 tracking-widest">TEAMS</div>
            <div className="h-4 w-px bg-white/20" />
            <div className="text-xs text-white/80">Chat</div>
          </div>

          <div className="flex h-80">
            {/* Sidebar */}
            <div className="w-48 shrink-0 border-r border-border bg-muted/20 p-2">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase px-2 mb-1">Recent</p>
              {/* Highlight the phishing chat */}
              <FlagZone flag={flagMap['f1']} onFlag={onFlag} found={foundFlags.includes('f1')}>
                <div className={cn(
                  'flex items-center gap-2 rounded-lg px-2 py-2',
                  foundFlags.includes('f1') ? 'bg-red-50 dark:bg-red-950/20' : 'bg-brand/10'
                )}>
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500 text-[10px] font-bold text-white">
                    {content.avatar}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-medium text-foreground truncate">{content.sender}</p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {foundFlags.includes('f1')
                        ? <span className="inline-flex items-center gap-1 text-red-500"><AlertTriangle className="h-3 w-3" />External account</span>
                        : 'Now'}
                    </p>
                  </div>
                </div>
              </FlagZone>
            </div>

            {/* Chat area */}
            <div className="flex-1 flex flex-col min-w-0">
              {/* Chat header */}
              <div className="border-b border-border px-4 py-2.5">
                <p className="text-xs font-semibold text-foreground">{content.sender}</p>
                {foundFlags.includes('f1') && (
                  <p className="flex items-center gap-1 text-[10px] text-red-500 font-medium"><AlertTriangle className="h-3 w-3" />This account is external to your organization</p>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {content.messages.map((msg, i) => {
                  const flagId = i === 0 ? 'f4' : i === 1 ? 'f2' : 'f3'
                  const flag = flagMap[flagId]

                  return (
                    <FlagZone key={i} flag={flag} onFlag={onFlag} found={foundFlags.includes(flagId)}>
                      <div className="flex items-start gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-500 text-[9px] font-bold text-white mt-0.5">
                          {content.avatar}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="text-[11px] font-semibold text-foreground">{content.sender}</span>
                            <span className="text-[10px] text-muted-foreground">{msg.time}</span>
                          </div>
                          <div className={cn(
                            'rounded-lg px-3 py-2 text-xs text-foreground/90 leading-relaxed',
                            foundFlags.includes(flagId)
                              ? flagId === 'f3' ? 'bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40'
                                : 'bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-800/30'
                              : 'bg-muted'
                          )}>
                            {msg.text}
                          </div>
                        </div>
                      </div>
                    </FlagZone>
                  )
                })}
              </div>

              {/* Input */}
              <div className="border-t border-border px-3 py-2">
                <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                  Type a message…
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </SimulationShell>
  )
}
