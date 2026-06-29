"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Calendar, DollarSign, Target, Zap, BookOpen, Shield, Swords } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { InteractiveTimeline } from './InteractiveTimeline'
import { AttackFlowDiagram } from './AttackFlowDiagram'
import type { CaseStudy } from '@/types'

const SEVERITY_CONFIG = {
  critical: { label: 'Critical', className: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800/50' },
  high: { label: 'High', className: 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-800/50' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-400 dark:border-yellow-800/50' },
}

type Tab = 'timeline' | 'attack-flow' | 'lessons' | 'prevention'

interface Props {
  study: CaseStudy
  index: number
}

export function CaseStudyCard({ study, index }: Props) {
  const [open, setOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('timeline')

  const severity = SEVERITY_CONFIG[study.severity]

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: 'timeline',     label: 'Timeline',     icon: Calendar },
    { id: 'attack-flow',  label: 'Attack Flow',  icon: Swords },
    { id: 'lessons',      label: 'Lessons',      icon: BookOpen },
    { id: 'prevention',   label: 'Prevention',   icon: Shield },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      viewport={{ once: true }}
      className={cn(
        'rounded-xl border shadow-sm overflow-hidden transition-colors duration-200',
        open ? 'border-brand/40' : 'border-border'
      )}
    >
      {/* Card header — always visible */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-4 p-5 text-left bg-card hover:bg-accent/30 transition-colors"
        aria-expanded={open}
      >
        {/* Year badge */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-bold text-muted-foreground">
          {study.year}
        </div>

        <div className="flex-1 min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold text-foreground">{study.title}</h3>
            <Badge variant="outline" className={cn('text-[10px] font-semibold border', severity.className)}>
              {severity.label}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Target className="h-3 w-3" /> {study.target}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" /> {study.financialImpact}
            </span>
          </div>

          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Zap className="h-3 w-3 text-brand" />
            {study.attackMethod}
          </p>
        </div>

        <ChevronDown className={cn(
          'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200 mt-1',
          open && 'rotate-180 text-brand'
        )} />
      </button>

      {/* Expandable content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="border-t border-border bg-card">
              {/* Summary */}
              <div className="px-5 py-4 bg-muted/30">
                <p className="text-sm text-foreground/90 leading-relaxed">{study.summary}</p>
              </div>

              {/* Tab bar */}
              <div className="flex border-b border-border px-5 gap-0 overflow-x-auto">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={cn(
                        'flex items-center gap-1.5 px-4 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap -mb-px',
                        activeTab === tab.id
                          ? 'border-brand text-brand'
                          : 'border-transparent text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Tab content */}
              <div className="p-5">
                <AnimatePresence mode="wait">
                  {activeTab === 'timeline' && (
                    <motion.div key="timeline" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <InteractiveTimeline events={study.timeline} />
                    </motion.div>
                  )}

                  {activeTab === 'attack-flow' && (
                    <motion.div key="attack-flow" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <p className="text-xs text-muted-foreground mb-4">
                        Click "Next Step" to walk through the attack — or "Show All" to reveal the full chain.
                      </p>
                      <AttackFlowDiagram steps={study.attackFlow} />
                    </motion.div>
                  )}

                  {activeTab === 'lessons' && (
                    <motion.div key="lessons" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <ul className="space-y-3">
                        {study.lessonsLearned.map((lesson, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="flex items-start gap-3 rounded-lg bg-amber-50/60 dark:bg-amber-950/10 border border-amber-200/60 dark:border-amber-800/30 p-3"
                          >
                            <BookOpen className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                            <p className="text-sm text-foreground/90 leading-relaxed">{lesson}</p>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}

                  {activeTab === 'prevention' && (
                    <motion.div key="prevention" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      <ul className="space-y-3">
                        {study.preventionTips.map((tip, i) => (
                          <motion.li
                            key={i}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.07 }}
                            className="flex items-start gap-3 rounded-lg bg-brand/5 border border-brand/20 p-3"
                          >
                            <Shield className="h-4 w-4 shrink-0 text-brand mt-0.5" />
                            <p className="text-sm text-foreground/90 leading-relaxed">{tip}</p>
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
