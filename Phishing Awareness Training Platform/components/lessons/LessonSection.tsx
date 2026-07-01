"use client"

import { motion } from 'framer-motion'
import {
  Search, Server, Mail, Send, Database, Eye, Link, ShieldCheck,
  Flag, Wrench, Building, Bot, Video, ArrowLeftRight, TrendingUp,
  Crosshair, Smartphone, KeyRound, MousePointer, Zap, ShieldAlert,
  Fish, FileSearch, CheckCircle2,
} from 'lucide-react'
import { RevealCard } from './RevealCard'
import { ExpandableCard } from './ExpandableCard'
import { ComparisonCard } from './ComparisonCard'
import { WarningCard } from './WarningCard'
import { StatCard } from './StatCard'
import { ExampleCallout } from './ExampleCallout'
import { DiagramStepsCard } from './DiagramStepsCard'
import { SectionVoicePlayer } from './SectionVoicePlayer'
import type { ModuleSection } from '@/data/content/attacker-operations'

const ICON_MAP: Record<string, React.ElementType> = {
  Search, Server, Mail, Send, Database, Eye, Link, ShieldCheck,
  Flag, Wrench, Building, Bot, Video, ArrowLeftRight, TrendingUp,
  Crosshair, Smartphone, KeyRound, MousePointer, Zap, ShieldAlert,
  Fish, FileSearch, CheckCircle2,
}

interface Props {
  section: ModuleSection
  index: number
}

export function LessonSection({ section, index }: Props) {
  const Icon = ICON_MAP[section.icon] ?? ShieldCheck

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      className="rounded-2xl border border-border bg-card shadow-sm"
    >
      {/* ── Section header ─────────────────────────────────────────────────── */}
      <div
        className="border-b border-border/50 rounded-t-2xl bg-muted/30 dark:bg-muted/10"
      >
        <div className="flex items-start gap-3 px-6 py-5">
          {/* Icon badge */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand/10 border border-brand/20 mt-0.5">
            <Icon className="h-4 w-4 text-brand" />
          </div>

          {/* Title row + description */}
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-3">
              <h3 className="flex-1 text-[15px] font-bold text-foreground leading-snug">
                {section.title}
              </h3>
              {/* Listen button pinned right — never competes with title */}
              <div className="shrink-0">
                <SectionVoicePlayer section={section} />
              </div>
            </div>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {section.description}
            </p>
          </div>
        </div>
      </div>

      {/* ── Child concept cards ─────────────────────────────────────────────── */}
      {/* px-6 matches the header px-6 so all left edges align perfectly */}
      <div className="px-6 pt-5 pb-6 space-y-3">
        {section.cards.map((card) => {
          switch (card.type) {
            case 'reveal':
              return <RevealCard key={card.id} card={card} />
            case 'expandable':
              return <ExpandableCard key={card.id} card={card} />
            case 'comparison':
              return <ComparisonCard key={card.id} card={card} />
            case 'warning':
              return <WarningCard key={card.id} card={card} />
            case 'stat':
              return <StatCard key={card.id} card={card} />
            case 'example':
              return <ExampleCallout key={card.id} card={card} />
            case 'diagram-steps':
              return <DiagramStepsCard key={card.id} card={card} />
            default:
              return null
          }
        })}
      </div>
    </motion.div>
  )
}
