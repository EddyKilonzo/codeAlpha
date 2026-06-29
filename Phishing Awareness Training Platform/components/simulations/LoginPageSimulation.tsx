"use client"

import { useState } from 'react'
import { Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import { SimulationShell } from './SimulationShell'
import { cn } from '@/lib/utils'
import type { Simulation, SimulationFlag } from '@/types'

interface FlagButtonProps {
  flag: SimulationFlag
  onFlag: (id: string) => void
  found: boolean
  className?: string
  children: React.ReactNode
}

function FlagTrigger({ flag, onFlag, found, className, children }: FlagButtonProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onFlag(flag.id)}
      onKeyDown={(e) => e.key === 'Enter' && onFlag(flag.id)}
      className={cn(
        'cursor-pointer rounded transition-all outline-none group',
        !found && 'hover:ring-2 hover:ring-red-400/50 hover:ring-offset-1',
        found && 'ring-2 ring-red-400/60',
        className
      )}
    >
      {children}
    </div>
  )
}

export function LoginPageSimulation({ simulation }: { simulation: Simulation }) {
  const content = simulation.content as {
    url: string; favicon: string; brand: string; logoText: string;
    fields: { label: string; type: string; placeholder: string }[]
    submitText: string; footerLinks: string[]
  }

  const [showPass, setShowPass] = useState(false)
  const [formValues, setFormValues] = useState<Record<string, string>>({})
  const flagMap = Object.fromEntries(simulation.flags.map((f) => [f.id, f]))

  const isPayPal = content.brand === 'PayPal'
  const isMicrosoft = content.brand === 'Microsoft'

  return (
    <SimulationShell simulation={simulation}>
      {({ onFlag, foundFlags }) => (
        <div className="overflow-hidden rounded-xl border border-border shadow-sm bg-white dark:bg-zinc-900">
          {/* Browser chrome */}
          <div className="border-b border-border bg-zinc-100 dark:bg-zinc-800 px-3 py-2.5 flex items-center gap-2">
            {/* Traffic lights */}
            <div className="flex gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <div className="h-3 w-3 rounded-full bg-green-500/80" />
            </div>

            {/* Address bar */}
            <FlagTrigger flag={flagMap['f1']} onFlag={onFlag} found={foundFlags.includes('f1')} className="flex-1">
              <div className="flex items-center gap-1.5 rounded-md bg-white dark:bg-zinc-700 border border-border px-2.5 py-1">
                <Lock className="h-3 w-3 text-green-500 shrink-0" />
                <span className="text-[11px] text-foreground/80 font-mono truncate">{content.url}</span>
              </div>
            </FlagTrigger>
          </div>

          {/* Page content */}
          <div className={cn(
            'min-h-72 flex items-center justify-center p-8',
            isPayPal ? 'bg-[#003087]' : 'bg-white dark:bg-zinc-900'
          )}>
            <div className={cn(
              'w-full max-w-xs space-y-5',
              isPayPal && 'bg-white rounded-2xl p-8 shadow-2xl'
            )}>
              {/* Logo */}
              <div className="text-center space-y-1">
                {isMicrosoft && (
                  <FlagTrigger flag={flagMap['f2']} onFlag={onFlag} found={foundFlags.includes('f2')}>
                    <div className="grid grid-cols-2 gap-0.5 w-8 h-8 mx-auto mb-3">
                      <div className="bg-[#F25022]" />
                      <div className="bg-[#7FBA00]" />
                      <div className="bg-[#00A4EF]" />
                      <div className="bg-[#FFB900]" />
                    </div>
                  </FlagTrigger>
                )}
                <h1 className={cn(
                  'text-xl font-semibold',
                  isPayPal ? 'text-[#003087]' : isMicrosoft ? 'text-foreground' : 'text-foreground'
                )}>
                  {isMicrosoft ? 'Sign in' : `${content.logoText}`}
                </h1>
                {isMicrosoft && (
                  <p className="text-xs text-muted-foreground">to continue to Microsoft 365</p>
                )}
              </div>

              {/* Form */}
              <div className="space-y-3">
                {content.fields.map((field, i) => (
                  <div key={i} className="relative">
                    <label className="block text-xs font-medium text-foreground/80 mb-1.5">
                      {field.label}
                    </label>
                    <div className="relative">
                      <input
                        type={field.type === 'password' && !showPass ? 'password' : 'text'}
                        placeholder={field.placeholder}
                        value={formValues[field.label] ?? ''}
                        onChange={(e) => setFormValues((v) => ({ ...v, [field.label]: e.target.value }))}
                        onClick={() => onFlag('f2')}
                        className="w-full rounded-md border border-border bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-brand/40"
                      />
                      {field.type === 'password' && (
                        <button
                          type="button"
                          onClick={() => setShowPass((v) => !v)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                    {/* Password manager hint */}
                    {field.type === 'password' && (
                      <FlagTrigger flag={flagMap['f2']} onFlag={onFlag} found={foundFlags.includes('f2')} className="mt-1.5">
                        <p className="text-[10px] text-muted-foreground italic px-0.5">
                          No saved passwords autofilled for this site
                        </p>
                      </FlagTrigger>
                    )}
                  </div>
                ))}

                {/* Submit */}
                <FlagTrigger flag={flagMap['f3']} onFlag={onFlag} found={foundFlags.includes('f3')}>
                  <button
                    type="button"
                    className={cn(
                      'w-full rounded-md px-4 py-2.5 text-sm font-semibold text-white transition-colors',
                      isPayPal ? 'bg-[#003087] hover:bg-[#002766]' :
                      isMicrosoft ? 'bg-[#0078d4] hover:bg-[#106ebe]' : 'bg-brand hover:bg-brand/90'
                    )}
                  >
                    {content.submitText}
                  </button>
                </FlagTrigger>
              </div>

              {/* Footer links */}
              <div className="text-center space-y-1">
                {content.footerLinks?.map((link, i) => (
                  <FlagTrigger key={i} flag={flagMap['f3']} onFlag={onFlag} found={foundFlags.includes('f3')}>
                    <button type="button" className="text-[11px] text-blue-600 dark:text-blue-400 hover:underline block mx-auto">
                      {link}
                    </button>
                  </FlagTrigger>
                ))}
              </div>
            </div>
          </div>

          {/* Arrived via link notice */}
          <FlagTrigger flag={flagMap['f3']} onFlag={onFlag} found={foundFlags.includes('f3')}>
            <div className="border-t border-border bg-amber-50/60 dark:bg-amber-950/20 px-4 py-2 text-center">
              <p className="flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-400">
                <AlertTriangle className="h-3 w-3 shrink-0" />
                You arrived here via a link in an email
              </p>
            </div>
          </FlagTrigger>
        </div>
      )}
    </SimulationShell>
  )
}
