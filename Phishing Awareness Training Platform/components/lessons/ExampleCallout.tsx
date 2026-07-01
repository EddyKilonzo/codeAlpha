"use client"

import { Lightbulb } from 'lucide-react'
import type { LessonCard } from '@/data/content/attacker-operations'

interface Props {
  card: LessonCard
}

export function ExampleCallout({ card }: Props) {
  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border flex items-start gap-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30 shrink-0">
          <Lightbulb className="h-4 w-4 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">{card.title}</p>
          <p className="text-sm text-muted-foreground mt-0.5">{card.summary}</p>
        </div>
      </div>

      <div className="px-8 py-6 space-y-4">
        <p className="text-sm text-foreground/90 leading-relaxed">{card.detail}</p>

        {card.example && (
          <blockquote className="relative pl-4 border-l-2 border-brand">
            <p className="text-sm text-foreground/90 leading-relaxed italic">{card.example}</p>
          </blockquote>
        )}

        {card.items && card.items.length > 0 && (
          <ul className="space-y-2">
            {card.items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand/60" />
                {item}
              </li>
            ))}
          </ul>
        )}

        {card.source && (
          <p className="text-xs text-muted-foreground">Source: {card.source}</p>
        )}
      </div>
    </div>
  )
}
