"use client"

import { motion } from 'framer-motion'
import { X, Check } from 'lucide-react'
import type { LessonCard } from '@/data/content/attacker-operations'

interface Props {
  card: LessonCard
}

export function ComparisonCard({ card }: Props) {
  if (!card.left || !card.right) return null

  return (
    <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <h4 className="text-sm font-semibold text-foreground">{card.title}</h4>
        <p className="mt-1 text-sm text-muted-foreground">{card.summary}</p>
      </div>

      {/* Comparison grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-border">
        {/* Left — typically "bad" or "before" */}
        <div className="px-8 py-6 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-destructive/15">
              <X className="h-3 w-3 text-destructive" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-destructive">
              {card.left.label}
            </span>
          </div>
          <ul className="space-y-2">
            {card.left.items.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                viewport={{ once: true }}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground/40" />
                {item}
              </motion.li>
            ))}
          </ul>
        </div>

        {/* Right — typically "good" or "after" */}
        <div className="px-8 py-6 space-y-3 bg-brand/[0.03]">
          <div className="flex items-center gap-2">
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/15">
              <Check className="h-3 w-3 text-brand" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-wide text-brand">
              {card.right.label}
            </span>
          </div>
          <ul className="space-y-2">
            {card.right.items.map((item, i) => (
              <motion.li
                key={i}
                initial={{ opacity: 0, x: 8 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                viewport={{ once: true }}
                className="flex items-start gap-2 text-sm text-foreground/90"
              >
                <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand" />
                {item}
              </motion.li>
            ))}
          </ul>
        </div>
      </div>

      {card.detail && (
        <div className="px-8 py-6 border-t border-border bg-muted/30">
          <p className="text-xs text-muted-foreground leading-relaxed">{card.detail}</p>
        </div>
      )}
    </div>
  )
}
