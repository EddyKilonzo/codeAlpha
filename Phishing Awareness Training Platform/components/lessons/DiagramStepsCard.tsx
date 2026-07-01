"use client"

import { motion } from 'framer-motion'
import {
  MousePointer, Shield, KeyRound, ArrowLeftRight, Smartphone, Cookie,
  Lock, Globe, Building, Tag, Folder, Hash, Key, Phone, MessageSquare,
  Clock, Users, Bell, Mail, Send, AlertTriangle, FileText, BarChart,
  Unlock, MousePointer2Off, Ban, Flag, Search, Server, Database,
} from 'lucide-react'
import type { LessonCard } from '@/data/content/attacker-operations'

const ICON_MAP: Record<string, React.ElementType> = {
  MousePointer, Shield, KeyRound, ArrowLeftRight, Smartphone, Cookie,
  Lock, Globe, Building, Tag, Folder, Hash, Key, Phone, MessageSquare,
  Clock, Users, Bell, Mail, Send, AlertTriangle, FileText, BarChart,
  Unlock, Ban, Flag, Search, Server, Database,
  MousePointerOff: MousePointer2Off,
}

interface Props {
  card: LessonCard
}

export function DiagramStepsCard({ card }: Props) {
  if (!card.steps?.length) return null

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border">
        <p className="text-sm font-semibold text-foreground">{card.title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{card.summary}</p>
      </div>

      <div className="px-8 py-6">
        <div className="relative">
          {/* Vertical connecting line */}
          <div className="absolute left-[19px] top-6 bottom-6 w-px bg-border" aria-hidden />

          <ol className="space-y-4">
            {card.steps.map((step, i) => {
              const Icon = ICON_MAP[step.icon] ?? Shield
              return (
                <motion.li
                  key={step.step}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  viewport={{ once: true }}
                  className="relative flex items-start gap-4"
                >
                  {/* Step indicator */}
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-brand/30 bg-background shadow-sm">
                    <Icon className="h-4 w-4 text-brand" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-brand uppercase tracking-wider">
                        Step {step.step}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-foreground">{step.label}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </motion.li>
              )
            })}
          </ol>
        </div>

        {card.detail && (
          <p className="mt-4 text-xs text-muted-foreground border-t border-border pt-4">
            {card.detail}
          </p>
        )}
      </div>
    </div>
  )
}
