"use client"

import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SimulationShell } from './SimulationShell'
import type { Simulation, SimulationFlag } from '@/types'

interface FlagZoneProps {
  flag: SimulationFlag
  onFlag: (id: string) => void
  found: boolean
  children: React.ReactNode
}

function FlagZone({ flag, onFlag, found, children }: FlagZoneProps) {
  return (
    <span
      role="button"
      tabIndex={0}
      onClick={() => onFlag(flag.id)}
      onKeyDown={(e) => e.key === 'Enter' && onFlag(flag.id)}
      className={cn(
        'relative cursor-pointer rounded transition-all outline-none',
        'hover:ring-2 hover:ring-offset-1',
        !found && flag.type === 'malicious' && 'hover:ring-red-400/60 hover:bg-red-50/40 dark:hover:bg-red-950/20',
        !found && flag.type === 'warning' && 'hover:ring-amber-400/60 hover:bg-amber-50/40 dark:hover:bg-amber-950/20',
        !found && flag.type === 'safe' && 'hover:ring-brand/40 hover:bg-brand/5',
        found && flag.type === 'malicious' && 'ring-2 ring-red-400/60 bg-red-50/30 dark:bg-red-950/10',
        found && flag.type === 'warning' && 'ring-2 ring-amber-400/60 bg-amber-50/30 dark:bg-amber-950/10',
        found && flag.type === 'safe' && 'ring-2 ring-brand/40 bg-brand/5',
      )}
      aria-label={`Click to flag: ${flag.label}`}
    >
      {children}
      {found && (
        <span className="absolute -top-2 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white z-10">
          !</span>
      )}
    </span>
  )
}

interface OutlookEmailProps {
  simulation: Simulation
}

export function OutlookEmailSimulation({ simulation }: OutlookEmailProps) {
  const content = simulation.content as {
    from: string; to: string; subject: string; time: string; body: string; hasQRCode?: boolean
  }

  const flagMap = Object.fromEntries(simulation.flags.map((f) => [f.id, f]))

  return (
    <SimulationShell simulation={simulation}>
      {({ onFlag, foundFlags }) => (
        <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
          {/* Outlook-style top bar */}
          <div className="flex items-center gap-2 border-b border-border bg-[#0078d4] px-4 py-2">
            <span className="text-xs font-semibold text-white">Outlook</span>
            <span className="ml-auto text-[10px] text-blue-200">Microsoft 365</span>
          </div>

          {/* Message header */}
          <div className="border-b border-border p-4 space-y-2.5">
            <h4 className="font-semibold text-foreground text-sm">{content.subject}</h4>

            {/* From line */}
            <FlagZone flag={flagMap['f1']} onFlag={onFlag} found={foundFlags.includes('f1')}>
              <div className="flex items-center gap-2 py-0.5 px-1 rounded">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                  {content.from.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{content.from.split('<')[0].trim()}</p>
                  <p className="text-[11px] text-muted-foreground">{content.from.match(/<(.+)>/)?.[1] ?? content.from}</p>
                </div>
                <span className="ml-auto text-[11px] text-muted-foreground">{content.time}</span>
              </div>
            </FlagZone>

            <div className="text-[11px] text-muted-foreground">
              To: <span className="text-foreground">{content.to}</span>
            </div>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {content.body.split('\n\n').map((para, i) => {
              if (para.startsWith('Dear')) {
                return (
                  <FlagZone key={i} flag={flagMap['f4']} onFlag={onFlag} found={foundFlags.includes('f4')}>
                    <p className="text-sm text-foreground/90 leading-relaxed px-1 py-0.5">{para}</p>
                  </FlagZone>
                )
              }
              if (para.includes('expires') || para.includes('URGENT') || para.includes('time-sensitive') || para.includes('urgent')) {
                return (
                  <FlagZone key={i} flag={flagMap['f2']} onFlag={onFlag} found={foundFlags.includes('f2')}>
                    <p className="text-sm text-foreground/90 leading-relaxed px-1 py-0.5">{para}</p>
                  </FlagZone>
                )
              }
              if (para.includes('[RESET') || para.includes('[VERIFY') || para.includes('button')) {
                return (
                  <div key={i}>
                    <FlagZone flag={flagMap['f3']} onFlag={onFlag} found={foundFlags.includes('f3')}>
                      <button className="rounded-lg bg-[#0078d4] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#106ebe] transition-colors">
                        {para.replace(/\[|\]/g, '')}
                      </button>
                    </FlagZone>
                  </div>
                )
              }
              if (para.includes('[QR CODE')) {
                return (
                  <div key={i} className="space-y-2">
                    <FlagZone flag={flagMap['f1']} onFlag={onFlag} found={foundFlags.includes('f1')}>
                      <div className="inline-flex h-32 w-32 items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted text-center">
                        <div className="space-y-1">
                          <div className="text-3xl">▦</div>
                          <p className="text-[9px] text-muted-foreground">QR Code</p>
                        </div>
                      </div>
                    </FlagZone>
                  </div>
                )
              }
              if (para.includes('confidential') || para.includes('NDA') || para.includes('Do not discuss')) {
                return (
                  <FlagZone key={i} flag={flagMap['f4']} onFlag={onFlag} found={foundFlags.includes('f4')}>
                    <p className="text-sm text-foreground/90 leading-relaxed px-1 py-0.5">{para}</p>
                  </FlagZone>
                )
              }
              return <p key={i} className="text-sm text-foreground/90 leading-relaxed">{para}</p>
            })}
          </div>
        </div>
      )}
    </SimulationShell>
  )
}

export function GmailSimulation({ simulation }: { simulation: Simulation }) {
  const content = simulation.content as {
    emails: { from: string; address: string; subject: string; preview: string; time: string; isPhishing: boolean; labels: string[] }[]
  }

  const phishingEmailIndex = content.emails.findIndex((e) => e.isPhishing)

  return (
    <SimulationShell simulation={simulation}>
      {({ onFlag, foundFlags }) => (
        <div className="rounded-xl border border-border overflow-hidden bg-card shadow-sm">
          {/* Gmail header */}
          <div className="flex items-center gap-3 border-b border-border bg-white dark:bg-zinc-900 px-4 py-2.5">
            <span className="text-sm font-semibold" style={{ color: '#EA4335' }}>G</span>
            <span className="text-sm font-semibold" style={{ color: '#FBBC04' }}>m</span>
            <span className="text-sm font-semibold" style={{ color: '#34A853' }}>a</span>
            <span className="text-sm font-semibold" style={{ color: '#4285F4' }}>i</span>
            <span className="text-sm font-semibold" style={{ color: '#EA4335' }}>l</span>
            <span className="ml-2 text-xs text-muted-foreground">Inbox</span>
          </div>

          {/* Email list */}
          <div className="divide-y divide-border">
            {content.emails.map((email, i) => {
              const isPhishing = email.isPhishing
              const allFlagIds = ['f1', 'f2', 'f3']
              const anyFound = allFlagIds.some((id) => foundFlags.includes(id))

              if (isPhishing) {
                return (
                  <div key={i} className={cn(
                    'relative transition-all',
                    anyFound && 'ring-2 ring-inset ring-red-400/40 bg-red-50/30 dark:bg-red-950/10'
                  )}>
                    {allFlagIds.map((flagId, fi) => (
                      <div
                        key={flagId}
                        className="absolute inset-0 z-10 cursor-pointer"
                        onClick={() => onFlag(flagId)}
                        style={{ display: foundFlags.includes(flagId) ? 'none' : fi === 0 ? 'block' : 'none' }}
                      />
                    ))}
                    {foundFlags.includes('f1') && !foundFlags.includes('f2') && (
                      <div className="absolute inset-0 z-10 cursor-pointer" onClick={() => onFlag('f2')} />
                    )}
                    {foundFlags.includes('f2') && !foundFlags.includes('f3') && (
                      <div className="absolute inset-0 z-10 cursor-pointer" onClick={() => onFlag('f3')} />
                    )}
                    <div className="flex items-start gap-3 px-4 py-3 cursor-pointer">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/40 text-xs font-bold text-red-600 dark:text-red-400 mt-0.5">G</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="text-sm font-semibold text-foreground truncate">{email.from}</span>
                          <span className="shrink-0 text-[11px] text-muted-foreground">{email.time}</span>
                        </div>
                        <p className="text-xs font-medium text-foreground truncate">{email.subject}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{email.address} — {email.preview}</p>
                        {anyFound && (
                          <div className="mt-1.5 flex gap-1 flex-wrap">
                            {foundFlags.includes('f1') && <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-950/30 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:text-red-400"><AlertTriangle className="h-2.5 w-2.5" />Fake domain</span>}
                            {foundFlags.includes('f2') && <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-950/30 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400"><AlertTriangle className="h-2.5 w-2.5" />Urgency tactic</span>}
                            {foundFlags.includes('f3') && <span className="inline-flex items-center gap-1 rounded-full bg-red-100 dark:bg-red-950/30 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:text-red-400"><AlertTriangle className="h-2.5 w-2.5" />Phishing link</span>}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div key={i} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors opacity-80">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground mt-0.5">
                    {email.from.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm text-muted-foreground truncate">{email.from}</span>
                      <span className="shrink-0 text-[11px] text-muted-foreground">{email.time}</span>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{email.subject}</p>
                    <p className="text-[11px] text-muted-foreground/60 truncate">{email.preview}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </SimulationShell>
  )
}
