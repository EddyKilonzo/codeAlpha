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
      className="space-y-4"
    >
      {/* Section header — sticky, theme-aware glass */}
      <div
        className="sticky top-[49px] z-10 flex items-start gap-4 py-2 -my-2 pr-2"
        style={{
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 border border-brand/20">
          <Icon className="h-5 w-5 text-brand" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <h3 className="text-base font-bold text-foreground">{section.title}</h3>
            <SectionVoicePlayer section={section} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{section.description}</p>
        </div>
      </div>

      {/* Cards */}
      <div className="space-y-3 pl-0 sm:pl-14">
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
